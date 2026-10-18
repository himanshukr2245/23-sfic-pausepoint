// lib/notes/memory-store.ts — the reference NotesStore: plain memory, gone on reload. Used by unit tests and as the readable spec of
// the contract; never shipped as a real store (an app that forgets notes on reload must not look like it keeps them).
import { uid } from '@/lib/sync/uid';
import { checkBody, laterThan, newestFirst, type Note } from './model';
import { StoreError, createListeners, type NotesStore } from './store';

export interface StoreClock { now?: () => Date; id?: () => string }

export function createMemoryStore({ now = () => new Date(), id = () => uid() }: StoreClock = {}): NotesStore {
  const notes = new Map<string, Note>();
  const listeners = createListeners();
  const valid = (body: string) => { const c = checkBody(body); if (!c.ok) throw new StoreError('invalid', c.message); return c.body; };

  return {
    kind: 'device',
    async list() { return [...notes.values()].map((n) => ({ ...n })).sort(newestFirst); },
    async add(body) {
      const at = now().toISOString();
      const note: Note = { id: id(), body: valid(body), createdAt: at, updatedAt: at };
      notes.set(note.id, note);
      listeners.emit();
      return { ...note };
    },
    async update(noteId, body) {
      const text = valid(body);
      const old = notes.get(noteId);
      if (!old) throw new StoreError('not-found');
      const note: Note = { ...old, body: text, updatedAt: laterThan(now(), old.updatedAt) };
      notes.set(noteId, note);
      listeners.emit();
      return { ...note };
    },
    async remove(noteId) { if (notes.delete(noteId)) listeners.emit(); },
    subscribe: listeners.add,
  };
}
