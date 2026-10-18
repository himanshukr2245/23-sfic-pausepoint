'use client';

// src/app/studio/KeyboardHudModal.tsx — Minimalist Keyboard Shortcuts Reference HUD
import React from 'react';
import {
  Button,
  KeyboardIcon,
  SearchIcon,
  HelpCircleIcon,
  CloseIcon,
  SidebarLeftIcon,
  SidebarRightIcon,
  MaximizeIcon,
} from '@/components/ui';
import { playHapticTick, unlockAudio } from '@/lib/audio/synthesizer';

interface KeyboardHudModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardHudModal({ isOpen, onClose }: KeyboardHudModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '[', desc: 'Toggle Left Navigator & Arsenal', icon: <SidebarLeftIcon className="h-3.5 w-3.5 text-cyan" /> },
    { key: ']', desc: 'Toggle Right Property Inspector', icon: <SidebarRightIcon className="h-3.5 w-3.5 text-cyan" /> },
    { key: '+ / −', desc: 'Zoom In / Zoom Out Stage', icon: <SearchIcon className="h-3.5 w-3.5 text-cyan" /> },
    { key: '0', desc: 'Fit Canvas to Screen (100%)', icon: <MaximizeIcon className="h-3.5 w-3.5 text-cyan" /> },
    { key: 'N', desc: 'Create New Block', icon: <span className="font-bold text-xs text-cyan">+</span> },
    { key: '?', desc: 'Toggle Keyboard Shortcuts HUD', icon: <HelpCircleIcon className="h-3.5 w-3.5 text-cyan" /> },
    { key: 'Esc', desc: 'Close Drawers / Deselect Block', icon: <CloseIcon className="h-3.5 w-3.5 text-danger" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-shade/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl border border-border/80 bg-surface/98 p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <KeyboardIcon className="h-5 w-5 text-cyan" />
            <h2 className="text-sm font-bold text-fg">Keyboard Shortcuts HUD</h2>
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
              className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs hover:bg-surface-2/60 transition-colors"
            >
              <div className="flex items-center gap-2 text-fg-muted">
                <span>{sc.icon}</span>
                <span>{sc.desc}</span>
              </div>
              <kbd className="rounded-md border border-border/80 bg-surface-2 px-2 py-0.5 font-mono text-[11px] font-bold text-fg shadow-2xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-[11px] font-mono text-fg-muted">
          <span>Web Audio Haptics Active</span>
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
            className="rounded-lg border border-cyan/40 bg-cyan/10 px-3 py-1 font-bold text-cyan hover:bg-cyan/20 transition-colors cursor-pointer"
          >
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
