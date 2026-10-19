'use client';

// components/Header.tsx — AWS-style floating precision top-bar (HK Universal Library v3).
// Minimalist, streamlined layout with 2-Column Bento Grid Showcase Popover & Quick Actions Drawer.
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SITE } from '@/lib/site';
import { AppearanceSwitch } from './AppearanceSwitch';
import { AudioEqualizerPill } from '@/components/ui/AudioEqualizerPill';
import { HeaderQuickDrawer } from './HeaderQuickDrawer';
import { playHapticTick, playPop, unlockAudio } from '@/lib/audio/synthesizer';
import { SeniorModeToggle } from '@/components/layout/SeniorModeToggle';
import { LanguageToggle } from '@/components/layout/LanguageToggle';

import {
  LayoutGridIcon,
  BoltIcon,
  BookOpenIcon,
  ScaleIcon,
  LightbulbIcon,
} from '@/components/ui';


interface DropdownItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  desc: string;
}

const DEFENSE_MODULES: DropdownItem[] = [
  { href: '/report', label: '1930 Emergency Report', icon: BoltIcon, badge: '<60s Triage', desc: 'Instant OCR receipt extraction & telephonic script' },
  { href: '/verify', label: 'Repeat Deposit Brake', icon: ScaleIcon, badge: 'Stop Loss', desc: 'Brake against extortionate withdrawal & bail fees' },
  { href: '/#decoder', label: 'Manipulation Decoder', icon: BookOpenIcon, badge: '10s Pause', desc: 'Decompile urgency traps & deceptive links' },
  { href: '/about', label: 'Surakshit Bharat Specs', icon: LayoutGridIcon, badge: 'SFIC 2026', desc: 'IISc / MoE Level 3 sovereign architecture' },
];

export function Header() {
  const pathname = usePathname();
  const [showcaseOpen, setShowcaseOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Standalone workspace routes have their own integrated bespoke chrome
  if (
    pathname?.startsWith('/ai') ||
    pathname?.startsWith('/minimal') ||
    pathname?.startsWith('/studio') ||
    pathname?.startsWith('/editorial')
  ) {
    return null;
  }

  function handleNavClick() {
    unlockAudio();
    playHapticTick();
    setShowcaseOpen(false);
  }

  function handleOpenShowcase() {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (!showcaseOpen) {
      unlockAudio();
      playPop();
      setShowcaseOpen(true);
    }
  }

  function handleCloseShowcase() {
    closeTimeoutRef.current = setTimeout(() => {
      setShowcaseOpen(false);
    }, 250);
  }

  const isShowcaseActive =
    DEFENSE_MODULES.some((item) => pathname === item.href);

  return (
    <header
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      className="sticky top-2 z-40 w-full px-3 sm:px-6 transition-all duration-300"
    >
      <div className="mx-auto max-w-7xl relative">
        <nav
          aria-label="Main Navigation Bar"
          className="relative flex items-center justify-between gap-2 sm:gap-4 rounded-2xl border border-border/80 bg-surface/95 p-2 px-3 sm:px-5 shadow-md backdrop-blur-xl transition-all"
        >
          {/* ── Brand Lead: AWS Console Style with Live Pulsing Indicator ── */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/"
              onClick={handleNavClick}
              aria-label="Home"
              className="flex items-center gap-2.5 pr-3 sm:pr-4 border-r border-border hover:opacity-90 transition-opacity cursor-pointer group"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan" />
              </span>
              <span className="text-sm font-extrabold tracking-tight text-fg group-hover:text-cyan transition-colors">
                {SITE.shortName}
              </span>
            </Link>
          </div>

          {/* ── Center Navigation Items: Home + Showcase Bento Popover ── */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold">
            {/* 1. Report (Emergency Hero) */}
            <Link
              href="/report"
              onClick={handleNavClick}
              className={`rounded-xl px-3 py-1.5 transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                pathname === '/report'
                  ? 'text-danger font-bold bg-danger/10 shadow-xs border border-danger/30'
                  : 'text-fg-muted hover:text-danger hover:bg-danger/5'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-danger" />
              <span>Report (1930)</span>
            </Link>

            {/* 2. Before You Pay (Verify Brake) */}
            <Link
              href="/verify"
              onClick={handleNavClick}
              className={`rounded-xl px-3 py-1.5 transition-all duration-200 cursor-pointer ${
                pathname === '/verify'
                  ? 'text-fg font-bold bg-surface-2 shadow-xs border border-border/80'
                  : 'text-fg-muted hover:text-fg hover:bg-surface-2/80'
              }`}
            >
              Before You Pay
            </Link>

            {/* 3. Decode Tab */}
            <Link
              href="/"
              onClick={handleNavClick}
              className={`rounded-xl px-3 py-1.5 transition-all duration-200 cursor-pointer ${
                pathname === '/'
                  ? 'text-fg font-bold bg-surface-2 shadow-xs border border-border/80'
                  : 'text-fg-muted hover:text-fg hover:bg-surface-2/80'
              }`}
            >
              Decode
            </Link>

            {/* 2. Showcase Dropdown Tab */}
            <div
              onMouseEnter={handleOpenShowcase}
              onMouseLeave={handleCloseShowcase}
              className="relative"
            >
              <button
                type="button"
                onClick={() => {
                  unlockAudio();
                  playPop();
                  setShowcaseOpen((prev) => !prev);
                }}
                aria-expanded={showcaseOpen}
                aria-haspopup="true"
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 transition-all duration-200 cursor-pointer ${
                  isShowcaseActive || showcaseOpen
                    ? 'text-fg font-bold bg-surface-2 shadow-xs border border-border/80'
                    : 'text-fg-muted hover:text-fg hover:bg-surface-2/80'
                }`}
              >
                <span>Defense Hub</span>
                <svg
                  className={`h-3 w-3 transition-transform duration-200 ${
                    showcaseOpen ? 'rotate-180 text-cyan' : 'rotate-0 text-fg-muted'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* ── Precision 2-Column Bento Grid Popover ── */}
              {showcaseOpen && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[92vw] sm:w-[580px] md:w-[640px] rounded-2xl border border-border/80 bg-surface/98 p-3 shadow-2xl backdrop-blur-xl z-50 animate-fade-in ring-1 ring-border/50 select-none"
                >
                  {/* Top Hub Header Banner */}
                  <div className="flex items-center justify-between border-b border-border/60 pb-2.5 px-1 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
                      </span>
                      <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-cyan">
                        Sovereign Defense Modules
                      </span>
                    </div>

                    <Link
                      href="/about"
                      onClick={handleNavClick}
                      className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-fg-muted hover:text-cyan transition-colors"
                    >
                      <span>System Specs</span>
                      <span>↗</span>
                    </Link>
                  </div>

                  {/* 2-Column Bento Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {DEFENSE_MODULES.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={handleNavClick}
                          onMouseEnter={() => {
                            unlockAudio();
                            playHapticTick();
                          }}
                          className={`group flex items-start gap-2.5 rounded-xl p-2.5 transition-all cursor-pointer border ${
                            isActive
                              ? 'bg-surface-2 border-border/80 text-fg shadow-xs'
                              : 'hover:bg-surface-2 hover:border-border/80 border-transparent text-fg-muted hover:text-fg'
                          }`}
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-2 border border-border/70 text-cyan shrink-0 group-hover:scale-105 group-hover:border-cyan/40 transition-transform shadow-xs">
                            <item.icon className="h-4 w-4" />
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-fg group-hover:text-cyan transition-colors truncate">
                                {item.label}
                              </span>
                              <span className="shrink-0 rounded bg-surface-2 border border-border/60 px-1.5 py-0.2 text-[9px] font-mono text-fg-muted">
                                {item.badge}
                              </span>
                            </div>
                            <p className="text-[10.5px] text-fg-muted truncate mt-0.5">
                              {item.desc}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Micro Footer Tip */}
                  <div className="mt-2.5 pt-2 border-t border-border/40 px-1 flex items-center justify-between text-[10px] font-mono text-fg-muted">
                    <span className="flex items-center gap-1.5">
                      <LightbulbIcon className="h-3.5 w-3.5 text-brand shrink-0" />
                      <span>Press ⌘K anytime to switch interfaces</span>
                    </span>
                    <span className="text-success font-semibold">CLS = 0.000</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Right Utility Controls (Language + Senior Mode + Equalizer + ⌘K + Animated Switch) ── */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Language Switcher (EN / हिन्दी) */}
            <LanguageToggle />

            {/* Senior Citizen High-Contrast Toggle */}
            <SeniorModeToggle />

            {/* Live Procedural Audio Equalizer & Mute Toggle */}
            <AudioEqualizerPill />

            {/* Quick Command Palette Trigger (Cmd+K) */}
            <button
              type="button"
              onClick={() => {
                unlockAudio();
                playHapticTick();
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
              }}
              title="Open Command Palette (⌘K / Ctrl+K)"
              className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-surface px-2.5 py-1 text-[11px] font-mono text-fg-muted hover:text-fg hover:border-brand/40 hover:bg-surface-2 transition-all cursor-pointer shadow-xs"
            >
              <svg className="h-3.5 w-3.5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden sm:inline font-semibold">⌘K</span>
            </button>

            {/* Tactile Sliding Sun/Moon Switch */}
            <AppearanceSwitch />

          </div>
        </nav>

        {/* ── Right-Side Drop-Left Quick Actions Drawer (Settings, About, Support) ── */}
        <HeaderQuickDrawer />
      </div>
    </header>
  );
}
