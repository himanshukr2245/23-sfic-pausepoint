// components/ui/classes.ts — the shared class names for controls, so every screen's buttons and fields look and behave alike.
// All colours come from the @theme tokens; every control is at least 48 px tall (min-h-touch, DEV-3).
export const btn = 'inline-flex min-h-touch items-center justify-center rounded-xl px-4 font-semibold disabled:opacity-60';
export const primary = `${btn} bg-brand text-brand-fg hover:brightness-90`;
export const quiet = `${btn} border border-border text-fg hover:bg-surface-2`;
export const danger = `${btn} bg-danger text-brand-fg hover:brightness-90`;
export const linkButton = 'inline-flex min-h-touch items-center font-medium text-brand underline underline-offset-4';
export const field = 'w-full rounded-xl border border-border bg-surface px-4 py-3 text-fg';
export const card = 'flex flex-col gap-3 rounded-card border border-border bg-surface p-5';
