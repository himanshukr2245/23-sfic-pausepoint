'use client';

// components/minimal/MinimalTopBar.tsx — Master Unified Minimalist AI Chat Workspace Top-Bar (48px)
// Fuses PausePoint brand anchor, dual-trigger 'Go To' route jumper, model selector capsule,
// live hardware VSync telemetry, tactile AppearanceSwitch, and VS Code twin panel toggles.
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Button,
  HomeIcon,
  PaletteIcon,
  LayoutGridIcon,
  BookOpenIcon,
  BoltIcon,
  SettingsIcon,
  InfoIcon,
  HeadphonesIcon,
  HelpCircleIcon,
  SidebarLeftIcon,
  SidebarRightIcon,
  SparklesIcon,
  ArrowDownIcon,
} from '@/components/ui';
import { AppearanceSwitch } from '@/components/AppearanceSwitch';
import { AudioEqualizerPill } from '@/components/ui/AudioEqualizerPill';
import { playHapticTick, unlockAudio } from '@/lib/audio/synthesizer';
import { useRealPerf } from '@/lib/telemetry/perfObserver';
import { useMounted } from '@/lib/use-mounted';
import {
  type AmbientModelId,
  AMBIENT_MODELS,
} from './minimal-store';

export interface MinimalTopBarProps {
  selectedModel: AmbientModelId;
  onSelectModel: (m: AmbientModelId) => void;
  activeSessionTitle: string;
  leftRailOpen: boolean;
  onToggleLeftRail: () => void;
  rightInspectorOpen: boolean;
  onToggleRightInspector: () => void;
  onOpenKeyboardHud: () => void;
}

const GO_TO_ROUTES = [
  { href: '/', label: 'Home Page', icon: HomeIcon },
  { href: '/showcase', label: 'Showcase Directory', icon: PaletteIcon },
  { href: '/studio', label: 'Studio Workspace', icon: LayoutGridIcon },
  { href: '/ai', label: 'AI Chat', icon: BoltIcon },
  { href: '/editorial', label: 'Editorial Typography', icon: BookOpenIcon },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
  { href: '/about', label: 'About', icon: InfoIcon },
  { href: '/support', label: 'Support', icon: HeadphonesIcon },
];

export function MinimalTopBar({
  selectedModel,
  onSelectModel,
  activeSessionTitle,
  leftRailOpen,
  onToggleLeftRail,
  rightInspectorOpen,
  onToggleRightInspector,
  onOpenKeyboardHud,
}: MinimalTopBarProps) {
  const [goToOpen, setGoToOpen] = useState(false);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const goToRef = useRef<HTMLDivElement>(null);
  const modelMenuRef = useRef<HTMLDivElement>(null);
  const snap = useRealPerf();
  const mounted = useMounted();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (goToRef.current && !goToRef.current.contains(target)) {
        setGoToOpen(false);
      }
      if (modelMenuRef.current && !modelMenuRef.current.contains(target)) {
        setModelMenuOpen(false);
      }
    }
    if (goToOpen || modelMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [goToOpen, modelMenuOpen]);

  const currentModel = AMBIENT_MODELS.find((m) => m.id === selectedModel) || AMBIENT_MODELS[0];
  const currentModelIdx = AMBIENT_MODELS.findIndex((m) => m.id === selectedModel);
  const isFluid = snap.fps >= 55;

  return (
    <header className="relative flex h-12 w-full shrink-0 items-center justify-between border-b border-border/80 bg-surface px-3 text-xs shadow-xs select-none z-40">
      {/* ── LEFT: Brand Anchor, Go To Navigation Menu, Document Title, VSync Badge ── */}
      <div className="flex items-center gap-2.5 min-w-0">
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
                <span className="text-[9px] text-cyan font-bold">8 Routes</span>
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

        {/* Workspace Title & VSync Lock Badge */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate text-xs font-bold text-fg">
            AI Chat
          </span>
          <span
            title="Hardware display compositor frame lock active"
            className="hidden md:inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-mono font-medium text-success shrink-0"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            VSYNC LOCKED
          </span>
        </div>

        {/* Active Session Title Breadcrumb */}
        {activeSessionTitle && (
          <div className="hidden lg:flex items-center gap-1.5 text-fg-muted truncate min-w-0">
            <span className="opacity-40">/</span>
            <span className="text-[11px] truncate max-w-[200px]" title={activeSessionTitle}>
              {activeSessionTitle}
            </span>
          </div>
        )}
      </div>

      {/* ── CENTER: Focused Model Selector Capsule & Floating Popover ── */}
      <div className="relative" ref={modelMenuRef}>
        <Button
          variant="plain"
          size="none"
          latencyMode="none"
          type="button"
          onClick={() => {
            unlockAudio();
            playHapticTick();
            setModelMenuOpen((prev) => !prev);
          }}
          title="Switch Cognitive Model [1-4]"
          aria-expanded={modelMenuOpen}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
            modelMenuOpen
              ? 'border-cyan/40 bg-surface-2 text-cyan shadow-sm'
              : 'border-border/80 bg-surface-2 text-fg hover:border-cyan/40 hover:bg-surface-3'
          }`}
        >
          <SparklesIcon className="h-3.5 w-3.5 text-cyan" />
          <span className="font-bold tracking-tight">{currentModel.name}</span>
          <kbd className="hidden sm:inline font-mono text-[9px] text-fg-muted">
            [{currentModelIdx + 1}]
          </kbd>
          <span className="text-[9px] text-fg-muted font-bold ml-0.5">▾</span>
        </Button>

        {/* Floating Model Popover Menu */}
        {modelMenuOpen && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-72 rounded-xl border border-border/90 bg-surface p-1.5 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-fg-muted border-b border-border/60 mb-1">
              <span>Cognitive Models</span>
              <span className="text-[9px] text-cyan font-bold">Hotkeys [1-4]</span>
            </div>
            <div className="flex flex-col gap-1">
              {AMBIENT_MODELS.map((m, idx) => {
                const isActive = selectedModel === m.id;
                return (
                  <Button
                    key={m.id}
                    variant="plain"
                    size="none"
                    latencyMode="none"
                    type="button"
                    onClick={() => {
                      unlockAudio();
                      playHapticTick();
                      onSelectModel(m.id);
                      setModelMenuOpen(false);
                    }}
                    className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors cursor-pointer ${
                      isActive
                        ? 'border border-cyan/30 bg-cyan/10 text-cyan font-bold'
                        : 'text-fg-muted hover:bg-surface-2 hover:text-fg'
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate">{m.name}</span>
                        {isActive && (
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_6px_var(--color-cyan)]" />
                        )}
                      </div>
                      <span className="text-[10px] text-fg-muted font-normal truncate mt-0.5">
                        {m.badge} · {m.latencyTarget}
                      </span>
                    </div>
                    <kbd
                      className={`font-mono text-[10px] ml-2 px-1.5 py-0.5 rounded border ${
                        isActive
                          ? 'border-cyan/40 bg-cyan/20 text-cyan'
                          : 'border-border/80 bg-surface-2 text-fg-muted'
                      }`}
                    >
                      [{idx + 1}]
                    </kbd>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT: Real Telemetry Pill + Audio Pill + Appearance + VS Code Twin Docks ── */}
      <div className="flex items-center gap-1.5">
        {/* Real Live Hardware Telemetry Pill */}
        <div
          suppressHydrationWarning
          className="hidden sm:flex items-center gap-1.5 rounded-lg border border-border/80 bg-surface-2 px-2.5 py-1 font-mono text-[11px] shadow-2xs"
          title={
            mounted
              ? `Real Display: ${snap.targetHz}Hz | Frame Budget: ${snap.frameDeltaMs}ms / ${snap.frameBudgetMs}ms | DOM Nodes: ${snap.domNodes}`
              : undefined
          }
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isFluid ? 'bg-success shadow-[0_0_6px_var(--color-success)]' : 'bg-warning'
            }`}
          />
          <span suppressHydrationWarning className="font-bold text-fg">
            {snap.fps} FPS
          </span>
          <span suppressHydrationWarning className="text-fg-muted">
            ({snap.frameDeltaMs}ms)
          </span>
        </div>

        {/* Web Audio Synthesizer Pill */}
        <AudioEqualizerPill />

        {/* Keyboard Shortcuts Trigger */}
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
          {/* Toggle Left Primary Sidebar (Presets & Sessions) */}
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
            title={leftRailOpen ? 'Hide Left Sessions & Presets [[]' : 'Show Left Sessions & Presets [[]'}
            aria-label="Toggle Left Rail"
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-all cursor-pointer ${
              leftRailOpen
                ? 'border border-cyan/40 bg-cyan/20 font-bold text-cyan shadow-2xs'
                : 'text-fg/70 hover:text-fg hover:bg-surface-3'
            }`}
          >
            <SidebarLeftIcon className="h-4 w-4" />
          </Button>

          {/* Toggle Right Secondary Sidebar (Telemetry Lab) */}
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
            title={rightInspectorOpen ? 'Hide Hardware Telemetry Lab []]' : 'Show Hardware Telemetry Lab []]'}
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
