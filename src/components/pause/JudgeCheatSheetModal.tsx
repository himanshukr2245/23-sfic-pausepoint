'use client';

// src/components/pause/JudgeCheatSheetModal.tsx — Judge Pitch Arsenal & Demo Kit.
// ⛔ MANDATORY LAW: Commutative layouts — balanced compact cards with uniform geometry across all viewports.
// ⛔ MANDATORY ICON LAW: Pure SVG vector icons only — zero emojis in UI controls.
// Pitch script and architectural demonstration kit for SFIC 2026 evaluators & jury at IISc Bengaluru.

import { X, Trophy, Clock, Image as ImageIcon, Sparkles, Mic, Scale, ShieldCheck } from 'lucide-react';
import { playHapticTick, unlockAudio } from '@/lib/audio/synthesizer';

interface JudgeCheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JudgeCheatSheetModal({ isOpen, onClose }: JudgeCheatSheetModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="judge-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-shade/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] rounded-2xl border border-border/80 bg-surface shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border bg-surface-2/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand block">
                SFIC 2026 Level 3
              </span>
              <h2 id="judge-modal-title" className="text-base font-extrabold text-fg">
                Judge Demo Kit &amp; Pitch Arsenal
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              unlockAudio();
              playHapticTick();
              onClose();
            }}
            aria-label="Close Judge Kit"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-fg-muted hover:text-fg hover:bg-surface-2 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex flex-col gap-5 text-sm leading-relaxed">
          {/* The Hero Winning Moment Callout */}
          <div className="rounded-xl border border-brand/40 bg-brand/5 dark:bg-brand/10 p-4 border-l-4 border-l-brand flex flex-col gap-1.5">
            <span className="font-bold text-fg">The Winning Demo Moment (30 Seconds):</span>
            <p className="text-xs text-fg-muted leading-relaxed">
              Hand your smartphone to the evaluator and say: <em>&ldquo;Sir/Ma&rsquo;am, please paste any real SMS, screenshot from WhatsApp, or test link from your phone.&rdquo;</em> Watch PausePoint decompile the psychological pressure tactics in under 50ms, completely offline, with zero server telemetry.
            </p>
          </div>

          {/* 4 Architectural Superpowers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border/80 bg-surface-2/50 p-3.5 flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs font-bold text-brand">
                <ImageIcon className="w-4 h-4" />
                <span>On-Device Canvas OCR</span>
              </div>
              <p className="text-xs text-fg-muted">
                Downscales screenshots to max 1600px and runs client-side OCR without uploading images to cloud servers.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-surface-2/50 p-3.5 flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs font-bold text-brand">
                <Mic className="w-4 h-4" />
                <span>Live Verbal Pressure Transcriber</span>
              </div>
              <p className="text-xs text-fg-muted">
                Listens to caller speech in English/Hindi and decomposes verbal urgency, fake police authority, and secrecy traps.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-surface-2/50 p-3.5 flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs font-bold text-brand">
                <Scale className="w-4 h-4" />
                <span>Evidence Summary &amp; File Fingerprints</span>
              </div>
              <p className="text-xs text-fg-muted">
                Computes on-device SHA-256 electronic evidence hashes to verify the incident record has not been tampered with.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-surface-2/50 p-3.5 flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs font-bold text-brand">
                <Sparkles className="w-4 h-4" />
                <span>Bilingual Spoken Readout</span>
              </div>
              <p className="text-xs text-fg-muted">
                Calm regional Web Speech readout in English and Hindi for elderly citizens who panic under high-pressure calls.
              </p>
            </div>
          </div>

          {/* 2-Minute Demo Script */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-brand flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>The 2-Minute Pitch Script</span>
            </h3>

            <div className="space-y-2">
              {[
                { time: '0:00 - 0:20', title: 'The Problem', text: 'Over 85% of cyberattacks in India succeed due to psychological manipulation, not technical software bugs. Attackers hijack human fear and urgency.' },
                { time: '0:20 - 0:45', title: 'The Live Triage', text: 'Show OCR on a UPI payment receipt. Notice how PausePoint extracts the 12-digit bank UTR in under 8 seconds before the inter-bank freeze window closes.' },
                { time: '0:45 - 1:10', title: '15 Indian Playbooks', text: 'Demonstrate Digital Arrest, Electricity Disconnection, and Part-Time Task Scams. Each playbook displays "The Disproving Truth" that legally destroys the scam.' },
                { time: '1:10 - 1:35', title: 'Senior Citizen Calm Mode', text: 'Toggle Senior Mode to reveal 22px high-contrast typography, 64px tap targets, and Web Speech readout without external API network latency.' },
                { time: '1:35 - 2:00', title: 'The Sovereign Close', text: 'Switch off Wi-Fi (Airplane mode). The application continues running 100% locally. "PausePoint turns every Indian citizen into a sovereign human firewall."' },
              ].map((step, idx) => (
                <div key={idx} className="rounded-lg border border-border/60 bg-surface-2/40 p-3 flex flex-col sm:flex-row sm:items-start gap-2">
                  <span className="font-mono text-[11px] font-bold text-brand shrink-0 sm:w-28">
                    {step.time}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-fg block">{step.title}</span>
                    <p className="text-xs text-fg-muted mt-0.5">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface-2/40 flex items-center justify-between text-xs text-fg-muted">
          <span>JAIN University · Team DELTA · SFIC 2026</span>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand text-brand-fg font-bold hover:opacity-90 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Close Kit</span>
          </button>
        </div>
      </div>
    </div>
  );
}
