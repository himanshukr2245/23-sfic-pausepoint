// modules/synced/engine.ts — keeps the person's device notes and their account in step (OFF-2). One run:
//  0. entries left "syncing" by a crash go back to "pending" — they were never acknowledged
//  1. PUSH every due outbox entry, oldest first (HK_KIT outbox drain()); each result is stored compare-and-set (commitIfUnchanged), so
//     an edit made while its upload was in flight is never marked done — the newer text is sent on the next run
//  2. PRUNE acknowledged entries
//  3. PULL changes stored on the server since the last run (with a 30 s overlap — the server clock is the cursor, merging is idempotent):
//     a note with an unsent local change is left alone (this device's newer edit wins and will be pushed); a tombstone deletes the
//     local copy; otherwise the newer updatedAt wins (last write wins, ties to the server so devices converge)
// Single-flight across tabs with navigator.locks (ifAvailable: a tab that finds another tab syncing skips — that tab does the work).
// Never throws: sync is background work and must never take a screen down.
import { NoteRow, type Note } from '@/lib/notes/model';
import { createListeners, type SyncStatus } from '@/lib/notes/store';
import type { DbHandle } from '@/modules/offline/db';
import { commitIfUnchanged, drain, resolveConflict } from '@/modules/offline/sync/outbox';
import type { Transport } from './transport';

export const PAGE = 200, OVERLAP_MS = 30_000;

type LockManagerLike = { request(name: string, options: { ifAvailable: boolean }, cb: (lock: unknown) => Promise<void>): Promise<void> };

export interface EngineDeps {
  db: DbHandle;
  transport: Transport;
  lockName: string;
  locks?: LockManagerLike | null;
  now?: () => number;
  online?: () => boolean;
  /** Local notes changed because of a pull — tell the screen. */
  onPulled: () => void;
}

export interface SyncEngine {
  /** Run now (or right after the run in progress). Resolves when done; never rejects. */
  syncNow(): Promise<void>;
  status(): SyncStatus;
  subscribe(listener: () => void): () => void;
  /** Recount pending entries (after a local write) and tell subscribers. */
  refresh(): Promise<void>;
  /** When the earliest failed entry may retry (ms epoch), or null. */
  nextRetryAt(): number | null;
}

export function createSyncEngine({ db, transport, lockName, locks = null, now = Date.now, online = () => true, onPulled }: EngineDeps): SyncEngine {
  const listeners = createListeners();
  let state: SyncStatus = { mode: 'signed-in', pending: 0, failed: 0, syncing: false, lastSyncedAt: null };
  let retryAt: number | null = null;
  let running: Promise<void> | null = null;
  let again = false;
  const set = (patch: Partial<SyncStatus>) => { state = { ...state, ...patch }; listeners.emit(); };

  async function refresh() {
    try {
      const entries = await (await db.get()).getAll('outbox');
      const live = entries.filter((e) => e.status !== 'done');
      const failed = live.filter((e) => e.status === 'failed');
      retryAt = failed.length ? Math.min(...failed.map((e) => e.nextAttemptAt)) : null;
      set({ pending: live.length, failed: failed.length });
    } catch { /* the database is closing (another tab upgraded): the screen already says so */ }
  }

  async function runOnce() {
    const conn = await db.get();

    // 0 + 1 — push
    const entries = (await conn.getAll('outbox')).map((e) => (e.status === 'syncing' ? { ...e, status: 'pending' as const } : e));
    await drain<Note>(entries, {
      now: now(),
      readLatest: (e) => conn.get('notes', e.rowId),
      send: (e, row) => transport.push(e, row),
      commit: async (before, after) => {
        const tx = conn.transaction('outbox', 'readwrite');
        const next = commitIfUnchanged(await tx.store.get(before.id), before, after);
        if (next) await tx.store.put(next);
        await tx.done;
      },
    });

    // 2 — prune acknowledged entries (a done entry is never reused: a new change creates a new entry)
    {
      const tx = conn.transaction('outbox', 'readwrite');
      for (const e of await tx.store.getAll()) if (e.status === 'done') await tx.store.delete(e.id);
      await tx.done;
    }

    // 3 — pull
    let cursor = ((await conn.get('meta', 'cursor')) as string | undefined) ?? null;
    let since = cursor ? new Date(Date.parse(cursor) - OVERLAP_MS).toISOString() : null;
    let pulled = false;
    for (;;) {
      const rows = await transport.pull(since, PAGE);
      if (rows.length === 0) break;
      const tx = conn.transaction(['notes', 'outbox', 'meta'], 'readwrite');
      const notes = tx.objectStore('notes');
      const unsent = new Set((await tx.objectStore('outbox').getAll()).filter((e) => e.status !== 'done').map((e) => e.rowId));
      for (const remote of rows) {
        if (unsent.has(remote.id)) continue;
        const local = await notes.get(remote.id);
        if (remote.deletedAt) { if (local) { await notes.delete(remote.id); pulled = true; } continue; }
        const incoming: Note = { id: remote.id, body: remote.body, createdAt: remote.createdAt, updatedAt: remote.updatedAt };
        if (!NoteRow.safeParse(incoming).success) continue;
        if (!local || resolveConflict('last-write-wins', local, incoming).winner === 'remote') {
          if (!local || local.body !== incoming.body || local.updatedAt !== incoming.updatedAt) { await notes.put(incoming); pulled = true; }
        }
      }
      const last = rows[rows.length - 1].syncedAt;
      if (!cursor || last > cursor) { cursor = last; await tx.objectStore('meta').put(cursor, 'cursor'); }
      await tx.done;
      if (rows.length < PAGE) break;
      since = last;
    }
    if (pulled) onPulled();
  }

  async function run() {
    set({ syncing: true });
    try { await runOnce(); set({ lastSyncedAt: new Date(now()).toISOString() }); }
    catch { /* network or server trouble: entries keep their state and retry; the badge shows what is waiting */ }
    finally { set({ syncing: false }); await refresh(); }
  }

  async function syncNow(): Promise<void> {
    if (running) { again = true; return running; }
    if (!online()) { await refresh(); return; }
    running = (async () => {
      do {
        again = false;
        if (locks) await locks.request(lockName, { ifAvailable: true }, async (lock) => { if (lock) await run(); });
        else await run();
      } while (again && online());
    })().finally(() => { running = null; });
    return running;
  }

  return { syncNow, status: () => state, subscribe: listeners.add, refresh, nextRetryAt: () => retryAt };
}
