'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertOctagon,
  Volume2,
  Share2,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { payAgainBrake } from '@/lib/engine/golden.ts';
import { TruthCards } from './TruthCards.tsx';

const SAMPLE_TASK_UNLOCK = `Dear user, your total earnings of ₹45,000 are ready to withdraw. To unlock your withdrawal, you must pay a 15% platform clearance tax of ₹6,750 within 30 minutes.`;
const SAMPLE_CRYPTO_UPGRADE = `Withdrawal frozen by liquidity pool. Please deposit 0.05 ETH (approx ₹12,000) security deposit to upgrade your account to VIP level and release your full balance.`;
const SAMPLE_CBI_BAIL = `This is Crime Branch officer. To verify your assets and cancel your arrest warrant, deposit ₹50,000 into the RBI holding account immediately. It will be returned after verification.`;

interface TrustedContact {
  name: string;
  phone: string;
}

export const PayAgainBrake: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [copiedAlert, setCopiedAlert] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [contacts, setContacts] = useState<TrustedContact[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('pausepoint_contacts');
      return saved ? (JSON.parse(saved) as TrustedContact[]) : [];
    } catch {
      return [];
    }
  });
  const [codeWord, setCodeWord] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    try {
      return localStorage.getItem('pausepoint_codeword') || '';
    } catch {
      return '';
    }
  });
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  const handleSaveCodeWord = (word: string) => {
    setCodeWord(word);
    try {
      localStorage.setItem('pausepoint_codeword', word);
    } catch {
      // Ignore storage errors
    }
  };

  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    const updated = [...contacts, { name: newContactName.trim(), phone: newContactPhone.trim() }];
    setContacts(updated);
    setNewContactName('');
    setNewContactPhone('');
    try {
      localStorage.setItem('pausepoint_contacts', JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  };

  const handleDeleteContact = (index: number) => {
    const updated = contacts.filter((_, i) => i !== index);
    setContacts(updated);
    try {
      localStorage.setItem('pausepoint_contacts', JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  };

  const brakeResult = inputText.trim() ? payAgainBrake(inputText) : null;
  const isStop = brakeResult?.stop ?? false;

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = isStop
      ? `STOP! Do not pay again. ${brakeResult?.reasons.join('. ')}. Remember: Real jobs and investments never charge you to withdraw money.`
      : 'No repeat payment traps detected in this text. However, always verify financial transactions independently.';

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    utterance.lang = 'en-IN';
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleShareAlert = () => {
    const alertMsg = `Emergency Alert: I was asked to pay a fee to withdraw money or clear an issue. PausePoint flagged this as a scam trap. Please call me now.`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: 'Emergency Alert', text: alertMsg }).catch(() => {});
    } else {
      navigator.clipboard.writeText(alertMsg);
      setCopiedAlert(true);
      setTimeout(() => setCopiedAlert(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 py-6 px-4">
      {/* 1. Header Banner */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-warning/10 text-warning border border-warning/20">
              Cognitive Brake
            </span>
            <span className="text-xs text-fg-muted font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-success" />
              100% Client-Side Privacy
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-fg tracking-tight">
            Before You Pay Again: Repeat Deposit Brake
          </h1>
          <p className="text-sm text-fg-muted mt-1">
            Were you asked to pay a &ldquo;withdrawal fee&rdquo;, &ldquo;tax&rdquo;, &ldquo;upgrade&rdquo;, or &ldquo;court clearance&rdquo; to unlock money? Paste the message below before sending any money.
          </p>
        </div>
      </div>

      {/* 2. Message Input */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col gap-4">
        <label className="text-xs font-semibold text-fg-muted uppercase tracking-wide block">
          Paste the message asking you to send money
        </label>
        <textarea
          rows={4}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste Telegram, WhatsApp, SMS, or email demanding payment to unlock earnings or cancel warrants..."
          className="w-full text-sm rounded-xl border border-border bg-surface-2 p-3.5 text-fg outline-none focus:border-brand/60 focus:ring-1 focus:ring-focus font-sans"
        />

        {/* Quick Samples */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/60">
          <span className="text-[11px] font-semibold text-fg-muted">Quick Test Samples:</span>
          <button
            onClick={() => setInputText(SAMPLE_TASK_UNLOCK)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-2 hover:bg-surface-3 text-fg border border-border transition-colors"
          >
            Task Scam &ldquo;Unlock Fee&rdquo; (₹6,750)
          </button>
          <button
            onClick={() => setInputText(SAMPLE_CRYPTO_UPGRADE)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-2 hover:bg-surface-3 text-fg border border-border transition-colors"
          >
            Trading VIP Upgrade (₹12,000)
          </button>
          <button
            onClick={() => setInputText(SAMPLE_CBI_BAIL)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-2 hover:bg-surface-3 text-fg border border-border transition-colors"
          >
            Digital Arrest &ldquo;Asset Verification&rdquo; (₹50,000)
          </button>
        </div>
      </div>

      {/* 3. Analysis Verdict Result */}
      {brakeResult && (
        <div
          className={`rounded-2xl border p-6 shadow-sm flex flex-col gap-4 animate-in fade-in duration-200 ${
            isStop
              ? 'border-danger/40 bg-danger/5'
              : 'border-success/40 bg-success/5'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                isStop ? 'bg-danger text-brand-fg' : 'bg-success text-brand-fg'
              }`}
            >
              {isStop ? <AlertOctagon className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-fg">
                {isStop ? 'STOP! DO NOT SEND MONEY' : 'No Immediate Repeat Deposit Trap Detected'}
              </h2>
              <p className="text-xs md:text-sm text-fg-muted mt-1">
                {isStop
                  ? 'This message contains classic repeat-payment hooks used in task and investment fraud to extract more money from victims.'
                  : 'This message does not show withdrawal-fee or bail-demand triggers. Always verify independently.'}
              </p>
            </div>
          </div>

          {/* Reasons */}
          {isStop && brakeResult.reasons.length > 0 && (
            <div className="rounded-xl border border-danger/20 bg-surface/80 p-4">
              <h4 className="text-xs font-bold uppercase text-danger mb-2 tracking-wide">
                Why this was flagged:
              </h4>
              <ul className="flex flex-col gap-1.5 text-xs text-fg">
                {brakeResult.reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-danger font-bold">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col md:flex-row items-center gap-3 pt-2">
            <Link
              href="/report"
              className="w-full md:flex-1 h-12 rounded-xl bg-danger text-brand-fg font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-danger/20 hover:bg-danger/90 transition-colors"
            >
              <span>I&apos;ve Already Paid Money ➔ Report to 1930</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              onClick={handleShareAlert}
              className="w-full md:w-auto h-12 px-4 rounded-xl border border-border bg-surface hover:bg-surface-2 text-fg font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              {copiedAlert ? <Check className="w-4 h-4 text-success" /> : <Share2 className="w-4 h-4" />}
              <span>{copiedAlert ? 'Alert Copied' : 'Tell My Family'}</span>
            </button>

            <button
              onClick={handleSpeak}
              className="w-full md:w-auto h-12 px-4 rounded-xl border border-border bg-surface hover:bg-surface-2 text-fg font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isSpeaking ? 'Stop Audio' : 'Read Aloud'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Immutable Truth Cards (Always Visible) */}
      <TruthCards />

      {/* 5. Trusted Family Contacts & Secret Code-Word SOS */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
          <div>
            <h3 className="text-base font-bold text-fg flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand" />
              <span>Trusted Family Shield & Secret Code-Word</span>
            </h3>
            <p className="text-xs text-fg-muted mt-0.5">
              Scammers try to isolate you on the call. Set a secret family code-word to verify real calls from your relatives vs AI deepfakes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-fg-muted uppercase tracking-wide">
              Secret Family Safety Word
            </label>
            <input
              type="text"
              value={codeWord}
              onChange={(e) => handleSaveCodeWord(e.target.value)}
              placeholder="e.g. MangoTree2026"
              className="text-sm font-mono rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-fg outline-none focus:border-brand/60"
            />
            <p className="text-[11px] text-fg-muted">
              If someone calls claiming a family member is in jail/hospital, ask for this secret word before believing them.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-fg-muted uppercase tracking-wide">
              Add Trusted Contact
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Name (e.g. Dad)"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                className="text-xs rounded-xl border border-border bg-surface-2 px-3 py-2 text-fg outline-none flex-1"
              />
              <input
                type="tel"
                placeholder="Phone (e.g. 9876543210)"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                className="text-xs rounded-xl border border-border bg-surface-2 px-3 py-2 text-fg outline-none flex-1 font-mono"
              />
              <button
                onClick={handleAddContact}
                className="h-9 px-3 rounded-xl bg-brand text-brand-fg text-xs font-bold hover:bg-brand/90 transition-colors shrink-0"
              >
                Save
              </button>
            </div>

            {contacts.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-1">
                {contacts.map((c, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-surface-2 border border-border text-xs"
                  >
                    <span className="font-semibold text-fg">{c.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-fg-muted text-[11px]">{c.phone}</span>
                      <a
                        href={`https://wa.me/91${c.phone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(
                          `SAFETY ALERT: I am on a suspicious call or message asking for money. Our safety word is [${codeWord || 'FAMILY_CHECK'}]. Please call me immediately to verify.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-success/15 text-success hover:bg-success/25 transition-colors"
                      >
                        WhatsApp SOS
                      </a>
                      <button
                        onClick={() => handleDeleteContact(idx)}
                        className="text-fg-muted hover:text-danger text-[11px] px-1"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
