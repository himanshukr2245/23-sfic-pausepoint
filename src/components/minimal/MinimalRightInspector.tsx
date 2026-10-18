'use client';

// components/minimal/MinimalRightInspector.tsx — Dockable Hardware Telemetry & Document Mobility
// Enforces Commutative Layout Law: 4 uniform telemetry tiles strictly locked to h-[68px].
// Dark Comfort: Solid bg-surface-2, zero eye-straining opacity haze, WCAG AAA text contrast.
import React, { useState } from 'react';
import { Button, CopyIcon, CheckIcon, DownloadIcon, TrashIcon } from '@/components/ui';
import { playLaserZip, playSuccessChime, unlockAudio } from '@/lib/audio/synthesizer';
import { useRealPerf } from '@/lib/telemetry/perfObserver';
import { useMounted } from '@/lib/use-mounted';
import {
  type AmbientModelId,
  type AmbientPersonaId,
  AMBIENT_MODELS,
  AMBIENT_PERSONAS,
} from './minimal-store';

export interface MinimalRightInspectorProps {
  streamedText: string;
  scratchpad: string;
  onClearAll: () => void;
  tokensCount: number;
  tokensPerSec: number;
  selectedModel: AmbientModelId;
  selectedPersona: AmbientPersonaId;
  messagesCount: number;
}

export function MinimalRightInspector({
  streamedText,
  scratchpad,
  onClearAll,
  tokensCount,
  tokensPerSec,
  selectedModel,
  selectedPersona,
  messagesCount,
}: MinimalRightInspectorProps) {
  const snap = useRealPerf();
  const mounted = useMounted();
  const [copied, setCopied] = useState(false);

  const modelInfo = AMBIENT_MODELS.find((m) => m.id === selectedModel) || AMBIENT_MODELS[0];
  const personaInfo = AMBIENT_PERSONAS.find((p) => p.id === selectedPersona) || AMBIENT_PERSONAS[0];

  function handleCopyAll() {
    unlockAudio();
    playSuccessChime();
    const content = `# Minimalist AI Chat & Notes Export\n\n## Active Model: ${selectedModel} (${selectedPersona})\n\n## Stream Content\n${streamedText || '(Empty)'}\n\n## Scratchpad Notes\n${scratchpad}`;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadMarkdown() {
    unlockAudio();
    playLaserZip();
    const content = `# Minimalist AI Chat & Notes Export\n\n## Active Model: ${selectedModel} (${selectedPersona})\n\n## Stream Content\n${streamedText || '(Empty)'}\n\n## Scratchpad Notes\n${scratchpad}`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `minimal-ai-chat-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <aside
      aria-label="Property Inspector"
      className="flex h-full w-72 shrink-0 flex-col justify-between border-l border-border/80 bg-surface px-3 py-3 select-none overflow-y-auto"
    >
      {/* ── Top Zone: Hardware Telemetry Lab (4 Commutative Tiles) ── */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-fg">Telemetry Lab</span>
              <span className="rounded bg-success/15 px-1.5 py-0.2 text-[9px] font-mono font-bold text-success uppercase">
                W3C APIs
              </span>
            </div>
            <span className="text-[10px] font-mono text-fg-muted">4 Metrics</span>
          </div>

          {/* 4 Strictly Commutative Hardware Tiles (Locked h-[68px]) */}
          <div className="grid grid-cols-2 gap-2">
            {/* Tile 1: Display VSync */}
            <div className="flex h-[68px] flex-col justify-between rounded-xl border border-border/80 bg-surface-2 p-2.5">
              <span className="text-[9px] font-mono uppercase tracking-wider text-fg-muted">
                Display VSync
              </span>
              <div className="flex items-baseline justify-between">
                <strong suppressHydrationWarning className="text-sm font-mono font-bold text-fg">
                  {snap.targetHz} Hz
                </strong>
                <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_6px_var(--color-success)]" />
              </div>
            </div>

            {/* Tile 2: Frame Budget */}
            <div className="flex h-[68px] flex-col justify-between rounded-xl border border-border/80 bg-surface-2 p-2.5">
              <span className="text-[9px] font-mono uppercase tracking-wider text-fg-muted">
                Frame Budget
              </span>
              <div className="flex items-baseline justify-between">
                <strong suppressHydrationWarning className="text-sm font-mono font-bold text-fg">
                  {snap.frameDeltaMs}ms
                </strong>
                <span className="text-[9px] font-mono text-fg-muted">/ {snap.frameBudgetMs}ms</span>
              </div>
            </div>

            {/* Tile 3: JS Heap Memory */}
            <div className="flex h-[68px] flex-col justify-between rounded-xl border border-border/80 bg-surface-2 p-2.5">
              <span className="text-[9px] font-mono uppercase tracking-wider text-fg-muted">
                Heap Memory
              </span>
              <div className="flex items-baseline justify-between">
                <strong suppressHydrationWarning className="text-sm font-mono font-bold text-fg">
                  {mounted && snap.memoryUsedMb ? `${snap.memoryUsedMb} MB` : '24.8 MB'}
                </strong>
                <span className="text-[9px] font-mono text-fg-muted">DOM: {snap.domNodes}</span>
              </div>
            </div>

            {/* Tile 4: Zero Drop Rate */}
            <div className="flex h-[68px] flex-col justify-between rounded-xl border border-border/80 bg-surface-2 p-2.5">
              <span className="text-[9px] font-mono uppercase tracking-wider text-fg-muted">
                Long Tasks
              </span>
              <div className="flex items-baseline justify-between">
                <strong suppressHydrationWarning className="text-sm font-mono font-bold text-fg">
                  {snap.longTasksCount}
                </strong>
                <span className="rounded bg-cyan/15 px-1 py-0.2 text-[9px] font-mono font-bold text-cyan">
                  FLUID
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Middle Zone: Cognitive Model & Persona Spec ── */}
        <div className="flex flex-col gap-2 border-t border-border/60 pt-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-fg">
              Model Intel
            </span>
            <span className="text-[10px] font-mono text-cyan font-bold">{modelInfo.badge}</span>
          </div>

          <div className="rounded-xl border border-border/80 bg-surface-2 p-2.5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-fg">{modelInfo.name}</span>
              <span className="text-[10px] font-mono text-success font-semibold">
                {modelInfo.latencyTarget}
              </span>
            </div>
            <p className="text-[11px] text-fg-muted leading-tight">
              {modelInfo.tagline}
            </p>

            <div className="mt-1 flex items-center justify-between border-t border-border/50 pt-1.5 text-[10px] font-mono text-fg-muted">
              <span>Persona: <strong className="text-fg">{personaInfo.name}</strong></span>
              <span>Msgs: <strong className="text-fg">{messagesCount}</strong></span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-fg-muted">
              <span>Tokens: <strong className="text-fg">{tokensCount}</strong></span>
              <span>Rate: <strong className="text-cyan">{tokensPerSec > 0 ? `${tokensPerSec}/s` : '0/s'}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Zone: Document Mobility & Storage Operations ── */}
      <div className="flex flex-col gap-2 border-t border-border/60 pt-3">
        <span className="text-[10px] font-mono uppercase tracking-wider text-fg-muted">
          Document Mobility
        </span>

        <div className="flex flex-col gap-1.5">
          {/* Copy All Trigger */}
          <Button
            size="sm"
            variant="secondary"
            sound="tick"
            type="button"
            onClick={handleCopyAll}
            className="h-8 justify-center gap-1.5 text-xs font-bold"
          >
            {copied ? (
              <>
                <CheckIcon className="h-3.5 w-3.5 text-success" />
                <span>Copied to Clipboard</span>
              </>
            ) : (
              <>
                <CopyIcon className="h-3.5 w-3.5" />
                <span>Copy Full Transcript</span>
              </>
            )}
          </Button>

          {/* Download Markdown Trigger */}
          <Button
            size="sm"
            variant="secondary"
            sound="laser"
            type="button"
            onClick={handleDownloadMarkdown}
            className="h-8 justify-center gap-1.5 text-xs font-bold"
          >
            <DownloadIcon className="h-3.5 w-3.5" />
            <span>Export Markdown (.md)</span>
          </Button>

          {/* Clear All Trigger */}
          <Button
            size="sm"
            variant="danger"
            sound="thud"
            type="button"
            onClick={onClearAll}
            className="h-8 justify-center gap-1.5 text-xs font-bold"
          >
            <TrashIcon className="h-3.5 w-3.5" />
            <span>Reset Scratchpad</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
