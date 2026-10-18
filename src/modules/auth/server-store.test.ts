// The account store's browser adapter must keep the same contract as every other store. The fake API below behaves like
// notes-actions.ts + RLS for one signed-in person (server time, tombstones, not-found, validation) without a network.
import { describe, it, expect, vi } from 'vitest';
import { notesStoreContract } from '@/lib/notes/store.contract';
import { checkBody, laterThan, newestFirst, type Note } from '@/lib/notes/model';
import type { StoreClock } from '@/lib/notes/memory-store';

import { createServerStore } from './server-store';

// never load the real Server Actions (next/headers, Supabase) in a unit test — the adapter is tested against the fake below
vi.mock('./notes-actions', () => ({ listNotesAction: vi.fn(), addNoteAction: vi.fn(), updateNoteAction: vi.fn(), removeNoteAction: vi.fn() }));
type Api = Parameters<typeof createServerStore>[0];

function fakeServer({ now, id }: Required<StoreClock>): NonNullable<Api> {
  const rows = new Map<string, Note & { deleted: boolean }>();
  const copy = (r: Note): Note => ({ id: r.id, body: r.body, createdAt: r.createdAt, updatedAt: r.updatedAt });
  return {
    list: async () => ({ ok: true, data: [...rows.values()].filter((r) => !r.deleted).map(copy).sort(newestFirst) }),
    add: async (body) => {
      const c = checkBody(body);
      if (!c.ok) return { ok: false, code: 'invalid', message: c.message };
      const at = now().toISOString();
      const row = { id: id(), body: c.body, createdAt: at, updatedAt: at, deleted: false };
      rows.set(row.id, row);
      return { ok: true, data: copy(row) };
    },
    update: async (noteId, body) => {
      const c = checkBody(body);
      if (!c.ok) return { ok: false, code: 'invalid', message: c.message };
      const row = rows.get(noteId);
      if (!row || row.deleted) return { ok: false, code: 'not-found' };
      Object.assign(row, { body: c.body, updatedAt: laterThan(now(), row.updatedAt) });
      return { ok: true, data: copy(row) };
    },
    remove: async (noteId) => { const row = rows.get(noteId); if (row) Object.assign(row, { deleted: true, body: '' }); return { ok: true, data: null }; },
  };
}

notesStoreContract('account store (Server Actions)', async (clock) => ({ store: createServerStore(fakeServer(clock)) }));

describe('account store — server answers', () => {
  it('signed out → a "please sign in" error the screen can act on', async () => {
    const store = createServerStore({ ...fakeServer({ now: () => new Date(), id: () => crypto.randomUUID() }), list: async () => ({ ok: false, code: 'signed-out' }) });
    await expect(store.list()).rejects.toMatchObject({ code: 'signed-out', message: expect.stringMatching(/sign in/i) });
  });
  it('a request that never reaches the server → "check your connection"', async () => {
    const store = createServerStore({ ...fakeServer({ now: () => new Date(), id: () => crypto.randomUUID() }), add: async () => { throw new TypeError('Failed to fetch'); } });
    await expect(store.add('hello')).rejects.toMatchObject({ code: 'network' });
  });
  it('validates in the browser before calling the server', async () => {
    const add = vi.fn();
    const store = createServerStore({ ...fakeServer({ now: () => new Date(), id: () => crypto.randomUUID() }), add });
    await expect(store.add('  ')).rejects.toMatchObject({ code: 'invalid', message: 'Write something first.' });
    expect(add).not.toHaveBeenCalled();
  });
});
