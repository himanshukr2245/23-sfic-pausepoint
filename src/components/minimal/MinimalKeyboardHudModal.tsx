'use client';

// components/minimal/MinimalKeyboardHudModal.tsx — Minimalist Keyboard Shortcuts Reference HUD
// Distraction-Free Dark Comfort: Solid bg-surface, WCAG AAA text contrast, zero opacity haze.
import React from 'react';
import {
  Button,
  KeyboardIcon,
  HelpCircleIcon,
  CloseIcon,
  SidebarLeftIcon,
  SidebarRightIcon,
  SparklesIcon,
} from '@/components/ui';
import { playHapticTick, unlockAudio } from '@/lib/audio/synthesizer';

interface MinimalKeyboardHudModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MinimalKeyboardHudModal({ isOpen, onClose }: MinimalKeyboardHudModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '1 – 4', desc: 'Switch Model (Gemini, Claude, GPT-4o, DeepSeek)', icon: <SparklesIcon className="h-3.5 w-3.5 text-cyan" /> },
    { key: '/ or ⌘K', desc: 'Focus Omni-Command Prompt Bar', icon: <span className="font-mono text-xs">›</span> },
    { key: '↵ (Enter)', desc: 'Send Message / Stream Response', icon: <span className="font-mono text-xs">↵</span> },
    { key: '[', desc: 'Toggle Left Chats & Presets Rail', icon: <SidebarLeftIcon className="h-3.5 w-3.5 text-cyan" /> },
    { key: ']', desc: 'Toggle Right Telemetry & Intel Dock', icon: <SidebarRightIcon className="h-3.5 w-3.5 text-cyan" /> },
    { key: '?', desc: 'Toggle Keyboard Shortcuts Reference HUD', icon: <HelpCircleIcon className="h-3.5 w-3.5 text-cyan" /> },
    { key: 'Esc', desc: 'Unfocus Prompt / Close Dialogs', icon: <CloseIcon className="h-3.5 w-3.5 text-danger" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-shade/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-md rounded-2xl border border-border/80 bg-surface p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <KeyboardIcon className="h-5 w-5 text-cyan" />
            <h2 className="text-sm font-bold text-fg">AI Chat Shortcuts</h2>
          </div>
          <Button
            variant="plain"
            size="none"
            type="button"
            onClick={() => {
              unlockAudio();
              playHapticTick();
              onClose();
            }}
            aria-label="Close HUD"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 text-fg-muted hover:border-border hover:bg-surface-2 hover:text-fg transition-colors cursor-pointer"
          >
            <CloseIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-3 flex flex-col gap-1.5 max-h-[60vh] overflow-y-auto pr-1">
          {shortcuts.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs hover:bg-surface-2 transition-colors"
            >
              <div className="flex items-center gap-2.5 text-fg">
                <span className="font-mono text-fg-muted">{sc.icon}</span>
                <span>{sc.desc}</span>
              </div>
              <kbd className="rounded-md border border-border/80 bg-surface-2 px-2 py-0.5 font-mono text-[11px] font-bold text-fg shadow-2xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-[11px] font-mono text-fg-muted">
          <span>Sub-Millisecond Dispatches</span>
          <Button
            size="sm"
            variant="primary"
            type="button"
            onClick={() => {
              unlockAudio();
              playHapticTick();
              onClose();
            }}
            className="h-7 px-3 text-xs font-bold"
          >
            Got It
          </Button>
        </div>
      </div>
    </div>
  );
}
