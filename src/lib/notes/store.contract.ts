// lib/notes/store.contract.ts — ONE test suite that every NotesStore must pass (memory, IndexedDB, server, synced).
// A store is only allowed into the app when `notesStoreContract('<name>', factory)` is green in its own *.test.ts.
import { describe, it, expect, afterEach } from 'vitest';
import type { NotesStore } from './store';
import { StoreError } from './store';
import type { StoreClock } from './memory-store';

export type StoreFactory = (clock: Required<StoreClock>) => Promise<{ store: NotesStore; cleanup?: () => Promise<void> | void }>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

/** A clock that moves one second per call, so "newest first" is deterministic. */
function testClock() {
  let t = Date.parse('2026-01-01T00:00:00.000Z');
  let n = 0;
  return {
    now: () => new Date((t += 1000)),
    id: () => `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}`,
    back: (ms: number) => { t -= ms; },                            // turn the device clock back
  };
}

async function rejection(p: Promise<unknown>): Promise<StoreError> {
  try { await p; } catch (e) { expect(e).toBeInstanceOf(StoreError); return e as StoreError; }
  throw new Error('expected the store to reject');
}

export function notesStoreContract(name: string, make: StoreFactory) {
  describe(`${name} — NotesStore contract`, () => {
    let cleanup: (() => Promise<void> | void) | undefined;
    afterEach(async () => { await cleanup?.(); cleanup = undefined; });
    const setup = async () => {
      const clock = testClock();
      const made = await make({ now: clock.now, id: clock.id });
      cleanup = made.cleanup;
      return { store: made.store, clock };
    };

    it('starts empty', async () => {
      const { store } = await setup();
      expect(await store.list()).toEqual([]);
    });

    it('adds a note: uuid id, trimmed body, created = updated', async () => {
      const { store } = await setup();
      const note = await store.add('  Buy milk  ');
      expect(note.id).toMatch(UUID);
      expect(note.body).toBe('Buy milk');
      expect(note.createdAt).toBe(note.updatedAt);
      expect(await store.list()).toEqual([note]);
    });

    it('rejects an empty or too-long note with the message to show, and saves nothing', async () => {
      const { store } = await setup();
      const empty = await rejection(store.add('   '));
      expect(empty.code).toBe('invalid');
      expect(empty.message).toBe('Write something first.');
      const long = await rejection(store.add('x'.repeat(2001)));
      expect(long.code).toBe('invalid');
      expect(long.message).toMatch(/under 2,000 characters/);
      expect(await store.list()).toEqual([]);
    });

    it('lists the newest change first', async () => {
      const { store } = await setup();
      const a = await store.add('first');
      const b = await store.add('second');
      expect((await store.list()).map((n) => n.id)).toEqual([b.id, a.id]);
      await store.update(a.id, 'first, edited');
      expect((await store.list()).map((n) => n.id)).toEqual([a.id, b.id]);
    });

    it('updates the body and time, keeps the id and creation time', async () => {
      const { store } = await setup();
      const note = await store.add('draft');
      const edited = await store.update(note.id, ' final ');
      expect(edited).toMatchObject({ id: note.id, body: 'final', createdAt: note.createdAt });
      expect(edited.updatedAt > note.updatedAt).toBe(true);
      expect(await store.list()).toEqual([edited]);
    });

    it('an edit moves time forward even when the device clock was turned back', async () => {
      const { store, clock } = await setup();
      const note = await store.add('draft');
      clock.back(60 * 60 * 1000);
      const edited = await store.update(note.id, 'edited');
      expect(edited.updatedAt > note.updatedAt).toBe(true);
    });

    it('rejects an invalid edit and keeps the note unchanged', async () => {
      const { store } = await setup();
      const note = await store.add('keep me');
      expect((await rejection(store.update(note.id, ''))).code).toBe('invalid');
      expect(await store.list()).toEqual([note]);
    });

    it('editing a note that is gone says not-found', async () => {
      const { store } = await setup();
      expect((await rejection(store.update('00000000-0000-4000-8000-00000000ffff', 'hi'))).code).toBe('not-found');
    });

    it('removes a note; removing it again is fine', async () => {
      const { store } = await setup();
      const a = await store.add('a');
      const b = await store.add('b');
      await store.remove(a.id);
      await store.remove(a.id);
      expect(await store.list()).toEqual([b]);
    });

    it('tells subscribers about every change, until they unsubscribe', async () => {
      const { store } = await setup();
      let calls = 0;
      const off = store.subscribe(() => { calls++; });
      const note = await store.add('a');
      await store.update(note.id, 'b');
      await store.remove(note.id);
      await expect.poll(() => calls).toBe(3);
      off();
      await store.add('c');
      await new Promise((r) => setTimeout(r, 20));
      expect(calls).toBe(3);
    });

    it('hands out copies — changing a returned note changes nothing stored', async () => {
      const { store } = await setup();
      const note = await store.add('original');
      note.body = 'tampered';
      (await store.list())[0].body = 'tampered too';
      expect((await store.list())[0].body).toBe('original');
    });
  });
}
