'use client';

// src/app/decode/page.tsx — Dedicated Manipulation Decoder Master Workspace.
// ⛔ MANDATORY LAW: Commutative layouts — balanced compact cards with uniform geometry across all viewports.
// ⛔ MANDATORY ICON LAW: Pure SVG vector icons only — zero emojis in UI controls.
// Full-screen focused workspace with 10-Second Pause Engine, Cognitive Immunity Drill, and Judge Demo Kit.

import { useState } from 'react';
import Link from 'next/link';
import { DecoderWorkbench } from '@/components/pause/DecoderWorkbench';
import { CognitiveImmunityDrillModal } from '@/components/pause/CognitiveImmunityDrillModal';
import { JudgeCheatSheetModal } from '@/components/pause/JudgeCheatSheetModal';
import { Button } from '@/components/ui/Button';
import { Zap, Trophy, ShieldCheck, ArrowLeft, Search } from 'lucide-react';
import { playHapticTick, playPop, unlockAudio } from '@/lib/audio/synthesizer';

export default function DecodePage() {
  const [drillOpen, setDrillOpen] = useState(false);
  const [judgeKitOpen, setJudgeKitOpen] = useState(false);

  function handleOpenDrill() {
    unlockAudio();
    playPop();
    setDrillOpen(true);
  }

  function handleOpenJudgeKit() {
    unlockAudio();
    playPop();
    setJudgeKitOpen(true);
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-20 animate-fade-in">
      {/* ── Top Breadcrumb & Actions Bar ── */}
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
            <span className="text-brand font-semibold">Manipulation Decoder</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fg">
                Psychological Manipulation Decoder
              </h1>
              <p className="text-xs sm:text-sm text-fg-muted">
                10-Second Cognitive Pause Engine · Won 3rd Prize at Human Firewall 2026
              </p>
            </div>
          </div>
        </div>

        {/* Top Action Buttons (Drill & Pitch Arsenal) */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <Button
            type="button"
            variant="primary"
            size="sm"
            sound="laser"
            onClick={handleOpenDrill}
            className="flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Immunity Drill</span>
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            sound="tick"
            onClick={handleOpenJudgeKit}
            className="flex items-center gap-1.5"
          >
            <Trophy className="w-3.5 h-3.5 text-brand" />
            <span>Judge Demo Kit</span>
          </Button>
        </div>
      </div>

      {/* ── Master Decoder Workbench ── */}
      <DecoderWorkbench />

      {/* ── Bottom Sovereign Privacy Strip ── */}
      <div className="rounded-2xl border border-border/80 bg-surface-2/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-fg-muted">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand" />
          <span>100% On-Device Client Sandbox · Zero Network Transmission · Zero Cloud Egress</span>
        </div>
        <span className="font-mono text-[11px] text-brand font-semibold">
          Bharatiya Sakshya Adhiniyam, 2023 Compliant
        </span>
      </div>

      {/* ── Modals ── */}
      <CognitiveImmunityDrillModal isOpen={drillOpen} onClose={() => setDrillOpen(false)} />
      <JudgeCheatSheetModal isOpen={judgeKitOpen} onClose={() => setJudgeKitOpen(false)} />
    </div>
  );
}
