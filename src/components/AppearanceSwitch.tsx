'use client';

// components/AppearanceSwitch.tsx — Ultra-Tactile Sliding Sun/Moon Switch (HK Universal Library v3).
// Seamless animated sliding thumb, zero text clutter, pure hardware-accelerated icon morphing.
import { useSyncExternalStore } from 'react';
import {
  getThemeChoice,
  setThemeChoice,
  getReduceEffects,
  setReduceEffects,
  subscribePreferences,
  serverSnapshot,
} from '@/lib/preferences';
import { playHapticTick, unlockAudio } from '@/lib/audio/synthesizer';

interface AppearanceSwitchProps {
  className?: string;
  compact?: boolean;
}

function IconSun({ size = 15, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function IconMoon({ size = 15, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function IconZap({ size = 14, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

export function AppearanceSwitch({ className = '', compact = false }: AppearanceSwitchProps) {
  const themeChoice = useSyncExternalStore(subscribePreferences, getThemeChoice, serverSnapshot) ?? 'dark';
  const reduceEffects = useSyncExternalStore(subscribePreferences, getReduceEffects, serverSnapshot) ?? false;

  const isLight = themeChoice === 'light';
  const isDark = themeChoice === 'dark' || themeChoice === 'system';

  function handleToggleTheme() {
    unlockAudio();
    playHapticTick();
    setThemeChoice(isDark ? 'light' : 'dark');
  }

  function handleToggleEffects() {
    unlockAudio();
    playHapticTick();
    setReduceEffects(!reduceEffects);
  }

  return (
    <div
      role="group"
      aria-label="Appearance and motion controls"
      className={`inline-flex items-center gap-1.5 ${className}`}
    >
      {/* ── Sliding Animated Switch [Sun ⇄ Moon] ── */}
      <button
        type="button"
        role="switch"
        data-testid="theme-toggle"
        aria-checked={isDark}
        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        title={isDark ? 'Active: Dark mode (Click for Light mode)' : 'Active: Light mode (Click for Dark mode)'}
        onClick={handleToggleTheme}
        className={`relative inline-flex shrink-0 cursor-pointer items-center rounded-full border border-border/80 bg-surface p-1 shadow-inner transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-focus focus:outline-hidden group ${
          compact ? 'h-7 w-[60px]' : 'h-8 w-[68px]'
        }`}
      >
        <span className="sr-only">{isDark ? 'Dark' : 'Light'}</span>

        {/* Animated Sliding Thumb */}
        <span
          className={`pointer-events-none absolute rounded-full shadow-md transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) ${
            compact ? 'h-5 w-6' : 'h-6 w-7'
          } ${
            isDark
              ? `${compact ? 'translate-x-[26px]' : 'translate-x-[32px]'} bg-cyan/20 border border-cyan/50 shadow-cyan/20`
              : 'translate-x-0 bg-warning/20 border border-warning/50 shadow-warning/20'
          }`}
        />

        {/* Sun Slot (Left) */}
        <span
          className={`relative z-10 flex items-center justify-center transition-all duration-300 ${
            compact ? 'h-5 w-6' : 'h-6 w-7'
          } ${
            isLight
              ? 'text-warning scale-110 rotate-0 font-bold'
              : 'text-fg-muted/60 hover:text-fg-muted scale-95 -rotate-45'
          }`}
        >
          <IconSun size={compact ? 13 : 15} />
        </span>

        {/* Moon Slot (Right) */}
        <span
          className={`relative z-10 flex items-center justify-center transition-all duration-300 ${
            compact ? 'h-5 w-6' : 'h-6 w-7'
          } ${
            isDark
              ? 'text-cyan scale-110 rotate-0 font-bold'
              : 'text-fg-muted/60 hover:text-fg-muted scale-95 rotate-12'
          }`}
        >
          <IconMoon size={compact ? 13 : 15} />
        </span>
      </button>

      {/* ── Compact Reduce FX Button ── */}
      <button
        type="button"
        onClick={handleToggleEffects}
        aria-pressed={reduceEffects}
        aria-label="Reduce effects"
        title={reduceEffects ? 'Reduced Motion Active (Click to enable motion)' : 'Ambient Motion Active (Click to reduce motion)'}
        className={`relative inline-flex items-center justify-center rounded-full border transition-all duration-200 cursor-pointer active:scale-95 shadow-xs ${
          compact ? 'h-7 w-7' : 'h-8 w-8'
        } ${
          reduceEffects
            ? 'border-brand bg-brand text-brand-fg shadow-sm'
            : 'border-border/80 bg-surface text-fg-muted hover:text-fg hover:bg-surface-2'
        }`}
      >
        <IconZap size={compact ? 12 : 14} className={reduceEffects ? 'text-brand-fg' : 'text-fg-muted'} />
      </button>
    </div>
  );
}
