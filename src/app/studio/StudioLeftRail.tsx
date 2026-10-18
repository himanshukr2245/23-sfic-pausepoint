'use client';

// src/app/studio/StudioLeftRail.tsx — Left Navigator & Quick Template Arsenal
// Compact, dockable, iconic minimalist sidebar with 1-click template inserts.
import React from 'react';
import {
  type StudioBlock,
  type StudioBlockType,
} from './studio-store';
import {
  Button,
  Input,
  SearchIcon,
  CloseIcon,
  BoltIcon,
  FileCodeIcon,
  RocketIcon,
  EditIcon,
  PinIcon,
} from '@/components/ui';
import { playHapticTick, playSuccessChime, unlockAudio } from '@/lib/audio/synthesizer';

interface StudioLeftRailProps {
  blocks: StudioBlock[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  onAddBlockFromTemplate: (type: StudioBlockType) => void;
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function StudioLeftRail({
  blocks,
  searchQuery,
  onSearchChange,
  activeCategory,
  onSelectCategory,
  onAddBlockFromTemplate,
  selectedBlockId,
  onSelectBlock,
  isOpen,
  onClose,
}: StudioLeftRailProps) {
  if (!isOpen) return null;

  const totalWords = blocks.reduce((acc, b) => {
    const text = (b.title + ' ' + (b.noteData?.markdown || b.specData?.interfaceContract || b.quoteData?.itemName || '')).trim();
    return acc + (text ? text.split(/\s+/).length : 0);
  }, 0);

  const categories = ['All', 'Commercial', 'Performance', 'Architecture', 'Creative'];

  return (
    <aside
      aria-label="Navigator & Arsenal"
      className="flex w-64 sm:w-72 shrink-0 flex-col gap-3.5 border-r border-border/80 bg-surface p-3 text-xs shadow-xs select-none overflow-y-auto"
    >
      {/* ── Search & Collapse Header ── */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-cyan font-bold pointer-events-none z-10 text-xs">
            <SearchIcon className="h-3.5 w-3.5" />
          </span>
          <Input
            type="text"
            placeholder="Filter blocks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 w-full rounded-lg border border-border/80 bg-surface-2 pl-8 pr-2 text-xs text-fg placeholder:text-fg/50 focus:border-cyan focus:outline-hidden transition-colors font-medium shadow-2xs"
          />
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
          title="Collapse Left Rail [[]"
          aria-label="Collapse Rail"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/80 bg-surface-2 text-fg hover:border-cyan/50 hover:bg-surface-3 hover:text-cyan transition-colors cursor-pointer shadow-2xs"
        >
          <CloseIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* ── Category Filter Pills ── */}
      <div className="flex flex-wrap gap-1.5">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <Button
              key={cat}
              variant="plain"
              size="none"
              latencyMode="none"
              type="button"
              onClick={() => {
                unlockAudio();
                playHapticTick();
                onSelectCategory(cat);
              }}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs ${
                isActive
                  ? 'border border-cyan/60 bg-cyan/20 font-bold text-cyan shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'border border-border/80 bg-surface-2 text-fg/85 hover:border-cyan/40 hover:bg-surface-3 hover:text-cyan'
              }`}
            >
              {cat}
            </Button>
          );
        })}
      </div>

      {/* ── 1-Click Template Insertion Arsenal ── */}
      <div className="flex flex-col gap-1.5 border-t border-border/60 pt-3">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-fg-muted font-bold">
          <span>Quick Arsenal</span>
          <span className="text-cyan">1-Click Insert</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { type: 'quote', icon: BoltIcon, label: 'Quote Item' },
            { type: 'spec', icon: FileCodeIcon, label: 'Spec Contract' },
            { type: 'speed', icon: RocketIcon, label: 'Speed Law' },
            { type: 'note', icon: EditIcon, label: 'Story Note' },
          ].map((item) => (
            <Button
              key={item.type}
              variant="plain"
              size="none"
              latencyMode="none"
              type="button"
              onClick={() => {
                unlockAudio();
                playSuccessChime();
                onAddBlockFromTemplate(item.type as StudioBlockType);
              }}
              className="flex items-center gap-2 rounded-lg border border-border/80 bg-surface-2 px-2.5 py-2 text-left text-[11px] font-semibold text-fg hover:border-cyan/60 hover:bg-surface-3 hover:text-cyan transition-all cursor-pointer shadow-2xs"
            >
              <item.icon className="h-3.5 w-3.5 text-cyan shrink-0" />
              <span className="truncate">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* ── Active Blocks List ── */}
      <div className="flex flex-1 flex-col gap-1 border-t border-border/60 pt-3 min-h-0">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-fg-muted mb-1 font-bold">
          <span>Stage Blocks</span>
          <span className="text-cyan font-bold" suppressHydrationWarning>{blocks.length}</span>
        </div>
        <div className="flex flex-col gap-1 overflow-y-auto pr-0.5">
          {blocks.map((block) => {
            const isSelected = selectedBlockId === block.id;
            const blockIconMap: Record<StudioBlockType, React.ComponentType<{ className?: string }>> = {
              quote: BoltIcon,
              spec: FileCodeIcon,
              speed: RocketIcon,
              note: EditIcon,
            };
            const BlockIcon = blockIconMap[block.type] || FileCodeIcon;
            return (
              <Button
                key={block.id}
                variant="plain"
                size="none"
                latencyMode="none"
                type="button"
                onClick={() => {
                  unlockAudio();
                  playHapticTick();
                  onSelectBlock(block.id);
                }}
                className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-all cursor-pointer shadow-2xs ${
                  isSelected
                    ? 'border border-cyan/60 bg-cyan/20 font-bold text-cyan shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : 'border border-border/70 bg-surface-2 text-fg hover:border-cyan/40 hover:bg-surface-3 hover:text-cyan'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <BlockIcon className="h-3.5 w-3.5 text-cyan shrink-0" />
                  <span className="truncate">{block.title}</span>
                </div>
                {block.pinned && <PinIcon className="h-3 w-3 text-cyan shrink-0" />}
              </Button>
            );
          })}
        </div>
      </div>

      {/* ── Document Vitals Mini-Footer ── */}
      <div className="flex items-center justify-between border-t border-border/60 pt-2 text-[10px] font-mono text-fg/80 font-medium">
        <span suppressHydrationWarning>{totalWords} words</span>
        <span suppressHydrationWarning>~{Math.max(1, Math.ceil(totalWords / 200))} min read</span>
        <span className="text-success font-bold">SYNCD</span>
      </div>
    </aside>
  );
}
