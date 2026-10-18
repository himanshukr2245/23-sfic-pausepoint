'use client';
// modules/offline/pwa/ServiceWorkerRegistrar.tsx — installs public/sw.js and offers updates politely (OFF-3). Mount once in the layout.
//  - production only: in `next dev` it REMOVES any worker left from a production run (a stale worker in dev serves old pages)
//  - /sw.js?v=<release> + updateViaCache 'none': every release is a new worker, and the browser never serves sw.js from its HTTP cache
//  - "A new version is ready" appears only when a new worker is WAITING and this page is already controlled (not on the first visit)
//  - the page reloads on `controllerchange` ONLY after the person tapped Reload — never mid-typing (a Smriti bug, fixed here)
import { useEffect, useRef, useState } from 'react';
import { RELEASE } from '@/lib/site';
import { telemetry } from '@/lib/telemetry/client';
import { primary, quiet } from '@/components/ui/classes';

export function ServiceWorkerRegistrar() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const accepted = useRef(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const sw = navigator.serviceWorker;
    if (process.env.NODE_ENV !== 'production') {
      void sw.getRegistrations().then((regs) => regs.forEach((r) => void r.unregister()));
      return;
    }
    let alive = true;
    const onControllerChange = () => { if (accepted.current) window.location.reload(); };
    sw.addEventListener('controllerchange', onControllerChange);

    sw.register(`/sw.js?v=${encodeURIComponent(RELEASE)}`, { scope: '/', updateViaCache: 'none' }).then((reg) => {
      const offer = () => { if (alive && reg.waiting && sw.controller) setWaiting(reg.waiting); };
      offer();
      reg.addEventListener('updatefound', () => {
        const next = reg.installing;
        next?.addEventListener('statechange', () => { if (next.state === 'installed') offer(); });
      });
    }).catch(() => telemetry.report({ event: 'client_error', code: 'SW_REGISTER_FAILED' }));

    return () => { alive = false; sw.removeEventListener('controllerchange', onControllerChange); };
  }, []);

  if (!waiting) return null;
  return (
    <div role="status" aria-live="polite"
      className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 mx-auto flex max-w-md flex-wrap items-center gap-3 rounded-card border border-border bg-surface p-4 text-fg shadow-lg">
      <p className="flex-1">A new version of the app is ready.</p>
      <button type="button" className={primary}
        onClick={() => { accepted.current = true; waiting.postMessage('SKIP_WAITING'); }}>Reload</button>
      <button type="button" className={quiet} onClick={() => setWaiting(null)}>Later</button>
    </div>
  );
}
