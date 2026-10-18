// lib/theme.ts — theme + "reduce effects" preferences, applied before first paint so the page never flashes the wrong theme.
export type ThemeChoice = 'light' | 'dark' | 'system';
export const THEME_KEY = 'hk:theme';
export const EFFECTS_KEY = 'hk:reduce-effects';

/** Inline <head> script (runs before React): reads saved choices, sets data-theme and .reduce-effects on <html>. Never throws. */
export const THEME_INIT_SCRIPT = `(function(){try{var d=document.documentElement,t=localStorage.getItem('${THEME_KEY}');` +
  `var dark=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);d.dataset.theme=dark?'dark':'light';` +
  `if(localStorage.getItem('${EFFECTS_KEY}')==='1')d.classList.add('reduce-effects');}catch(e){}})();`;

export function resolveTheme(choice: ThemeChoice, prefersDark: boolean): 'light' | 'dark' {
  return choice === 'system' ? (prefersDark ? 'dark' : 'light') : choice;
}

export function nextChoice(choice: ThemeChoice): ThemeChoice {
  return choice === 'light' ? 'dark' : choice === 'dark' ? 'system' : 'light';
}
