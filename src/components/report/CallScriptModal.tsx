'use client';

import React, { useState } from 'react';
import { Phone, Volume2, Copy, Check, X, ShieldAlert, UserCheck } from 'lucide-react';
import { type Txn, callScript, type Category } from '@/lib/engine/golden';
import { useTranslation } from '@/lib/i18n';
import { Button, ButtonLink } from '@/components/ui/Button';
import { unlockAudio, playPop, playHapticTick } from '@/lib/audio/synthesizer';

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
    unlockAudio();
    playPop();
    navigator.clipboard.writeText(fullScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    unlockAudio();
    playHapticTick();
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
      <div className="relative w-full max-w-lg rounded-2xl bg-surface/98 border border-border/80 p-6 shadow-2xl backdrop-blur-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger/10 text-danger border border-danger/30 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-fg tracking-tight">{t.callScriptModalTitle}</h3>
              <p className="text-xs text-fg-muted">{t.callScriptModalSub}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="quiet"
            size="sm"
            sound="pop"
            onClick={onClose}
            aria-label="Close script"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Helper Mode Toggle */}
        <div className="py-3 border-b border-border/60">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-fg">
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
                className="text-xs rounded-xl border border-border bg-surface-2 px-3 py-2 text-fg outline-none focus:border-brand/60"
              />
              <select
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="text-xs rounded-xl border border-border bg-surface-2 px-3 py-2 text-fg outline-none focus:border-brand/60"
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
          <pre className="text-xs sm:text-sm text-fg font-sans leading-relaxed whitespace-pre-wrap select-text">
            {fullScript}
          </pre>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={isSpeaking ? 'primary' : 'secondary'}
              size="md"
              sound="tick"
              onClick={handleSpeak}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isSpeaking ? t.stopAudioPrompt : t.audioPlaybackPrompt}</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="md"
              sound="tick"
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? t.copiedFeedback : t.speakScriptPrompt}</span>
            </Button>
          </div>

          <ButtonLink
            href="tel:1930"
            variant="cyber-danger"
            size="lg"
            sound="laser"
            className="w-full flex items-center justify-center gap-2"
          >
            <Phone className="w-5 h-5 fill-current" />
            <span>{t.dial1930Button}</span>
          </ButtonLink>

          <p className="text-[11px] text-center text-fg-muted flex items-center justify-center gap-1 font-medium">
            <ShieldAlert className="w-3.5 h-3.5 text-danger shrink-0" />
            <span>{t.goldenHourDesc}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
