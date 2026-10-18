'use client';

// src/app/studio/StudioRibbon.tsx — Master Unified Studio Workspace Top-Bar (48px)
// Merged single header with PausePoint brand, 'Go To' jump menu, centered canvas tools, and VS-Code style twin panel toggles.
import React, { useState, useRef, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  Button,
  Input,
  HomeIcon,
  PaletteIcon,
  VolumeIcon,
  BookOpenIcon,
  BoltIcon,
  SettingsIcon,
  InfoIcon,
  HeadphonesIcon,
  HelpCircleIcon,
  DownloadIcon,
  VolumeMuteIcon,
  SidebarLeftIcon,
  SidebarRightIcon,
  MaximizeIcon,
  EditIcon,
  ArrowDownIcon,
} from '@/components/ui';
import { AppearanceSwitch } from '@/components/AppearanceSwitch';
import {
  playHapticTick,
  playLaserZip,
  isAudioMuted,
  setAudioMuted,
  unlockAudio,
} from '@/lib/audio/synthesizer';

interface StudioRibbonProps {
  docTitle: string;
  onUpdateTitle: (newTitle: string) => void;
  zoomLevel: number;
  onZoom: (delta: number) => void;
  onResetZoom: () => void;
  leftRailOpen: boolean;
  onToggleLeftRail: () => void;
  rightInspectorOpen: boolean;
  onToggleRightInspector: () => void;
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
  onOpenKeyboardHud: () => void;
}

const GO_TO_ROUTES = [
  { href: '/', label: 'Home Page', icon: HomeIcon },
  { href: '/showcase', label: 'Showcase Directory', icon: PaletteIcon },
  { href: '/ai', label: 'AI Chat', icon: BoltIcon },
  { href: '/editorial', label: 'Editorial Typography', icon: BookOpenIcon },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
  { href: '/about', label: 'About', icon: InfoIcon },
  { href: '/support', label: 'Support', icon: HeadphonesIcon },
];

function subscribeMute(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('hk:sound-muted-changed', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('hk:sound-muted-changed', callback);
  };
}

function getMuteServerSnapshot(): boolean {
  return false;
}

export function StudioRibbon({
  docTitle,
  onUpdateTitle,
  zoomLevel,
  onZoom,
  onResetZoom,
  leftRailOpen,
  onToggleLeftRail,
  rightInspectorOpen,
  onToggleRightInspector,
  onOpenAddModal,
  onOpenExportModal,
  onOpenKeyboardHud,
}: StudioRibbonProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(docTitle);
  const [goToOpen, setGoToOpen] = useState(false);
  const muted = useSyncExternalStore(subscribeMute, isAudioMuted, getMuteServerSnapshot);
  const goToRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (goToRef.current && !goToRef.current.contains(event.target as Node)) {
        setGoToOpen(false);
      }
    }
    if (goToOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [goToOpen]);

  function handleToggleAudio() {
    unlockAudio();
    const next = !muted;
    setAudioMuted(next);
    if (!next) {
      playHapticTick();
    }
  }

  function handleCommitTitle() {
    setIsEditingTitle(false);
    if (tempTitle.trim() && tempTitle.trim() !== docTitle) {
      onUpdateTitle(tempTitle.trim());
    } else {
      setTempTitle(docTitle);
    }
  }

  return (
    <header className="relative flex h-12 w-full shrink-0 items-center justify-between border-b border-border/80 bg-surface px-3 text-xs shadow-xs select-none z-40">
      {/* ── LEFT: Brand, Go To Navigation Menu, Document Title, Sync Badge ── */}
      <div className="flex items-center gap-2.5">
        {/* Brand Home Link */}
        <Link
          href="/"
          onClick={() => {
            unlockAudio();
            playHapticTick();
          }}
          className="flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-extrabold tracking-tight text-fg hover:text-cyan transition-colors"
        >
          <span className="flex h-2.5 w-2.5 rounded-full bg-cyan shadow-[0_0_8px_var(--color-cyan)]" />
          <span className="font-sans font-bold">PausePoint</span>
        </Link>

        {/* 'Go To' Quick Route Jumper Dropdown (Hover + Click Dual Trigger) */}
        <div
          ref={goToRef}
          className="relative"
          onMouseEnter={() => setGoToOpen(true)}
          onMouseLeave={() => setGoToOpen(false)}
        >
          <Button
            variant="plain"
            size="none"
            latencyMode="none"
            type="button"
            onClick={() => {
              unlockAudio();
              playHapticTick();
              setGoToOpen((prev) => !prev);
            }}
            aria-expanded={goToOpen}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              goToOpen
                ? 'border-cyan/60 bg-cyan/20 text-cyan shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                : 'border-border/80 bg-surface-2 text-fg hover:border-cyan/50 hover:bg-surface-2 hover:text-cyan'
            }`}
          >
            <span>Go To</span>
            <ArrowDownIcon className="h-2.5 w-2.5 text-cyan shrink-0" />
          </Button>

          {/* Elevated Floating Route Jumper Menu */}
          {goToOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-56 rounded-xl border border-border/90 bg-surface p-1.5 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-fg-muted border-b border-border/60 mb-1">
                <span>Quick Navigation</span>
                <span className="text-[9px] text-cyan font-bold">7 Routes</span>
              </div>
              <div className="flex flex-col gap-0.5 max-h-80 overflow-y-auto">
                {GO_TO_ROUTES.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => {
                      unlockAudio();
                      playHapticTick();
                      setGoToOpen(false);
                    }}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-fg hover:bg-surface-2 hover:text-cyan transition-colors"
                  >
                    <route.icon className="h-4 w-4 text-cyan shrink-0" />
                    <span className="truncate">{route.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="hidden sm:block h-4 w-px bg-border/60" />

        {/* Document Title Editable */}
        <div className="flex items-center gap-2 min-w-0">
          {isEditingTitle ? (
            <Input
              type="text"
              autoFocus
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleCommitTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCommitTitle();
                if (e.key === 'Escape') {
                  setTempTitle(docTitle);
                  setIsEditingTitle(false);
                }
              }}
              className="h-7 w-36 sm:w-52 rounded-md border border-brand bg-surface px-2 text-xs font-bold text-fg outline-hidden"
            />
          ) : (
            <Button
              variant="plain"
              size="none"
              latencyMode="none"
              type="button"
              onClick={() => {
                setTempTitle(docTitle);
                setIsEditingTitle(true);
              }}
              title="Click to rename document"
              className="group flex items-center gap-1.5 truncate rounded-md px-1.5 py-1 text-xs font-bold text-fg hover:bg-surface-2 transition-colors cursor-pointer"
            >
              <span className="truncate" suppressHydrationWarning>{docTitle}</span>
              <span className="text-fg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                <EditIcon className="h-3 w-3" />
              </span>
            </Button>
          )}

          {/* Local-first pulse badge */}
          <span
            title="Saved locally in browser memory (no network wait)"
            className="hidden md:inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-mono font-medium text-success"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            LOCAL SSD
          </span>
        </div>
      </div>

      {/* ── CENTER: Canvas Zoom Engine & Add / Export Action Cluster ── */}
      <div className="flex items-center gap-2">
        {/* Zoom Controls (Iconic Pill) */}
        <div className="flex items-center rounded-lg border border-border/80 bg-surface-2 px-1 py-0.5 shadow-2xs">
          <Button
            variant="plain"
            size="none"
            latencyMode="none"
            type="button"
            onClick={() => onZoom(-10)}
            title="Zoom out [-]"
            aria-label="Zoom out"
            className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-mono font-bold text-fg hover:bg-surface-3 hover:text-cyan cursor-pointer transition-colors"
          >
            −
          </Button>
          <span className="w-10 text-center font-mono text-[11px] font-bold text-fg">
            {zoomLevel}%
          </span>
          <Button
            variant="plain"
            size="none"
            latencyMode="none"
            type="button"
            onClick={() => onZoom(10)}
            title="Zoom in [+]"
            aria-label="Zoom in"
            className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-mono font-bold text-fg hover:bg-surface-3 hover:text-cyan cursor-pointer transition-colors"
          >
            +
          </Button>
          <div className="h-3 w-px bg-border/60 mx-0.5" />
          <Button
            variant="plain"
            size="none"
            latencyMode="none"
            type="button"
            onClick={onResetZoom}
            title="Fit to Screen [0]"
            aria-label="Fit to Screen"
            className="flex h-6 w-6 items-center justify-center rounded-md text-fg hover:bg-surface-3 hover:text-cyan cursor-pointer transition-colors"
          >
            <MaximizeIcon className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Add Block Glowing Cyber Button */}
        <Button
          variant="plain"
          size="none"
          latencyMode="none"
          type="button"
          onClick={() => {
            unlockAudio();
            playLaserZip();
            onOpenAddModal();
          }}
          title="Add Block [N]"
          aria-label="Add Block"
          className="flex h-7.5 px-3 items-center justify-center gap-1.5 rounded-lg border border-cyan/50 bg-cyan/20 text-xs font-extrabold text-cyan hover:bg-cyan/30 hover:border-cyan shadow-[0_0_12px_rgba(6,182,212,0.18)] transition-all cursor-pointer"
        >
          <span className="text-sm font-bold leading-none">+</span>
          <span className="hidden sm:inline">Add</span>
        </Button>

        {/* Export Modal Button */}
        <Button
          variant="plain"
          size="none"
          latencyMode="none"
          type="button"
          onClick={() => {
            unlockAudio();
            playHapticTick();
            onOpenExportModal();
          }}
          title="Export JSON / Markdown"
          aria-label="Export"
          className="flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-border/80 bg-surface-2 text-xs font-bold text-fg hover:border-cyan/50 hover:bg-surface-2 hover:text-cyan transition-all cursor-pointer shadow-2xs"
        >
          <DownloadIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* ── RIGHT: Utilities & VS Code-Style Twin Panel Layout Toggles ── */}
      <div className="flex items-center gap-1.5">
        {/* Live QuoteMaker Production Reference */}
        <a
          href="http://quotemaker.hkr.dpdns.org/studio"
          target="_blank"
          rel="noopener noreferrer"
          title="Open Live Production QuoteMaker Studio"
          className="hidden xl:inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-surface-2 px-2.5 py-1 text-[11px] font-mono font-medium text-fg hover:border-cyan/50 hover:text-cyan transition-colors"
        >
          <span>QuoteMaker ↗</span>
        </a>

        {/* Audio Haptic Toggle */}
        <Button
          variant="plain"
          size="none"
          latencyMode="none"
          type="button"
          onClick={handleToggleAudio}
          title={muted ? 'Unmute procedural haptic audio' : 'Mute procedural haptic audio'}
          aria-label="Toggle Audio"
          className="flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-border/80 bg-surface-2 text-xs text-fg hover:border-cyan/50 hover:text-cyan transition-all cursor-pointer shadow-2xs"
        >
          {muted ? <VolumeMuteIcon className="h-4 w-4 text-fg-muted" /> : <VolumeIcon className="h-4 w-4 text-cyan" />}
        </Button>

        {/* Keyboard HUD */}
        <Button
          variant="plain"
          size="none"
          latencyMode="none"
          type="button"
          onClick={() => {
            unlockAudio();
            playHapticTick();
            onOpenKeyboardHud();
          }}
          title="Keyboard Shortcuts [?]"
          aria-label="Keyboard Shortcuts"
          className="flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-border/80 bg-surface-2 text-xs font-extrabold text-fg hover:border-cyan/50 hover:text-cyan transition-all cursor-pointer shadow-2xs"
        >
          <HelpCircleIcon className="h-4 w-4" />
        </Button>

        {/* Animated Light/Dark Mode Switcher */}
        <AppearanceSwitch compact={true} />

        <div className="h-4 w-px bg-border/60 mx-1" />

        {/* ── VS Code Style Twin Panel Layout Toggles (Side-by-Side on the Right) ── */}
        <div className="flex items-center rounded-lg border border-border/80 bg-surface-2 p-0.5 gap-0.5 shadow-2xs">
          {/* Toggle Left Primary Sidebar */}
          <Button
            variant="plain"
            size="none"
            latencyMode="none"
            type="button"
            onClick={() => {
              unlockAudio();
              playHapticTick();
              onToggleLeftRail();
            }}
            title={leftRailOpen ? 'Hide Left Navigator & Arsenal [[]' : 'Show Left Navigator & Arsenal [[]'}
            aria-label="Toggle Left Rail"
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-all cursor-pointer ${
              leftRailOpen
                ? 'border border-cyan/40 bg-cyan/20 font-bold text-cyan shadow-2xs'
                : 'text-fg/70 hover:text-fg hover:bg-surface-3'
            }`}
          >
            <SidebarLeftIcon className="h-4 w-4" />
          </Button>

          {/* Toggle Right Secondary Sidebar (Inspector) */}
          <Button
            variant="plain"
            size="none"
            latencyMode="none"
            type="button"
            onClick={() => {
              unlockAudio();
              playHapticTick();
              onToggleRightInspector();
            }}
            title={rightInspectorOpen ? 'Hide Property Inspector []]' : 'Show Property Inspector []]'}
            aria-label="Toggle Right Inspector"
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-all cursor-pointer ${
              rightInspectorOpen
                ? 'border border-cyan/40 bg-cyan/20 font-bold text-cyan shadow-2xs'
                : 'text-fg/70 hover:text-fg hover:bg-surface-3'
            }`}
          >
            <SidebarRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
