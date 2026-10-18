'use client';

// components/layout/SeniorModeToggle.tsx — Senior Citizen High-Contrast & Large-Touch Mode (HK Universal Library v3).
// Pure SVG icons, no emojis. 22px typography & 64px touch target floor when activated.
import React, { useState, useEffect } from 'react';
import { ZoomIn, Check } from 'lucide-react';
import { playHapticTick, unlockAudio } from '@/lib/audio/synthesizer';
import { useTranslation } from '@/lib/i18n';

export const SeniorModeToggle: React.FC = () => {
  const { t } = useTranslation();
  const [isSenior, setIsSenior] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('pausepoint_senior_mode') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isSenior) {
      document.documentElement.classList.add('senior-mode');
    } else {
      document.documentElement.classList.remove('senior-mode');
    }
  }, [isSenior]);

  const handleToggle = () => {
    unlockAudio();
    playHapticTick();
    const nextState = !isSenior;
    setIsSenior(nextState);

    try {
      localStorage.setItem('pausepoint_senior_mode', String(nextState));
      if (nextState) {
        document.documentElement.classList.add('senior-mode');
      } else {
        document.documentElement.classList.remove('senior-mode');
      }
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={isSenior}
      aria-label={t.seniorModeTooltip}
      title={t.seniorModeTooltip}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer border shadow-xs ${
        isSenior
          ? 'bg-warning/20 text-fg border-warning/50 ring-2 ring-warning/30 font-bold'
          : 'bg-surface border-border/80 text-fg-muted hover:text-fg hover:bg-surface-2'
      }`}
    >
      <ZoomIn className={`w-3.5 h-3.5 ${isSenior ? 'text-warning' : 'text-fg-muted'}`} />
      <span className="hidden sm:inline">
        {isSenior ? t.seniorModeOn : t.seniorModeOff}
      </span>
      {isSenior && <Check className="w-3 h-3 text-warning hidden sm:inline" />}
    </button>
  );
};
