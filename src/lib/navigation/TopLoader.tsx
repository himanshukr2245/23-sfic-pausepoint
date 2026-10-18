'use client';
// navigation/TopLoader.tsx — instant feedback for soft (no-reload) navigation. Mount once in app/layout.tsx.
// Starts on the 'hk:nav-start' event, which instrumentation-client.ts fires from Next's onRouterTransitionStart for EVERY App Router
// navigation (Link clicks, router.push/replace, Back/Forward). Finishes when the new route has rendered (pathname or query changed).
// Logic lives in progress.ts (unit-tested); the animation loop lives inside the effect (React Compiler purity rule).
import { useEffect, useRef, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { NAV_START_EVENT, ProgressMachine, isPageChange } from './progress';

export { NAV_START_EVENT };
/** Start the bar by hand (only needed on Next < 15.3, which has no onRouterTransitionStart). */
export const startTopLoader = () => window.dispatchEvent(new Event(NAV_START_EVENT));

function Bar({ color = 'var(--loader, #2563eb)' }: { color?: string }) {   // tokens-ok (fallback when no --loader token is set)
  const pathname = usePathname();
  const search = useSearchParams();
  const machine = useRef<ProgressMachine | null>(null);
  const rendered = useRef('');                                     // the URL of the page currently on screen
  const [view, setView] = useState({ visible: false, value: 0 });

  useEffect(() => {
    const m = (machine.current ??= new ProgressMachine());
    let raf: number | null = null;
    const loop = () => {
      const v = m.tick(performance.now());
      setView(v);
      raf = v.visible ? requestAnimationFrame(loop) : null;
    };
    const begin = (e: Event) => {
      const url = (e as CustomEvent<{ url?: string }>).detail?.url;
      if (url && rendered.current && !isPageChange(url, rendered.current)) return;   // same page or a #hash jump: no bar
      m.start(performance.now());
      if (raf === null) raf = requestAnimationFrame(loop);
    };
    window.addEventListener(NAV_START_EVENT, begin);
    return () => {
      window.removeEventListener(NAV_START_EVENT, begin);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  // The new route rendered. Declared after the mount effect, so the machine exists. (The machine keeps the bar up for minVisibleMs.)
  useEffect(() => { rendered.current = window.location.href; machine.current?.done(performance.now()); }, [pathname, search]);

  if (!view.visible) return null;
  return (
    <div aria-hidden="true" className="hk-toploader" style={{ position: 'fixed', inset: '0 0 auto 0', height: 3, zIndex: 2147483647, pointerEvents: 'none' }}>
      <div style={{ height: '100%', width: `${view.value}%`, background: color, boxShadow: `0 0 8px ${color}`,
        transition: 'width 120ms ease-out, opacity 200ms ease-out', opacity: view.value >= 100 ? 0 : 1, borderRadius: '0 2px 2px 0' }} />
    </div>
  );
}

export function TopLoader(props: { color?: string }) {
  return <Suspense fallback={null}><Bar {...props} /></Suspense>;
}
