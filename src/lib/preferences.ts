// lib/preferences.ts — theme + "reduce effects" as a tiny external store, read with useSyncExternalStore (no setState-in-effect,
// no hydration mismatch: the server snapshot is null, the client snapshot is the saved choice). Changes sync across tabs via "storage".
import { EFFECTS_KEY, THEME_KEY, resolveTheme, type ThemeChoice } from './theme';

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function subscribePreferences(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => { listeners.delete(listener); window.removeEventListener('storage', listener); };
}

export function getThemeChoice(): ThemeChoice {
  try { const v = localStorage.getItem(THEME_KEY); return v === 'light' || v === 'dark' ? v : 'system'; } catch { return 'system'; }
}

export function applyTheme(choice: ThemeChoice) {
  document.documentElement.dataset.theme = resolveTheme(choice, matchMedia('(prefers-color-scheme: dark)').matches);
}

export function setThemeChoice(choice: ThemeChoice) {
  try { if (choice === 'system') localStorage.removeItem(THEME_KEY); else localStorage.setItem(THEME_KEY, choice); } catch { /* private mode */ }
  applyTheme(choice);
  emit();
}

export function getReduceEffects(): boolean {
  return document.documentElement.classList.contains('reduce-effects');
}

export function setReduceEffects(on: boolean) {
  document.documentElement.classList.toggle('reduce-effects', on);
  try { if (on) localStorage.setItem(EFFECTS_KEY, '1'); else localStorage.removeItem(EFFECTS_KEY); } catch { /* private mode */ }
  emit();
}

export const serverSnapshot = () => null;
