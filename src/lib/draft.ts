// src/lib/draft.ts — Zero-Loss Draft Autosave & Panic Purge Protocol (SFIC 2026).
// ⛔ MANDATORY LAW: Zero network egress. Pure client-side storage sandboxing.
// Encapsulates incident draft serialization, schema validation, and 1-tap Panic Purge.

import type { Txn } from '@/lib/engine/golden';

export const DRAFT_STORAGE_KEY = 'pausepoint:report_draft_v1';
export const PANIC_PURGE_EVENT = 'pausepoint:panic-purge';

export interface ReportDraft {
  version: 1;
  updatedAt: string;
  txns: Txn[];
  activeIndex: number;
}

export function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const testKey = '__pausepoint_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function serializeDraft(txns: Txn[], activeIndex = 0): string {
  const draft: ReportDraft = {
    version: 1,
    updatedAt: new Date().toISOString(),
    txns,
    activeIndex: Math.max(0, Math.min(activeIndex, txns.length - 1)),
  };
  return JSON.stringify(draft);
}

export function deserializeDraft(raw: string): ReportDraft | null {
  if (!raw || typeof raw !== 'string') return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ReportDraft>;
    if (parsed && parsed.version === 1 && Array.isArray(parsed.txns) && parsed.txns.length > 0) {
      return {
        version: 1,
        updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
        txns: parsed.txns,
        activeIndex: typeof parsed.activeIndex === 'number' ? parsed.activeIndex : 0,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveDraft(txns: Txn[], activeIndex = 0): boolean {
  if (!isStorageAvailable() || txns.length === 0) return false;
  try {
    const raw = serializeDraft(txns, activeIndex);
    window.localStorage.setItem(DRAFT_STORAGE_KEY, raw);
    return true;
  } catch (err) {
    console.warn('Failed to save draft to localStorage:', err);
    return false;
  }
}

export function loadDraft(): ReportDraft | null {
  if (!isStorageAvailable()) return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    return deserializeDraft(raw);
  } catch {
    return null;
  }
}

export function clearDraft(): boolean {
  if (!isStorageAvailable()) return false;
  try {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export interface PanicPurgeResult {
  clearedCount: number;
  clearedKeys: string[];
  timestamp: string;
}

export function panicPurgeAllData(): PanicPurgeResult {
  const result: PanicPurgeResult = {
    clearedCount: 0,
    clearedKeys: [],
    timestamp: new Date().toISOString(),
  };

  if (typeof window === 'undefined') return result;

  try {
    // 1. Purge all localStorage keys matching pausepoint or incident artifacts
    const keysToPurge: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (
        key &&
        (key.startsWith('pausepoint') ||
          key.includes('draft') ||
          key.includes('codeword') ||
          key.includes('contacts'))
      ) {
        keysToPurge.push(key);
      }
    }

    for (const key of keysToPurge) {
      window.localStorage.removeItem(key);
      result.clearedKeys.push(key);
    }

    // 2. Clear sessionStorage completely
    window.sessionStorage.clear();

    result.clearedCount = result.clearedKeys.length;

    // 3. Dispatch global broadcast so all mounted components reset their memory state
    window.dispatchEvent(new CustomEvent(PANIC_PURGE_EVENT, { detail: result }));
  } catch (err) {
    console.warn('Error during panic purge:', err);
  }

  return result;
}

export function onPanicPurge(callback: (res?: PanicPurgeResult) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => {
    const custom = e as CustomEvent<PanicPurgeResult>;
    callback(custom.detail);
  };
  window.addEventListener(PANIC_PURGE_EVENT, handler);
  return () => window.removeEventListener(PANIC_PURGE_EVENT, handler);
}
