'use client';

// components/ui/FpsCounter.tsx — Real-time frame time and compositor diagnostic monitor pill (HK Universal Library v3).
// Measures real-time display refresh rate and layout reflow scores in real-time.
import { useState } from 'react';
import { useRealPerf } from '@/lib/telemetry/perfObserver';

function IconActivity({ className = '' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.48 12H2" />
    </svg>
  );
}

function IconChevronDown({ className = '' }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function IconChevronUp({ className = '' }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

export function FpsCounter({ className = '' }: { className?: string }) {
  const snap = useRealPerf();
  const [collapsed, setCollapsed] = useState(true);

  const isSmooth = snap.fps >= 55;

  return (
    <aside
      aria-label="Real-time FPS and GPU Render Monitor"
      className={`fixed bottom-4 right-4 z-50 select-none font-mono ${className}`}
    >
      <div suppressHydrationWarning className="rounded-2xl border border-border/80 bg-surface/98 p-2.5 shadow-xl transition-all duration-300 min-w-[200px]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${isSmooth ? 'bg-success' : 'bg-warning'}`} />
            <IconActivity className="h-4 w-4 text-brand" />
            <span suppressHydrationWarning className="text-xs font-bold tracking-wider text-fg">
              {snap.fps} FPS
            </span>
            <span suppressHydrationWarning className="text-[10px] text-fg-muted font-normal">
              ({snap.frameDeltaMs}ms)
            </span>
          </div>

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand FPS monitor details' : 'Collapse FPS monitor details'}
            className="flex h-6 w-6 items-center justify-center rounded-lg hover:bg-surface-2 text-fg-muted transition-colors cursor-pointer"
          >
            {collapsed ? <IconChevronUp className="h-3.5 w-3.5" /> : <IconChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        {!collapsed && (
          <div className="mt-2 border-t border-border/80 pt-2 text-[10px] flex flex-col gap-1 text-fg-muted">
            <div className="flex justify-between gap-4">
              <span>Display VSync:</span>
              <span className="font-bold text-fg">{snap.targetHz} Hz (Hardware)</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Frame Budget:</span>
              <span className="font-bold text-fg">{snap.frameDeltaMs}ms / {snap.frameBudgetMs}ms</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>DOM Elements:</span>
              <span className="font-bold text-fg">{snap.domNodes} nodes</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>JS Heap:</span>
              <span className="font-bold text-fg">
                {snap.memoryUsedMb !== null ? `${snap.memoryUsedMb} MB` : 'Sandbox'}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Input Latency:</span>
              <span className="font-bold text-fg">
                {snap.lastInteractionLatencyMs !== null ? `${snap.lastInteractionLatencyMs} ms` : 'Click to test'}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Compositor:</span>
              <span className="font-bold text-success">
                {snap.isTurbo ? 'Zero-Blur Solid' : 'GPU Composited'}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
