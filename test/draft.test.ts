import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  serializeDraft,
  deserializeDraft,
  saveDraft,
  loadDraft,
  clearDraft,
  panicPurgeAllData,
  DRAFT_STORAGE_KEY,
} from '../src/lib/draft.ts';
import type { Txn } from '../src/lib/engine/golden.ts';

// In-memory mock storage for testing
class MockLocalStorage {
  private store: Map<string, string> = new Map();

  get length(): number {
    return this.store.size;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

describe('Phase C: Zero-Loss Draft Autosave & Panic Purge Protocol', () => {
  const mockTxns: Txn[] = [
    {
      amountInr: 15000,
      utr: '429812345678',
      payeeName: 'RAHUL SHARMA',
      payeeVpa: 'rahul.jobs.hr@okaxis',
      channel: 'upi',
      warnings: [],
      when: '2026-10-18T15:42:00.000Z',
    },
    {
      amountInr: 50000,
      utr: '512398765432',
      payeeName: 'CBI VERIFY CELL',
      channel: 'netbanking',
      warnings: [],
      when: '2026-10-18T16:00:00.000Z',
    },
  ];

  beforeEach(() => {
    // Setup global window and localStorage mocks for Node test environment
    const mockStorage = new MockLocalStorage();
    const mockSession = new MockLocalStorage();
    // @ts-expect-error Mocking window in Node test runner
    globalThis.window = {
      localStorage: mockStorage,
      sessionStorage: mockSession,
      dispatchEvent: () => true,
      addEventListener: () => {},
      removeEventListener: () => {},
    };
  });

  test('serializes and deserializes transaction drafts with schema versioning', () => {
    const raw = serializeDraft(mockTxns, 1);
    assert.ok(raw.length > 0);

    const draft = deserializeDraft(raw);
    assert.ok(draft !== null);
    assert.equal(draft.version, 1);
    assert.equal(draft.activeIndex, 1);
    assert.equal(draft.txns.length, 2);
    assert.equal(draft.txns[0]?.utr, '429812345678');
    assert.equal(draft.txns[1]?.amountInr, 50000);
  });

  test('handles corrupted or invalid JSON drafts gracefully without throwing', () => {
    assert.equal(deserializeDraft(''), null);
    assert.equal(deserializeDraft('invalid-json{{{'), null);
    assert.equal(deserializeDraft('{"version":2}'), null); // wrong version
    assert.equal(deserializeDraft('{"version":1,"txns":[]}'), null); // empty txns
    assert.equal(deserializeDraft('null'), null);
  });

  test('saves and loads active draft from storage sandbox', () => {
    const saved = saveDraft(mockTxns, 0);
    assert.equal(saved, true);

    const loaded = loadDraft();
    assert.ok(loaded !== null);
    assert.equal(loaded.txns.length, 2);
    assert.equal(loaded.activeIndex, 0);

    const cleared = clearDraft();
    assert.equal(cleared, true);
    assert.equal(loadDraft(), null);
  });

  test('panic purge completely eradicates all local drafts, codewords, and contacts', () => {
    // Populate storage with diverse sensitive items
    window.localStorage.setItem(DRAFT_STORAGE_KEY, serializeDraft(mockTxns, 0));
    window.localStorage.setItem('pausepoint_codeword', 'EAGLE-99');
    window.localStorage.setItem('pausepoint_contacts', JSON.stringify([{ name: 'Dad', phone: '9876543210' }]));
    window.localStorage.setItem('pausepoint_active_draft', 'old_format_trace');
    window.localStorage.setItem('unrelated_key', 'keep_this_safe');

    const result = panicPurgeAllData();

    // Verifies sensitive keys were removed
    assert.ok(result.clearedCount >= 4);
    assert.equal(window.localStorage.getItem(DRAFT_STORAGE_KEY), null);
    assert.equal(window.localStorage.getItem('pausepoint_codeword'), null);
    assert.equal(window.localStorage.getItem('pausepoint_contacts'), null);
    assert.equal(window.localStorage.getItem('pausepoint_active_draft'), null);

    // Verifies unrelated keys were not touched
    assert.equal(window.localStorage.getItem('unrelated_key'), 'keep_this_safe');
  });
});
