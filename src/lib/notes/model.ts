// lib/notes/model.ts — the Note: one shape and one set of rules for the browser, the device database and the server.
import * as z from '@/lib/zod';

export const NOTE_MAX = 2000;

/** What a person may type. The SAME schema runs in the browser (instant feedback) and on the server (the real check, SEC-5). */
export const NoteBody = z.string().check(
  z.trim(),
  z.minLength(1, 'Write something first.'),
  z.maxLength(NOTE_MAX, 'Please keep a note under 2,000 characters.'),
);

export interface Note {
  id: string;          // client UUID (lib/sync/uid.ts): a note has its id before any server sees it (OFF-2)
  body: string;
  createdAt: string;   // ISO 8601, UTC
  updatedAt: string;   // ISO 8601, UTC — last write wins when two devices edit the same note
}

/** A row read back from storage or the network is untrusted too: parse it before it reaches the screen. */
export const NoteRow = z.object({
  id: z.uuid(),
  body: z.string().check(z.maxLength(NOTE_MAX)),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
});

/** Validate what the person typed: the trimmed body, or the message to show next to the field. */
export function checkBody(input: unknown): { ok: true; body: string } | { ok: false; message: string } {
  const parsed = NoteBody.safeParse(input);
  return parsed.success ? { ok: true, body: parsed.data } : { ok: false, message: parsed.error.issues[0]?.message ?? 'Please check the note.' };
}

/** Newest change first; the id breaks ties so the order never jumps between renders. */
export const newestFirst = (a: Note, b: Note) => b.updatedAt.localeCompare(a.updatedAt) || b.id.localeCompare(a.id);

/** An edit always moves a note's time forward — even if the device clock was turned back since it was written (keeps last-write-wins sane). */
export function laterThan(now: Date, previous: string): string {
  const prev = Date.parse(previous);
  return new Date(Number.isFinite(prev) && now.getTime() <= prev ? prev + 1 : now.getTime()).toISOString();
}
