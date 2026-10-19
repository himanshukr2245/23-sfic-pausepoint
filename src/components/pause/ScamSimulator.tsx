'use client';

// src/components/pause/ScamSimulator.tsx — Interactive Cyber Attack Simulation Arena.
// ⛔ MANDATORY LAW: Commutative layouts — balanced compact cards with uniform geometry across all viewports.
// ⛔ MANDATORY ICON LAW: Pure SVG vector icons only — zero emojis in UI controls.
// Allows evaluators, students, and citizens to test realistic Indian scam vectors and watch PausePoint's cognitive brake fire.

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  AlertOctagon,
  ShieldCheck,
  Volume2,
  VolumeX,
  ArrowRight,
  Search,
  ExternalLink,
  Smartphone,
  Video,
  CreditCard,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { unlockAudio, playHapticTick, playPop } from '@/lib/audio/synthesizer';
import { speakText, stopSpeaking, isSpeaking } from '@/lib/speech';

import { SCENARIOS, type SimulationScenario } from '@/lib/engine/simulator';

const ICON_MAP: Record<SimulationScenario['iconName'], React.ComponentType<{ className?: string }>> = {
  Zap,
  Video,
  Smartphone,
  CreditCard,
};


export const ScamSimulator: React.FC = () => {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<SimulationScenario['id']>('task-scam');
  const [activeMode, setActiveMode] = useState<'intercept' | 'comply'>('intercept');
  const [speaking, setSpeaking] = useState(false);

  const scenario = SCENARIOS.find((s) => s.id === selectedId) ?? SCENARIOS[0]!;

  const handleSelectScenario = (id: SimulationScenario['id']) => {
    unlockAudio();
    playHapticTick();
    stopSpeaking();
    setSpeaking(false);
    setSelectedId(id);
    setActiveMode('intercept');
  };

  const handleToggleMode = (mode: 'intercept' | 'comply') => {
    unlockAudio();
    playPop();
    stopSpeaking();
    setSpeaking(false);
    setActiveMode(mode);
  };

  const handleAudioPlayback = () => {
    unlockAudio();
    playPop();

    if (speaking || isSpeaking()) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }

    setSpeaking(true);
    speakText(scenario.pausepointIntervention.immutableTruth, {
      lang: 'en-IN',
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  const handleInspectInDecoder = () => {
    unlockAudio();
    playPop();
    // Dispatch custom event to load payload directly into DecoderWorkbench
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('pausepoint:load-sample', {
          detail: { text: scenario.incomingMessage },
        })
      );
      const decoderElem = document.getElementById('decoder');
      if (decoderElem) {
        decoderElem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleVerifyRoute = () => {
    unlockAudio();
    playPop();
    router.push('/verify');
  };

  const handleReportRoute = () => {
    unlockAudio();
    playPop();
    router.push('/report');
  };

  return (
    <div
      aria-label="Interactive Scam Simulation Arena"
      className="w-full rounded-2xl border border-border bg-surface p-5 sm:p-7 shadow-xs flex flex-col gap-6"
    >
      {/* ── Section Header ── */}
      <div className="flex flex-col gap-1.5 border-b border-border/70 pb-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-brand flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
            </span>
            <span>Interactive Cyber Attack Arena</span>
          </div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-surface-2 border border-border text-fg-muted">
            Live Cognitive Simulation
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fg">
          Test the Trap Before It Strikes
        </h2>
        <p className="text-xs sm:text-sm text-fg-muted max-w-3xl leading-relaxed">
          Select an active Indian cybercrime scenario below to see how fear, fake authority, and urgency manipulate victim psychology — and test how PausePoint&apos;s cognitive brake halts the loss in real time.
        </p>
      </div>

      {/* ── Scenario Selection Tabs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {SCENARIOS.map((item) => {
          const Icon = ICON_MAP[item.iconName];
          const isActive = item.id === selectedId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectScenario(item.id)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer select-none ${
                isActive
                  ? 'border-brand bg-brand/10 text-fg shadow-xs ring-1 ring-brand/30'
                  : 'border-border/80 bg-surface-2/60 text-fg-muted hover:border-brand/40 hover:bg-surface-2'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-brand text-bg' : 'bg-surface text-fg-muted'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-fg-muted truncate">
                  {item.category}
                </div>
                <div className="text-xs font-bold text-fg truncate">
                  {item.tabTitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Main Arena: 2-Column Responsive Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5-Col): The Simulated Attack Payload */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-xl border border-border/80 bg-surface-2/60 p-4 sm:p-5 flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
                <span className="text-xs font-mono font-bold text-fg uppercase">
                  Simulated {scenario.channel} Vector
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-danger/10 text-fg border border-danger/30 dark:bg-danger/20 dark:text-danger">
                {scenario.severity} ({scenario.threatScore}/100)
              </span>
            </div>

            {/* Sender Metadata */}
            <div className="flex flex-col gap-1 text-xs">
              <span className="text-fg-muted text-[11px] font-mono">FROM:</span>
              <span className="font-mono font-bold text-fg bg-surface px-2.5 py-1 rounded border border-border/60">
                {scenario.sender}
              </span>
            </div>

            {/* Message Body Plate */}
            <div className="rounded-xl border border-danger/30 bg-surface p-4 shadow-inner relative">
              <div className="text-[10px] font-mono text-danger font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Malicious Coercion Payload</span>
              </div>
              <p className="text-xs sm:text-sm font-sans text-fg leading-relaxed">
                &ldquo;{scenario.incomingMessage}&rdquo;
              </p>
            </div>

            {/* Psychological Pressure Meter Breakdown */}
            <div className="flex flex-col gap-2.5 pt-2 border-t border-border/60">
              <div className="text-[11px] font-mono font-bold text-fg-muted uppercase tracking-wider flex items-center justify-between">
                <span>Psychological Levers Triggered</span>
                <span className="text-danger font-bold">{scenario.threatScore}% Sunk Pressure</span>
              </div>

              {/* Progress Bars */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Fear */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-fg-muted">Terror / Coercion</span>
                    <span className="font-mono font-bold text-danger">
                      {scenario.pressureMetrics.fear}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-surface overflow-hidden">
                    <div
                      className="h-full bg-danger rounded-full transition-all duration-500"
                      style={{ width: `${scenario.pressureMetrics.fear}%` }}
                    />
                  </div>
                </div>

                {/* Urgency */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-fg-muted">Artificial Urgency</span>
                    <span className="font-mono font-bold text-fg dark:text-warning">
                      {scenario.pressureMetrics.urgency}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-surface overflow-hidden">
                    <div
                      className="h-full bg-warning rounded-full transition-all duration-500"
                      style={{ width: `${scenario.pressureMetrics.urgency}%` }}
                    />
                  </div>
                </div>

                {/* Authority */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-fg-muted">Fake Authority</span>
                    <span className="font-mono font-bold text-danger">
                      {scenario.pressureMetrics.authority}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-surface overflow-hidden">
                    <div
                      className="h-full bg-danger rounded-full transition-all duration-500"
                      style={{ width: `${scenario.pressureMetrics.authority}%` }}
                    />
                  </div>
                </div>

                {/* Isolation */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-fg-muted">Secrecy / Isolation</span>
                    <span className="font-mono font-bold text-fg dark:text-warning">
                      {scenario.pressureMetrics.isolation}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-surface overflow-hidden">
                    <div
                      className="h-full bg-warning rounded-full transition-all duration-500"
                      style={{ width: `${scenario.pressureMetrics.isolation}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action to load into Decoder */}
            <button
              type="button"
              onClick={handleInspectInDecoder}
              className="mt-1 flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-fg hover:border-brand hover:text-brand transition-all cursor-pointer shadow-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Inspect in Live Decoder Workbench ↓</span>
            </button>
          </div>
        </div>

        {/* Right Column (7-Col): Dual-Branch Interactive Simulation */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Dual Mode Switcher */}
          <div className="grid grid-cols-2 gap-2 bg-surface-2 p-1.5 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => handleToggleMode('intercept')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer select-none ${
                activeMode === 'intercept'
                  ? 'bg-brand text-bg shadow-sm font-extrabold'
                  : 'text-fg-muted hover:text-fg'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>PausePoint Cognitive Brake</span>
            </button>

            <button
              type="button"
              onClick={() => handleToggleMode('comply')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer select-none ${
                activeMode === 'comply'
                  ? 'bg-danger text-bg shadow-sm font-extrabold'
                  : 'text-fg-muted hover:text-fg'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Simulate Complying (The Trap)</span>
            </button>
          </div>

          {/* Mode View: Intercept vs Comply */}
          {activeMode === 'intercept' ? (
            <div className="rounded-xl border border-brand/30 bg-surface-2/40 p-5 sm:p-6 flex flex-col justify-between gap-5 flex-1 animate-fade-in">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand animate-ping" />
                    <span className="text-xs font-mono font-bold text-brand uppercase tracking-wider">
                      Active Cognitive Defense Triggered
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-brand/10 text-fg border border-brand/30 dark:bg-brand/20 dark:text-brand">
                    {scenario.pausepointIntervention.preventedLoss}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-fg">
                  {scenario.pausepointIntervention.headline}
                </h3>

                {/* The Immutable Truth Callout */}
                <div className="rounded-xl border border-brand/40 bg-surface p-4 flex flex-col gap-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand">
                      The Immutable Legal Truth
                    </span>
                    <button
                      type="button"
                      onClick={handleAudioPlayback}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-surface-2 hover:bg-brand/10 text-fg hover:text-brand border border-border transition-colors cursor-pointer"
                    >
                      {speaking ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-danger" />
                          <span className="text-[11px]">Stop Audio</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-brand" />
                          <span className="text-[11px]">Listen Reality Check</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-fg leading-relaxed">
                    &ldquo;{scenario.pausepointIntervention.immutableTruth}&rdquo;
                  </p>

                  <div className="text-[11px] font-mono text-fg-muted pt-1 border-t border-border/40">
                    Statutory Rule: {scenario.pausepointIntervention.statuteOrLaw}
                  </div>
                </div>

                {/* Immediate Action Directive */}
                <div className="rounded-xl border border-border bg-surface p-3.5 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="text-xs leading-relaxed">
                    <span className="font-bold text-fg">Recommended Directive: </span>
                    <span className="text-fg-muted">{scenario.pausepointIntervention.immediateAction}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons to deep-dive */}
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={handleVerifyRoute}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand text-bg px-4 py-2.5 text-xs font-extrabold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                >
                  <span>Test in Before You Pay Brake</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleReportRoute}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-danger/40 bg-danger/10 text-danger hover:bg-danger/20 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <span>Launch 1930 Triage Drill</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-danger/30 bg-surface-2/40 p-5 sm:p-6 flex flex-col justify-between gap-5 flex-1 animate-fade-in">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-danger" />
                    <span className="text-xs font-mono font-bold text-danger uppercase tracking-wider">
                      Simulated Victim Compliance Outcome
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-danger/10 text-fg border border-danger/30 dark:bg-danger/20 dark:text-danger">
                    Loss: {scenario.complianceOutcome.lossAmount}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-danger">
                  {scenario.complianceOutcome.headline}
                </h3>

                {/* The Trap Escalation Step */}
                <div className="rounded-xl border border-danger/30 bg-surface p-4 flex flex-col gap-2 shadow-xs">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-danger">
                    What The Scammer Does Next (Escalation Ladder)
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-fg leading-relaxed">
                    &ldquo;{scenario.complianceOutcome.escalationStep}&rdquo;
                  </p>
                </div>

                {/* Trap Analysis & Recovery Probability */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-border bg-surface p-3 flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-fg-muted uppercase font-bold">
                      Recovery Probability
                    </span>
                    <span className="font-bold text-danger">
                      {scenario.complianceOutcome.recoveryChance}
                    </span>
                  </div>

                  <div className="rounded-xl border border-border bg-surface p-3 flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-fg-muted uppercase font-bold">
                      Psychological Exploitation
                    </span>
                    <span className="text-fg-muted text-[11px] leading-tight">
                      {scenario.complianceOutcome.trapAnalysis}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reset to PausePoint */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-3">
                <span className="text-xs text-fg-muted">
                  Ready to see how to prevent this trap?
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleMode('intercept')}
                  className="flex items-center gap-1.5 rounded-xl border border-brand bg-brand/10 text-brand px-3.5 py-2 text-xs font-bold hover:bg-brand hover:text-bg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Activate PausePoint Defense</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
