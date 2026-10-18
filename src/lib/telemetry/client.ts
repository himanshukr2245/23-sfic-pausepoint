// lib/telemetry/client.ts — browser side of the telemetry contract (OPS-2).
// Every event passes the allow-list (toTelemetryEvent) BEFORE it is kept; events wait in a small ring buffer and are flushed with
// navigator.sendBeacon to /api/log when online — on the next tick, when the tab hides, and when the network returns.
// Offline is a normal state (LAW-9): events simply wait; they never go into the user's data outbox.
import { RingBuffer, toTelemetryEvent, type TelemetryEvent } from './events';
import { RELEASE } from '@/lib/site';

export const LOG_ENDPOINT = '/api/log';
const MAX_BATCH = 20;

type Transport = (url: string, body: string) => boolean;
type Env = { online: () => boolean; send: Transport };

const browserEnv = (): Env => ({
  online: () => typeof navigator === 'undefined' || navigator.onLine !== false,
  send: (url, body) => {
    try { return typeof navigator !== 'undefined' && !!navigator.sendBeacon?.(url, new Blob([body], { type: 'application/json' })); }
    catch { return false; }
  },
});

export function createTelemetry(env: Env = browserEnv(), capacity = 100) {
  const buffer = new RingBuffer<TelemetryEvent>(capacity);
  let scheduled = false;

  function flush(): number {
    if (!env.online() || buffer.size === 0) return 0;
    const batch = buffer.drain();
    let sent = 0;
    for (let i = 0; i < batch.length; i += MAX_BATCH) {
      const chunk = batch.slice(i, i + MAX_BATCH);
      if (env.send(LOG_ENDPOINT, JSON.stringify(chunk))) sent += chunk.length;
      else { for (const e of batch.slice(i)) buffer.push(e); break; }   // keep what could not be handed over
    }
    return sent;
  }

  /** Validate, buffer, and schedule a flush. Unknown events or fields are dropped — nothing personal ever leaves the device. */
  function report(raw: Record<string, unknown>): TelemetryEvent | null {
    const platform = typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches ? 'pwa' : 'web';
    const event = toTelemetryEvent({ release: RELEASE, environment: process.env.NODE_ENV === 'production' ? 'production' : 'development', platform,
      route: typeof location !== 'undefined' ? location.pathname : undefined, ...raw });
    if (!event) return null;
    if (process.env.NODE_ENV !== 'production') console.info('[telemetry]', event);
    buffer.push(event);
    if (!scheduled) { scheduled = true; queueMicrotask(() => { scheduled = false; flush(); }); }
    return event;
  }

  return { report, flush, get size() { return buffer.size; } };
}

export const telemetry = createTelemetry();
