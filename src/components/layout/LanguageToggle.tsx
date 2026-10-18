'use client';

// components/layout/LanguageToggle.tsx — Bilingual English / Hindi Switcher (HK Universal Library v3).
// Pure SVG icon, no emojis. 1-tap seamless toggle with haptic feedback.
import React from 'react';
import { Languages } from 'lucide-react';
import { playHapticTick, unlockAudio } from '@/lib/audio/synthesizer';
import { useTranslation } from '@/lib/i18n';

export const LanguageToggle: React.FC = () => {
  const { lang, toggleLanguage } = useTranslation();

  const handleToggle = () => {
    unlockAudio();
    playHapticTick();
    toggleLanguage();
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={`Switch language. Current language: ${lang === 'en' ? 'English' : 'Hindi'}`}
      title={lang === 'en' ? 'Switch to हिन्दी' : 'Switch to English'}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-surface border border-border/80 text-fg hover:bg-surface-2 transition-all cursor-pointer shadow-xs"
    >
      <Languages className="w-3.5 h-3.5 text-brand" />
      <span className="font-mono text-[11px] font-bold">
        {lang === 'en' ? 'हिन्दी' : 'EN'}
      </span>
    </button>
  );
};
