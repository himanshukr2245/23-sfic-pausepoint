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
  { href: '/decode', label: 'Manipulation Decoder', icon: BookOpenIcon, badge: '10s Pause', desc: 'Decompile urgency traps, deceptive links & tactics' },
  { href: '/simulator', label: 'Attack Simulator Arena', icon: LightbulbIcon, badge: 'Live Drills', desc: 'Realistic drills for Digital Arrest, APKs & UPI fraud' },
  { href: '/studio', label: 'Evidence Studio', icon: ScaleIcon, badge: 'BSA 2023', desc: 'Court-grade Section 63 cryptographic certificate & timeline' },
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
          {/* ── Brand Lead: Hand-Crafted Adaptive Sovereign Brand Logo (Icon + Wordmark) ── */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/"
              onClick={handleNavClick}
              aria-label="PausePoint Golden Hour Defence"
              className="flex items-center gap-2 sm:gap-2.5 pr-2 sm:pr-3 hover:opacity-90 transition-opacity cursor-pointer group"
            >
              {/* 1. Official App Crest Icon */}
              <picture className="flex items-center justify-center">
                <source srcSet="/brand/app-logo.webp" type="image/webp" />
                <img
                  src="/brand/app-logo.png"
                  alt="PausePoint App Crest"
                  width={34}
                  height={34}
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl object-contain shadow-xs border border-border/80 p-0.5 group-hover:scale-105 group-hover:border-cyan/50 transition-all duration-200"
                  loading="eager"
                />
              </picture>

              {/* 2. Thin Optical Divider */}
              <div className="hidden xs:block h-5 w-px bg-border/80" />

              {/* 3. Horizontal Wordmark (Adaptive Dark/Light) */}
              <div className="relative h-6 sm:h-7 flex items-center">
                <picture className="hidden dark:block">
                  <source srcSet="/brand/logo-dark.webp" type="image/webp" />
                  <img
                    src="/brand/logo-dark.png"
                    alt={`${SITE.name} Golden Hour Defence`}
                    width={135}
                    height={40}
                    className="h-5 sm:h-6 w-auto object-contain transition-all"
                    loading="eager"
                  />
                </picture>
                <picture className="block dark:hidden">
                  <source srcSet="/brand/logo-light.webp" type="image/webp" />
                  <img
                    src="/brand/logo-light.png"
                    alt={`${SITE.name} Golden Hour Defence`}
                    width={135}
                    height={40}
                    className="h-5 sm:h-6 w-auto object-contain transition-all"
                    loading="eager"
                  />
                </picture>
              </div>
            </Link>
          </div>

          {/* ── Center Navigation Items: Home + Defense Hub + About ── */}
          <div className="flex items-center gap-1 sm:gap-1.5 text-xs font-semibold">
            {/* 1. Home Tab */}
            <Link
              href="/"
              onClick={handleNavClick}
              className={`rounded-xl px-3 py-1.5 transition-all duration-200 cursor-pointer ${
                pathname === '/'
                  ? 'text-fg font-bold bg-surface-2 shadow-xs border border-border/80'
                  : 'text-fg-muted hover:text-fg hover:bg-surface-2/80 border border-transparent'
              }`}
            >
              Home
            </Link>

            {/* 2. Defense Hub Dropdown Trigger */}
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
                className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 transition-all duration-200 cursor-pointer ${
                  isShowcaseActive || showcaseOpen
                    ? 'text-brand font-bold bg-brand/10 shadow-xs border border-brand/40'
                    : 'text-fg-muted hover:text-fg hover:bg-surface-2/80 border border-transparent'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
                </span>
                <span className="tracking-wide">Defense Hub</span>
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

            {/* 3. About Tab (Dossier & Specifications) */}
            <Link
              href="/about"
              onClick={handleNavClick}
              className={`rounded-xl px-3 py-1.5 transition-all duration-200 cursor-pointer ${
                pathname === '/about'
                  ? 'text-fg font-bold bg-surface-2 shadow-xs border border-border/80'
                  : 'text-fg-muted hover:text-fg hover:bg-surface-2/80 border border-transparent'
              }`}
            >
              About
            </Link>
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
