// tokens-ok-file: studio archetype color palettes and optical spotlight accents
'use client';

// src/app/studio/BentoCanvasView.tsx — Spatial Bento Canvas Grid with AWS Spotlight Cards
import React, { useState } from 'react';
import {
  type StudioBlock,
  type CanvasDensity,
  calculateQuoteTotal,
} from './studio-store';
import {
  AwsSpotlightCard,
  Button,
  Input,
  BoltIcon,
  FileCodeIcon,
  RocketIcon,
  EditIcon,
  PinIcon,
  LayersIcon,
  CloseIcon,
  LayoutGridIcon,
} from '@/components/ui';
import {
  playHapticTick,
  playSuccessChime,
  playSubBassThud,
  unlockAudio,
} from '@/lib/audio/synthesizer';

interface BentoCanvasViewProps {
  blocks: StudioBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onUpdateBlock: (updated: StudioBlock) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (block: StudioBlock) => void;
  density: CanvasDensity;
}

export function BentoCanvasView({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
  density,
}: BentoCanvasViewProps) {
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  function startEditing(block: StudioBlock) {
    setEditingBlockId(block.id);
    setEditTitle(block.title);
  }

  function commitEditing(block: StudioBlock) {
    setEditingBlockId(null);
    if (editTitle.trim() && editTitle.trim() !== block.title) {
      onUpdateBlock({ ...block, title: editTitle.trim() });
    }
  }

  if (blocks.length === 0) {
    return (
      <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-3 p-8 text-center select-none">
        <LayoutGridIcon className="h-12 w-12 text-cyan opacity-80" />
        <h3 className="text-base font-bold text-fg">Canvas Stage is Empty</h3>
        <p className="max-w-xs text-xs text-fg-muted">
          Click the <span className="font-bold text-cyan">+</span> button on the top ribbon or use the Quick Arsenal on the left to spawn blocks.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`grid w-full gap-4 ${
        density === 'compact'
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          : 'grid-cols-1 md:grid-cols-2'
      }`}
    >
      {blocks.map((block) => {
        const isSelected = selectedBlockId === block.id;
        const isEditing = editingBlockId === block.id;

        const blockIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
          quote: BoltIcon,
          spec: FileCodeIcon,
          speed: RocketIcon,
          note: EditIcon,
        };
        const BlockIcon = blockIconMap[block.type] || FileCodeIcon;

        return (
          <div
            key={block.id}
            onClick={() => {
              unlockAudio();
              playHapticTick();
              onSelectBlock(block.id);
            }}
            className={`transition-transform duration-150 ${isSelected ? 'scale-[1.01]' : ''}`}
          >
            {/* ── Strict Commutative Card (Locked Dimensions: h-[204px] compact / h-[232px] comfortable) ── */}
            <AwsSpotlightCard
              colorAccent={block.colorAccent}
              sound={true}
              className={`p-3.5 sm:p-4 flex flex-col justify-between transition-all cursor-pointer overflow-hidden border border-border/80 hover:border-cyan/50 ${
                density === 'compact' ? 'h-[204px]' : 'h-[232px]'
              } ${isSelected ? 'ring-2 ring-cyan/70 shadow-[0_0_20px_rgba(6,182,212,0.25)]' : ''}`}
            >
              {/* ── Slot 1: Header (Fixed h-9 / 36px) ── */}
              <div className="flex h-9 shrink-0 items-center justify-between gap-2 border-b border-border/60 pb-1.5">
                <div className="flex items-center gap-2 truncate">
                  <span className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-surface-2 text-xs shadow-2xs">
                    <BlockIcon className="h-3.5 w-3.5 text-cyan shrink-0" />
                  </span>
                  <div className="flex flex-col truncate">
                    {isEditing ? (
                      <Input
                        type="text"
                        autoFocus
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => commitEditing(block)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitEditing(block);
                          if (e.key === 'Escape') setEditingBlockId(null);
                        }}
                        className="h-5.5 rounded border border-cyan bg-surface px-1.5 text-xs font-bold text-fg outline-hidden"
                      />
                    ) : (
                      <h3
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          startEditing(block);
                        }}
                        title="Double-click to inline edit"
                        className="truncate text-xs font-bold text-fg hover:text-cyan transition-colors"
                      >
                        {block.title}
                      </h3>
                    )}
                    <span className="text-[10px] font-mono text-cyan/90 font-medium">{block.category}</span>
                  </div>
                </div>

                {/* Micro Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {block.pinned && (
                    <span className="flex h-5 w-5 items-center justify-center text-cyan" title="Pinned Block">
                      <PinIcon className="h-3 w-3" />
                    </span>
                  )}
                  <Button
                    variant="plain"
                    size="none"
                    latencyMode="none"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      unlockAudio();
                      playSuccessChime();
                      onDuplicateBlock(block);
                    }}
                    title="Duplicate block"
                    aria-label="Duplicate Block"
                    className="flex h-6 w-6 items-center justify-center rounded-md border border-border/60 bg-surface-2 text-fg hover:border-cyan/50 hover:bg-cyan/15 hover:text-cyan transition-colors cursor-pointer shadow-2xs"
                  >
                    <LayersIcon className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="plain"
                    size="none"
                    latencyMode="none"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      unlockAudio();
                      playSubBassThud();
                      onDeleteBlock(block.id);
                    }}
                    title="Delete block"
                    aria-label="Delete Block"
                    className="flex h-6 w-6 items-center justify-center rounded-md border border-border/60 bg-surface-2 text-fg hover:border-danger/50 hover:bg-danger/20 hover:text-danger transition-colors cursor-pointer shadow-2xs"
                  >
                    <CloseIcon className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* ── Slot 2: Content Body (Fixed h-[108px], Balanced & Centered) ── */}
              <div className="h-[108px] shrink-0 flex flex-col justify-center py-1 text-xs overflow-hidden">
                {block.type === 'quote' && block.quoteData && (
                  <div className="flex flex-col justify-between h-full py-0.5">
                    <span className="font-semibold text-fg text-xs truncate">
                      {block.quoteData.itemName}
                    </span>
                    <div className="flex items-center justify-between text-[11px] font-mono text-fg/80">
                      <span>
                        {block.quoteData.quantity} × ${block.quoteData.unitPrice.toFixed(2)}
                      </span>
                      <span className="rounded-md border border-border/80 bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold text-fg">
                        +{block.quoteData.taxPercent}% Tax
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-cyan/40 bg-cyan/15 px-2.5 py-1 font-mono text-xs font-bold text-cyan shadow-2xs">
                      <span>NET TOTAL:</span>
                      <span>${calculateQuoteTotal(block.quoteData).total.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {block.type === 'spec' && block.specData && (
                  <div className="flex flex-col justify-between h-full py-0.5">
                    <div className="flex items-center justify-between">
                      <code className="rounded-md border border-border/80 bg-surface-2 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan">
                        {block.specData.module}
                      </code>
                      <span className="rounded-full border border-success/50 bg-success/15 px-2 py-0.5 text-[9px] font-mono font-bold text-success">
                        {block.specData.status}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-[11px] leading-snug text-fg/85">
                      {block.specData.interfaceContract}
                    </p>
                    <div className="flex items-center justify-between rounded-md border border-border/60 bg-surface-2/70 px-2 py-0.5 text-[10px] font-mono">
                      <span className="text-fg-muted font-medium">Latency SLA:</span>
                      <span className="font-bold text-fg">{block.specData.latencySla}</span>
                    </div>
                  </div>
                )}

                {block.type === 'speed' && block.speedData && (
                  <div className="flex flex-col justify-between h-full py-0.5">
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-fg-muted font-medium">Target Refresh:</span>
                      <span className="font-bold text-success">{block.speedData.targetFps} FPS VSync</span>
                    </div>
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-fg-muted font-medium">Render Budget:</span>
                      <span className="font-bold text-fg">{block.speedData.renderBudgetMs}ms</span>
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-cyan/40 bg-cyan/15 px-2 py-1 font-mono text-[10px]">
                      <span className="text-cyan font-medium">Cumulative Layout Shift:</span>
                      <span className="font-bold text-cyan">{block.speedData.clsScore.toFixed(3)} (0 Shift)</span>
                    </div>
                  </div>
                )}

                {block.type === 'note' && block.noteData && (
                  <div className="flex flex-col justify-between h-full py-0.5">
                    <p className="line-clamp-3 text-xs leading-relaxed text-fg/90">
                      {block.noteData.markdown}
                    </p>
                    {block.noteData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {block.noteData.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md border border-border/80 bg-surface-2 px-1.5 py-0.5 text-[10px] font-mono text-fg/85 font-semibold"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Slot 3: Footer (Fixed h-6 / 24px) ── */}
              <div className="flex h-6 shrink-0 items-center justify-between border-t border-border/60 pt-1 text-[10px] font-mono text-fg/75">
                <span>{block.createdAt}</span>
                <span className="text-cyan font-bold tracking-tight">LOCAL SSD</span>
              </div>
            </AwsSpotlightCard>
          </div>
        );
      })}
    </div>
  );
}
