'use client';

import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface FieldCardProps {
  label: string;
  value: string | number | undefined;
  placeholder?: string;
  onChange: (val: string) => void;
  warning?: string;
  required?: boolean;
  type?: 'text' | 'number';
  badge?: string;
  helperText?: string;
}

export const FieldCard: React.FC<FieldCardProps> = ({
  label,
  value,
  placeholder,
  onChange,
  warning,
  required,
  type = 'text',
  badge,
  helperText,
}) => {
  const { t } = useTranslation();
  const isFilled = value !== undefined && String(value).trim().length > 0;
  const hasWarning = Boolean(warning);

  return (
    <div
      className={`relative rounded-xl border p-4 transition-all duration-200 ${
        hasWarning
          ? 'border-warning/60 bg-warning/5 shadow-xs'
          : isFilled
          ? 'border-border bg-surface shadow-xs'
          : 'border-border/60 bg-surface-2/40'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <label className="text-xs font-semibold tracking-wide uppercase text-fg-muted flex items-center gap-1.5">
          <span>{label}</span>
          {required && <span className="text-danger font-bold">*</span>}
          {badge && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-surface-3 text-fg-muted">
              {badge}
            </span>
          )}
        </label>
        {hasWarning ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-warning bg-warning/10 px-2 py-0.5 rounded-full">
            <AlertCircle className="w-3.5 h-3.5" />
            {t.checkThisTag}
          </span>
        ) : isFilled ? (
          <CheckCircle2 className="w-4 h-4 text-success/80" />
        ) : null}
      </div>

      <input
        type={type}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-transparent text-base md:text-lg font-medium text-fg outline-none transition-colors placeholder:text-fg-muted/40 ${
          hasWarning ? 'font-mono' : ''
        }`}
      />

      {warning && (
        <p className="mt-2 text-xs font-medium text-warning flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
          <span>{warning}</span>
        </p>
      )}

      {helperText && !warning && (
        <p className="mt-1.5 text-[11px] text-fg-muted font-medium">{helperText}</p>
      )}
    </div>
  );
};
