// modules/offline/db.ts — the device database (IndexedDB via idb). OFF-2 rules:
//  - one database PER PERSON: `<slug>:<user id>`, guests `<slug>:guest` — a shared phone never shows one person's notes to another
//  - upgrades are a `switch (oldVersion)` that falls through, so a phone that skipped versions still runs every step in order
//  - another tab opening a newer version → this tab closes its connection and says "reload" (instead of blocking that tab forever)
//  - the browser killing the connection (storage pressure, Safari) → the next call simply reopens
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Note } from '@/lib/notes/model';
import { StoreError } from '@/lib/notes/store';
import type { OutboxEntry } from './sync/outbox';

export const DB_VERSION = 1;

export interface DeviceDB extends DBSchema {
  notes: { key: string; value: Note; indexes: { byUpdated: string } };
  /** Changes waiting to be sent to the server (only filled when sync is on). Written in the SAME transaction as the note. */
  outbox: { key: string; value: OutboxEntry };
  /** Small key/value facts: the sync cursor, "storage persistence asked", … */
  meta: { key: string; value: unknown };
}

export { dbNameFor } from '@/lib/device-db';                    // the naming rule lives in core (auth wipes a person's database too)

export interface DbHandle {
  get(): Promise<IDBPDatabase<DeviceDB>>;
  close(): void;
}

/** Opens lazily, reuses one connection, and recovers from the two ways a connection dies. */
export function deviceDb(name: string): DbHandle {
  let conn: Promise<IDBPDatabase<DeviceDB>> | null = null;
  let outdated = false;

  const open = () => {
    if (typeof indexedDB === 'undefined') return Promise.reject(new StoreError('unavailable'));
    return openDB<DeviceDB>(name, DB_VERSION, {
      upgrade(db, oldVersion) {
        switch (oldVersion) {
          case 0: {
            db.createObjectStore('notes', { keyPath: 'id' }).createIndex('byUpdated', 'updatedAt');
            db.createObjectStore('outbox', { keyPath: 'id' });
            db.createObjectStore('meta');
          }
          // case 1: a future version adds its step here — no break between cases
        }
      },
      blocking() { outdated = true; void conn?.then((db) => db.close()); conn = null; },   // a newer tab is waiting for us
      terminated() { conn = null; },                                                     // the browser closed it: reopen next time
    }).catch((e: unknown) => {
      conn = null;
      const errName = (e as { name?: string } | null)?.name;
      if (errName === 'VersionError') throw new StoreError('outdated');
      if (errName === 'QuotaExceededError') throw new StoreError('quota');
      throw new StoreError('unavailable');                         // private mode, blocked storage, broken profile
    });
  };

  return {
    get() {
      if (outdated) return Promise.reject(new StoreError('outdated'));
      return (conn ??= open());
    },
    close() { void conn?.then((db) => db.close()).catch(() => {}); conn = null; },
  };
}
