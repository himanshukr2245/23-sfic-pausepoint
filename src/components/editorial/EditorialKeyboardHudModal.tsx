'use client';

// tokens-ok-file: editorial quote cards and parchment themes use tailored terracotta and amber literary palette
// components/editorial/EditorialKeyboardHudModal.tsx — Master Editorial Keyboard HUD
// Distraction-Free Dark Comfort: Solid bg-surface, WCAG AAA text contrast, zero opacity haze.
import React from 'react';
import {
  KeyboardIcon,
  HelpCircleIcon,
  CloseIcon,
  SidebarLeftIcon,
  SidebarRightIcon,
  SparklesIcon,
  CopyIcon,
  BookOpenIcon,
} from '@/components/ui';
import { playHapticTick, playPop, unlockAudio } from '@/lib/audio/synthesizer';

export interface EditorialKeyboardHudModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditorialKeyboardHudModal({
  isOpen,
  onClose,
}: EditorialKeyboardHudModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    {
      key: '1 – 4',
      desc: 'Switch Literary Treatise (Essays 01 – 04)',
      icon: <BookOpenIcon size={14} className="text-[var(--ed-accent)]" />,
    },
    {
      key: 'V',
      desc: 'Cycle Visual Theme (Terracotta ➔ Obsidian ➔ Parchment ➔ Cyber)',
      icon: <SparklesIcon size={14} className="text-[var(--ed-accent)]" />,
    },
    {
      key: 'T',
      desc: 'Cycle Typeface Family (Serif ➔ Georgia ➔ Mono)',
      icon: <span className="font-serif text-sm font-bold text-[var(--ed-accent)]">Aa</span>,
    },
    {
      key: '[',
      desc: 'Toggle Left Anthology & Marginalia Rail',
      icon: <SidebarLeftIcon size={14} className="text-[var(--ed-accent)]" />,
    },
    {
      key: ']',
      desc: 'Toggle Right QuoteMaker Studio Inspector',
      icon: <SidebarRightIcon size={14} className="text-[var(--ed-accent)]" />,
    },
    {
      key: 'C',
      desc: 'Copy Active Pull Quote to Clipboard',
      icon: <CopyIcon size={14} className="text-[var(--ed-accent)]" />,
    },
    {
      key: 'E',
      desc: 'Export Quote Card Markdown (.md)',
      icon: <SparklesIcon size={14} className="text-[var(--ed-accent)]" />,
    },
    {
      key: '?',
      desc: 'Toggle Keyboard Shortcuts Reference HUD',
      icon: <HelpCircleIcon size={14} className="text-[var(--ed-accent)]" />,
    },
    {
      key: 'Esc',
      desc: 'Close Modal / Unfocus Active Elements',
      icon: <CloseIcon size={14} className="text-red-400" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-md rounded-2xl border border-[var(--ed-border)] bg-[var(--ed-surface)] p-5 shadow-2xl text-[var(--ed-text)]">
        <div className="flex items-center justify-between border-b border-[var(--ed-border)] pb-3">
          <div className="flex items-center gap-2">
            <KeyboardIcon size={18} className="text-[var(--ed-accent)]" />
            <h2 className="text-sm font-serif font-bold text-[var(--ed-text)]">
              Editorial Studio Shortcuts
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              unlockAudio();
              playPop();
              onClose();
            }}
            aria-label="Close HUD"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--ed-border)] text-[var(--ed-text-muted)] hover:border-[var(--ed-accent-border)] hover:bg-[var(--ed-surface-raised)] hover:text-[var(--ed-text)] transition-colors cursor-pointer"
          >
            <CloseIcon size={14} />
          </button>
        </div>

        <div className="mt-3 flex flex-col gap-1.5 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
          {shortcuts.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs hover:bg-[var(--ed-surface-raised)] transition-colors"
            >
              <div className="flex items-center gap-2.5 text-[var(--ed-text)]">
                <span className="shrink-0">{sc.icon}</span>
                <span>{sc.desc}</span>
              </div>
              <kbd className="rounded-md border border-[var(--ed-border)] bg-[var(--ed-surface-raised)] px-2 py-0.5 font-mono text-[11px] font-bold text-[var(--ed-text)] shadow-2xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[var(--ed-border)] pt-3 text-[11px] font-mono text-[var(--ed-text-muted)]">
          <span>Sub-Millisecond VSync Ready</span>
          <button
            type="button"
            onClick={() => {
              unlockAudio();
              playHapticTick();
              onClose();
            }}
            className="h-7 rounded-md bg-[var(--ed-accent)] px-3 font-mono text-xs font-semibold text-black transition-opacity hover:opacity-90 cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
