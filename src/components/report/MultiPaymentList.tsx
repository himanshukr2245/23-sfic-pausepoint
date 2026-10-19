'use client';

import React from 'react';
import { Layers, Trash2, Calendar, User, ArrowUpRight } from 'lucide-react';
import { type Txn } from '@/lib/engine/golden.ts';
import { useTranslation } from '@/lib/i18n';

interface MultiPaymentListProps {
  txns: Txn[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onRemove: (index: number) => void;
  onAddNew: () => void;
}

export const MultiPaymentList: React.FC<MultiPaymentListProps> = ({
  txns,
  activeIndex,
  onSelect,
  onRemove,
  onAddNew,
}) => {
  const { t } = useTranslation();
  const totalAmount = txns.reduce((sum, tItem) => sum + (tItem.amountInr ?? 0), 0);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand" />
            <h3 className="text-base font-bold text-fg">{t.multiPaymentLedgerTitle}</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-danger/10 text-danger border border-danger/20">
              ₹{totalAmount.toLocaleString('en-IN')} {t.totalStolenLost}
            </span>
          </div>
          <p className="text-xs text-fg-muted mt-0.5">
            {t.multiPaymentSub}
          </p>
        </div>

        <button
          onClick={onAddNew}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-surface-2 hover:bg-surface-3 border border-border text-xs font-semibold text-fg transition-colors"
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-brand" />
          <span>{t.addAnotherTransfer}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {txns.map((txnItem, idx) => {
          const isSelected = activeIndex === idx;
          const hasWarning = txnItem.warnings.length > 0;

          return (
            <div
              key={idx}
              onClick={() => onSelect(idx)}
              className={`cursor-pointer rounded-xl border p-3 flex flex-col gap-1.5 transition-all ${
                isSelected
                  ? 'border-brand bg-brand/5 ring-1 ring-brand/40 shadow-xs'
                  : 'border-border bg-surface-2/40 hover:bg-surface-2 hover:border-border/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-fg-muted uppercase tracking-wider">
                  {t.transferLabel} #{idx + 1}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-fg font-mono">
                    ₹{(txnItem.amountInr ?? 0).toLocaleString('en-IN')}
                  </span>
                  {txns.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(idx);
                      }}
                      className="p-1 rounded text-fg-muted hover:text-danger hover:bg-surface transition-colors"
                      title="Remove this payment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-fg-muted">
                <span className="flex items-center gap-1 truncate max-w-[170px]">
                  <User className="w-3 h-3 text-fg-muted shrink-0" />
                  <span className="truncate">{txnItem.payeeName || txnItem.payeeVpa || t.whoYouPaid}</span>
                </span>
                <span className="font-mono text-[11px] truncate max-w-[120px]">
                  {txnItem.utr ? `UTR: ${txnItem.utr}` : '—'}
                </span>
              </div>

              {txnItem.when && (
                <div className="text-[11px] text-fg-muted/80 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-fg-muted/60 shrink-0" />
                  <span>{txnItem.when}</span>
                </div>
              )}

              {hasWarning && (
                <div className="text-[10px] text-warning font-semibold flex items-center gap-1 pt-0.5">
                  <span>⚠️ {t.checkThisTag}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
