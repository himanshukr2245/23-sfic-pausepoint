import 'fake-indexeddb/auto';
import { describe, it, expect, afterEach } from 'vitest';
import { openDB } from 'idb';
import { notesStoreContract } from '@/lib/notes/store.contract';
import type { Note } from '@/lib/notes/model';
import { createDeviceStore } from '@/modules/offline/device-store';
import { dbNameFor, DB_VERSION } from '@/modules/offline/db';
import { createSyncedStore, type SyncedStore } from './synced-store';
import type { RemoteNote, Transport } from './transport';

let n = 0;
const freshSlug = () => `sync-${Date.now()}-${++n}`;

/** A server for ONE person: rows with tombstones and its own clock (syncedAt); it can go offline or hold a push mid-flight. */
function fakeServer() {
  const rows = new Map<string, RemoteNote>();
  let clock = Date.parse('2030-01-01T00:00:00.000Z');
  const tick = () => new Date((clock += 1000)).toISOString();
  let failing = 0, entered = 0;
  let gate: Promise<void> | null = null;
  const pushes: string[] = [];
  const transport: Transport = {
    async push(entry, row) {
      entered++;
      if (gate) await gate;
      if (failing > 0) { failing--; throw new Error('offline'); }
      pushes.push(`${entry.op}:${entry.rowId}`);
      const existing = rows.get(entry.rowId);
      // like the starter_notes trigger: an older write never replaces a newer row (last write wins on the server too)
      if (entry.op === 'upsert' && row) {
        if (!existing || existing.updatedAt <= row.updatedAt) rows.set(row.id, { ...row, deletedAt: null, syncedAt: tick() });
      } else if (existing) {
        const at = new Date(entry.updatedAt).toISOString();
        if (existing.updatedAt <= at) rows.set(existing.id, { ...existing, body: '', updatedAt: at, deletedAt: at, syncedAt: tick() });
      }
    },
    async pull(since, limit) {
      if (failing > 0) throw new Error('offline');
      return [...rows.values()].filter((r) => !since || r.syncedAt > since).sort((a, b) => a.syncedAt.localeCompare(b.syncedAt))
        .slice(0, limit).map((r) => ({ ...r }));
    },
  };
  return {
    rows, transport, pushes,
    entered: () => entered,
    offline(times = 1_000_000) { failing = times; },
    online() { failing = 0; },
    hold() { let release!: () => void; gate = new Promise<void>((r) => { release = r; }); return () => { gate = null; release(); }; },
    /** A change made on the person's OTHER device. */
    fromOtherDevice(note: Note, deleted = false) {
      rows.set(note.id, { ...note, body: deleted ? '' : note.body, deletedAt: deleted ? note.updatedAt : null, syncedAt: tick() });
    },
  };
}

const open: SyncedStore[] = [];
afterEach(() => { for (const s of open.splice(0)) s.close(); });
function signedIn(server = fakeServer(), slug = freshSlug(), user = 'user-a', clock: { now?: () => Date; id?: () => string } = {}) {
  const store = createSyncedStore({ slug, whoIsSignedIn: async () => user, transportFor: () => server.transport, autoSync: false, ...clock });
  open.push(store);
  return { store, server, slug };
}

notesStoreContract('synced store (signed in)', async (clock) => ({ store: signedIn(fakeServer(), freshSlug(), 'user-a', clock).store }));
notesStoreContract('synced store (guest, accounts off)', async (clock) => {
  const store = createSyncedStore({ slug: freshSlug(), whoIsSignedIn: async () => 'ignored', transportFor: null, autoSync: false, ...clock });
  open.push(store);
  return { store };
});

describe('synced store — sync rules', () => {
  it('a note written offline is kept and counted; back online it is not sent before its backoff is due', async () => {
    const { store, server } = signedIn();
    server.offline();
    await store.add('written on the train');
    await store.syncNow();
    expect(store.sync!.get()).toMatchObject({ mode: 'signed-in', pending: 1, failed: 1 });
    expect(await store.list()).toHaveLength(1);                   // the device copy is the truth, whatever the server says
    expect(server.rows.size).toBe(0);
    server.online();
    await store.syncNow();                                        // a hundred phones coming back must not stampede the API
    expect(server.pushes).toEqual([]);
  });

  it('retries after the backoff and then clears the queue', async () => {
    let t = Date.parse('2026-01-01T00:00:00.000Z');
    const clock = { now: () => new Date(t) };
    const { store, server } = signedIn(fakeServer(), freshSlug(), 'user-a', clock);
    server.offline(1);
    await store.add('retry me');
    await store.syncNow();
    expect(store.sync!.get()).toMatchObject({ pending: 1, failed: 1 });
    t += 5_000;                                                   // past the first backoff (1 s ± 25 %)
    await store.syncNow();
    expect(store.sync!.get()).toMatchObject({ pending: 0, failed: 0 });
    expect(server.rows.size).toBe(1);
    expect(server.pushes).toHaveLength(1);
  });

  it('an edit made while its upload is in flight is sent next time — never marked done with the old text', async () => {
    const { store, server } = signedIn();
    const note = await store.add('first');
    const release = server.hold();
    const running = store.syncNow();
    await expect.poll(() => server.entered()).toBe(1);            // the upload of "first" has started
    await store.update(note.id, 'second');
    release();
    await running;
    expect(server.rows.get(note.id)?.body).toBe('first');
    expect(store.sync!.get().pending).toBe(1);                    // re-queued, not lost
    await store.syncNow();
    expect(server.rows.get(note.id)?.body).toBe('second');
    expect(store.sync!.get().pending).toBe(0);
  });

  it('a delete reaches the server as a tombstone', async () => {
    const { store, server } = signedIn();
    const note = await store.add('to delete');
    await store.syncNow();
    await store.remove(note.id);
    await store.syncNow();
    expect(server.rows.get(note.id)).toMatchObject({ body: '', deletedAt: expect.any(String) });
  });

  it('pulls the other device’s new notes and deletions; pulling again changes nothing', async () => {
    const { store, server } = signedIn();
    const other: Note = { id: '00000000-0000-4000-8000-0000000000aa', body: 'from the laptop', createdAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' };
    server.fromOtherDevice(other);
    await store.syncNow();
    expect((await store.list()).map((x) => x.body)).toEqual(['from the laptop']);
    await store.syncNow();
    expect(await store.list()).toHaveLength(1);
    server.fromOtherDevice({ ...other, updatedAt: '2026-02-02T00:00:00.000Z' }, true);
    await store.syncNow();
    expect(await store.list()).toEqual([]);
  });

  it('last write wins by edit time — an older edit that arrives late never replaces a newer one, and every device converges', async () => {
    let t = Date.parse('2026-03-01T10:00:00.000Z');
    const { store, server } = signedIn(fakeServer(), freshSlug(), 'user-a', { now: () => new Date(t) });
    const note = await store.add('first text');
    await store.syncNow();

    server.offline(1);
    t += 60_000;
    await store.update(note.id, 'phone edit at 10:01 (offline)');
    await store.syncNow();                                        // fails: the phone is offline
    server.fromOtherDevice({ ...note, body: 'laptop edit at 10:05', updatedAt: new Date(t + 4 * 60_000).toISOString() });
    t += 10 * 60_000;                                             // later: the phone is back and its retry is due
    await store.syncNow();
    expect(server.rows.get(note.id)?.body).toBe('laptop edit at 10:05');   // the late, older phone edit did not overwrite it
    expect((await store.list())[0].body).toBe('laptop edit at 10:05');     // and the phone converged on the newest text

    t += 60_000;
    await store.update(note.id, 'phone edit, now the newest');
    await store.syncNow();
    expect(server.rows.get(note.id)?.body).toBe('phone edit, now the newest');
  });

  it('an unsent local edit is kept during a pull until it has been sent', async () => {
    const { store, server } = signedIn();
    const note = await store.add('phone text');
    await store.syncNow();
    server.offline(1);
    await store.update(note.id, 'phone edit, not sent yet');
    await store.syncNow();                                        // push fails → entry waits for its backoff
    server.fromOtherDevice({ ...note, body: 'laptop text', updatedAt: '2099-01-01T00:00:00.000Z' });
    await store.syncNow();                                        // not due: no push; the pull must not overwrite the unsent edit
    expect((await store.list())[0].body).toBe('phone edit, not sent yet');
  });

  it('an entry left "syncing" by a crash is sent again', async () => {
    const { store, server, slug } = signedIn();
    const note = await store.add('crash survivor');
    const db = await openDB(dbNameFor(slug, 'user-a'), DB_VERSION);
    const [entry] = await db.getAll('outbox');
    await db.put('outbox', { ...entry, status: 'syncing' });
    db.close();
    await store.syncNow();
    expect(server.rows.get(note.id)?.body).toBe('crash survivor');
    expect(store.sync!.get().pending).toBe(0);
  });

  it('each person has their own notes on a shared device', async () => {
    const slug = freshSlug();
    const a = signedIn(fakeServer(), slug, 'user-a');
    await a.store.add('A only');
    const b = signedIn(fakeServer(), slug, 'user-b');
    expect(await b.store.list()).toEqual([]);
  });

  it('guest notes move into the account only when asked, are queued for upload, and leave the guest copy', async () => {
    const slug = freshSlug();
    const guestDevice = createDeviceStore({ dbName: dbNameFor(slug, null) });
    await guestDevice.add('written before signing in');
    await guestDevice.add('and another');
    guestDevice.close();

    const { store, server } = signedIn(fakeServer(), slug, 'user-a');
    expect(await store.list()).toEqual([]);                       // nothing moved by itself
    expect(await store.guestNotes!.count()).toBe(2);
    expect(await store.guestNotes!.moveIn()).toBe(2);
    expect((await store.list()).map((x) => x.body).sort()).toEqual(['and another', 'written before signing in']);
    expect(store.sync!.get().pending).toBe(2);
    expect(await store.guestNotes!.count()).toBe(0);
    await store.syncNow();
    expect(server.rows.size).toBe(2);
  });

  it('accounts off: says "local-only", queues nothing, never calls a server', async () => {
    const store = createSyncedStore({ slug: freshSlug(), whoIsSignedIn: async () => 'x', transportFor: null, autoSync: false });
    open.push(store);
    await store.add('stays here');
    await store.syncNow();
    expect(store.sync!.get()).toMatchObject({ mode: 'local-only', pending: 0 });
    expect(await store.guestNotes!.count()).toBe(0);
  });

  it('signed out (accounts on): guest mode — saved on this device, nothing queued', async () => {
    const server = fakeServer();
    const store = createSyncedStore({ slug: freshSlug(), whoIsSignedIn: async () => null, transportFor: () => server.transport, autoSync: false });
    open.push(store);
    await store.add('guest note');
    await store.syncNow();
    expect(store.sync!.get()).toMatchObject({ mode: 'guest', pending: 0 });
    expect(server.pushes).toEqual([]);
  });
});
