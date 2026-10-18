// lib/notes/active.ts — the one place that decides which NotesStore this app uses (written by hk:init: auth module only).
// Notes live in the person's account (Server Actions + RLS). Signed out → the screen asks them to sign in.
import { createServerStore } from '@/modules/auth/server-store';
import type { NotesStore, StoreKind } from '@/lib/notes/store';

/** Known at build time, so the server can render the right "where your notes live" sentence. */
export const NOTES_KIND: StoreKind = 'account';

let store: NotesStore | null = null;

/** Browser only — call it from effects and event handlers, never during render. */
export function getNotesStore(): NotesStore {
  return (store ??= createServerStore());
}
