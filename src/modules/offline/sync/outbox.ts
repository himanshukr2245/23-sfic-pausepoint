// lib/sync/outbox.ts — the pure core of an offline outbox. Storage (IndexedDB / SQLite) and transport (Supabase upsert) are injected.
// The contract (Smriti's, generalised):
//  1. local storage is the source of truth — a failed push changes nothing on the device
//  2. push the row as it is in local storage NOW, not the snapshot that was queued
//  3. mark an entry done only after the server acknowledged it, so an interrupted sync retries instead of silently dropping a write
//  4. retries back off (1 s, 2 s, 4 s … 60 s) with jitter, so a hundred phones coming back online do not stampede the API
//  5. drain() never throws — sync is background work and must never take a screen down
// Idempotency: row ids are client UUIDs (uid.ts), so a retried push is an upsert on the primary key — sending twice is harmless.

export type OutboxStatus = 'pending' | 'syncing' | 'failed' | 'done';
export type OutboxOp = 'upsert' | 'delete';
export interface OutboxEntry {
  id: string; entity: string; rowId: string; op: OutboxOp; status: OutboxStatus;
  attempts: number; nextAttemptAt: number; createdAt: number; updatedAt: number; lastError?: string;
  /** Bumped by enqueue() on every change. Storage compares it to apply drain() results compare-and-set (see commitIfUnchanged). */
  rev?: number;
}

export const BASE_DELAY_MS = 1000, MAX_DELAY_MS = 60_000, JITTER = 0.25;

/** Delay before retry number `attempt` (1 = after the first failure): 1 s, 2 s, 4 s … base capped at 60 s, then ± up to 25 % jitter. */
export function nextDelayMs(attempt: number, rng: () => number = Math.random): number {
  const n = Math.max(1, Math.floor(attempt) || 1);
  const base = Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** Math.min(n - 1, 30));
  const r = Math.min(1, Math.max(0, rng()));
  return Math.round(base * (1 + JITTER * (2 * r - 1)));
}

/** One live entry per row: the server upserts on the primary key, so `${entity}:${rowId}` is the whole idempotency story. */
export const idempotencyKey = (e: Pick<OutboxEntry, 'entity' | 'rowId'>) => `${e.entity}:${e.rowId}`;

/** Queue a change. Rapid taps / repeated edits of one row collapse into the existing live entry (latest op wins, retry clock resets). */
export function enqueue(entries: OutboxEntry[], change: { entity: string; rowId: string; op: OutboxOp }, opts: { now: number; id: string }): OutboxEntry[] {
  const key = idempotencyKey(change);
  const live = entries.find((e) => e.status !== 'done' && idempotencyKey(e) === key);
  if (live) return entries.map((e): OutboxEntry => (e === live ? { ...e, op: change.op, status: 'pending', attempts: 0, nextAttemptAt: opts.now, updatedAt: opts.now, lastError: undefined, rev: (e.rev ?? 0) + 1 } : e));
  return [...entries, { id: opts.id, ...change, status: 'pending', attempts: 0, nextAttemptAt: opts.now, createdAt: opts.now, updatedAt: opts.now, rev: 1 }];
}

/** Compare-and-set for persisting one drain() result. `stored` is the entry as it is in storage NOW.
 *  - entry gone (deleted meanwhile)            → null: never resurrect it
 *  - re-queued while the push was in flight    → keep `stored` (its newer rev means the latest row must be sent again)
 *  - unchanged since drain() read it           → `after` */
export function commitIfUnchanged(stored: OutboxEntry | null | undefined, before: OutboxEntry, after: OutboxEntry): OutboxEntry | null {
  if (!stored) return null;
  return (stored.rev ?? 0) === (before.rev ?? 0) ? after : stored;
}

export type ConflictPolicy = 'append-only' | 'last-write-wins' | 'server-wins';
type Stamped = { updatedAt?: number | string | null };
const time = (v: Stamped['updatedAt']) => (typeof v === 'number' ? v : typeof v === 'string' ? Date.parse(v) : NaN);

/** Decide which copy of a row survives. Pick the policy PER ENTITY:
 *  append-only     → events that never change (game results, audit rows): an existing server copy is the same event already accepted
 *  last-write-wins → editable records: newer updatedAt wins; a tie goes to the server so every device converges on one value
 *  server-wins     → server-owned data (settings pushed by a caregiver/admin): the device copy only fills a gap */
export function resolveConflict<T extends Stamped>(policy: ConflictPolicy, local: T, remote: T | null | undefined): { winner: 'local' | 'remote'; row: T } {
  if (remote == null) return { winner: 'local', row: local };
  if (policy === 'last-write-wins') {
    const l = time(local.updatedAt), r = time(remote.updatedAt);
    return Number.isFinite(l) && (!Number.isFinite(r) || l > r) ? { winner: 'local', row: local } : { winner: 'remote', row: remote };
  }
  return { winner: 'remote', row: remote };                        // append-only and server-wins both keep the server copy
}

export interface DrainDeps<Row> {
  now: number;
  /** The row as it is in local storage at push time (null if it was deleted locally). */
  readLatest: (entry: OutboxEntry) => Promise<Row | null | undefined>;
  /** Push one entry. Resolve ONLY when the server acknowledged it (e.g. upsert returned no error); throw/reject otherwise. */
  send: (entry: OutboxEntry, row: Row | null) => Promise<void>;
  /** Persist one entry's outcome as soon as it is known. Write `after` only through commitIfUnchanged() against the stored entry —
   *  the user may have edited the row (re-queuing it) while it was uploading. Never write drain()'s returned array back wholesale. */
  commit?: (before: OutboxEntry, after: OutboxEntry) => Promise<void> | void;
}

/** Push every due entry, oldest first and one at a time (an update must not overtake the create it depends on). Never throws. */
export async function drain<Row>(entries: OutboxEntry[], { now, readLatest, send, commit }: DrainDeps<Row>): Promise<OutboxEntry[]> {
  const out = entries.map((e) => ({ ...e }));
  const blocked = new Set<string>();                               // a failed key holds back its later entries this round
  const order = out.map((e, i) => [e, i] as const).sort(([a, i], [b, j]) => a.createdAt - b.createdAt || i - j);
  const settle = async (before: OutboxEntry, e: OutboxEntry) => { try { await commit?.(before, { ...e }); } catch { /* storage hiccup: the entry stays queued and is retried */ } };
  for (const [e] of order) {
    if (e.status === 'done' || e.nextAttemptAt > now || blocked.has(idempotencyKey(e))) continue;
    const before = { ...e };
    try {
      const row = (await readLatest(e)) ?? null;
      if (e.op === 'upsert' && row === null) { Object.assign(e, { status: 'done', updatedAt: now, lastError: undefined }); await settle(before, e); continue; }   // deleted before it ever synced
      e.status = 'syncing';
      await send(e, row);
      Object.assign(e, { status: 'done', updatedAt: now, lastError: undefined });
    } catch (err) {
      const attempts = e.attempts + 1;
      Object.assign(e, { status: 'failed', attempts, nextAttemptAt: now + nextDelayMs(attempts), updatedAt: now,
        lastError: (err instanceof Error ? err.message : String(err)).slice(0, 200) });
      blocked.add(idempotencyKey(e));
    }
    await settle(before, e);
  }
  return out;
}
