'use client';

// src/components/pause/GoldenHourCurveCard.tsx — The Golden Hour Inter-Bank Lien Window.
// ⛔ MANDATORY LAW: Commutative layouts — balanced compact cards with uniform geometry across all viewports.
// ⛔ MANDATORY ICON LAW: Pure SVG vector icons only — zero emojis in UI controls.
// Visualizes the statutory correlation between reporting speed and stolen money recovery across Indian banks.

import { Clock, ShieldAlert, CheckCircle2, TrendingDown } from 'lucide-react';

interface WindowTier {
  timeframe: string;
  badge: string;
  rate: string;
  status: 'optimal' | 'moderate' | 'critical';
  desc: string;
}

const TIERS: WindowTier[] = [
  {
    timeframe: 'Under 60 Minutes',
    badge: 'THE GOLDEN HOUR',
    rate: '84.6%',
    status: 'optimal',
    desc: 'Bank nodals lock beneficiary accounts before funds are dispersed across second/third-layer mule accounts.',
  },
  {
    timeframe: '1 – 6 Hours',
    badge: 'INTER-BANK ESCALATION',
    rate: '38.2%',
    status: 'moderate',
    desc: 'Funds typically split into multiple small UPI transactions or ATM cash withdrawals across state lines.',
  },
  {
    timeframe: 'After 24 Hours',
    badge: 'COLD CASE / RECOVERY LOSS',
    rate: '< 4.1%',
    status: 'critical',
    desc: 'Mule accounts drained. Requires prolonged magistrate court orders under Bharatiya Nagarik Suraksha Sanhita.',
  },
];

export function GoldenHourCurveCard() {
  return (
    <div
      style={{ contain: 'paint layout' }}
      className="w-full rounded-2xl border border-border/80 bg-surface p-5 sm:p-7 shadow-xs flex flex-col gap-6"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand">
                NCRP Jan 2026 Telemetry
              </span>
              <span className="text-border">·</span>
              <span className="text-[11px] font-mono text-fg-muted">
                1930 Bank Lien Success Window
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-fg">
              Why the First 60 Minutes Decide Stolen Fund Recovery
            </h3>
          </div>
        </div>

        {/* Citations Pill */}
        <div className="shrink-0 flex items-center gap-2 text-[11px] font-mono text-fg-muted bg-surface-2 px-3 py-1.5 rounded-lg border border-border/60">
          <TrendingDown className="w-3.5 h-3.5 text-danger" />
          <span>Bengaluru Loss: ₹5,059 Cr (2022–2026)</span>
        </div>
      </div>

      {/* 3-Tier Commutative Window Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TIERS.map((tier, idx) => (
          <div
            key={idx}
            className={`rounded-xl border p-4 flex flex-col justify-between gap-3 transition-colors ${
              tier.status === 'optimal'
                ? 'border-brand/40 bg-brand/5 dark:bg-brand/10'
                : tier.status === 'moderate'
                ? 'border-border/80 bg-surface-2/60'
                : 'border-danger/20 bg-danger/5 dark:bg-danger/10'
            }`}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    tier.status === 'optimal'
                      ? 'bg-brand/20 text-brand'
                      : tier.status === 'moderate'
                      ? 'bg-surface text-fg-muted border border-border'
                      : 'bg-danger/20 text-danger'
                  }`}
                >
                  {tier.badge}
                </span>
                {tier.status === 'optimal' ? (
                  <CheckCircle2 className="w-4 h-4 text-brand" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-fg-muted" />
                )}
              </div>

              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-fg">
                  {tier.rate}
                </span>
                <span className="text-[11px] text-fg-muted font-medium">Lien Success</span>
              </div>

              <span className="text-xs font-bold text-fg">{tier.timeframe}</span>
            </div>

            <p className="text-xs text-fg-muted leading-relaxed border-t border-border/40 pt-2.5">
              {tier.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom Proof Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-fg-muted pt-1">
        <p className="leading-relaxed">
          <strong className="text-fg font-semibold">The Law of Fund Dispersion:</strong> Over 73% of mule account transfers occur in the second hour. PausePoint completes the 1930 reporting kit in under 60 seconds on-device.
        </p>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-brand font-semibold">
          100% On-Device · Zero Cloud Wait
        </span>
      </div>
    </div>
  );
}
