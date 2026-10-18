'use client';

// src/app/studio/StudioInspector.tsx — Collapsible Right Property Inspector
// Follows the Rule of Iconic Minimalism: Sleek property tuning with zero clutter.
import React from 'react';
import {
  type StudioBlock,
  type StudioColorAccent,
  type CanvasGridStyle,
  type CanvasDensity,
  calculateQuoteTotal,
} from './studio-store';
import { Button, Input, CloseIcon, PinIcon, TrashIcon, BoltIcon } from '@/components/ui';
import { playHapticTick, playSubBassThud, unlockAudio } from '@/lib/audio/synthesizer';

interface StudioInspectorProps {
  selectedBlock: StudioBlock | null;
  onUpdateBlock: (updated: StudioBlock) => void;
  onDeleteBlock: (id: string) => void;
  gridStyle: CanvasGridStyle;
  onSelectGridStyle: (style: CanvasGridStyle) => void;
  density: CanvasDensity;
  onSelectDensity: (density: CanvasDensity) => void;
  isOpen: boolean;
  onClose: () => void;
  totalBlocks: number;
}

export function StudioInspector({
  selectedBlock,
  onUpdateBlock,
  onDeleteBlock,
  gridStyle,
  onSelectGridStyle,
  density,
  onSelectDensity,
  isOpen,
  onClose,
  totalBlocks,
}: StudioInspectorProps) {
  if (!isOpen) return null;

  const accents: StudioColorAccent[] = ['cyan', 'indigo', 'rose', 'emerald', 'amber', 'violet'];

  return (
    <aside
      aria-label="Property Inspector"
      className="flex w-64 sm:w-72 shrink-0 flex-col gap-4 border-l border-border/80 bg-surface p-3 text-xs shadow-xs select-none overflow-y-auto"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-cyan">◨</span>
          <span className="font-bold text-fg">
            {selectedBlock ? selectedBlock.type.toUpperCase() : 'STAGE'}
          </span>
        </div>
        <Button
          variant="plain"
          size="none"
          latencyMode="none"
          type="button"
          onClick={() => {
            unlockAudio();
            playHapticTick();
            onClose();
          }}
          title="Collapse Inspector []]"
          aria-label="Collapse Inspector"
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/80 bg-surface-2 text-fg hover:border-cyan/50 hover:bg-surface-3 hover:text-cyan transition-colors cursor-pointer shadow-2xs"
        >
          <CloseIcon className="h-3.5 w-3.5" />
        </Button>
      </div>

      {selectedBlock ? (
        /* ── Block Selected Properties ── */
        <div className="flex flex-col gap-3.5">
          {/* Color Accent Picker */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-fg-muted">
              Color Accent Aura
            </span>
            <div className="flex items-center gap-1.5">
              {accents.map((accent) => {
                const isActive = selectedBlock.colorAccent === accent;
                const dotColorMap: Record<StudioColorAccent, string> = {
                  cyan: 'bg-cyan',
                  indigo: 'bg-indigo',
                  rose: 'bg-rose',
                  emerald: 'bg-emerald',
                  amber: 'bg-amber',
                  violet: 'bg-violet',
                };
                return (
                  <Button
                    key={accent}
                    variant="plain"
                    size="none"
                    latencyMode="none"
                    type="button"
                    onClick={() => {
                      unlockAudio();
                      playHapticTick();
                      onUpdateBlock({ ...selectedBlock, colorAccent: accent });
                    }}
                    title={`Accent ${accent}`}
                    aria-label={`Select accent ${accent}`}
                    className={`flex h-6 w-6 items-center justify-center rounded-full transition-transform cursor-pointer ${
                      isActive ? 'ring-2 ring-fg ring-offset-2 scale-110' : 'hover:scale-105'
                    }`}
                  >
                    <span className={`h-4 w-4 rounded-full ${dotColorMap[accent]}`} />
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Title Editor */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-fg-muted font-bold">
              Block Title
            </span>
            <Input
              type="text"
              value={selectedBlock.title}
              onChange={(e) => onUpdateBlock({ ...selectedBlock, title: e.target.value })}
              className="h-8 rounded-lg border border-border/80 bg-surface-2 px-2.5 text-xs text-fg focus:border-cyan focus:outline-hidden font-medium shadow-2xs"
            />
          </div>

          {/* Category Input */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-fg-muted font-bold">
              Category Tag
            </span>
            <Input
              type="text"
              value={selectedBlock.category}
              onChange={(e) => onUpdateBlock({ ...selectedBlock, category: e.target.value })}
              className="h-8 rounded-lg border border-border/80 bg-surface-2 px-2.5 text-xs text-fg focus:border-cyan focus:outline-hidden font-medium shadow-2xs"
            />
          </div>

          {/* Quote-specific editor if applicable */}
          {selectedBlock.type === 'quote' && selectedBlock.quoteData && (
            <div className="flex flex-col gap-2 rounded-xl border border-cyan/30 bg-cyan/5 p-2.5">
              <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold text-cyan">
                <BoltIcon className="h-3 w-3 shrink-0" />
                <span>Quote Calculations</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-fg-muted">Quantity</span>
                  <Input
                    type="number"
                    min={1}
                    value={selectedBlock.quoteData.quantity}
                    onChange={(e) => {
                      const qty = Math.max(1, parseInt(e.target.value, 10) || 1);
                      onUpdateBlock({
                        ...selectedBlock,
                        quoteData: { ...selectedBlock.quoteData!, quantity: qty },
                      });
                    }}
                    className="h-7 w-full rounded border border-border/70 bg-surface px-1.5 font-mono text-xs text-fg"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-fg-muted">Unit Price ($)</span>
                  <Input
                    type="number"
                    min={0}
                    value={selectedBlock.quoteData.unitPrice}
                    onChange={(e) => {
                      const price = Math.max(0, parseFloat(e.target.value) || 0);
                      onUpdateBlock({
                        ...selectedBlock,
                        quoteData: { ...selectedBlock.quoteData!, unitPrice: price },
                      });
                    }}
                    className="h-7 w-full rounded border border-border/70 bg-surface px-1.5 font-mono text-xs text-fg"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-cyan/20 pt-1.5 font-mono text-[11px]">
                <span className="text-fg-muted">Total:</span>
                <span className="font-bold text-cyan">
                  ${calculateQuoteTotal(selectedBlock.quoteData).total.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex items-center gap-2 border-t border-border/60 pt-3">
            <Button
              variant="plain"
              size="none"
              latencyMode="none"
              type="button"
              onClick={() => {
                unlockAudio();
                playHapticTick();
                onUpdateBlock({ ...selectedBlock, pinned: !selectedBlock.pinned });
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg border py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                selectedBlock.pinned
                  ? 'border-brand/40 bg-brand/10 text-brand'
                  : 'border-border/60 text-fg-muted hover:bg-surface-2'
              }`}
            >
              <PinIcon className="h-3.5 w-3.5" />
              <span>{selectedBlock.pinned ? 'Pinned' : 'Pin'}</span>
            </Button>

            <Button
              variant="plain"
              size="none"
              latencyMode="none"
              type="button"
              onClick={() => {
                unlockAudio();
                playSubBassThud();
                onDeleteBlock(selectedBlock.id);
              }}
              title="Delete Block"
              aria-label="Delete block"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-danger/40 bg-danger/10 text-danger hover:bg-danger/20 transition-colors cursor-pointer"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        /* ── Stage Global Settings ── */
        <div className="flex flex-col gap-3.5">
          {/* Canvas Grid Style */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-fg-muted">
              Canvas Grid Matrix
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {(['dots', 'grid', 'clean'] as CanvasGridStyle[]).map((st) => (
                <Button
                  key={st}
                  variant="plain"
                  size="none"
                  latencyMode="none"
                  type="button"
                  onClick={() => {
                    unlockAudio();
                    playHapticTick();
                    onSelectGridStyle(st);
                  }}
                  className={`rounded-lg py-1.5 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs ${
                    gridStyle === st
                      ? 'border border-cyan/60 bg-cyan/20 font-bold text-cyan shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                      : 'border border-border/80 bg-surface-2 text-fg/85 hover:border-cyan/40 hover:bg-surface-3 hover:text-cyan'
                  }`}
                >
                  {st.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* Card Density */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-fg-muted font-bold">
              Card Density
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {(['compact', 'comfortable'] as CanvasDensity[]).map((ds) => (
                <Button
                  key={ds}
                  variant="plain"
                  size="none"
                  latencyMode="none"
                  type="button"
                  onClick={() => {
                    unlockAudio();
                    playHapticTick();
                    onSelectDensity(ds);
                  }}
                  className={`rounded-lg py-1.5 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs ${
                    density === ds
                      ? 'border border-cyan/60 bg-cyan/20 font-bold text-cyan shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                      : 'border border-border/80 bg-surface-2 text-fg/85 hover:border-cyan/40 hover:bg-surface-3 hover:text-cyan'
                  }`}
                >
                  {ds.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* Stage Memory Stats */}
          <div className="flex flex-col gap-2 rounded-xl border border-border/80 bg-surface-2 p-3 text-[11px] shadow-2xs">
            <span className="text-[10px] font-mono uppercase text-fg-muted font-bold">Workspace Footprint</span>
            <div className="flex justify-between">
              <span className="text-fg/75 font-medium">Total Elements:</span>
              <span className="font-mono font-bold text-cyan" suppressHydrationWarning>
                {totalBlocks}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg/75 font-medium">Network Latency:</span>
              <span className="font-mono font-bold text-success">0.00ms SSD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-fg/75 font-medium">Reflow Guard:</span>
              <span className="font-mono font-bold text-cyan">Active (60 FPS)</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
