// modules/synced/synced-store.ts — notes saved on this device FIRST, then synced to the person's account (needs auth + offline).
// Who is signed in is resolved once, from the local session (works offline). Signing in or out reloads the page on purpose
// (modules/auth/ui), so the person never changes under a running store and nothing of one person stays in memory for the next.
//  - guest (or accounts off): the guest database, no queue, nothing leaves the device
//  - signed in: the person's own database `<slug>:<user id>`, every change queued in the same transaction, the engine syncs it
// Sync runs: on start, shortly after every local change, when the network returns, when the tab becomes visible, every 60 s while
// visible, and when the earliest failed entry may retry.
import type { Note } from '@/lib/notes/model';
import { createListeners, type NotesStore, type SyncStatus } from '@/lib/notes/store';
import { createDeviceStore, type DeviceStore } from '@/modules/offline/device-store';
import { dbNameFor } from '@/modules/offline/db';
import { createSyncEngine, type SyncEngine } from './engine';
import type { Transport } from './transport';

export interface SyncedStoreOptions {
  slug: string;
  /** The signed-in person's id from the local session, or null. */
  whoIsSignedIn: () => Promise<string | null>;
  /** null = accounts are not switched on in this copy of the app. */
  transportFor: ((userId: string) => Transport) | null;
  now?: () => Date;
  id?: () => string;
  /** Tests switch the automatic triggers off and call syncNow() themselves. */
  autoSync?: boolean;
}

export interface SyncedStore extends NotesStore { syncNow(): Promise<void>; close(): void }

const PERIOD_MS = 60_000, AFTER_WRITE_MS = 400;

export function createSyncedStore({ slug, whoIsSignedIn, transportFor, now, id, autoSync = true }: SyncedStoreOptions): SyncedStore {
  const listeners = createListeners();
  const statusListeners = createListeners();
  let status: SyncStatus = { mode: transportFor ? 'guest' : 'local-only', pending: 0, failed: 0, syncing: false, lastSyncedAt: null };
  const cleanups: (() => void)[] = [];

  const ready: Promise<{ device: DeviceStore; engine: SyncEngine | null; userId: string | null }> = (async () => {
    const userId = transportFor ? await whoIsSignedIn() : null;
    const dbName = dbNameFor(slug, userId);
    const device = createDeviceStore({ dbName, queue: !!userId, kind: 'synced', now, id });
    cleanups.push(device.subscribe(() => listeners.emit()));
    if (!userId || !transportFor) return { device, engine: null, userId: null };

    const hasWindow = typeof window !== 'undefined';
    const engine = createSyncEngine({
      db: device.db, transport: transportFor(userId), lockName: `${dbName}:sync`,
      locks: hasWindow ? (navigator.locks ?? null) : null,
      online: () => !hasWindow || navigator.onLine !== false,
      now: now ? () => now().getTime() : undefined,
      onPulled: () => device.changed(),
    });
    cleanups.push(engine.subscribe(() => { status = { ...engine.status(), mode: 'signed-in' }; statusListeners.emit(); }));
    status = { ...status, mode: 'signed-in' };
    statusListeners.emit();

    if (autoSync && hasWindow) {
      let retry: ReturnType<typeof setTimeout> | undefined;
      const scheduleRetry = () => {
        clearTimeout(retry);
        const at = engine.nextRetryAt();
        if (at !== null) retry = setTimeout(() => void engine.syncNow().then(scheduleRetry), Math.max(1000, at - Date.now()));
      };
      const kick = () => void engine.syncNow().then(scheduleRetry);
      const onVisible = () => { if (document.visibilityState === 'visible') kick(); };
      const timer = setInterval(() => { if (document.visibilityState === 'visible') kick(); }, PERIOD_MS);
      window.addEventListener('online', kick);
      document.addEventListener('visibilitychange', onVisible);
      cleanups.push(() => { clearInterval(timer); clearTimeout(retry); window.removeEventListener('online', kick); document.removeEventListener('visibilitychange', onVisible); });
      kick();
    } else await engine.refresh();
    return { device, engine, userId };
  })();

  let soon: ReturnType<typeof setTimeout> | undefined;
  /** After a local change: count it at once (the badge), upload shortly after (rapid edits share one run). */
  async function afterWrite() {
    const { engine } = await ready;
    if (!engine) return;
    await engine.refresh();
    if (!autoSync) return;
    clearTimeout(soon);
    soon = setTimeout(() => void engine.syncNow(), AFTER_WRITE_MS);
  }

  const store: SyncedStore = {
    kind: 'synced',
    async list() { return (await ready).device.list(); },
    async add(body) { const note = await (await ready).device.add(body); void afterWrite(); return note; },
    async update(noteId, body) { const note = await (await ready).device.update(noteId, body); void afterWrite(); return note; },
    async remove(noteId) { await (await ready).device.remove(noteId); void afterWrite(); },
    subscribe: listeners.add,
    sync: { get: () => status, subscribe: statusListeners.add },
    guestNotes: {
      /** Notes this device kept before sign-in. 0 for guests (they are already looking at them). */
      async count() {
        const { userId } = await ready;
        if (!userId) return 0;
        const guest = createDeviceStore({ dbName: dbNameFor(slug, null) });
        try { return (await guest.list()).length; } catch { return 0; } finally { guest.close(); }
      },
      /** Copy them into the account (queued for upload), then clear the guest copy. Only when the person asks. */
      async moveIn() {
        const { userId, device } = await ready;
        if (!userId) return 0;
        const guest = createDeviceStore({ dbName: dbNameFor(slug, null) });
        try {
          const notes: Note[] = await guest.list();
          const moved = await device.importNotes(notes);
          for (const n of notes) await guest.remove(n.id);             // only after the import committed
          void afterWrite();
          return moved;
        } finally { guest.close(); }
      },
    },
    async syncNow() { const { engine } = await ready; await engine?.syncNow(); },
    close() { clearTimeout(soon); void ready.then(({ device }) => { cleanups.splice(0).forEach((fn) => fn()); device.close(); }); },
  };
  return store;
}
