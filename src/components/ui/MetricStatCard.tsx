// components/ui/MetricStatCard.tsx — High-density KPI stat plate with monospace numbers (HK Universal Library v3).
// Monospace tabular-nums numbers prevent layout jitter, with live beacon dot indicators.
import type { ReactNode } from 'react';

export interface MetricStatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  badge?: string;
  icon?: ReactNode;
  description?: string;
  className?: string;
}

export function MetricStatCard({
  label,
  value,
  change,
  trend = 'neutral',
  badge,
  icon,
  description,
  className = '',
}: MetricStatCardProps) {
  const trendColor =
    trend === 'up'
      ? 'text-success'
      : trend === 'down'
        ? 'text-danger'
        : 'text-fg-muted';

  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-surface/98 p-5 shadow-xs transition-all duration-200 hover:border-border hover:shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          {badge && (
            <span className="rounded-full border border-border/80 bg-surface-2 px-2 py-0.5 text-[10px] font-mono font-medium text-fg-muted">
              {badge}
            </span>
          )}
          {icon && <span className="text-fg-muted text-sm">{icon}</span>}
        </div>
      </div>

      <div className="my-3 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-fg font-mono tabular-nums">
          {value}
        </span>
        {change && (
          <span className={`text-xs font-semibold font-mono ${trendColor}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {change}
          </span>
        )}
      </div>

      {description && (
        <p className="text-xs text-fg-muted leading-relaxed line-clamp-2">
          {description}
        </p>
      )}
    </div>
  );
}
