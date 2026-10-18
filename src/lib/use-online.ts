'use client';
// lib/use-online.ts — is the device online? useSyncExternalStore reads navigator.onLine without hydration mismatches
// (the server always renders "online"). Shared by the network banner and the notes sync badge, so they never disagree.
import { useSyncExternalStore } from 'react';

const subscribe = (notify: () => void) => {
  window.addEventListener('online', notify);
  window.addEventListener('offline', notify);
  return () => { window.removeEventListener('online', notify); window.removeEventListener('offline', notify); };
};

export function useOnline(): boolean {
  return useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
}
