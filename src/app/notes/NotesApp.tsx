'use client';
// app/notes/NotesApp.tsx — the notes screen. It talks only to the NotesStore interface (lib/notes/store.ts), so it works unchanged
// whichever module provides the store. Every state is designed: loading, empty, error, saving, and "that note is gone".
// Rule: a failed save never loses what the person typed — the text stays in the box with the reason beside it.
import { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import { getNotesStore, NOTES_KIND } from '@/lib/notes/active';
import { checkBody, NOTE_MAX, type Note } from '@/lib/notes/model';
import { toStoreError, type StoreError, type StoreErrorCode, type StoreKind, type SyncStatus } from '@/lib/notes/store';
import { useOnline } from '@/lib/use-online';
import { telemetry } from '@/lib/telemetry/client';
import { ERROR_CODES } from '@/lib/telemetry/events';
import { field, linkButton } from '@/components/ui/classes';
import { GlassCard } from '@/components/ui/GlassCard';
import { playSuccessChime, unlockAudio } from '@/lib/audio/synthesizer';
import { Button } from '@/components/ui/Button';
import { Input, TextArea } from '@/components/ui/Input';

/** Where the notes live, in plain words — never more than is true (a guest's notes are NOT synced, so the text must not say so). */
function where(kind: StoreKind, sync: SyncStatus | null): string {
  if (kind === 'account') return 'Saved to your account.';
  if (kind === 'device' || sync?.mode === 'local-only') return 'Saved in this browser on this device. Nothing is sent anywhere.';
  if (sync?.mode === 'signed-in') return 'Saved on this device first, then synced to your account.';
  if (sync?.mode === 'guest') return 'Saved on this device. Sign in to keep them in your account too.';
  return 'Saved on this device.';                                  // before the store has said more (true in every synced mode)
}

const plural = (n: number, one: string, many: string) => `${n.toLocaleString('en-IN')} ${n === 1 ? one : many}`;

/** The sync badge (signed in only): what is waiting, and why — offline is normal, not an error (LAW-9). */
function syncLine(s: SyncStatus, online: boolean): string {
  if (s.pending === 0) return s.syncing ? 'Checking for changes…' : 'All changes synced.';
  const n = plural(s.pending, 'change', 'changes');
  if (!online) return `${n} saved on this device — they will sync when you are back online.`;
  if (s.syncing) return `Syncing ${n}…`;
  if (s.failed > 0) return `${n} waiting to sync — trying again shortly.`;
  return `${n} waiting to sync…`;
}

/** Technical telemetry only: a stable code, never the note or the error text (OPS-2). */
function report(e: StoreError) {
  const code = e.code === 'quota' ? ERROR_CODES.STORAGE_QUOTA_EXCEEDED
    : e.code === 'unavailable' || e.code === 'outdated' ? ERROR_CODES.IDB_OPEN_FAILED
    : e.code === 'network' || e.code === 'signed-out' ? ERROR_CODES.API_ERROR
    : e.code === 'unknown' ? ERROR_CODES.IDB_WRITE_FAILED : null;   // invalid / not-found are normal outcomes, not faults
  if (code) telemetry.report({ event: 'client_error', code });
}

const when = (iso: string) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));

type View = { state: 'loading' } | { state: 'ready'; notes: Note[] } | { state: 'error'; message: string; code: StoreErrorCode };

export function NotesApp() {
  const [view, setView] = useState<View>({ state: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [said, setSaid] = useState('');                           // polite screen-reader announcements ("Note saved.")
  const [sync, setSync] = useState<SyncStatus | null>(null);
  const [guestCount, setGuestCount] = useState(0);
  const [moving, setMoving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const online = useOnline();
  const listHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const store = getNotesStore();
    let alive = true;
    const load = () => store.list().then(
      (notes) => { if (alive) setView({ state: 'ready', notes }); },
      (e: unknown) => { const err = toStoreError(e); report(err); if (alive) setView({ state: 'error', message: err.message, code: err.code }); },
    );
    void load();
    const off = store.subscribe(() => void load());                // own changes, other tabs, sync — one path for all of them
    const offSync = store.sync?.subscribe(() => { if (alive) setSync(store.sync!.get()); });
    if (store.sync) queueMicrotask(() => { if (alive) setSync(store.sync!.get()); });
    void store.guestNotes?.count().then((n) => { if (alive) setGuestCount(n); });
    return () => { alive = false; off(); offSync?.(); };
  }, [attempt]);

  async function moveGuestNotes() {
    const store = getNotesStore();
    if (!store.guestNotes) return;
    setMoving(true);
    try {
      const moved = await store.guestNotes.moveIn();
      setGuestCount(0);
      setSaid(`Moved ${plural(moved, 'note', 'notes')} into your account.`);
    } catch (e) { const err = toStoreError(e); report(err); setSaid(err.message); }
    finally { setMoving(false); }
  }

  const filteredNotes = useMemo(() => {
    if (view.state !== 'ready') return [];
    if (!searchQuery.trim()) return view.notes;
    const q = searchQuery.toLowerCase();
    return view.notes.filter((n) => n.body.toLowerCase().includes(q));
  }, [view, searchQuery]);

  return (
    <div className="flex flex-col gap-8">
      {/* Precision Status Banner */}
      <div className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-surface/40 p-4 backdrop-blur-md">
        <p className="text-fg-muted" data-testid="notes-where">
          {where(NOTES_KIND, sync)}
          {sync?.mode === 'guest' && <> <Link href="/login?next=/notes" className="font-medium text-brand underline underline-offset-4">Sign in</Link></>}
        </p>
        {sync?.mode === 'signed-in' && (
          <p data-testid="sync-badge" className={sync.pending > 0 && sync.failed > 0 ? 'text-sm text-warning' : 'text-sm text-fg-muted'}>
            {syncLine(sync, online)}
          </p>
        )}
      </div>

      {guestCount > 0 && (
        <GlassCard interactive={false} borderRadius={20} className="border-warning/30 bg-warning/5 p-5">
          <div className="flex flex-col items-start gap-3">
            <div className="flex items-center gap-2 text-warning">
              <span className="text-base">⚠️</span>
              <span className="font-semibold text-sm">Unsynced Local Notes</span>
            </div>
            <p className="text-fg">This device has {plural(guestCount, 'note', 'notes')} from before you signed in. They are not in your account yet.</p>
            <Button type="button" variant="primary" disabled={moving} onClick={() => void moveGuestNotes()}>
              {moving ? 'Moving…' : 'Move them into my account'}
            </Button>
          </div>
        </GlassCard>
      )}

      {/* Composer Glass Card */}
      <Composer onSaved={() => setSaid('Note saved.')} />

      {/* Notes Collection Section */}
      <section aria-labelledby="your-notes" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="your-notes" ref={listHeading} tabIndex={-1} className="text-xl font-bold tracking-tight text-fg outline-none">
            Your notes{view.state === 'ready' && view.notes.length > 0 ? ` (${view.notes.length})` : ''}
          </h2>

          {/* Quick Filter Pill (visible when user has notes) */}
          {view.state === 'ready' && view.notes.length > 1 && (
            <div className="flex items-center gap-2 rounded-full border border-border/80 bg-surface/70 px-3 py-1 shadow-sm backdrop-blur-md focus-within:border-brand">
              <svg className="h-3.5 w-3.5 text-fg-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter notes…"
                className="w-28 bg-transparent text-xs text-fg placeholder:text-fg-muted focus:outline-none sm:w-44"
                aria-label="Filter notes"
              />
              {searchQuery && (
                <Button variant="plain" size="none" latencyMode="none"
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-[11px] font-semibold text-fg-muted hover:text-fg"
                  aria-label="Clear filter"
                >
                  Clear
                </Button>
              )}
            </div>
          )}
        </div>

        {view.state === 'loading' && (
          <div role="status" aria-label="Loading notes" className="flex animate-pulse flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <GlassCard
                key={i}
                interactive={false}
                borderRadius={20}
                className="flex min-h-[114px] flex-col justify-between gap-3 p-5"
              >
                <div className="space-y-2">
                  <div className="h-4 w-3/4 rounded bg-surface-2" />
                  <div className="h-3 w-1/4 rounded bg-surface-2/60" />
                </div>
                <div className="flex gap-2">
                  <div className="h-7 w-14 rounded bg-surface-2/40" />
                  <div className="h-7 w-16 rounded bg-surface-2/40" />
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {view.state === 'error' && (
          <GlassCard interactive={false} borderRadius={20} role="alert" className="flex flex-col items-start gap-3 p-6">
            <p className="text-danger font-medium">{view.message}</p>
            {view.code === 'signed-out'
              ? <Link href="/login?next=/notes" className={linkButton}>Sign in</Link>
              : <Button type="button" variant="secondary" onClick={() => { setView({ state: 'loading' }); setAttempt((a) => a + 1); }}>Try again</Button>}
          </GlassCard>
        )}

        {view.state === 'ready' && view.notes.length === 0 && (
          <p className="rounded-card border border-dashed border-border p-5 text-fg-muted">
            No notes yet. Write your first one above.
          </p>
        )}

        {view.state === 'ready' && view.notes.length > 0 && filteredNotes.length === 0 && (
          <p className="rounded-card border border-dashed border-border p-5 text-fg-muted">
            No notes matching &ldquo;{searchQuery}&rdquo;. <Button variant="plain" size="none" latencyMode="none" type="button" onClick={() => setSearchQuery('')} className="underline text-brand">Clear filter</Button>
          </p>
        )}

        {view.state === 'ready' && view.notes.length > 0 && filteredNotes.length > 0 && (
          <ul aria-label="Your notes" className="flex flex-col gap-4">
            {filteredNotes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                onDeleted={() => { setSaid('Note deleted.'); listHeading.current?.focus(); }}
                onSaved={() => setSaid('Note updated.')}
              />
            ))}
          </ul>
        )}
      </section>
      <p role="status" aria-live="polite" className="sr-only">{said}</p>
    </div>
  );
}

function Composer({ onSaved }: { onSaved: () => void }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const box = useRef<HTMLTextAreaElement>(null);

  async function save() {
    const check = checkBody(text);
    if (!check.ok) { setError(check.message); box.current?.focus(); return; }
    setSaving(true);
    setError('');
    try {
      await getNotesStore().add(text);
      setText('');
      playSuccessChime();
      onSaved();
    } catch (e) {
      const err = toStoreError(e);
      report(err);
      setError(err.message);                                       // the typed text stays in the box
    } finally {
      setSaving(false);
      box.current?.focus();
    }
  }

  const near = text.length > NOTE_MAX * 0.9;
  return (
    <GlassCard interactive={false} borderRadius={24} className="p-6">
      <form noValidate className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); void save(); }}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="new-note" className="text-sm font-semibold uppercase tracking-wider text-fg">
            New note
          </label>
          <div className="inline-flex items-center gap-1.5 text-xs text-fg-muted">
            <kbd className="rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[11px]">Ctrl</kbd>
            <span>+</span>
            <kbd className="rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[11px]">Enter</kbd>
            <span>to save</span>
          </div>
        </div>

        <TextArea
          id="new-note"
          ref={box}
          rows={3}
          value={text}
          className={field}
          placeholder="Jot down quick thoughts, blueprints, code snippets or scratch notes…"
          aria-invalid={!!error}
          aria-describedby="new-note-error new-note-count"
          onChange={(e) => { setText(e.target.value); if (error) setError(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); void save(); } }}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <Button type="submit" disabled={saving} variant="primary">
            {saving ? 'Saving…' : 'Add note'}
          </Button>
          <span id="new-note-count" className={near ? 'text-sm text-warning' : 'sr-only'}>
            {text.length.toLocaleString('en-IN')} of 2,000 characters
          </span>
        </div>

        <p id="new-note-error" role="alert" className="min-h-5 text-sm text-danger">
          {error}
        </p>
      </form>
    </GlassCard>
  );
}

function NoteItem({ note, onDeleted, onSaved }: { note: Note; onDeleted: () => void; onSaved: () => void }) {
  const [mode, setMode] = useState<'view' | 'edit' | 'confirm'>('view');
  const [draft, setDraft] = useState(note.body);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const editBox = useRef<HTMLTextAreaElement>(null);
  const editButton = useRef<HTMLButtonElement>(null);
  const editId = `edit-${note.id}`;

  useEffect(() => { if (mode === 'edit') editBox.current?.focus(); }, [mode]);

  async function run(work: () => Promise<unknown>, after: () => void) {
    setBusy(true);
    setError('');
    try { await work(); after(); }
    catch (e) { const err = toStoreError(e); report(err); setError(err.message); }
    finally { setBusy(false); }
  }

  const close = () => { setMode('view'); setError(''); requestAnimationFrame(() => editButton.current?.focus()); };
  const save = () => {
    const check = checkBody(draft);
    if (!check.ok) { setError(check.message); editBox.current?.focus(); return; }
    void run(() => getNotesStore().update(note.id, draft), () => { close(); onSaved(); });
  };

  const copyNote = async () => {
    try {
      unlockAudio();
      await navigator.clipboard.writeText(note.body);
      playSuccessChime();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard fail
    }
  };

  const wordCount = useMemo(() => {
    const trimmed = note.body.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [note.body]);

  return (
    <GlassCard as="li" borderRadius={20} interactive={mode === 'view'} className="p-5">
      {mode === 'edit' ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-brand">Edit Note</span>
            <span className="text-xs text-fg-muted">Esc to cancel</span>
          </div>
          <label htmlFor={editId} className="sr-only">Edit note</label>
          <TextArea
            id={editId}
            ref={editBox}
            rows={3}
            value={draft}
            className={field}
            aria-invalid={!!error}
            onChange={(e) => { setDraft(e.target.value); if (error) setError(''); }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { e.preventDefault(); close(); }
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); save(); }
            }}
          />
          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="button" variant="primary" disabled={busy} onClick={save}>
              {busy ? 'Saving…' : 'Save'}
            </Button>
            <Button type="button" variant="secondary" disabled={busy} onClick={close}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {/* Note Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5">
            <p className="text-xs font-medium text-fg-muted">
              <time dateTime={note.updatedAt}>
                {note.updatedAt === note.createdAt ? 'Added' : 'Edited'} {when(note.updatedAt)}
              </time>
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-surface-2 px-2.5 py-0.5 text-[11px] font-medium text-fg-muted">
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
              </span>
              <Button variant="plain" size="none" latencyMode="none"
                type="button"
                onClick={copyNote}
                className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-surface/50 px-2.5 py-0.5 text-[11px] font-medium text-fg-muted transition-colors hover:border-brand hover:text-brand"
                aria-label="Copy note contents"
              >
                {copied ? (
                  <>
                    <svg className="h-3 w-3 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-success">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="h-3 w-3 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Note Body */}
          <p className="whitespace-pre-wrap break-words text-base leading-relaxed text-fg">
            {note.body}
          </p>

          {/* Note Actions */}
          {mode === 'confirm' ? (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-danger/30 bg-danger/5 p-3">
              <span className="text-sm font-semibold text-fg">Delete this note?</span>
              <Button
                type="button"
                variant="danger"
                disabled={busy}
                onClick={() => void run(() => getNotesStore().remove(note.id), onDeleted)}
              >
                Yes, delete
              </Button>
              <Button type="button" variant="secondary" disabled={busy} onClick={() => setMode('view')}>
                Keep it
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button
                type="button"
                ref={editButton}
                variant="secondary"
                onClick={() => { setDraft(note.body); setMode('edit'); }}
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setMode('confirm')}
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      )}
      {error && <p role="alert" className="pt-2 text-sm text-danger">{error}</p>}
    </GlassCard>
  );
}
