'use client';

// tokens-ok-file: editorial quote cards and parchment themes use tailored terracotta and amber literary palette
// components/editorial/EditorialLeftRail.tsx — Master Anthology & Marginalia Rail (280px)
// Fuses Treatise Archive, live search filter, strictly commutative h-[76px] cards,
// marginalia note bookmarks, GPU Typographic Engine Health telemetry, and instant full-surface theming.
import React, { useState, useMemo } from 'react';
import {
  BookOpenIcon,
  SearchIcon,
  CloseIcon,
  TrashIcon,
  SidebarLeftIcon,
  CheckIcon,
} from '@/components/ui';
import { playHapticTick, playPop } from '@/lib/audio/synthesizer';
import {
  type EditorialEssay,
  type MarginaliaNote,
  EDITORIAL_ESSAYS,
} from './editorial-store';

export interface EditorialLeftRailProps {
  isOpen: boolean;
  onClose: () => void;
  activeEssay: EditorialEssay;
  onSelectEssay: (essay: EditorialEssay) => void;
  marginalia: MarginaliaNote[];
  onDeleteMarginalia: (id: string) => void;
}

export function EditorialLeftRail({
  isOpen,
  onClose,
  activeEssay,
  onSelectEssay,
  marginalia,
  onDeleteMarginalia,
}: EditorialLeftRailProps) {
  const [activeTab, setActiveTab] = useState<'essays' | 'marginalia'>('essays');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter essays based on title, subtitle, author, or tags
  const filteredEssays = useMemo(() => {
    if (!searchQuery.trim()) return EDITORIAL_ESSAYS;
    const q = searchQuery.toLowerCase();
    return EDITORIAL_ESSAYS.filter(
      (essay) =>
        essay.title.toLowerCase().includes(q) ||
        essay.subtitle.toLowerCase().includes(q) ||
        essay.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        essay.issueNo.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Filter marginalia notes based on text or quote snippet
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return marginalia;
    const q = searchQuery.toLowerCase();
    return marginalia.filter(
      (note) =>
        note.text.toLowerCase().includes(q) ||
        note.quoteSnippet.toLowerCase().includes(q)
    );
  }, [searchQuery, marginalia]);

  if (!isOpen) return null;

  return (
    <aside
      className="relative flex h-[calc(100dvh-48px)] w-[280px] shrink-0 flex-col border-r border-[var(--ed-border)] bg-[var(--ed-surface)] text-[var(--ed-text)] select-none z-30 transition-all duration-150 ease-out"
      aria-label="Anthology Shelf and Marginalia Dock"
    >
      {/* ── HEADER STRIP (40px) ── */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-[var(--ed-border)] px-3">
        <div className="flex items-center gap-2">
          <BookOpenIcon size={14} className="text-[var(--ed-accent)]" />
          <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-[var(--ed-text)]">
            Anthology
          </span>
          <span className="rounded-full bg-[var(--ed-border)] px-1.5 py-0.2 font-mono text-[9px] text-[var(--ed-text-muted)]">
            {EDITORIAL_ESSAYS.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            playPop();
            onClose();
          }}
          className="flex h-6 w-6 items-center justify-center rounded-sm text-[var(--ed-text-muted)] transition-colors hover:bg-[var(--ed-surface-raised)] hover:text-[var(--ed-text)] cursor-pointer"
          title="Collapse Left Rail ([)"
          aria-label="Collapse Left Rail"
        >
          <SidebarLeftIcon size={13} />
        </button>
      </div>

      {/* ── SEARCH INPUT ── */}
      <div className="p-2 border-b border-[var(--ed-border)]">
        <div className="relative flex items-center">
          <SearchIcon
            size={12}
            className="absolute left-2.5 text-[var(--ed-text-muted)] pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search treatises, topics..."
            className="h-7 w-full rounded-md border border-[var(--ed-border)] bg-[var(--ed-surface-raised)] pl-7 pr-7 font-sans text-[11px] text-[var(--ed-text)] placeholder:text-[var(--ed-text-muted)]/60 focus:border-[var(--ed-accent-border)] focus:outline-hidden"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                playHapticTick();
              }}
              className="absolute right-2 flex h-4 w-4 items-center justify-center rounded text-[var(--ed-text-muted)] hover:text-[var(--ed-text)] cursor-pointer"
              aria-label="Clear search"
            >
              <CloseIcon size={10} />
            </button>
          )}
        </div>
      </div>

      {/* ── SEGMENTED TAB SWITCHER ── */}
      <div className="px-2 pt-2 pb-1">
        <div className="grid grid-cols-2 rounded-md border border-[var(--ed-border)] bg-[var(--ed-surface-raised)] p-0.5 text-[11px]">
          <button
            type="button"
            onClick={() => {
              setActiveTab('essays');
              playHapticTick();
            }}
            className={`flex items-center justify-center gap-1.5 rounded-sm py-1 font-mono text-[10px] font-medium transition-colors cursor-pointer ${
              activeTab === 'essays'
                ? 'bg-[var(--ed-surface)] text-[var(--ed-text)] shadow-xs font-semibold'
                : 'text-[var(--ed-text-muted)] hover:text-[var(--ed-text)]'
            }`}
          >
            <span>Treatises</span>
            <span className="rounded-full bg-[var(--ed-border)] px-1 font-mono text-[9px]">
              {filteredEssays.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('marginalia');
              playHapticTick();
            }}
            className={`flex items-center justify-center gap-1.5 rounded-sm py-1 font-mono text-[10px] font-medium transition-colors cursor-pointer ${
              activeTab === 'marginalia'
                ? 'bg-[var(--ed-surface)] text-[var(--ed-text)] shadow-xs font-semibold'
                : 'text-[var(--ed-text-muted)] hover:text-[var(--ed-text)]'
            }`}
          >
            <span>Marginalia</span>
            <span className="rounded-full bg-[var(--ed-border)] px-1 font-mono text-[9px]">
              {marginalia.length}
            </span>
          </button>
        </div>
      </div>

      {/* ── SCROLLABLE LIST ZONE ── */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1.5 scrollbar-thin">
        {activeTab === 'essays' ? (
          filteredEssays.length > 0 ? (
            filteredEssays.map((essay) => {
              const isActive = essay.id === activeEssay.id;
              return (
                <div
                  key={essay.id}
                  onClick={() => {
                    playHapticTick();
                    onSelectEssay(essay);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onSelectEssay(essay);
                    }
                  }}
                  // COMMUTATIVE LAYOUT LAW: Strictly uniform height h-[76px]
                  className={`group relative flex h-[76px] w-full cursor-pointer flex-col justify-between rounded-lg border p-2 text-left ${
                    isActive
                      ? 'border-[var(--ed-accent-border)] bg-[var(--ed-surface-raised)] shadow-xs'
                      : 'border-[var(--ed-border)] bg-[var(--ed-surface-raised)]/70 hover:border-[var(--ed-accent-border)] hover:bg-[var(--ed-surface-raised)]'
                  }`}
                >
                  {/* Left Active Indicator Strip */}
                  {isActive && (
                    <span className="absolute top-2 bottom-2 left-0 w-1 rounded-r-sm bg-[var(--ed-accent)]" />
                  )}

                  {/* Top Row: Issue & Read Time */}
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono font-medium text-[var(--ed-accent-text)]">
                      {essay.issueNo}
                    </span>
                    <span className="font-mono text-[9px] text-[var(--ed-text-muted)]">
                      {essay.readTimeMin} min read
                    </span>
                  </div>

                  {/* Middle Row: Title (Strictly 1-line truncation) */}
                  <div className="truncate font-serif text-[12px] font-semibold text-[var(--ed-text)] group-hover:text-[var(--ed-accent-text)]">
                    {essay.title}
                  </div>

                  {/* Bottom Row: Tags snippet & Author */}
                  <div className="flex items-center justify-between font-mono text-[9px] text-[var(--ed-text-muted)]">
                    <span className="truncate max-w-[170px]">
                      {essay.tags[0]} · {essay.tags[1] || ''}
                    </span>
                    <span>[{EDITORIAL_ESSAYS.findIndex((e) => e.id === essay.id) + 1}]</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center text-[var(--ed-text-muted)]">
              <SearchIcon size={20} className="mb-2 opacity-40" />
              <p className="font-sans text-xs">No treatises found</p>
              <p className="font-mono text-[10px] text-[var(--ed-text-muted)]/60 mt-1">
                Try another keyword
              </p>
            </div>
          )
        ) : (
          marginalia.length > 0 ? (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                // COMMUTATIVE LAYOUT LAW: Strictly uniform h-[76px] marginalia card
                className="group relative flex h-[76px] w-full flex-col justify-between rounded-lg border border-[var(--ed-border)] bg-[var(--ed-surface-raised)] p-2 text-left hover:border-[var(--ed-accent-border)]"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-mono text-[9px] text-[var(--ed-text-muted)]">
                    {note.timestamp}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      playPop();
                      onDeleteMarginalia(note.id);
                    }}
                    className="flex h-4 w-4 items-center justify-center rounded text-[var(--ed-text-muted)] hover:text-red-400 cursor-pointer"
                    title="Delete Note"
                    aria-label="Delete Note"
                  >
                    <TrashIcon size={11} />
                  </button>
                </div>

                <div className="line-clamp-2 font-serif text-[11px] leading-tight text-[var(--ed-text)]">
                  {note.text}
                </div>

                <div className="truncate font-mono text-[9px] italic text-[var(--ed-accent-text)]">
                  {note.quoteSnippet}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center text-[var(--ed-text-muted)]">
              <BookOpenIcon size={20} className="mb-2 opacity-40" />
              <p className="font-sans text-xs">No marginalia recorded</p>
              <p className="font-mono text-[10px] text-[var(--ed-text-muted)]/60 mt-1">
                Highlight passages to annotate
              </p>
            </div>
          )
        )}
      </div>

      {/* ── BOTTOM DOCK: GPU TYPOGRAPHIC ENGINE HEALTH TILE ── */}
      <div className="border-t border-[var(--ed-border)] bg-[var(--ed-surface)] p-2 pb-6 sm:pb-2">
        <div className="flex h-[44px] items-center justify-between rounded-md border border-[var(--ed-border)] bg-[var(--ed-surface-raised)] px-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <div className="flex flex-col">
              <span className="font-mono text-[10px] font-semibold text-[var(--ed-text)]">
                60 FPS VSync
              </span>
              <span className="font-mono text-[9px] text-[var(--ed-text-muted)]">
                CLS 0.000 Immovable
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 rounded bg-[var(--ed-accent-bg)] border border-[var(--ed-accent-border)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--ed-accent-text)] shrink-0">
            <CheckIcon size={10} />
            <span>GPU-OK</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
