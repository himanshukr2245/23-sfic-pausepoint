import { describe, it, expect } from 'vitest';
import { notesStoreContract } from './store.contract';
import { createMemoryStore } from './memory-store';
import { checkBody, laterThan, newestFirst } from './model';
import { StoreError, toStoreError } from './store';

notesStoreContract('memory store', async (clock) => ({ store: createMemoryStore(clock) }));

describe('note model', () => {
  it('checkBody trims, and explains what is wrong', () => {
    expect(checkBody('  hi ')).toEqual({ ok: true, body: 'hi' });
    expect(checkBody('')).toEqual({ ok: false, message: 'Write something first.' });
    expect(checkBody(42)).toMatchObject({ ok: false });
  });

  it('laterThan never goes backwards', () => {
    expect(laterThan(new Date('2026-01-01T00:00:00.000Z'), '2026-06-01T00:00:00.000Z')).toBe('2026-06-01T00:00:00.001Z');
    expect(laterThan(new Date('2026-07-01T00:00:00.000Z'), '2026-06-01T00:00:00.000Z')).toBe('2026-07-01T00:00:00.000Z');
    expect(laterThan(new Date('2026-07-01T00:00:00.000Z'), 'garbage')).toBe('2026-07-01T00:00:00.000Z');
  });

  it('newestFirst breaks ties by id, so the order is stable', () => {
    const at = '2026-01-01T00:00:00.000Z';
    const rows = [{ id: 'a', body: '', createdAt: at, updatedAt: at }, { id: 'b', body: '', createdAt: at, updatedAt: at }];
    expect(rows.sort(newestFirst).map((r) => r.id)).toEqual(['b', 'a']);
  });
});

describe('toStoreError', () => {
  it('maps browser storage errors to words a person can act on', () => {
    expect(toStoreError(new DOMException('full', 'QuotaExceededError')).code).toBe('quota');
    expect(toStoreError(new DOMException('newer', 'VersionError')).code).toBe('outdated');
    expect(toStoreError(new Error('boom')).code).toBe('unknown');
    const own = new StoreError('not-found');
    expect(toStoreError(own)).toBe(own);
  });
});
