// lib/notes/active.ts — the one place that decides which NotesStore this app uses (hk:init writes the version for your modules).
// This template copy = auth + offline: notes are saved on this device first, then synced to the person's account.
import { SITE } from '@/lib/site';
import { createSyncedStore } from '@/modules/synced/synced-store';
import { lazyTransport } from '@/modules/synced/transport';
import { browserClient, localUserId } from '@/modules/auth/supabase/client';
import type { NotesStore, StoreKind } from './store';

/** Known at build time, so the server can render the right "where your notes live" sentence. */
export const NOTES_KIND: StoreKind = 'synced';

let store: NotesStore | null = null;

/** Browser only — call it from effects and event handlers, never during render (there is no IndexedDB on the server). */
export function getNotesStore(): NotesStore {
  const supabase = browserClient();                                // null when accounts are not switched on: guest, local only
  return (store ??= createSyncedStore({
    slug: SITE.slug,
    whoIsSignedIn: localUserId,
    transportFor: supabase ? () => lazyTransport(supabase) : null,
  }));
}
