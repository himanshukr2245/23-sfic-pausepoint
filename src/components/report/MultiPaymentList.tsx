'use client';

import React from 'react';
import { Layers, Trash2, Calendar, User, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { type Txn } from '@/lib/engine/golden';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { AwsSpotlightCard } from '@/components/ui/AwsSpotlightCard';
import { unlockAudio, playHapticTick, playPop } from '@/lib/audio/synthesizer';

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
    <AwsSpotlightCard
      colorAccent="cyan"
      sound={true}
      className="p-6 flex flex-col gap-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand" />
            <h3 className="text-base font-extrabold text-fg tracking-tight">{t.multiPaymentLedgerTitle}</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-danger/10 text-danger border border-danger/30">
              ₹{totalAmount.toLocaleString('en-IN')} {t.totalStolenLost}
            </span>
          </div>
          <p className="text-xs text-fg-muted mt-0.5">
            {t.multiPaymentSub}
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          sound="laser"
          onClick={onAddNew}
          className="flex items-center gap-1.5 self-start sm:self-auto"
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-brand" />
          <span>{t.addAnotherTransfer}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {txns.map((txnItem, idx) => {
          const isSelected = activeIndex === idx;
          const hasWarning = txnItem.warnings.length > 0;

          return (
            <div
              key={idx}
              onClick={() => {
                unlockAudio();
                playHapticTick();
                onSelect(idx);
              }}
              className={`cursor-pointer rounded-xl border p-3.5 flex flex-col gap-2 transition-all ${
                isSelected
                  ? 'border-brand bg-brand/10 ring-1 ring-brand/40 shadow-xs'
                  : 'border-border/80 bg-surface-2/40 hover:bg-surface-2 hover:border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-fg-muted uppercase tracking-wider">
                  {t.transferLabel} #{idx + 1}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-fg font-mono">
                    ₹{(txnItem.amountInr ?? 0).toLocaleString('en-IN')}
                  </span>
                  {txns.length > 1 && (
                    <Button
                      type="button"
                      variant="quiet"
                      size="sm"
                      sound="thud"
                      onClick={(e) => {
                        e.stopPropagation();
                        unlockAudio();
                        playPop();
                        onRemove(idx);
                      }}
                      title="Remove this transfer"
                      className="p-1 hover:text-danger"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-fg-muted">
                <span className="flex items-center gap-1.5 truncate max-w-[170px]">
                  <User className="w-3.5 h-3.5 text-fg-muted shrink-0" />
                  <span className="truncate">{txnItem.payeeName || txnItem.payeeVpa || t.whoYouPaid}</span>
                </span>
                <span className="font-mono text-[11px] truncate max-w-[120px]">
                  {txnItem.utr ? `UTR: ${txnItem.utr}` : '—'}
                </span>
              </div>

              {txnItem.when && (
                <div className="text-[11px] text-fg-muted flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-fg-muted/60 shrink-0" />
                  <span>{txnItem.when}</span>
                </div>
              )}

              {hasWarning && (
                <div className="text-[11px] text-warning font-semibold flex items-center gap-1.5 pt-0.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
                  <span>{t.checkThisTag}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AwsSpotlightCard>
  );
};
