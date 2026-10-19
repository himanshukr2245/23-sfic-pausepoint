// src/app/studio/StudioRibbon.tsx — Master Triage Ribbon for PausePoint Forensic Studio
'use client';

import React from 'react';
import {
  ShieldAlert,
  Cpu,
  Layers,
  ShieldCheck,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  type StudioMode,
  PRESET_CASES,
  updateStudioStore,
  loadPresetCase,
} from './forensic-store';
import { unlockAudio, playHapticTick, playPop } from '@/lib/audio/synthesizer';

interface StudioRibbonProps {
  activeMode: StudioMode;
  activeCaseId: string;
  onCopyDocket: () => void;
  copiedDocket: boolean;
}

export function StudioRibbon({
  activeMode,
  activeCaseId,
  onCopyDocket,
  copiedDocket,
}: StudioRibbonProps) {
  function handleModeChange(mode: StudioMode) {
    unlockAudio();
    playHapticTick();
    updateStudioStore({ activeMode: mode });
  }

  function handleSelectCase(id: string) {
    unlockAudio();
    playPop();
    loadPresetCase(id);
  }

  return (
    <header className="rounded-2xl border border-border bg-surface p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      {/* ── Left: Studio Brand & Active Pipeline ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan/15 text-cyan border border-cyan/30 flex items-center justify-center shrink-0 shadow-xs">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan">
              PausePoint Cybercrime Cockpit
            </span>
            <span className="text-fg-muted font-mono text-[10px]">•</span>
            <span className="text-fg-muted font-mono text-[10px]">100% Client-Side Triage</span>
          </div>
          <h1 className="text-lg font-extrabold text-fg tracking-tight">
            Forensic Investigation Studio
          </h1>
        </div>
      </div>

      {/* ── Center: Mode Switcher Pills ── */}
      <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-surface-2 border border-border/80">
        <Button
          type="button"
          variant="plain"
          size="none"
          latencyMode="none"
          onClick={() => handleModeChange('triage')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeMode === 'triage'
              ? 'bg-danger text-brand-fg shadow-xs font-bold'
              : 'text-fg-muted hover:text-fg hover:bg-surface/50'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span>Golden Hour Triage</span>
        </Button>

        <Button
          type="button"
          variant="plain"
          size="none"
          latencyMode="none"
          onClick={() => handleModeChange('decompilation')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeMode === 'decompilation'
              ? 'bg-brand text-brand-fg shadow-xs font-bold'
              : 'text-fg-muted hover:text-fg hover:bg-surface/50'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Psychological X-Ray</span>
        </Button>

        <Button
          type="button"
          variant="plain"
          size="none"
          latencyMode="none"
          onClick={() => handleModeChange('reconstruction')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeMode === 'reconstruction'
              ? 'bg-brand text-brand-fg shadow-xs font-bold'
              : 'text-fg-muted hover:text-fg hover:bg-surface/50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Incident Timeline</span>
        </Button>

        <Button
          type="button"
          variant="plain"
          size="none"
          latencyMode="none"
          onClick={() => handleModeChange('certificate')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeMode === 'certificate'
              ? 'bg-cyan text-cyber-ink shadow-xs font-bold'
              : 'text-fg-muted hover:text-fg hover:bg-surface/50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Court Certificate (BSA 2023)</span>
        </Button>
      </div>

      {/* ── Right: Case Presets & Export Action ── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-fg-muted">
          <span>Preset Cases:</span>
          {PRESET_CASES.map((c, idx) => (
            <Button
              key={c.id}
              type="button"
              variant="plain"
              size="none"
              latencyMode="none"
              onClick={() => handleSelectCase(c.id)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                activeCaseId === c.id
                  ? 'bg-cyan text-cyber-ink'
                  : 'bg-surface-2 text-fg-muted hover:text-fg border border-border'
              }`}
            >
              #{idx + 1}
            </Button>
          ))}
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          sound="tick"
          onClick={onCopyDocket}
          className="text-xs font-bold"
        >
          {copiedDocket ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedDocket ? 'Copied' : 'Copy Docket'}</span>
        </Button>
      </div>
    </header>
  );
}
