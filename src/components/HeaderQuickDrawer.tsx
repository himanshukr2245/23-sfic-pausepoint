'use client';

// components/HeaderQuickDrawer.tsx — Drop-Left Quick-Action Drawer (HK Universal Library v3).
// Positioned just below the main header bar on the right side.
// Expands to the left on hover/click revealing Gear (Settings), Info (About), and Headphone (Support) icons.
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { playHapticTick, playPop, unlockAudio } from '@/lib/audio/synthesizer';

/* ── Lightweight Inline SVG Icons ────────────────────────────────────────── */
function IconGear({ className = '' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconInfo({ className = '' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function IconHeadphones({ className = '' }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

export function HeaderQuickDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  function handleOpen() {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (!isOpen) {
      unlockAudio();
      playPop();
      setIsOpen(true);
    }
  }

  function handleMouseLeave() {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 280);
  }

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  function handleActionClick() {
    unlockAudio();
    playHapticTick();
    setIsOpen(false);
  }

  return (
    <div
      onMouseEnter={handleOpen}
      onMouseLeave={handleMouseLeave}
      className="absolute right-4 sm:right-6 top-full mt-1.5 z-50 flex items-center justify-end select-none"
    >
      <div
        className={`flex items-center rounded-2xl border border-border/80 bg-surface/98 p-1 shadow-lg transition-all duration-300 ease-out backdrop-blur-md ${
          isOpen
            ? 'pr-2 pl-1.5 border-cyan/40 shadow-cyan/15 scale-100 opacity-100 ring-1 ring-cyan/20'
            : 'hover:border-border-strong opacity-85 hover:opacity-100 hover:scale-105'
        }`}
      >
        {/* Expanded Quick Actions Strip (Slides Left) */}
        {isOpen && (
          <div className="flex items-center gap-1 mr-1 animate-fade-in">
            {/* 1. Settings (Gear Icon) */}
            <Link
              href="/settings"
              onClick={handleActionClick}
              title="Settings & System Configuration"
              className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all cursor-pointer ${
                pathname === '/settings'
                  ? 'bg-cyan/20 text-cyan border border-cyan/40 shadow-xs'
                  : 'text-fg-muted hover:text-fg hover:bg-surface-2'
              }`}
            >
              <IconGear className="transition-transform group-hover:rotate-45" />
              <span className="sr-only">Settings</span>
            </Link>

            {/* 2. About (Info 'i' Icon) */}
            <Link
              href="/about"
              onClick={handleActionClick}
              title="About PausePoint & Architecture"
              className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all cursor-pointer ${
                pathname === '/about'
                  ? 'bg-cyan/20 text-cyan border border-cyan/40 shadow-xs'
                  : 'text-fg-muted hover:text-fg hover:bg-surface-2'
              }`}
            >
              <IconInfo className="transition-transform group-hover:scale-110" />
              <span className="sr-only">About</span>
            </Link>

            {/* 3. Support (Headphone Icon) */}
            <Link
              href="/support"
              onClick={handleActionClick}
              title="Support & Developer Assistance"
              className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all cursor-pointer ${
                pathname === '/support'
                  ? 'bg-cyan/20 text-cyan border border-cyan/40 shadow-xs'
                  : 'text-fg-muted hover:text-fg hover:bg-surface-2'
              }`}
            >
              <IconHeadphones className="transition-transform group-hover:scale-110" />
              <span className="sr-only">Support</span>
            </Link>

            {/* Divider */}
            <div className="h-4 w-px bg-border/60 mx-1" />
          </div>
        )}

        {/* Floating Chevron Trigger */}
        <button
          type="button"
          onClick={() => {
            unlockAudio();
            playPop();
            setIsOpen((prev) => !prev);
          }}
          title={isOpen ? 'Collapse Quick Drawer' : 'Quick Actions (Settings, About, Support)'}
          aria-expanded={isOpen}
          aria-label="Toggle quick actions drawer"
          className="flex h-7 w-7 items-center justify-center rounded-xl text-fg-muted hover:text-cyan hover:bg-surface-2 transition-all cursor-pointer"
        >
          <svg
            className={`h-4 w-4 transition-transform duration-300 ${
              isOpen ? 'rotate-180 text-cyan' : 'rotate-0'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
