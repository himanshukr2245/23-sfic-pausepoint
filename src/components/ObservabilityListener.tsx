'use client';
// components/ObservabilityListener.tsx — turns window-level failures and network changes into allow-listed telemetry (OPS-2).
// Never logs the error text (it can contain user data) — only a stable code + the route.
import { useEffect } from 'react';
import { ERROR_CODES } from '@/lib/telemetry/events';
import { telemetry } from '@/lib/telemetry/client';

export function ObservabilityListener() {
  useEffect(() => {
    telemetry.report({ event: 'app_started' });
    const onError = () => telemetry.report({ event: 'client_error', code: ERROR_CODES.CLIENT_JS_EXCEPTION });
    const onRejection = () => telemetry.report({ event: 'unhandled_rejection', code: ERROR_CODES.UNHANDLED_REJECTION });
    const onOffline = () => telemetry.report({ event: 'offline_entered' });             // info, never an alert (offline ≠ failure)
    const onOnline = () => { telemetry.report({ event: 'online_restored' }); telemetry.flush(); };
    const onHide = () => { if (document.visibilityState === 'hidden') telemetry.flush(); };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onHide);
    };
  }, []);
  return null;
}
