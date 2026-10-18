// modules/offline/device-store.ts — notes that live in this browser (IndexedDB). Survives reloads, restarts and airplane mode.
// With `queue: true` (the synced store) every change ALSO goes into the outbox in the same transaction: the note and its pending
// upload are saved together or not at all, so a crash can never leave a note that will silently never sync (OFF-2).
import type { IDBPTransaction } from 'idb';
import { uid } from '@/lib/sync/uid';
import { NoteRow, checkBody, laterThan, newestFirst, type Note } from '@/lib/notes/model';
import { StoreError, createListeners, toStoreError, type NotesStore, type StoreKind } from '@/lib/notes/store';
import { deviceDb, type DeviceDB } from './db';
import { enqueue, type OutboxOp } from './sync/outbox';

type Tx = IDBPTransaction<DeviceDB, ('notes' | 'outbox')[], 'readwrite'>;

export interface DeviceStoreOptions {
  dbName: string;
  /** Also queue every change for upload (used by the synced store). */
  queue?: boolean;
  kind?: StoreKind;
  now?: () => Date;
  id?: () => string;
}

export interface DeviceStore extends NotesStore {
  /** Tell this tab's subscribers that something changed outside this store (e.g. a sync pull). */
  changed(): void;
  /** Copy notes in as they are (ids and times kept) — e.g. a guest's notes moving into an account. Queued for upload when the queue is on.
   *  A note that already exists here with a newer change is kept. Returns how many were written. */
  importNotes(notes: Note[]): Promise<number>;
  close(): void;
  readonly db: ReturnType<typeof deviceDb>;
}

export const NOTES_ENTITY = 'notes';

export function createDeviceStore({ dbName, queue = false, kind = 'device', now = () => new Date(), id = () => uid() }: DeviceStoreOptions): DeviceStore {
  const db = deviceDb(dbName);
  const listeners = createListeners();

  // Other tabs of this app: they post here after a change, so every open tab shows the same notes.
  // One channel per store, opened on first use and closed by close() (an open channel keeps a Node test run alive).
  let channel: BroadcastChannel | null = null;
  const tabs = () => {
    if (!channel && typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel(`hk-notes:${dbName}`);
      channel.onmessage = () => listeners.emit();
    }
    return channel;
  };
  const tellOtherTabs = () => { try { tabs()?.postMessage('changed'); } catch { /* closed */ } };
  const changed = () => { listeners.emit(); tellOtherTabs(); };

  // OFF-3: after the first saved note, ask the browser not to evict this app's storage under pressure (Chrome decides silently,
  // Firefox asks the person — at the moment they just saved something, which is when the question makes sense).
  let keepAsked = false;
  const keepData = () => {
    if (keepAsked) return;
    keepAsked = true;
    const storage = typeof navigator === 'undefined' ? undefined : navigator.storage;
    if (storage?.persist) void storage.persisted().then((yes) => yes || storage.persist()).catch(() => {});
  };

  const valid = (body: string) => { const c = checkBody(body); if (!c.ok) throw new StoreError('invalid', c.message); return c.body; };

  /** One readwrite transaction over notes (+ outbox): `work` runs inside it; the queue entry is written beside the note. */
  async function write<T>(work: (tx: Tx) => Promise<{ result: T; op?: OutboxOp; rowId?: string }>): Promise<T> {
    try {
      const conn = await db.get();
      const tx = conn.transaction(queue ? ['notes', 'outbox'] : ['notes'], 'readwrite');
      const { result, op, rowId } = await work(tx as Tx);           // only IDB requests are awaited inside: anything else would auto-commit the transaction
      if (queue && op && rowId) {
        const out = tx.objectStore('outbox');
        const next = enqueue(await out.getAll(), { entity: NOTES_ENTITY, rowId, op }, { now: now().getTime(), id: id() });
        const live = next.find((e) => e.status !== 'done' && e.entity === NOTES_ENTITY && e.rowId === rowId);   // enqueue keeps exactly one
        if (live) await out.put(live);
      }
      await tx.done;
      return result;
    } catch (e) { throw toStoreError(e); }
  }

  const store: DeviceStore = {
    kind,
    db,
    async list() {
      try {
        const rows = await (await db.get()).getAllFromIndex('notes', 'byUpdated');
        return rows.filter((r) => NoteRow.safeParse(r).success).sort(newestFirst);   // a corrupted row is skipped, never crashes the screen
      } catch (e) { throw toStoreError(e); }
    },
    async add(body) {
      const text = valid(body);
      const at = now().toISOString();
      const note: Note = { id: id(), body: text, createdAt: at, updatedAt: at };
      await write(async (tx) => { await tx.objectStore('notes').add(note); return { result: undefined, op: 'upsert', rowId: note.id }; });
      changed();
      keepData();
      return { ...note };
    },
    async update(noteId, body) {
      const text = valid(body);
      const note = await write(async (tx) => {
        const notes = tx.objectStore('notes');
        const old = await notes.get(noteId);
        if (!old) throw new StoreError('not-found');
        const next: Note = { ...old, body: text, updatedAt: laterThan(now(), old.updatedAt) };
        await notes.put(next);
        return { result: next, op: 'upsert', rowId: noteId };
      });
      changed();
      return { ...note };
    },
    async remove(noteId) {
      const existed = await write(async (tx) => {
        const notes = tx.objectStore('notes');
        const had = (await notes.getKey(noteId)) !== undefined;
        if (had) await notes.delete(noteId);
        return { result: had, op: had ? 'delete' : undefined, rowId: noteId };
      });
      if (existed) changed();
    },
    subscribe(fn) { tabs(); return listeners.add(fn); },
    async importNotes(incoming) {
      let written = 0;
      try {
        const conn = await db.get();
        const tx = conn.transaction(queue ? ['notes', 'outbox'] : ['notes'], 'readwrite');
        const notes = tx.objectStore('notes');
        let entries = queue ? await tx.objectStore('outbox').getAll() : [];
        for (const note of incoming) {
          if (!NoteRow.safeParse(note).success) continue;
          const here = await notes.get(note.id);
          if (here && here.updatedAt >= note.updatedAt) continue;
          await notes.put({ id: note.id, body: note.body, createdAt: note.createdAt, updatedAt: note.updatedAt });
          written++;
          if (queue) {
            entries = enqueue(entries, { entity: NOTES_ENTITY, rowId: note.id, op: 'upsert' }, { now: now().getTime(), id: id() });
            const live = entries.find((e) => e.status !== 'done' && e.entity === NOTES_ENTITY && e.rowId === note.id);
            if (live) await tx.objectStore('outbox').put(live);
          }
        }
        await tx.done;
      } catch (e) { throw toStoreError(e); }
      if (written) changed();
      return written;
    },
    changed,
    close() { channel?.close(); channel = null; db.close(); },
  };
  return store;
}

