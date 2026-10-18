// lib/notes/store.ts — the contract every notes store keeps. The screen only ever talks to this interface, so a module can swap
// where notes live (this device, the account, or both with sync) without touching the UI. store.contract.ts proves each store keeps it.
import type { Note } from './model';

/** Where notes live — the screen says it in plain words (honesty: never imply sync or backup that is not there). */
export type StoreKind = 'device' | 'account' | 'synced';

/** Sync stores only. `mode`: 'local-only' = accounts are not switched on in this copy of the app; 'guest' = could sign in to sync. */
export interface SyncStatus {
  mode: 'local-only' | 'guest' | 'signed-in';
  pending: number;                 // changes saved on this device, not yet acknowledged by the server
  failed: number;                  // of those, how many failed their last attempt (they retry with backoff)
  syncing: boolean;
  lastSyncedAt: string | null;
}

export interface NotesStore {
  readonly kind: StoreKind;
  /** Every note, newest change first. */
  list(): Promise<Note[]>;
  /** Validates with NoteBody; rejects with StoreError('invalid') and the message to show. */
  add(body: string): Promise<Note>;
  /** Rejects with StoreError('not-found') when the note is gone (e.g. deleted in another tab). */
  update(id: string, body: string): Promise<Note>;
  /** Idempotent: removing a note that is already gone is not an error. */
  remove(id: string): Promise<void>;
  /** Called after every change — this store's own, another tab's, or a sync. Returns the unsubscribe function. */
  subscribe(listener: () => void): () => void;
  /** Sync stores: what is waiting to upload. Absent on stores that never sync (the screen then promises nothing about syncing). */
  readonly sync?: { get(): SyncStatus; subscribe(listener: () => void): () => void };
  /** Synced store, signed in: notes this device kept as a guest, which the person may move into their account — never automatically. */
  readonly guestNotes?: { count(): Promise<number>; moveIn(): Promise<number> };
}

export type StoreErrorCode = 'invalid' | 'not-found' | 'unavailable' | 'outdated' | 'quota' | 'signed-out' | 'network' | 'unknown';

/** Human words for each failure (LAW-10: say what happened and what to do; never a raw error). */
export const STORE_MESSAGES: Record<StoreErrorCode, string> = {
  invalid: 'Please check the note.',
  'not-found': 'That note no longer exists — it may have been deleted in another tab or on another device.',
  unavailable: 'This browser is not letting the app save on this device (a private window or blocked storage), so notes cannot be kept here.',
  outdated: 'The app was updated in another tab. Reload this page to keep saving.',
  quota: 'This device is out of storage space for the app. Free some space, then try again.',
  'signed-out': 'Please sign in again to see your notes.',
  network: 'Could not reach the server. Check your connection and try again.',
  unknown: 'Something went wrong while saving. Please try again.',
};

export class StoreError extends Error {
  readonly code: StoreErrorCode;
  constructor(code: StoreErrorCode, message: string = STORE_MESSAGES[code]) { super(message); this.name = 'StoreError'; this.code = code; }
}

/** Anything thrown by a store → a StoreError with words a person can act on. */
export function toStoreError(e: unknown): StoreError {
  if (e instanceof StoreError) return e;
  const name = (e as { name?: string } | null)?.name;
  if (name === 'QuotaExceededError') return new StoreError('quota');
  if (name === 'VersionError') return new StoreError('outdated');
  return new StoreError('unknown');
}

/** A tiny listener set shared by the stores. */
export function createListeners() {
  const set = new Set<() => void>();
  return {
    add(fn: () => void) { set.add(fn); return () => { set.delete(fn); }; },
    emit() { for (const fn of [...set]) { try { fn(); } catch { /* one broken listener must not stop the others */ } } },
    get size() { return set.size; },
  };
}
