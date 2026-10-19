'use client';

// src/app/simulator/page.tsx — Dedicated Cyber Attack Simulator Arena.
// ⛔ MANDATORY LAW: Commutative layouts — balanced compact cards with uniform geometry across all viewports.
// ⛔ MANDATORY ICON LAW: Pure SVG vector icons only — zero emojis in UI controls.
// Full-screen focused simulation arena for India's 4 major scam attacks with Web Speech regional narration.

import Link from 'next/link';
import { ScamSimulator } from '@/components/pause/ScamSimulator';
import { Zap, ShieldCheck, ArrowLeft, ArrowRight } from 'lucide-react';
import { playHapticTick, unlockAudio } from '@/lib/audio/synthesizer';

export default function SimulatorPage() {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-20 animate-fade-in">
      {/* ── Top Breadcrumb & Title Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-xs font-mono text-fg-muted">
            <Link
              href="/"
              onClick={() => {
                unlockAudio();
                playHapticTick();
              }}
              className="hover:text-fg transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Defense Hub</span>
            </Link>
            <span>/</span>
            <span className="text-brand font-semibold">Attack Simulator</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fg">
                Interactive Cyber Threat Simulator Arena
              </h1>
              <p className="text-xs sm:text-sm text-fg-muted">
                Real-world simulation drills for Digital Arrest, APK Trojans, Task Fraud, and UPI PIN traps
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <Link
            href="/decode"
            onClick={() => {
              unlockAudio();
              playHapticTick();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-2 border border-border text-fg text-xs font-bold hover:bg-surface transition-colors cursor-pointer"
          >
            <span>Go to Decoder</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ── Master Scam Simulator Component ── */}
      <ScamSimulator />

      {/* ── Bottom Sovereign Privacy Strip ── */}
      <div className="rounded-2xl border border-border/80 bg-surface-2/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-fg-muted">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand" />
          <span>Safe Sandboxed Drills · Zero Network Requests · Zero Real Account Exposure</span>
        </div>
        <span className="font-mono text-[11px] text-brand font-semibold">
          SFIC 2026 Surakshit Bharat Telemetry
        </span>
      </div>
    </div>
  );
}
