'use client';

// app/xray/page.tsx — PausePoint Shield Single-Message X-Ray Inspection Screen.
// Static export compatible (?id= query parameter) wrapped in Suspense.
// Balanced-Minimalist UX: Complexity Inside, Serenity Outside (HK Universal LAW-13).
// 1-box on-device inspector, sample pills, plain truth verdict, and expandable technical docket.

import React, { Suspense, useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AwsSpotlightCard } from '@/components/ui/AwsSpotlightCard';
import { Button, ButtonLink } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/Input';
import { decode, TACTICS } from '@/lib/engine/decoder';
import { speakText, stopSpeaking } from '@/lib/speech';
import { playHapticTick, unlockAudio, playLaserZip, playSuccessChime } from '@/lib/audio/synthesizer';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  Volume2,
  VolumeX,
  Share2,
  CheckCircle2,
  Phone,
  BrainCircuit,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  FileText,
  Copy,
} from 'lucide-react';

const SAMPLES = [
  {
    id: 'task',
    label: 'Task Scam',
    text: 'Your task commission Rs 8,400 is ready. Pay Rs 5,000 to unlock withdrawal immediately.',
  },
  {
    id: 'arrest',
    label: 'Digital Arrest',
    text: 'CBI NOTICE: Your Aadhaar linked to money laundering case No. 7819. Stay on WhatsApp video call or face immediate police arrest.',
  },
  {
    id: 'power',
    label: 'Electricity Cut',
    text: 'Dear Customer, Your electricity will be disconnected tonight at 9:30 PM due to unpaid bill. Call officer immediately at 9876543210.',
  },
  {
    id: 'upi',
    label: 'UPI Cashback',
    text: 'You have won Rs 4,999 cashback! Open PhonePe and enter your 6-digit UPI PIN to claim reward into your bank account.',
  },
];

function XrayContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get('id') ?? 'case-01';
  const textParam = searchParams.get('text') ?? '';

  const [inputText, setInputText] = useState(
    textParam || SAMPLES[0].text
  );
  const [prevTextParam, setPrevTextParam] = useState(textParam);

  if (textParam !== prevTextParam) {
    setPrevTextParam(textParam);
    if (textParam) {
      setInputText(textParam);
    }
  }

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [markedSafe, setMarkedSafe] = useState(false);
  const [copiedFamilyAlert, setCopiedFamilyAlert] = useState(false);
  const [copiedEvidence, setCopiedEvidence] = useState(false);
  const [showTechnicalDocket, setShowTechnicalDocket] = useState(false);

  const verdict = useMemo(() => decode(inputText), [inputText]);

  function handleSpeak() {
    unlockAudio();
    playHapticTick();
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    const truthText = verdict?.playbooks[0]?.truth || 'Always verify independently through official numbers.';
    speakText(truthText, {
      lang: 'en-IN',
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
    setIsSpeaking(true);
  }

  function handleTellFamily() {
    unlockAudio();
    playHapticTick();
    const alertMessage = `⚠️ PausePoint Alert: I received a suspicious message: "${inputText.slice(0, 80)}...". PausePoint flagged it because: ${verdict?.playbooks[0]?.truth ?? 'It uses pressure tactics to extract money.'} Sharing so everyone in the family stays alert!`;
    navigator.clipboard.writeText(alertMessage);
    setCopiedFamilyAlert(true);
    setTimeout(() => setCopiedFamilyAlert(false), 3000);
  }

  function handleCopyEvidence() {
    unlockAudio();
    playHapticTick();
    const evidenceText = `PausePoint BSA 2023 Sec 63 Forensic Docket\nThreat Score: ${verdict?.score ?? 0}%\nClassification: ${verdict?.level?.toUpperCase() ?? 'UNKNOWN'}\nPlaybook: ${verdict?.playbooks[0]?.name ?? 'None'}\nPayload: "${inputText}"\nPrimary Truth: ${verdict?.playbooks[0]?.truth ?? 'N/A'}`;
    navigator.clipboard.writeText(evidenceText);
    setCopiedEvidence(true);
    setTimeout(() => setCopiedEvidence(false), 2500);
  }

  function selectSample(text: string) {
    unlockAudio();
    playLaserZip();
    setInputText(text);
    setMarkedSafe(false);
  }

  const isDanger = verdict?.level === 'danger';
  const isCaution = verdict?.level === 'suspicious';

  return (
    <div className="mx-auto max-w-4xl flex flex-col gap-6 pb-20">
      {/* ── Top Bar: Back & Case Badge ── */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-fg-muted hover:text-fg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO HOME</span>
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-surface border border-border">
          <span className="text-fg-muted">Case ID:</span>
          <span className="text-cyan font-bold">{idParam}</span>
        </div>
      </div>

      {/* ── Unified Screen Header (Harmonized with Android) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-surface border border-border">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan/15 border border-cyan/35 flex items-center justify-center shrink-0 text-cyan">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg sm:text-xl font-extrabold text-fg tracking-tight">
              X-RAY FORENSICS
            </h1>
            <p className="text-xs text-fg-muted font-medium">
              BSA 2023 · On-Device Analysis Engine
            </p>
          </div>
        </div>

        {/* 100% Offline Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/30 text-[11px] font-mono font-bold text-success self-start sm:self-center">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <span>100% OFFLINE · ZERO INTERNET NEEDED</span>
        </div>
      </div>

      {/* ── Interactive Message Input & Sample Chips ── */}
      <div className="flex flex-col gap-3 p-4 sm:p-5 rounded-2xl bg-surface border border-border">
        <div className="flex items-center justify-between">
          <label htmlFor="message-input" className="text-xs font-mono font-bold text-fg-muted uppercase">
            Message or Call Script to Inspect
          </label>
          <span className="text-[11px] font-mono text-fg-muted">
            {inputText.length} characters
          </span>
        </div>

        <TextArea
          id="message-input"
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            setMarkedSafe(false);
          }}
          rows={3}
          placeholder="Paste suspicious SMS, WhatsApp message, or phone call pitch here..."
          className="w-full font-mono text-xs sm:text-sm text-fg bg-surface-2 p-3.5 rounded-xl border border-border focus:border-cyan focus:outline-none transition-colors resize-y leading-relaxed"
        />

        {/* Quick Sample Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-mono text-fg-muted mr-1">Test with sample:</span>
          {SAMPLES.map((sample) => (
            <Button
              key={sample.id}
              variant="plain"
              size="none"
              onClick={() => selectSample(sample.text)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-colors cursor-pointer ${
                inputText === sample.text
                  ? 'bg-cyan/15 text-cyan border-cyan/40'
                  : 'bg-surface-2 text-fg-muted border-border/80 hover:text-fg hover:border-border'
              }`}
            >
              {sample.label}
            </Button>
          ))}
          {inputText !== SAMPLES[0].text && (
            <Button
              variant="plain"
              size="none"
              onClick={() => selectSample(SAMPLES[0].text)}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-fg-muted hover:text-fg ml-auto cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── Real-Time Verdict Card ── */}
      <AwsSpotlightCard
        colorAccent={isDanger ? 'rose' : isCaution ? 'amber' : 'emerald'}
        className="p-6 sm:p-8"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pb-6 border-b border-border/80">
          <div className="flex items-center gap-4">
            <div
              className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                isDanger
                  ? 'bg-danger/10 text-danger border-danger/30'
                  : isCaution
                  ? 'bg-warning/10 text-warning border-warning/30'
                  : 'bg-success/10 text-success border-success/30'
              }`}
            >
              {isDanger ? (
                <ShieldAlert className="w-7 h-7" />
              ) : isCaution ? (
                <AlertTriangle className="w-7 h-7" />
              ) : (
                <ShieldCheck className="w-7 h-7" />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-extrabold uppercase tracking-wider ${
                    isDanger
                      ? 'bg-danger/15 text-danger border border-danger/40'
                      : isCaution
                      ? 'bg-warning/15 text-warning border border-warning/40'
                      : 'bg-success/15 text-success border border-success/40'
                  }`}
                >
                  {isDanger
                    ? 'DANGER · HIGH SCAM PROBABILITY'
                    : isCaution
                    ? 'CAUTION · SUSPICIOUS PATTERN'
                    : 'SAFE · NO KNOWN SCAM LEVERS'}
                </span>
                <span className="text-xs font-mono text-fg-muted">
                  Threat Score: {verdict?.score ?? 0}%
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-fg tracking-tight">
                {verdict?.playbooks[0]?.name ?? 'Unidentified Message Pattern'}
              </h2>
            </div>
          </div>

          {/* Audio Readout */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSpeak}
            className="flex items-center gap-2 font-mono text-xs cursor-pointer shrink-0"
          >
            {isSpeaking ? (
              <VolumeX className="w-4 h-4 text-danger animate-pulse" />
            ) : (
              <Volume2 className="w-4 h-4 text-cyan" />
            )}
            <span>{isSpeaking ? 'Stop Readout' : 'Read Aloud'}</span>
          </Button>
        </div>

        {/* ── The Single Truth That Breaks This Scam ── */}
        <div className="pt-6 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan">
              THE SINGLE TRUTH THAT BREAKS THIS SCAM
            </span>
            <span className="text-[11px] font-mono text-fg-muted">Simple Rule</span>
          </div>
          <div className="rounded-xl p-4 bg-surface-2 border border-border text-fg text-sm sm:text-base font-medium leading-relaxed">
            {verdict?.playbooks[0]?.truth ??
              'Genuine banks and government authorities will never demand instant transfers or threaten arrest over phone/video calls. Always verify through official websites or phone numbers.'}
          </div>
        </div>
      </AwsSpotlightCard>

      {/* ── Decompiled Levers & Verified Action Steps ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Manipulative Levers (in Plain English) */}
        <AwsSpotlightCard colorAccent="cyan" className="p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-cyan">
              Tricks Found in this Message ({verdict?.tactics.length ?? 0})
            </span>
            <span className="text-[11px] font-mono text-fg-muted">Decompiled</span>
          </div>
          {verdict && verdict.tactics.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {verdict.tactics.map((t) => {
                const tacticMeta = TACTICS.find((x) => x.id === t.id);
                return (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-surface-2 border border-border flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-fg">{t.label}</span>
                      <span className="text-[10px] font-mono text-cyan bg-cyan/10 px-1.5 py-0.5 rounded border border-cyan/20">
                        +{tacticMeta?.weight ?? 10} pts
                      </span>
                    </div>
                    <p className="text-[11px] text-fg-muted leading-relaxed">{t.lever}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-surface-2 border border-border text-xs text-fg-muted italic">
              No psychological pressure triggers or coercion phrases detected.
            </div>
          )}
        </AwsSpotlightCard>

        {/* Recommended Action Steps */}
        <AwsSpotlightCard colorAccent="cyan" className="p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-success">
              What You Should Do Now
            </span>
            <span className="text-[11px] font-mono text-fg-muted">Immediate Steps</span>
          </div>
          {verdict && verdict.verifySteps.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {verdict.verifySteps.map((step: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-2 border border-border text-xs text-fg"
                >
                  <span className="w-5 h-5 rounded-full bg-success/15 text-success font-mono font-bold flex items-center justify-center shrink-0 text-[10px] border border-success/30">
                    {idx + 1}
                  </span>
                  <span className="leading-snug pt-0.5">{step}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-surface-2 border border-border text-xs text-fg-muted italic">
              Standard vigilance applies. Never share OTPs or click unverified links.
            </div>
          )}
        </AwsSpotlightCard>
      </div>

      {/* ── Action Doors Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-surface border border-border">
        <div className="flex flex-wrap items-center gap-3">
          {/* Action 1: Report to 1930 */}
          <ButtonLink
            href={`/report?case=${idParam}&text=${encodeURIComponent(inputText)}`}
            variant="cyber-danger"
            size="md"
            className="flex items-center gap-2 font-bold"
          >
            <Phone className="w-4 h-4" />
            <span>Report to 1930 Helpline</span>
          </ButtonLink>

          {/* Action 2: Tell Family */}
          <Button
            variant="secondary"
            size="md"
            onClick={handleTellFamily}
            className="flex items-center gap-2 font-bold cursor-pointer"
          >
            {copiedFamilyAlert ? (
              <CheckCircle2 className="w-4 h-4 text-success" />
            ) : (
              <Share2 className="w-4 h-4 text-cyan" />
            )}
            <span>{copiedFamilyAlert ? 'Family Warning Copied!' : 'Warn Family'}</span>
          </Button>

          {/* Action 3: Copy Evidence Docket */}
          <Button
            variant="quiet"
            size="md"
            onClick={handleCopyEvidence}
            className="flex items-center gap-2 font-mono text-xs cursor-pointer text-fg-muted hover:text-fg"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedEvidence ? 'Evidence Copied!' : 'Copy Evidence'}</span>
          </Button>
        </div>

        {/* Action 4: Mark Safe / False Alarm */}
        <Button
          variant="quiet"
          size="sm"
          onClick={() => {
            unlockAudio();
            playSuccessChime();
            setMarkedSafe(true);
          }}
          className={`text-xs font-mono cursor-pointer ${
            markedSafe ? 'text-success' : 'text-fg-muted hover:text-fg'
          }`}
        >
          {markedSafe ? '✓ Trusted Sender for 30 Days' : 'Not a Scam (Mark Safe)'}
        </Button>
      </div>

      {/* ── Expandable Technical Docket (LAW-13: Complexity Inside, Serenity Outside) ── */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <Button
          variant="plain"
          size="none"
          onClick={() => {
            unlockAudio();
            playHapticTick();
            setShowTechnicalDocket(!showTechnicalDocket);
          }}
          className="w-full flex items-center justify-between p-4 text-left font-mono text-xs text-fg-muted hover:text-fg hover:bg-surface-2/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan" />
            <span className="font-bold text-fg">Technical Analysis &amp; Legal Docket</span>
            <span className="text-[10px] text-fg-muted">(For Cyber Police &amp; Forensics)</span>
          </div>
          {showTechnicalDocket ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>

        {showTechnicalDocket && (
          <div className="p-5 border-t border-border bg-surface-2/40 flex flex-col gap-4 text-xs font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-surface border border-border">
                <span className="text-fg-muted text-[10px] uppercase block">Analysis Engine</span>
                <span className="text-fg font-bold">PausePoint Deterministic Finite Automaton (DFA)</span>
              </div>
              <div className="p-3 rounded-lg bg-surface border border-border">
                <span className="text-fg-muted text-[10px] uppercase block">Evidence Standard</span>
                <span className="text-fg font-bold">Bharatiya Sakshya Adhiniyam (BSA) 2023 Sec 63</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface border border-border flex flex-col gap-1.5">
              <span className="text-fg-muted text-[10px] uppercase">Raw Payload Inspection</span>
              <pre className="text-[11px] text-cyan overflow-x-auto whitespace-pre-wrap select-all">
                {inputText}
              </pre>
            </div>

            <div className="p-3 rounded-lg bg-surface border border-border flex flex-col gap-1.5">
              <span className="text-fg-muted text-[10px] uppercase">Engine Evaluation Output</span>
              <pre className="text-[11px] text-fg-muted overflow-x-auto whitespace-pre-wrap select-all">
                {JSON.stringify(
                  {
                    score: verdict?.score,
                    level: verdict?.level,
                    playbooks: verdict?.playbooks.map((p) => p.name),
                    tactics: verdict?.tactics.map((t) => t.label),
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function XrayPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl py-20 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-10 h-10 border-2 border-cyan border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-fg-muted">Loading X-Ray Engine...</span>
        </div>
      }
    >
      <XrayContent />
    </Suspense>
  );
}
