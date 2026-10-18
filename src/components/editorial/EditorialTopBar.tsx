'use client';

// tokens-ok-file: editorial quote cards and parchment themes use tailored terracotta and amber literary palette
// components/editorial/EditorialTopBar.tsx — Master Unified Editorial Workspace Top-Bar (48px)
// Fuses HK Starter brand anchor, dual-trigger 'Go To' route jumper, essay navigator capsule,
// typeface switcher, reading vitals pill, appearance switch, and VS Code twin panel dock toggles.
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
  ArrowDownIcon,
} from '@/components/ui';
import { AppearanceSwitch } from '@/components/AppearanceSwitch';
import { AudioEqualizerPill } from '@/components/ui/AudioEqualizerPill';
import { playHapticTick, playPop, unlockAudio } from '@/lib/audio/synthesizer';
import {
  type TypefaceFamily,
  type EditorialEssay,
  type QuoteCardStyle,
  EDITORIAL_ESSAYS,
  EDITORIAL_THEMES,
} from './editorial-store';

export interface EditorialTopBarProps {
  activeEssay: EditorialEssay;
  onSelectEssay: (essay: EditorialEssay) => void;
  typeface: TypefaceFamily;
  onSelectTypeface: (font: TypefaceFamily) => void;
  selectedTheme?: QuoteCardStyle;
  onSelectTheme?: (theme: QuoteCardStyle) => void;
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

export function EditorialTopBar({
  activeEssay,
  onSelectEssay,
  typeface,
  onSelectTypeface,
  selectedTheme = 'terracotta',
  onSelectTheme,
  leftRailOpen,
  onToggleLeftRail,
  rightInspectorOpen,
  onToggleRightInspector,
  onOpenKeyboardHud,
}: EditorialTopBarProps) {
  const [goToOpen, setGoToOpen] = useState(false);
  const [essayMenuOpen, setEssayMenuOpen] = useState(false);
  const goToRef = useRef<HTMLDivElement>(null);
  const essayMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (goToRef.current && !goToRef.current.contains(target)) {
        setGoToOpen(false);
      }
      if (essayMenuRef.current && !essayMenuRef.current.contains(target)) {
        setEssayMenuOpen(false);
      }
    }
    if (goToOpen || essayMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [goToOpen, essayMenuOpen]);

  const activeEssayIdx = EDITORIAL_ESSAYS.findIndex((e) => e.id === activeEssay.id);

  return (
    <header className="relative flex h-12 w-full shrink-0 items-center justify-between border-b border-[var(--ed-border)] bg-[var(--ed-surface)] px-3 text-xs shadow-xs select-none z-40 text-[var(--ed-text)]">
      {/* ── LEFT ZONE: Brand, Route Jumper, Title, VSync Badge, Breadcrumb ── */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Brand Home Link */}
        <Link
          href="/"
          onClick={() => {
            unlockAudio();
            playHapticTick();
          }}
          className="flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-extrabold tracking-tight text-[var(--ed-text)] hover:text-[var(--ed-accent-text)] transition-colors shrink-0"
        >
          <span className="flex h-2.5 w-2.5 rounded-full bg-[var(--ed-accent)] shadow-[0_0_8px_var(--ed-accent-glow)] shrink-0" />
          <span className="font-sans font-bold">HK Starter</span>
        </Link>

        {/* 'Go To' Quick Route Jumper Dropdown (Hover + Click Dual Trigger) */}
        <div
          ref={goToRef}
          className="relative shrink-0"
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
                ? 'border-[var(--ed-accent-border)] bg-[var(--ed-accent-bg)] text-[var(--ed-accent-text)] shadow-[0_0_12px_var(--ed-accent-glow)]'
                : 'border-[var(--ed-border)] bg-[var(--ed-surface-raised)] text-[var(--ed-text)] hover:border-[var(--ed-accent-border)] hover:text-[var(--ed-accent-text)]'
            }`}
          >
            <span>Go To</span>
            <ArrowDownIcon className="h-2.5 w-2.5 text-[var(--ed-accent-text)] shrink-0" />
          </Button>

          {/* Elevated Floating Route Jumper Menu */}
          {goToOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-56 rounded-xl border border-[var(--ed-border)] bg-[var(--ed-surface)] p-1.5 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-100 text-[var(--ed-text)]">
              <div className="flex items-center justify-between px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--ed-text-muted)] border-b border-[var(--ed-border)] mb-1">
                <span>Quick Navigation</span>
                <span className="text-[9px] text-[var(--ed-accent-text)] font-bold">8 Routes</span>
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
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--ed-text)] hover:bg-[var(--ed-accent-bg)] hover:text-[var(--ed-accent-text)] transition-colors"
                  >
                    <route.icon className="h-4 w-4 text-[var(--ed-accent)] shrink-0" />
                    <span className="truncate">{route.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="hidden sm:block h-4 w-px bg-[var(--ed-border)] shrink-0" />

        {/* Workspace Title & VSync Badge */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate text-xs font-bold text-[var(--ed-text)]">
            Editorial Studio
          </span>
          <span
            title="Typographic display compositor frame lock active"
            className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-[var(--ed-accent-border)] bg-[var(--ed-accent-bg)] text-[var(--ed-accent-text)] px-2 py-0.5 text-[10px] font-mono font-medium shrink-0"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--ed-accent)] animate-pulse" />
            {EDITORIAL_THEMES[selectedTheme]?.badge || 'VENETIAN VSYNC'} · 60HZ
          </span>
        </div>

        {/* Active Essay Title Breadcrumb */}
        {activeEssay && (
          <div className="hidden xl:flex items-center gap-1.5 text-[var(--ed-text-muted)] truncate min-w-0">
            <span className="opacity-40">/</span>
            <span className="text-[11px] font-serif truncate max-w-[220px]" title={activeEssay.title}>
              {activeEssay.title}
            </span>
          </div>
        )}
      </div>

      {/* ── CENTER ZONE: Focused Essay Navigator Capsule & Popover ── */}
      <div className="relative shrink-0" ref={essayMenuRef}>
        <Button
          variant="plain"
          size="none"
          latencyMode="none"
          type="button"
          onClick={() => {
            unlockAudio();
            playHapticTick();
            setEssayMenuOpen((prev) => !prev);
          }}
          title="Switch Active Essay [1-4]"
          aria-expanded={essayMenuOpen}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
            essayMenuOpen
              ? 'border-[var(--ed-accent-border)] bg-[var(--ed-accent-bg)] text-[var(--ed-accent-text)] shadow-sm'
              : 'border-[var(--ed-border)] bg-[var(--ed-surface-raised)] text-[var(--ed-text)] hover:border-[var(--ed-accent-border)] hover:text-[var(--ed-accent-text)]'
          }`}
        >
          <BookOpenIcon className="h-3.5 w-3.5 text-[var(--ed-accent)]" />
          <span className="font-serif font-bold tracking-tight max-w-[160px] sm:max-w-[240px] truncate">
            {activeEssay.title}
          </span>
          <kbd className="hidden sm:inline font-mono text-[9px] text-[var(--ed-text-muted)]">
            [{activeEssayIdx + 1}]
          </kbd>
          <span className="text-[9px] text-[var(--ed-text-muted)] font-bold ml-0.5">▾</span>
        </Button>

        {/* Floating Essay Selection Popover Menu */}
        {essayMenuOpen && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-80 rounded-xl border border-[var(--ed-border)] bg-[var(--ed-surface)] p-1.5 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-100 text-[var(--ed-text)]">
            <div className="flex items-center justify-between px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--ed-text-muted)] border-b border-[var(--ed-border)] mb-1">
              <span>Curated Treatises</span>
              <span className="text-[9px] text-[var(--ed-accent-text)] font-bold">Hotkeys [1-4]</span>
            </div>
            <div className="flex flex-col gap-1">
              {EDITORIAL_ESSAYS.map((essay, idx) => {
                const isActive = activeEssay.id === essay.id;
                return (
                  <Button
                    key={essay.id}
                    variant="plain"
                    size="none"
                    latencyMode="none"
                    type="button"
                    onClick={() => {
                      unlockAudio();
                      playPop();
                      onSelectEssay(essay);
                      setEssayMenuOpen(false);
                    }}
                    className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors cursor-pointer ${
                      isActive
                        ? 'border border-[var(--ed-accent-border)] bg-[var(--ed-accent-bg)] text-[var(--ed-accent-text)] font-bold'
                        : 'text-[var(--ed-text-muted)] hover:bg-[var(--ed-surface-raised)] hover:text-[var(--ed-text)]'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-serif truncate font-bold text-[var(--ed-text)]">{essay.title}</span>
                        {isActive && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[var(--ed-accent)] shadow-[0_0_6px_var(--ed-accent-glow)] shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-[var(--ed-text-muted)] font-normal truncate mt-0.5">
                        {essay.issueNo} · {essay.readTimeMin} min read
                      </span>
                    </div>
                    <kbd
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded border shrink-0 ${
                        isActive
                          ? 'border-[var(--ed-accent-border)] bg-[var(--ed-accent-bg)] text-[var(--ed-accent-text)]'
                          : 'border-[var(--ed-border)] bg-[var(--ed-surface-raised)] text-[var(--ed-text-muted)]'
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

      {/* ── RIGHT ZONE: Theme Switcher, Typeface Switcher, Reading Pill, Audio, Appearance, Twin Docks ── */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Visual Theme Capsule Selector */}
        {onSelectTheme && (
          <div className="hidden xl:flex items-center rounded-lg border border-[var(--ed-border)] bg-[var(--ed-surface-raised)] p-0.5 shadow-2xs">
            {(['terracotta', 'obsidian', 'parchment', 'cyber'] as const).map((t) => {
              const isActive = selectedTheme === t;
              return (
                <Button
                  key={t}
                  variant="plain"
                  size="none"
                  latencyMode="none"
                  type="button"
                  onClick={() => {
                    unlockAudio();
                    playPop();
                    onSelectTheme(t);
                  }}
                  className={`rounded px-2 py-0.5 text-[10px] font-mono capitalize transition-all cursor-pointer ${
                    isActive
                      ? 'border border-[var(--ed-accent-border)] bg-[var(--ed-accent-bg)] text-[var(--ed-accent-text)] font-bold shadow-2xs'
                      : 'text-[var(--ed-text-muted)] hover:text-[var(--ed-text)] hover:bg-[var(--ed-surface)]'
                  }`}
                >
                  {t}
                </Button>
              );
            })}
          </div>
        )}

        {/* Typeface Switcher Segmented Pills */}
        <div className="hidden lg:flex items-center rounded-lg border border-[var(--ed-border)] bg-[var(--ed-surface-raised)] p-0.5 shadow-2xs">
          {(['serif', 'georgia', 'mono'] as TypefaceFamily[]).map((f) => {
            const isActive = typeface === f;
            return (
              <Button
                key={f}
                variant="plain"
                size="none"
                latencyMode="none"
                type="button"
                onClick={() => {
                  unlockAudio();
                  playPop();
                  onSelectTypeface(f);
                }}
                className={`rounded px-2 py-0.5 text-[11px] capitalize transition-all cursor-pointer ${
                  isActive
                    ? 'border border-[var(--ed-accent-border)] bg-[var(--ed-accent-bg)] text-[var(--ed-accent-text)] font-bold shadow-2xs'
                    : 'text-[var(--ed-text-muted)] hover:text-[var(--ed-text)] hover:bg-[var(--ed-surface)]'
                }`}
              >
                {f}
              </Button>
            );
          })}
        </div>

        {/* Reading Progress & Vitals Pill */}
        <div
          className="hidden md:flex items-center gap-1.5 rounded-lg border border-[var(--ed-border)] bg-[var(--ed-surface-raised)] px-2.5 py-1 font-mono text-[11px] shadow-2xs text-[var(--ed-text)]"
          title={`Total words: ${activeEssay.wordCount} | Optimal reading speed: 240 WPM`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--ed-accent)] shadow-[0_0_6px_var(--ed-accent-glow)] shrink-0" />
          <span className="font-bold text-[var(--ed-text)]">{activeEssay.readTimeMin}m read</span>
          <span className="text-[var(--ed-text-muted)]">({activeEssay.wordCount}w)</span>
        </div>

        {/* Web Audio Equalizer Pill */}
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
          className="flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-[var(--ed-border)] bg-[var(--ed-surface-raised)] text-xs font-extrabold text-[var(--ed-text)] hover:border-[var(--ed-accent-border)] hover:text-[var(--ed-accent-text)] transition-all cursor-pointer shadow-2xs"
        >
          <HelpCircleIcon className="h-4 w-4" />
        </Button>

        {/* Animated Light/Dark Mode Switcher */}
        <AppearanceSwitch compact={true} />

        <div className="h-4 w-px bg-[var(--ed-border)] mx-0.5" />

        {/* ── VS Code Style Twin Panel Layout Toggles ── */}
        <div className="flex items-center rounded-lg border border-[var(--ed-border)] bg-[var(--ed-surface-raised)] p-0.5 gap-0.5 shadow-2xs">
          {/* Toggle Left Primary Sidebar (Anthology & Treatises) */}
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
            title={leftRailOpen ? 'Hide Anthology Shelf [[]' : 'Show Anthology Shelf [[]'}
            aria-label="Toggle Left Rail"
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-all cursor-pointer ${
              leftRailOpen
                ? 'border border-[var(--ed-accent-border)] bg-[var(--ed-accent-bg)] font-bold text-[var(--ed-accent-text)] shadow-2xs'
                : 'text-[var(--ed-text-muted)] hover:text-[var(--ed-text)] hover:bg-[var(--ed-surface)]'
            }`}
          >
            <SidebarLeftIcon className="h-4 w-4" />
          </Button>

          {/* Toggle Right Secondary Sidebar (QuoteMaker & Telemetry) */}
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
            title={rightInspectorOpen ? 'Hide QuoteMaker Exporter []]' : 'Show QuoteMaker Exporter []]'}
            aria-label="Toggle Right Inspector"
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-all cursor-pointer ${
              rightInspectorOpen
                ? 'border border-[var(--ed-accent-border)] bg-[var(--ed-accent-bg)] font-bold text-[var(--ed-accent-text)] shadow-2xs'
                : 'text-[var(--ed-text-muted)] hover:text-[var(--ed-text)] hover:bg-[var(--ed-surface)]'
            }`}
          >
            <SidebarRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
