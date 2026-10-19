'use client';

// app/xray/page.tsx — PausePoint Shield Single-Message X-Ray Inspection Screen.
// Static export compatible (?id= query parameter) wrapped in Suspense.
// Decompiles pressure levers, matched playbook, link forensics, and the single truth that breaks it.
import React, { Suspense, useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AwsSpotlightCard } from '@/components/ui/AwsSpotlightCard';
import { Button, ButtonLink } from '@/components/ui/Button';
import { decode, TACTICS } from '@/lib/engine/decoder';
import { speakText, stopSpeaking } from '@/lib/speech';
import { playHapticTick, unlockAudio } from '@/lib/audio/synthesizer';
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
} from 'lucide-react';

function XrayContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') ?? 'sample';
  const rawText = searchParams.get('text') ?? '';

  const messageText =
    rawText || 'Your task commission Rs 8,400 is ready. Pay Rs 5,000 to unlock withdrawal immediately.';
  const verdict = useMemo(() => decode(messageText), [messageText]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [markedSafe, setMarkedSafe] = useState(false);
  const [copiedFamilyAlert, setCopiedFamilyAlert] = useState(false);

  function handleSpeak() {
    unlockAudio();
    playHapticTick();
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    if (verdict?.playbooks[0]?.truth) {
      speakText(verdict.playbooks[0].truth, {
        lang: 'en-IN',
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
      setIsSpeaking(true);
    }
  }

  function handleTellFamily() {
    unlockAudio();
    playHapticTick();
    const alertMessage = `⚠️ PausePoint Alert: I received a suspicious message that looks like a scam: "${messageText.slice(0, 80)}...". PausePoint flagged it because: ${verdict?.playbooks[0]?.truth ?? 'It uses pressure tactics to extract money.'} Sharing so everyone in the family stays alert!`;
    navigator.clipboard.writeText(alertMessage);
    setCopiedFamilyAlert(true);
    setTimeout(() => setCopiedFamilyAlert(false), 3000);
  }

  const isDanger = verdict?.level === 'danger';
  const isCaution = verdict?.level === 'suspicious';

  return (
    <div className="mx-auto max-w-4xl flex flex-col gap-8 pb-20">
      {/* ── Top Bar Navigation ── */}
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
          <span className="text-cyan font-bold">{id}</span>
        </div>
      </div>

      {/* ── Verdict Banner Card ── */}
      <AwsSpotlightCard
        colorAccent={isDanger ? 'rose' : isCaution ? 'amber' : 'emerald'}
        className="p-6 sm:p-8"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-border/80">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                isDanger
                  ? 'bg-danger/10 text-danger border-danger/30'
                  : isCaution
                  ? 'bg-warning/10 text-warning border-warning/30'
                  : 'bg-success/10 text-success border-success/30'
              }`}
            >
              {isDanger ? <ShieldAlert className="w-7 h-7" /> : isCaution ? <AlertTriangle className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
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
                  {isDanger ? 'DANGER · SCAM VECTOR IDENTIFIED' : isCaution ? 'CAUTION · SUSPICIOUS PATTERN' : 'SAFE · NO KNOWN LEVERS'}
                </span>
                <span className="text-xs font-mono text-fg-muted">Threat Score: {verdict?.score ?? 0}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-fg tracking-tight">
                {verdict?.playbooks[0]?.name ?? 'Unidentified Message Pattern'}
              </h1>
            </div>
          </div>

          {/* Audio Readout Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSpeak}
            className="flex items-center gap-2 font-mono text-xs cursor-pointer"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4 text-danger animate-pulse" /> : <Volume2 className="w-4 h-4 text-cyan" />}
            <span>{isSpeaking ? 'Stop Readout' : 'Read Aloud'}</span>
          </Button>
        </div>

        {/* ── The Single Truth That Breaks It ── */}
        <div className="pt-6 flex flex-col gap-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan">
            THE IMMUTABLE TRUTH THAT BREAKS THIS SCAM
          </span>
          <div className="rounded-xl p-4 bg-surface-2 border border-border/80 text-fg text-sm sm:text-base font-medium leading-relaxed">
            {verdict?.playbooks[0]?.truth ??
              'Always verify independently through official numbers. Scammers use artificial urgency to prevent you from consulting others.'}
          </div>
        </div>
      </AwsSpotlightCard>

      {/* ── Message Raw Text Preview ── */}
      <div className="rounded-2xl border border-border bg-surface p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-fg-muted uppercase">Inspected Message Payload</span>
          <span className="text-[11px] font-mono text-fg-muted">Source: Android Firewall Receiver</span>
        </div>
        <p className="font-mono text-xs text-fg leading-relaxed bg-surface-2 p-3.5 rounded-xl border border-border/60 break-words select-all">
          {messageText}
        </p>
      </div>

      {/* ── Decompiled Levers & Tactics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AwsSpotlightCard colorAccent="cyan" className="p-5 flex flex-col gap-3">
          <span className="text-xs font-mono font-bold uppercase text-cyan">Identified Pressure Levers ({verdict?.tactics.length ?? 0})</span>
          {verdict && verdict.tactics.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {verdict.tactics.map((t) => {
                const tacticMeta = TACTICS.find((x) => x.id === t.id);
                return (
                  <div key={t.id} className="p-2.5 rounded-lg bg-surface-2 border border-border/60 flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-fg">{t.label}</span>
                      <span className="text-[10px] font-mono text-cyan bg-cyan/10 px-1.5 py-0.5 rounded">+{tacticMeta?.weight ?? 10} pts</span>
                    </div>
                    <p className="text-[11px] text-fg-muted leading-tight">{t.lever}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-fg-muted italic">No manipulative pressure levers detected.</p>
          )}
        </AwsSpotlightCard>

        {/* ── Verified Recommended Steps ── */}
        <AwsSpotlightCard colorAccent="emerald" className="p-5 flex flex-col gap-3">
          <span className="text-xs font-mono font-bold uppercase text-success">Recommended Action Steps</span>
          {verdict && verdict.verifySteps.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {verdict.verifySteps.map((step: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-fg">
                  <span className="w-5 h-5 rounded-full bg-success/15 text-success font-mono font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="leading-snug">{step}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-fg-muted italic">Standard caution applies to unverified messages.</p>
          )}
        </AwsSpotlightCard>
      </div>

      {/* ── Action Doors Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
        <div className="flex flex-wrap items-center gap-3">
          {/* Action 1: Report Now */}
          <ButtonLink
            href={`/report?case=${id}&text=${encodeURIComponent(messageText)}`}
            variant="cyber-danger"
            size="md"
            className="flex items-center gap-2 font-bold"
          >
            <Phone className="w-4 h-4" />
            <span>Report Now [1930]</span>
          </ButtonLink>

          {/* Action 2: Tell Family */}
          <Button
            variant="secondary"
            size="md"
            onClick={handleTellFamily}
            className="flex items-center gap-2 font-bold cursor-pointer"
          >
            {copiedFamilyAlert ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Share2 className="w-4 h-4 text-cyan" />}
            <span>{copiedFamilyAlert ? 'Alert Copied to Clipboard!' : 'Tell Family'}</span>
          </Button>
        </div>

        {/* Action 3: Mark Safe / False Alarm */}
        <Button
          variant="quiet"
          size="sm"
          onClick={() => {
            unlockAudio();
            playHapticTick();
            setMarkedSafe(true);
          }}
          className={`text-xs font-mono cursor-pointer ${markedSafe ? 'text-success' : 'text-fg-muted hover:text-fg'}`}
        >
          {markedSafe ? '✓ Trusted Sender for 30 Days' : 'Not a Scam (Mark Safe)'}
        </Button>
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
