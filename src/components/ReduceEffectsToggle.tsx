'use client';
// components/ReduceEffectsToggle.tsx — the escape hatch for weak devices and motion-sensitive people (PRF-5): switches animations off.
import { useSyncExternalStore } from 'react';
import { getReduceEffects, serverSnapshot, setReduceEffects, subscribePreferences } from '@/lib/preferences';

export function ReduceEffectsToggle() {
  const on = useSyncExternalStore(subscribePreferences, getReduceEffects, serverSnapshot) ?? false;
  return (
    <button type="button" onClick={() => setReduceEffects(!on)} aria-pressed={on}
      className="inline-flex min-h-touch items-center justify-center rounded-xl border border-border bg-surface px-3 text-sm font-medium text-fg hover:bg-surface-2">
      {on ? 'Effects off' : 'Reduce effects'}
    </button>
  );
}
