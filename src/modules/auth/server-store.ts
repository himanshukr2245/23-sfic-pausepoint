// modules/auth/server-store.ts — notes kept in the person's account (auth module without offline). A thin browser adapter over the
// Server Actions in notes-actions.ts: validates first (instant feedback), turns result codes into StoreErrors, and tells the screen.
import { checkBody, type Note } from '@/lib/notes/model';
import { StoreError, STORE_MESSAGES, createListeners, type NotesStore } from '@/lib/notes/store';
import { addNoteAction, listNotesAction, removeNoteAction, updateNoteAction, type ActionResult } from './notes-actions';

export interface NotesApi {
  list(): Promise<ActionResult<Note[]>>;
  add(body: string): Promise<ActionResult<Note>>;
  update(id: string, body: string): Promise<ActionResult<Note>>;
  remove(id: string): Promise<ActionResult<null>>;
}

const serverApi: NotesApi = { list: listNotesAction, add: addNoteAction, update: updateNoteAction, remove: removeNoteAction };

export function createServerStore(api: NotesApi = serverApi): NotesStore {
  const listeners = createListeners();

  async function call<T>(request: () => Promise<ActionResult<T>>): Promise<T> {
    let result: ActionResult<T>;
    try { result = await request(); } catch { throw new StoreError('network'); }   // the request itself failed: offline, server down
    if (!result.ok) throw new StoreError(result.code, result.message ?? STORE_MESSAGES[result.code]);
    return result.data;
  }
  const valid = (body: string) => { const c = checkBody(body); if (!c.ok) throw new StoreError('invalid', c.message); return c.body; };

  return {
    kind: 'account',
    list: () => call(() => api.list()),
    // validate BEFORE the request starts: inside it, a validation error would be caught as "could not reach the server"
    async add(body) { const text = valid(body); const note = await call(() => api.add(text)); listeners.emit(); return note; },
    async update(id, body) { const text = valid(body); const note = await call(() => api.update(id, text)); listeners.emit(); return note; },
    async remove(id) { await call(() => api.remove(id)); listeners.emit(); },
    subscribe: listeners.add,
  };
}
