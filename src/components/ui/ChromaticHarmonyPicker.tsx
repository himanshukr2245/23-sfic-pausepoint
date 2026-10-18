// tokens-ok-file: the colours ARE the data this picker shows to people
'use client';

// components/ui/ChromaticHarmonyPicker.tsx — Dual-Mode Chromatic Harmony Switcher (HK Universal Library v3).
// Allows live <1ms switching of --color-brand CSS tokens with procedural Web Audio haptics and localStorage persistence.
import { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import { playHapticTick, playSuccessChime, unlockAudio } from '@/lib/audio/synthesizer';

export interface ChromaticPreset {
  id: string;
  name: string;
  lightOklch: string;
  darkOklch: string;
  hexPreview: string;
  dotClass: string;
}

export const CHROMATIC_PRESETS: ChromaticPreset[] = [
  {
    id: 'indigo',
    name: 'Hyper Indigo',
    lightOklch: 'oklch(0.55 0.22 265)',
    darkOklch: 'oklch(0.72 0.18 265)',
    hexPreview: '#6366f1',
    dotClass: 'bg-[#6366f1]',
  },
  {
    id: 'cyan',
    name: 'Cyan Neon',
    lightOklch: 'oklch(0.62 0.18 210)',
    darkOklch: 'oklch(0.75 0.15 210)',
    hexPreview: '#06b6d4',
    dotClass: 'bg-[#06b6d4]',
  },
  {
    id: 'violet',
    name: 'Electric Violet',
    lightOklch: 'oklch(0.58 0.22 290)',
    darkOklch: 'oklch(0.74 0.19 290)',
    hexPreview: '#a855f7',
    dotClass: 'bg-[#a855f7]',
  },
  {
    id: 'emerald',
    name: 'Emerald Laser',
    lightOklch: 'oklch(0.58 0.18 150)',
    darkOklch: 'oklch(0.75 0.16 150)',
    hexPreview: '#10b981',
    dotClass: 'bg-[#10b981]',
  },
  {
    id: 'amber',
    name: 'Solar Amber',
    lightOklch: 'oklch(0.72 0.18 75)',
    darkOklch: 'oklch(0.82 0.16 75)',
    hexPreview: '#f59e0b',
    dotClass: 'bg-[#f59e0b]',
  },
];

function subscribeToChromatic(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('hk-chromatic-change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('hk-chromatic-change', callback);
  };
}

function getChromaticSnapshot(): string {
  if (typeof window === 'undefined') return 'indigo';
  try {
    const saved = localStorage.getItem('hk-chromatic-theme');
    if (saved && CHROMATIC_PRESETS.some((p) => p.id === saved)) {
      return saved;
    }
  } catch {
    // ignore
  }
  return 'indigo';
}

function getChromaticServerSnapshot(): string {
  return 'indigo';
}

function IconPalette({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}

export function ChromaticHarmonyPicker() {
  const activeColorId = useSyncExternalStore(subscribeToChromatic, getChromaticSnapshot, getChromaticServerSnapshot);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync theme changes with active chromatic accent
  useEffect(() => {
    const found = CHROMATIC_PRESETS.find((p) => p.id === activeColorId) || CHROMATIC_PRESETS[0];
    const applyColor = () => {
      const isDark = document.documentElement.dataset.theme === 'dark';
      document.documentElement.style.setProperty('--color-brand', isDark ? found.darkOklch : found.lightOklch);
    };

    applyColor();

    const observer = new MutationObserver(applyColor);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, [activeColorId]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  function applyPreset(preset: ChromaticPreset) {
    unlockAudio();
    playSuccessChime();

    try {
      localStorage.setItem('hk-chromatic-theme', preset.id);
      window.dispatchEvent(new Event('hk-chromatic-change'));
    } catch {
      // ignore
    }

    const isDark = document.documentElement.dataset.theme === 'dark';
    const targetOklch = isDark ? preset.darkOklch : preset.lightOklch;
    document.documentElement.style.setProperty('--color-brand', targetOklch);

    setIsOpen(false);
  }

  const activePreset = CHROMATIC_PRESETS.find((p) => p.id === activeColorId) || CHROMATIC_PRESETS[0];

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      {/* Pill Trigger */}
      <button
        type="button"
        onClick={() => {
          unlockAudio();
          playHapticTick();
          setIsOpen((prev) => !prev);
        }}
        className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface/90 px-3 py-1 text-xs font-medium text-fg shadow-xs backdrop-blur-md transition-all hover:bg-surface-2 hover:border-brand/40 active:scale-95 cursor-pointer select-none"
        title="Switch Dual-Mode Chromatic Harmony theme"
        aria-expanded={isOpen}
      >
        <IconPalette className="h-3.5 w-3.5 text-brand transition-transform group-hover:rotate-12" />
        <span className="hidden sm:inline text-fg-muted text-[11px] font-mono">Accent:</span>
        <span className="font-semibold text-fg text-xs">{activePreset.name}</span>
        <span className={`h-2.5 w-2.5 rounded-full ${activePreset.dotClass} shadow-xs ring-1 ring-white/40`} />
      </button>

      {/* Flyout Swatch Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 flex items-center gap-1.5 rounded-2xl border border-border bg-surface/95 p-1.5 shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {CHROMATIC_PRESETS.map((preset) => {
            const isSelected = preset.id === activeColorId;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`relative flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-surface-2 text-fg shadow-xs ring-1 ring-border'
                    : 'text-fg-muted hover:text-fg hover:bg-surface-2/60'
                }`}
                title={`Apply ${preset.name}`}
              >
                <span className={`h-3 w-3 rounded-full ${preset.dotClass} shadow-xs ring-1 ring-white/50 ${isSelected ? 'scale-110' : ''}`} />
                <span className="text-[11px] whitespace-nowrap">{preset.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
