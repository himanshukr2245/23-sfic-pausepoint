'use client';

// app/about/AboutCommandCenter.tsx — Interactive Architecture Command Center with optical glass cards (HK Universal Library v3).
import { useState } from 'react';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { GreetForm } from './GreetForm';
import { playHapticTick, playSuccessChime, unlockAudio } from '@/lib/audio/synthesizer';
import { Button } from '@/components/ui/Button';

interface GateItem {
  cmd: string;
  when: string;
  what: string;
  badge: string;
  accent: 'cyan' | 'emerald' | 'purple' | 'amber';
  icon: string;
}

const LADDER: GateItem[] = [
  {
    cmd: 'npm run check:fast',
    when: 'After every task',
    what: 'TypeScript types, ESLint rules, secrets scan, design tokens validation',
    badge: 'Fast Loop (<15s)',
    accent: 'cyan',
    icon: '⚡',
  },
  {
    cmd: 'npm run check',
    when: 'End of every phase',
    what: 'Unit tests, RLS policies, honesty checks, asset weight, next build, dynamic rendering, E2E tests',
    badge: 'Phase Gate',
    accent: 'emerald',
    icon: '🛡️',
  },
  {
    cmd: 'npm run check:release',
    when: 'Before a release',
    what: 'Full check + dependency audit, bundle leaks, route weight budgets, opennext preflight, FACTS seal',
    badge: 'Release Gate',
    accent: 'purple',
    icon: '🚀',
  },
  {
    cmd: 'npm run check:live -- <url>',
    when: 'After every deploy',
    what: 'Response headers, nonce CSP, endpoint health, hidden paths, smoke routes verification',
    badge: 'Live Smoke',
    accent: 'amber',
    icon: '🌐',
  },
];

function IconCopy({ className = '' }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function IconCheck({ className = '' }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconSparkles({ className = '' }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

function IconTerminal({ className = '' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

export function AboutCommandCenter() {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  async function handleCopy(cmd: string) {
    unlockAudio();
    playSuccessChime();
    try {
      await navigator.clipboard.writeText(cmd);
      setCopiedCmd(cmd);
      setTimeout(() => setCopiedCmd(null), 2000);
    } catch {
      // fallback
    }
  }

  return (
    <div className="flex flex-col gap-10">
      {/* ── 1. Hero & Philosophy Header ───────────────────────────────────── */}
      <section className="flex flex-col gap-3">
        {/* Status Pill matching AWS Capsule styling */}
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-cyan/30 bg-cyan/10 px-3.5 py-1 text-xs font-semibold text-cyan-fg shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
          </span>
          <span>HK UNIVERSAL ARCHITECTURE · GATE LADDER v3</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
          Architecture &amp; Quality Gates
        </h1>
        <p className="max-w-2xl text-base text-fg-muted leading-relaxed">
          This app is the <strong className="text-fg font-semibold">HK Universal Library</strong> turned into living code. Every architectural standard has a machine-enforced verification gate, and every gate executes before code ships.
        </p>
      </section>

      {/* ── 2. Interactive Gate Ladder Cards (Replacing raw HTML table) ─────── */}
      <section aria-labelledby="gate-ladder-heading" className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="gate-ladder-heading" className="text-xl font-bold tracking-tight text-fg sm:text-2xl flex items-center gap-2">
              <IconTerminal className="h-5 w-5 text-brand" />
              <span>The Verification Ladder</span>
            </h2>
            <p className="mt-1 text-xs text-fg-muted">
              Hover over any gate plate to inspect checks. Click to copy command with procedural audio response.
            </p>
          </div>
          <div className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface-2 px-3 py-1.5 text-xs font-mono text-fg-muted">
            <IconSparkles className="h-3.5 w-3.5 text-brand" />
            <span>4 Deterministic Stages</span>
          </div>
        </div>

        {/* 4 Precision Glass Plates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {LADDER.map((item, index) => {
            const isCopied = copiedCmd === item.cmd;
            return (
              <GlassCard
                key={item.cmd}
                borderRadius={24}
                className="p-6 justify-between min-h-[190px]"
                onClick={() => handleCopy(item.cmd)}
              >
                <div>
                  {/* Top Bar: Index + Frequency Pill + Copy Button */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-surface-2 text-xs font-mono font-bold text-fg">
                        0{index + 1}
                      </span>
                      <span className="rounded-full border border-border bg-surface-2/80 px-2.5 py-0.5 text-[11px] font-semibold text-fg-muted">
                        {item.when}
                      </span>
                    </div>

                    {/* Copy Trigger */}
                    <Button variant="plain" size="none" latencyMode="none"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(item.cmd);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-fg hover:bg-surface-2 transition-all cursor-pointer shadow-xs active:scale-95"
                      title="Copy command to clipboard"
                    >
                      {isCopied ? (
                        <>
                          <IconCheck className="h-3.5 w-3.5 text-success" />
                          <span className="text-success font-bold text-[11px]">Copied</span>
                        </>
                      ) : (
                        <>
                          <IconCopy className="h-3.5 w-3.5 text-fg-muted" />
                          <span className="text-fg-muted text-[11px]">Copy</span>
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Terminal Command Lead */}
                  <div className="mt-4 flex items-center gap-2 font-mono text-sm font-bold text-fg">
                    <span className="text-brand">$</span>
                    <span className="select-all">{item.cmd}</span>
                  </div>

                  {/* What it checks */}
                  <p className="mt-2 text-xs text-fg-muted leading-relaxed">
                    {item.what}
                  </p>
                </div>

                {/* Bottom Status Ribbon */}
                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-fg-muted flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
                    <span>{item.badge}</span>
                  </span>
                  <span className="text-brand font-medium group-hover:translate-x-0.5 transition-transform">
                    Click plate to copy →
                  </span>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </section>

      {/* ── 3. VisionOS Form Validation Pod ───────────────────────────────── */}
      <section aria-labelledby="form-pod-heading" className="flex flex-col gap-4">
        <div>
          <h2 id="form-pod-heading" className="text-xl font-bold tracking-tight text-fg sm:text-2xl">
            Live Schema-Validated Form Pod
          </h2>
          <p className="mt-1 text-sm text-fg-muted max-w-2xl">
            The server checks every field with a strict schema and responds in human words within 100ms — the exact interaction design used across all forms in this architecture.
          </p>
        </div>

        <GlassCard borderRadius={24} interactive={false} className="p-6 sm:p-8 max-w-xl">
          <GreetForm />
        </GlassCard>
      </section>

      {/* ── 4. Quick Return Navigation ────────────────────────────────────── */}
      <div className="pt-4 border-t border-border flex items-center justify-between">
        <Link
          href="/"
          onClick={() => {
            unlockAudio();
            playHapticTick();
          }}
          className="inline-flex min-h-touch items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-fg hover:bg-surface-2 transition-all shadow-sm active:scale-95"
        >
          <span>← Back to Living Lab</span>
        </Link>

        <Link
          href="/#glass-benchmark"
          onClick={() => {
            unlockAudio();
            playHapticTick();
          }}
          className="inline-flex min-h-touch items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-brand-fg hover:opacity-90 transition-all shadow-sm active:scale-95"
        >
          <span>Explore Glass Benchmark →</span>
        </Link>
      </div>
    </div>
  );
}
