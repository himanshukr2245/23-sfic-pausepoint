'use server';
// modules/auth/notes-actions.ts — the server side of the account notes store (auth module without offline). Server Actions are public
// HTTP endpoints: every argument is validated, identity comes from the verified session — never from an argument (no userId param) —
// and RLS on starter_notes decides which rows exist for this person (SEC-4, SEC-5). Errors leave as codes, never as raw text.
import * as z from '@/lib/zod';
import { uid } from '@/lib/sync/uid';
import { NoteBody, type Note } from '@/lib/notes/model';
import type { StoreErrorCode } from '@/lib/notes/store';
import { createClient } from './supabase/server';
import { AUTH_CONFIGURED } from './config';

export type ActionResult<T> = { ok: true; data: T } | { ok: false; code: StoreErrorCode; message?: string };
type Row = { id: string; body: string; created_at: string; updated_at: string };

const Id = z.uuid();
const COLS = 'id, body, created_at, updated_at';
const toNote = (r: Row): Note => ({ id: r.id, body: r.body, createdAt: new Date(r.created_at).toISOString(), updatedAt: new Date(r.updated_at).toISOString() });

/** The person's own client, or null when nobody is signed in (or accounts are off). */
async function signedInClient() {
  if (!AUTH_CONFIGURED) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  return !error && typeof data?.claims?.sub === 'string' ? supabase : null;
}

const invalid = (message?: string): ActionResult<never> => ({ ok: false, code: 'invalid', message });
const SIGNED_OUT: ActionResult<never> = { ok: false, code: 'signed-out' };
const FAILED: ActionResult<never> = { ok: false, code: 'unknown' };

export async function listNotesAction(): Promise<ActionResult<Note[]>> {
  const supabase = await signedInClient();
  if (!supabase) return SIGNED_OUT;
  const { data, error } = await supabase.from('starter_notes').select(COLS).is('deleted_at', null)
    .order('updated_at', { ascending: false }).limit(500);
  return error ? FAILED : { ok: true, data: (data as Row[]).map(toNote) };
}

export async function addNoteAction(body: unknown): Promise<ActionResult<Note>> {
  const parsed = NoteBody.safeParse(body);
  if (!parsed.success) return invalid(parsed.error.issues[0]?.message);
  const supabase = await signedInClient();
  if (!supabase) return SIGNED_OUT;
  const at = new Date().toISOString();
  const { data, error } = await supabase.from('starter_notes').insert({ id: uid(), body: parsed.data, created_at: at, updated_at: at })
    .select(COLS).single();
  return error || !data ? FAILED : { ok: true, data: toNote(data as Row) };
}

export async function updateNoteAction(id: unknown, body: unknown): Promise<ActionResult<Note>> {
  const noteId = Id.safeParse(id), parsed = NoteBody.safeParse(body);
  if (!noteId.success) return { ok: false, code: 'not-found' };
  if (!parsed.success) return invalid(parsed.error.issues[0]?.message);
  const supabase = await signedInClient();
  if (!supabase) return SIGNED_OUT;
  const { data, error } = await supabase.from('starter_notes').update({ body: parsed.data, updated_at: new Date().toISOString() })
    .eq('id', noteId.data).is('deleted_at', null).select(COLS).maybeSingle();
  if (error) return FAILED;
  return data ? { ok: true, data: toNote(data as Row) } : { ok: false, code: 'not-found' };
}

/** A tombstone, not a hard delete: other devices learn about the deletion on their next sync. The text is wiped immediately. */
export async function removeNoteAction(id: unknown): Promise<ActionResult<null>> {
  const noteId = Id.safeParse(id);
  if (!noteId.success) return { ok: true, data: null };             // nothing with that id can exist: already "removed"
  const supabase = await signedInClient();
  if (!supabase) return SIGNED_OUT;
  const at = new Date().toISOString();
  const { error } = await supabase.from('starter_notes').update({ body: '', deleted_at: at, updated_at: at })
    .eq('id', noteId.data).is('deleted_at', null);
  return error ? FAILED : { ok: true, data: null };
}
