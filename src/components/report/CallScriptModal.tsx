'use client';

import React, { useState } from 'react';
import { Phone, Volume2, Copy, Check, X, ShieldAlert, UserCheck } from 'lucide-react';
import { type Txn, callScript, type Category } from '@/lib/engine/golden.ts';
import { useTranslation } from '@/lib/i18n';

interface CallScriptModalProps {
  txns: Txn[];
  category: Category;
  isOpen: boolean;
  onClose: () => void;
}

export const CallScriptModal: React.FC<CallScriptModalProps> = ({
  txns,
  category,
  isOpen,
  onClose,
}) => {
  const { t, lang } = useTranslation();
  const [onBehalf, setOnBehalf] = useState(false);
  const [victimName, setVictimName] = useState('');
  const [relation, setRelation] = useState('grandchild');
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!isOpen) return null;

  const scriptLines = callScript(txns, category, {
    onBehalfOf: onBehalf
      ? { name: victimName || 'my family member', relation }
      : undefined,
  });
  const fullScript = scriptLines.join('\n\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(fullScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(fullScript);
    utterance.rate = 0.95;
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-shade/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-border p-6 shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-danger/10 text-danger flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-fg">{t.callScriptModalTitle}</h3>
              <p className="text-xs text-fg-muted">{t.callScriptModalSub}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-fg-muted hover:text-fg hover:bg-surface-2 transition-colors"
            aria-label="Close script"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Helper Mode Toggle */}
        <div className="py-3 border-b border-border/60">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-fg">
            <input
              type="checkbox"
              checked={onBehalf}
              onChange={(e) => setOnBehalf(e.target.checked)}
              className="rounded border-border text-brand focus:ring-focus"
            />
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-brand" />
              {t.filingOnBehalfLabel}
            </span>
          </label>

          {onBehalf && (
            <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2">
              <input
                type="text"
                placeholder={t.victimFullNameLabel}
                value={victimName}
                onChange={(e) => setVictimName(e.target.value)}
                className="text-xs rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-fg outline-none"
              />
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="text-xs rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-fg outline-none"
              >
                <option value="grandchild">{t.grandchildRel}</option>
                <option value="child">{t.sonDaughterRel}</option>
                <option value="spouse">{t.spouseRel}</option>
              </select>
            </div>
          )}
        </div>

        {/* Script Content */}
        <div className="my-4 flex-1 overflow-y-auto rounded-xl bg-surface-2/60 border border-border/80 p-4">
          <pre className="text-sm text-fg font-sans leading-relaxed whitespace-pre-wrap select-text">
            {fullScript}
          </pre>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSpeak}
              className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-xs font-semibold border border-border transition-colors ${
                isSpeaking ? 'bg-brand/15 text-brand border-brand/40' : 'bg-surface hover:bg-surface-2 text-fg'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isSpeaking ? t.stopAudioPrompt : t.audioPlaybackPrompt}</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-xs font-semibold border border-border bg-surface hover:bg-surface-2 text-fg transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? t.copiedFeedback : t.speakScriptPrompt}</span>
            </button>
          </div>

          <a
            href="tel:1930"
            className="w-full h-14 rounded-xl bg-danger text-brand-fg font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-danger/25 hover:bg-danger/90 active:scale-[0.98] transition-all"
          >
            <Phone className="w-5 h-5 fill-current" />
            <span>{t.dial1930Button}</span>
          </a>

          <p className="text-[11px] text-center text-fg-muted flex items-center justify-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-danger shrink-0" />
            <span>{t.goldenHourDesc}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
