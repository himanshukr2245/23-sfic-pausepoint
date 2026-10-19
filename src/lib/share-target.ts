// src/lib/share-target.ts — Android Native PWA Web Share Target Ingestion.
// ⛔ MANDATORY LAW: Zero external network calls. Reads on-device CacheStorage.

export const SHARE_CACHE = 'pausepoint-shared-receipts';
export const SHARED_IMAGE_KEY = '/shared-receipt-incoming';
export const SHARED_TEXT_KEY = '/shared-text-incoming';

export interface ConsumedShare {
  file: File | null;
  text: string | null;
}

/**
 * Checks if a shared receipt image or SMS text payload was received via Android Share Sheet.
 * Consumes the item from CacheStorage so it is only processed once.
 */
export async function consumeSharedPayload(): Promise<ConsumedShare> {
  const result: ConsumedShare = { file: null, text: null };
  if (typeof window === 'undefined' || !('caches' in window)) return result;

  try {
    const cache = await window.caches.open(SHARE_CACHE);

    // 1. Check for incoming image file
    const imgRes = await cache.match(SHARED_IMAGE_KEY);
    if (imgRes) {
      const blob = await imgRes.blob();
      const rawName = imgRes.headers.get('x-shared-name');
      const fileName = rawName ? decodeURIComponent(rawName) : 'shared-receipt.png';
      result.file = new File([blob], fileName, { type: blob.type || 'image/png' });
      await cache.delete(SHARED_IMAGE_KEY);
    }

    // 2. Check for incoming text payload (e.g. shared SMS)
    const textRes = await cache.match(SHARED_TEXT_KEY);
    if (textRes) {
      result.text = await textRes.text();
      await cache.delete(SHARED_TEXT_KEY);
    }
  } catch (err) {
    console.warn('Failed to consume shared payload from CacheStorage:', err);
  }

  return result;
}
