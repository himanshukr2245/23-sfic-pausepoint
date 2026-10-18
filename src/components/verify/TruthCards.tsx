'use client';

import React from 'react';
import { Lightbulb, AlertTriangle, ShieldCheck, KeyRound, Volume2 } from 'lucide-react';

interface TruthCardItem {
  id: number;
  label: string;
  badgeColor: string;
  badgeBorder: string;
  badgeText: string;
  icon: React.ReactNode;
  statement: string;
  clarification: string;
}

const TRUTHS: TruthCardItem[] = [
  {
    id: 1,
    label: 'Truth #1',
    badgeColor: 'bg-brand/10',
    badgeBorder: 'border-brand/20',
    badgeText: 'text-brand',
    icon: <Lightbulb className="w-4 h-4 text-brand" />,
    statement:
      'Real jobs and legitimate investment platforms NEVER charge you money to withdraw your own earnings.',
    clarification:
      'Any demand for an "unlock tax", "VIP fee", or "handling deposit" is the same scam asking for more.',
  },
  {
    id: 2,
    label: 'Truth #2',
    badgeColor: 'bg-danger/10',
    badgeBorder: 'border-danger/20',
    badgeText: 'text-danger',
    icon: <AlertTriangle className="w-4 h-4 text-danger" />,
    statement:
      'No Indian Police, CBI, ED, or Customs officer arrests citizens over a Skype/WhatsApp video call.',
    clarification:
      'Government agencies never demand deposits into "RBI holding accounts" to clear warrants or freeze orders.',
  },
  {
    id: 3,
    label: 'Truth #3',
    badgeColor: 'bg-success/10',
    badgeBorder: 'border-success/20',
    badgeText: 'text-success',
    icon: <KeyRound className="w-4 h-4 text-success" />,
    statement:
      'You NEVER need to enter your UPI PIN or scan a QR code to RECEIVE money into your account.',
    clarification:
      'Your UPI PIN is strictly for AUTHORIZING outgoing payments from your bank account.',
  },
];

interface TruthCardsProps {
  showAudioButton?: boolean;
}

export const TruthCards: React.FC<TruthCardsProps> = ({ showAudioButton = true }) => {
  const [speakingId, setSpeakingId] = React.useState<number | null>(null);

  const handleSpeakTruth = (truth: TruthCardItem) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingId === truth.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const text = `${truth.label}. ${truth.statement}. Remember: ${truth.clarification}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.lang = 'en-IN';
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(truth.id);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <h3 className="text-base font-bold text-fg flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-warning" />
          <span>Three Permanent Truths That Break Cyber Frauds</span>
        </h3>
        <span className="text-[11px] font-mono text-fg-muted uppercase tracking-wider">
          Universal Golden Rules
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TRUTHS.map((t) => (
          <div
            key={t.id}
            className="rounded-xl border border-border/80 bg-surface-2/60 p-4 flex flex-col gap-2.5 transition-all hover:border-border"
          >
            <div className="flex items-center justify-between">
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${t.badgeColor} ${t.badgeBorder} ${t.badgeText}`}
              >
                {t.label}
              </span>
              {showAudioButton && (
                <button
                  type="button"
                  onClick={() => handleSpeakTruth(t)}
                  className="p-1 rounded-lg text-fg-muted hover:text-fg hover:bg-surface transition-colors"
                  title="Read aloud"
                  aria-label={`Read ${t.label} aloud`}
                >
                  <Volume2
                    className={`w-3.5 h-3.5 ${speakingId === t.id ? 'text-brand animate-pulse' : ''}`}
                  />
                </button>
              )}
            </div>

            <p className="text-xs font-semibold text-fg leading-relaxed">{t.statement}</p>
            <p className="text-[11px] text-fg-muted mt-auto pt-2 border-t border-border/60">
              {t.clarification}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
