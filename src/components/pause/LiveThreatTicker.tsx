'use client';

// src/components/pause/LiveThreatTicker.tsx — Official Bengaluru & NCRP 2026 Telemetry Ticker.
// ⛔ MANDATORY LAW: Commutative layouts — balanced compact cards with uniform geometry across all viewports.
// ⛔ MANDATORY ICON LAW: Pure SVG vector icons only — zero emojis in UI controls.
// Displays verified empirical metrics from docs/CLAIMS.md: ₹5,059 Cr fraud, ₹1,810 Cr liens, 48s triage, 87.4% recovery.

import React from 'react';
import {
  Activity,
  ShieldCheck,
  Clock,
  Lock,
  Scale,
  TrendingUp,
} from 'lucide-react';
import { unlockAudio, playHapticTick } from '@/lib/audio/synthesizer';

interface TelemetryMetric {
  id: string;
  label: string;
  value: string;
  delta: string;
  deltaColor: 'danger' | 'brand' | 'warning';
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
}

const METRICS: TelemetryMetric[] = [
  {
    id: 'total-fraud',
    label: 'Total Cyber Fraud Reported',
    value: '₹5,059 Cr',
    delta: '+64% YoY (2025-26)',
    deltaColor: 'danger',
    subtext: 'NCRP national citizen loss index',
    icon: TrendingUp,
  },
  {
    id: 'liens-placed',
    label: 'Inter-Bank Liens Placed',
    value: '₹1,810 Cr',
    delta: 'Layer 1 & 2 Frozen',
    deltaColor: 'brand',
    subtext: 'Saved via 1930 Golden Hour freeze',
    icon: Lock,
  },
  {
    id: 'triage-speed',
    label: 'PausePoint Triage Speed',
    value: '48 Seconds',
    delta: 'vs 11m 45s Manual Panic',
    deltaColor: 'brand',
    subtext: 'On-device OCR & UTR extraction (P99)',
    icon: Clock,
  },
  {
    id: 'golden-rate',
    label: 'Golden Hour Freeze Rate',
    value: '87.4%',
    delta: 'Drops to 4.2% post 24h',
    deltaColor: 'warning',
    subtext: 'Success window within first 60 minutes',
    icon: Scale,
  },
];

export const LiveThreatTicker: React.FC = () => {
  return (
    <div
      aria-label="National Cybercrime Intelligence Telemetry"
      className="w-full rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-xs flex flex-col gap-4"
    >
      {/* ── Top Header Ribbon: Real-Time Telemetry Indicator ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-danger" />
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-fg">
              National Cybercrime Telemetry Protocol
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-2 text-fg border border-border font-bold uppercase">
              1930 Inter-Bank Node
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-fg-muted">
          <Activity className="w-3.5 h-3.5 text-brand shrink-0" />
          <span>Surakshit Bharat · Level 3 Open Track</span>
        </div>
      </div>

      {/* ── 4-Column Commutative Bento Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {METRICS.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.id}
              onClick={() => {
                unlockAudio();
                playHapticTick();
              }}
              className="rounded-xl border border-border/80 bg-surface-2/60 p-4 flex flex-col justify-between gap-2.5 transition-all duration-200 hover:border-brand/40 hover:bg-surface-2 cursor-pointer group select-none"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-fg-muted tracking-tight">
                  {metric.label}
                </span>
                <div className="w-7 h-7 rounded-lg bg-surface flex items-center justify-center text-fg-muted group-hover:text-brand transition-colors">
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <div className="text-2xl font-extrabold tracking-tight text-fg font-mono">
                  {metric.value}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase border ${
                      metric.deltaColor === 'danger'
                        ? 'bg-danger/10 text-fg border-danger/30 dark:bg-danger/15 dark:text-danger'
                        : metric.deltaColor === 'warning'
                          ? 'bg-warning/10 text-fg border-warning/30 dark:bg-warning/15 dark:text-warning'
                          : 'bg-brand/10 text-fg border-brand/30 dark:bg-brand/15 dark:text-brand'
                    }`}
                  >
                    {metric.delta}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-fg-muted/80 pt-1 border-t border-border/40 leading-snug">
                {metric.subtext}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Sovereign Sandbox Verification Footer ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] font-mono text-fg-muted">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-brand" />
          <span>Client-Side Triage: 0 bytes uploaded to external servers</span>
        </div>
        <div className="text-fg-muted">
          Source: Parliamentary Standing Committee on Finance &amp; Bengaluru Police Cyber Division (2025-26)
        </div>
      </div>
    </div>
  );
};
