import 'fake-indexeddb/auto';
import { describe, it, expect, afterEach } from 'vitest';
import { openDB } from 'idb';
import { notesStoreContract } from '@/lib/notes/store.contract';
import { StoreError } from '@/lib/notes/store';
import { createDeviceStore, type DeviceStore } from './device-store';
import { dbNameFor, DB_VERSION } from './db';

let n = 0;
const freshName = () => `test-${Date.now()}-${++n}`;               // a new database per test: no state leaks between tests

notesStoreContract('device store (IndexedDB)', async (clock) => {
  const store = createDeviceStore({ dbName: freshName(), ...clock });
  return { store, cleanup: () => store.close() };
});

notesStoreContract('device store with sync queue', async (clock) => {
  const store = createDeviceStore({ dbName: freshName(), queue: true, ...clock });
  return { store, cleanup: () => store.close() };
});

describe('device store — device rules', () => {
  const open: DeviceStore[] = [];
  const make = (o: Parameters<typeof createDeviceStore>[0]) => { const s = createDeviceStore(o); open.push(s); return s; };
  afterEach(() => { for (const s of open.splice(0)) s.close(); });

  it('one database per person — a guest and a signed-in person never see each other’s notes', async () => {
    expect(dbNameFor('hk-starter')).toBe('hk-starter:guest');
    expect(dbNameFor('hk-starter', 'a1b2-c3')).toBe('hk-starter:a1b2-c3');
    expect(dbNameFor('hk-starter', '../evil name')).toBe('hk-starter:guest');
    const slug = freshName();
    await make({ dbName: dbNameFor(slug, 'user-a') }).add('A’s secret');
    expect(await make({ dbName: dbNameFor(slug) }).list()).toEqual([]);
  });

  it('notes survive closing and reopening (a reload)', async () => {
    const dbName = freshName();
    const first = make({ dbName });
    const note = await first.add('still here');
    first.close();
    expect(await make({ dbName }).list()).toEqual([note]);
  });

  it('with the sync queue: the note and its upload entry are saved together; edits collapse; a delete replaces the upsert', async () => {
    const dbName = freshName();
    const store = make({ dbName, queue: true });
    const note = await store.add('to sync');
    const outbox = async () => (await store.db.get()).getAll('outbox');
    expect(await outbox()).toMatchObject([{ entity: 'notes', rowId: note.id, op: 'upsert', status: 'pending', rev: 1 }]);
    await store.update(note.id, 'edited before it synced');
    expect(await outbox()).toMatchObject([{ rowId: note.id, op: 'upsert', rev: 2 }]);
    await store.remove(note.id);
    expect(await outbox()).toMatchObject([{ rowId: note.id, op: 'delete', rev: 3 }]);
    await store.remove(note.id);                                  // already gone: nothing new queued
    expect(await outbox()).toHaveLength(1);
  });

  it('without the sync queue nothing is queued', async () => {
    const store = make({ dbName: freshName() });
    await store.add('local only');
    expect(await (await store.db.get()).getAll('outbox')).toEqual([]);
  });

  it('a failed edit (note gone) leaves the queue untouched', async () => {
    const store = make({ dbName: freshName(), queue: true });
    await expect(store.update('00000000-0000-4000-8000-000000000999', 'x')).rejects.toMatchObject({ code: 'not-found' });
    expect(await (await store.db.get()).getAll('outbox')).toEqual([]);
  });

  it('a corrupted row is skipped instead of crashing the screen', async () => {
    const dbName = freshName();
    const store = make({ dbName });
    const good = await store.add('fine');
    await (await store.db.get()).put('notes', { id: 'not-a-uuid', body: 'x', createdAt: 'bad', updatedAt: 'bad' });
    expect(await store.list()).toEqual([good]);
  });

  it('another tab opening a newer version → this tab steps aside and says "reload"', async () => {
    const dbName = freshName();
    const store = make({ dbName });
    await store.add('before the update');
    const newer = await openDB(dbName, DB_VERSION + 1);           // the newer tab's upgrade is not blocked by us
    newer.close();
    const err = await store.list().then(() => null, (e: unknown) => e);
    expect(err).toBeInstanceOf(StoreError);
    expect((err as StoreError).code).toBe('outdated');
  });

  it('no IndexedDB (blocked storage) → a clear "cannot save on this device" error', async () => {
    const saved = globalThis.indexedDB;
    // @ts-expect-error — simulate a browser without IndexedDB
    delete globalThis.indexedDB;
    try {
      const err = await make({ dbName: freshName() }).list().then(() => null, (e: unknown) => e);
      expect((err as StoreError).code).toBe('unavailable');
    } finally { globalThis.indexedDB = saved; }
  });

  it('other tabs hear about changes (BroadcastChannel)', async () => {
    const dbName = freshName();
    const tabA = make({ dbName });
    const tabB = make({ dbName });
    let heard = 0;
    const off = tabB.subscribe(() => { heard++; });
    await tabA.add('from tab A');
    await expect.poll(() => heard).toBe(1);
    expect((await tabB.list()).map((x) => x.body)).toEqual(['from tab A']);
    off();
  });
});
