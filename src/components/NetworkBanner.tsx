'use client';
// components/NetworkBanner.tsx — an honest, calm notice when the device is offline (OFF-1: every app shows one, even without offline support).
import { useOnline } from '@/lib/use-online';

export function NetworkBanner({ offlineMessage = 'You are offline. Anything you already opened still works; new changes will wait for the connection.' }: { offlineMessage?: string }) {
  const online = useOnline();
  if (online) return null;
  return (
    <div role="status" aria-live="polite" className="sticky top-0 z-40 border-b border-border bg-surface-2 px-4 py-3 text-center text-sm text-fg">
      {offlineMessage}
    </div>
  );
}
