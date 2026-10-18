'use client';

// components/showcase/SpeedBenchmarkHud.tsx — Real-Time Hardware Compositor & Telemetry Monitor.
// Measures display refresh rate (VSync), frame paint time, DOM node weight, memory, and long tasks.
import { useState } from 'react';
import { BoltIcon } from '@/components/ui';
import { playHapticTick, playPop, unlockAudio } from '@/lib/audio/synthesizer';
import { useRealPerf } from '@/lib/telemetry/perfObserver';

export function SpeedBenchmarkHud() {
  const snap = useRealPerf();
  const [collapsed, setCollapsed] = useState(true);
  const [turboOverride, setTurboOverride] = useState<boolean | null>(null);

  const isTurbo = turboOverride !== null ? turboOverride : snap.isTurbo;

  function toggleTurbo() {
    unlockAudio();
    playPop();
    const next = !isTurbo;
    if (next) {
      document.documentElement.dataset.perf = 'turbo';
      try {
        localStorage.setItem('hk-perf-mode', 'turbo');
      } catch {
        // ignore
      }
    } else {
      delete document.documentElement.dataset.perf;
      try {
        localStorage.removeItem('hk-perf-mode');
      } catch {
        // ignore
      }
    }
    setTurboOverride(next);
  }

  const isFluid = snap.fps >= 55;

  return (
    <aside
      aria-label="Real-time Speed Benchmark HUD"
      className="fixed bottom-4 right-4 z-50 select-none font-mono"
    >
      <div className="rounded-2xl border border-border/80 bg-surface/95 p-2.5 shadow-2xl backdrop-blur-md transition-all duration-300 min-w-[210px]">
        <div className="flex items-center justify-between gap-3">
          {/* Status Indicator & FPS Pill */}
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                isFluid ? 'bg-success animate-pulse' : 'bg-warning'
              }`}
            />
            <span suppressHydrationWarning className="text-xs font-bold tracking-wider text-fg">
              {snap.fps} FPS
            </span>
            <span suppressHydrationWarning className="text-[10px] text-fg-muted font-normal">
              ({snap.frameDeltaMs}ms)
            </span>
          </div>

          {/* Quick Turbo Toggle */}
          <button
            type="button"
            onClick={toggleTurbo}
            title={isTurbo ? 'Turbo Zero-Blur Active. Click for standard glass.' : 'Standard Glass Active. Click for Turbo Zero-Blur compositing.'}
            className={`rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              isTurbo
                ? 'bg-cyan text-cyan-fg shadow-cyan-soft'
                : 'bg-surface-2 text-fg-muted hover:text-fg'
            }`}
          >
            {isTurbo ? (
              <span className="flex items-center gap-1">
                <BoltIcon className="h-3 w-3" />
                <span>Turbo ON</span>
              </span>
            ) : (
              <span>Turbo</span>
            )}
          </button>

          {/* Collapse/Expand Toggle */}
          <button
            type="button"
            onClick={() => {
              unlockAudio();
              playHapticTick();
              setCollapsed(!collapsed);
            }}
            aria-label={collapsed ? 'Expand performance telemetry' : 'Collapse performance telemetry'}
            className="flex h-6 w-6 items-center justify-center rounded-lg hover:bg-surface-2 text-fg-muted hover:text-fg transition-colors cursor-pointer"
          >
            <span className="text-xs">{collapsed ? '▲' : '▼'}</span>
          </button>
        </div>

        {/* Expanded Genuine Telemetry Drawer */}
        {!collapsed && (
          <div className="mt-2.5 border-t border-border/80 pt-2 text-[10px] flex flex-col gap-1.5 text-fg-muted">
            <div className="flex justify-between gap-4">
              <span>Display VSync:</span>
              <span className="font-bold text-fg">{snap.targetHz} Hz (Hardware)</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Frame Budget:</span>
              <span className="font-bold text-fg">
                {snap.frameDeltaMs}ms / {snap.frameBudgetMs}ms
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>DOM Elements:</span>
              <span className="font-bold text-fg">{snap.domNodes} nodes</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>JS Heap:</span>
              <span className="font-bold text-fg">
                {snap.memoryUsedMb !== null
                  ? `${snap.memoryUsedMb} MB / ${snap.memoryTotalMb} MB`
                  : 'Protected Sandbox'}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>First Paint (FCP):</span>
              <span className="font-bold text-fg">
                {snap.fcpMs !== null ? `${snap.fcpMs} ms` : 'Measuring...'}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Long Tasks (&gt;50ms):</span>
              <span className={`font-bold ${snap.longTasksCount === 0 ? 'text-success' : 'text-warning'}`}>
                {snap.longTasksCount === 0 ? '0 detected' : `${snap.longTasksCount} (${snap.lastLongTaskMs}ms)`}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Input Latency:</span>
              <span className="font-bold text-fg">
                {snap.lastInteractionLatencyMs !== null
                  ? `${snap.lastInteractionLatencyMs} ms`
                  : 'Click anywhere to test'}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span>Compositor:</span>
              <span className="font-bold text-fg">
                {isTurbo ? 'Zero-Blur Solid Canvas' : 'Dual-Mode Glass Shader'}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
