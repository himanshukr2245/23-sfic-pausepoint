// components/ui/Badge.tsx — a short status label. The WORD carries the meaning; colour only supports it (WCAG 1.4.1: never colour alone).
// `live` adds a small pulsing dot for things that are happening now (switched off by "Reduce effects" like every animation).
import type { ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const TONES: Record<BadgeTone, { box: string; dot: string }> = {
  neutral: { box: 'border-border bg-surface-2 text-fg', dot: 'bg-fg-muted' },
  success: { box: 'border-success/40 bg-success/10 text-fg', dot: 'bg-success' },
  warning: { box: 'border-warning/40 bg-warning/10 text-fg', dot: 'bg-warning' },
  danger: { box: 'border-danger/40 bg-danger/10 text-fg', dot: 'bg-danger' },
  info: { box: 'border-cyan/40 bg-cyan/10 text-cyan-fg', dot: 'bg-cyan' },
};

export function Badge({ tone = 'neutral', live = false, children }: { tone?: BadgeTone; live?: boolean; children: ReactNode }) {
  const t = TONES[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${t.box}`}>
      {live && (
        <span aria-hidden="true" className="relative flex h-2 w-2">
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${t.dot}`} />
          <span className={`relative inline-flex h-2 w-2 rounded-full ${t.dot}`} />
        </span>
      )}
      {children}
    </span>
  );
}
