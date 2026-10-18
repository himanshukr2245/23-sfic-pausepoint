// lib/notes/active.ts — the one place that decides which NotesStore this app uses (written by hk:init: offline module only).
// Notes live in this browser on this device (IndexedDB); nothing is sent anywhere.
import { SITE } from '@/lib/site';
import { createDeviceStore } from '@/modules/offline/device-store';
import { dbNameFor } from '@/lib/device-db';
import type { NotesStore, StoreKind } from '@/lib/notes/store';

/** Known at build time, so the server can render the right "where your notes live" sentence. */
export const NOTES_KIND: StoreKind = 'device';

let store: NotesStore | null = null;

/** Browser only — call it from effects and event handlers, never during render (there is no IndexedDB on the server). */
export function getNotesStore(): NotesStore {
  return (store ??= createDeviceStore({ dbName: dbNameFor(SITE.slug) }));
}
