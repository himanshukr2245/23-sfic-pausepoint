'use client';
// components/ThemeToggle.tsx — light → dark → system, saved on this device. The no-flash script in layout.tsx applies it before paint.
import { useEffect, useSyncExternalStore } from 'react';
import { nextChoice, type ThemeChoice } from '@/lib/theme';
import { applyTheme, getThemeChoice, serverSnapshot, setThemeChoice, subscribePreferences } from '@/lib/preferences';

const LABEL: Record<ThemeChoice, string> = { light: 'Light', dark: 'Dark', system: 'System' };

export function ThemeToggle() {
  const choice = useSyncExternalStore(subscribePreferences, getThemeChoice, serverSnapshot);   // null on the server

  useEffect(() => {                                                // "system" follows the OS live
    if (choice !== 'system') return;
    const media = matchMedia('(prefers-color-scheme: dark)');
    const follow = () => applyTheme('system');
    media.addEventListener('change', follow);
    return () => media.removeEventListener('change', follow);
  }, [choice]);

  return (
    <button type="button" data-testid="theme-toggle" onClick={() => setThemeChoice(nextChoice(choice ?? getThemeChoice()))}
      aria-label={`Theme: ${choice ? LABEL[choice] : 'System'}. Change theme`}
      className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-surface px-3 text-sm font-medium text-fg hover:bg-surface-2">
      {choice ? LABEL[choice] : 'Theme'}
    </button>
  );
}
