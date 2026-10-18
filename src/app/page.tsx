'use client';

// app/page.tsx — PausePoint Sovereign Citizen Cognitive Firewall (SFIC 2026 Master Showcase).
// ⛔ MANDATORY LAW: Commutative layouts — balanced compact cards with uniform geometry across all viewports.
// ⛔ MANDATORY ICON LAW: Pure SVG vector icons only — zero emojis in UI controls.
// Features 100% bespoke PausePoint Golden Hour showcase, live 12-col DecoderWorkbench, and zero-cloud architecture.

import { ButtonLink } from '@/components/ui/Button';
import { FpsCounter } from '@/components/ui';
import { ChromaticHarmonyPicker } from '@/components/ui/ChromaticHarmonyPicker';
import { DecoderWorkbench } from '@/components/pause/DecoderWorkbench';
import {
  Video,
  Smartphone,
  CreditCard,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface ScamVectorCard {
  title: string;
  badge: string;
  badgeColor: 'danger' | 'warning' | 'brand';
  description: string;
  disprovingTruth: string;
  icon: typeof Video;
}

const SCAM_VECTORS: ScamVectorCard[] = [
  {
    title: 'Digital Arrest Video Impersonation',
    badge: 'FEAR & FAKE AUTHORITY',
    badgeColor: 'danger',
    description: 'Impersonators posing as Mumbai Crime Branch, CBI, or Supreme Court on Skype/WhatsApp video calls, alleging drugs found in courier parcels.',
    disprovingTruth: 'Indian law enforcement NEVER conducts video arrests or online judicial proceedings. There is no legal concept called "Digital Arrest".',
    icon: Video,
  },
  {
    title: 'UPI PIN Cashback & Refund Lures',
    badge: 'GREED / FINANCIAL FRAUD',
    badgeColor: 'warning',
    description: 'Fake notifications claiming lottery winnings, scratch card rewards, or mistaken bank transfers requesting your PIN to collect money.',
    disprovingTruth: 'Entering a UPI PIN ONLY deducts money from your account. Receiving money NEVER requires entering your UPI PIN or scanning a QR code.',
    icon: CreditCard,
  },
  {
    title: 'Electricity & Challan APK Trojans',
    badge: 'URGENCY / MALWARE TROJANS',
    badgeColor: 'danger',
    description: 'Urgent SMS threatening power disconnection tonight at 9:30 PM, or pending traffic challans with links to sideload malicious Android APKs.',
    disprovingTruth: 'State electricity DISCOMs never send APK links via personal mobile numbers. Real traffic challans are only hosted on echallan.parivahan.gov.in.',
    icon: Smartphone,
  },
];

interface ArchitecturePillar {
  title: string;
  badge: string;
  metric: string;
  body: string;
}

const PILLARS: ArchitecturePillar[] = [
  {
    title: 'Instant 60-Second Triage',
    badge: 'GOLDEN HOUR',
    metric: '<60s P99',
    body: 'Extracts critical transaction UTR, beneficiary UPI IDs, and scam categories within seconds before the inter-bank freeze window closes.',
  },
  {
    title: '100% On-Device Sovereign Privacy',
    badge: 'ZERO CLOUD',
    metric: 'Client Sandbox',
    body: 'Zero network calls. All psychological decompilation and link safety analysis execute locally inside your browser sandbox.',
  },
  {
    title: 'NCRP 1930 Police Reporting Kit',
    badge: 'COMPLIANT',
    metric: '1-Click Kit',
    body: 'Generates a standardized cybercrime incident statement formatted precisely for National Cyber Crime Reporting Portal operators.',
  },
];

export default function Home() {
  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col gap-16 py-8 pb-24">
      {/* ── 1. Hero Section: Sovereign Citizen Firewall ─────────────────────── */}
      <section className="flex flex-col items-start gap-5 pt-4">
        {/* Precision Status Capsule */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-fg-muted shadow-xs backdrop-blur-md">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan" />
          </span>
          <span className="text-fg font-bold">SFIC 2026 · Theme 05 Surakshit Bharat</span>
          <span className="opacity-40">·</span>
          <span className="text-fg-muted font-mono">100% on-device · zero cloud telemetry</span>
        </div>

        <div className="flex flex-col gap-3 max-w-4xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-fg sm:text-6xl sm:leading-[1.1]">
            PausePoint Golden Hour
          </h1>
          <p className="text-base sm:text-xl text-fg-muted leading-relaxed font-sans">
            The sovereign citizen cognitive firewall. From panic to a complete 1930 helpline report in under 60 seconds, on your own device, completely offline.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3.5 pt-2 min-h-[50px]">
          {/* Button 1: Emergency Report (1930) */}
          <ButtonLink href="/report" variant="cyber-solid" latencyMode="spring-pop" sound="laser" size="lg">
            <span>REPORT FRAUD (1930)</span>
            <span className="text-sm font-bold">→</span>
          </ButtonLink>

          {/* Button 2: Before You Pay Again */}
          <ButtonLink href="/verify" variant="cyber-outline" latencyMode="spring-pop" sound="tick" size="lg">
            <span>BEFORE YOU PAY AGAIN</span>
          </ButtonLink>

          {/* Button 3: Decode Anchor */}
          <a
            href="#decoder"
            className="h-12 px-6 rounded-xl border border-border bg-surface-2 hover:bg-surface-3 text-fg text-xs font-bold uppercase tracking-wider flex items-center justify-center transition-colors shadow-xs"
          >
            DECODE SUSPICIOUS MESSAGE ↓
          </a>
        </div>

        {/* Golden Hour Citizen Defense Banner */}
        <div className="w-full mt-2 rounded-2xl border border-brand/20 bg-surface p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-fg uppercase tracking-wider">
                The Golden Hour Law (National Cybercrime Protocol)
              </h3>
              <p className="text-xs sm:text-sm text-fg-muted mt-0.5 leading-relaxed">
                Calling 1930 or filing within the first 60 minutes after a fraudulent UPI transfer halts beneficiary account settlement across participating banks.
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <ChromaticHarmonyPicker />
          </div>
        </div>
      </section>

      {/* ── 2. Psychological Manipulation Decoder (Won 3rd Prize at Human Firewall) ──── */}
      <section id="decoder" aria-labelledby="decoder-title" className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-brand">
            10-Second Cognitive Pause Engine
          </div>
          <h2 id="decoder-title" className="text-2xl sm:text-4xl font-extrabold tracking-tight text-fg">
            Psychological Manipulation Decoder
          </h2>
          <p className="text-xs sm:text-sm text-fg-muted max-w-3xl leading-relaxed">
            Paste any suspicious WhatsApp message, SMS alert, or web link to expose high-pressure psychological levers and counterfeit official domains in real time.
          </p>
        </div>

        {/* Master Responsive 12-Column Workbench */}
        <DecoderWorkbench />
      </section>

      {/* ── 3. Commutative Indian Scam Vector Playbooks ──────────────────────── */}
      <section aria-labelledby="playbooks-title" className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-brand">
            Pre-Emptive Pattern Immunization
          </div>
          <h2 id="playbooks-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fg">
            The Three Major Indian Scam Playbooks
          </h2>
          <p className="text-xs sm:text-sm text-fg-muted max-w-3xl leading-relaxed">
            Over 85% of citizen fraud in India relies on three recurring psychological attack vectors. Exposing the core lie disarms the scam immediately.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SCAM_VECTORS.map((vector, idx) => {
            const Icon = vector.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col justify-between gap-4 hover:border-brand/40 transition-colors"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        vector.badgeColor === 'danger'
                          ? 'bg-danger/15 text-danger border border-danger/20'
                          : 'bg-warning/15 text-warning border border-warning/20'
                      }`}
                    >
                      {vector.badge}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-surface-2 flex items-center justify-center text-fg-muted">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-fg leading-snug">
                    {vector.title}
                  </h3>
                  <p className="text-xs text-fg-muted leading-relaxed">
                    {vector.description}
                  </p>
                </div>

                <div className="rounded-xl border border-border/80 bg-surface-2/60 p-3.5 flex flex-col gap-1 mt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
                    The Disproving Truth
                  </span>
                  <p className="text-xs font-semibold text-fg leading-relaxed">
                    &ldquo;{vector.disprovingTruth}&rdquo;
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 4. Zero-Cloud Architecture Pillars ───────────────────────────────── */}
      <section aria-labelledby="architecture-title" className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-brand">
            Sovereign Safety Architecture
          </div>
          <h2 id="architecture-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fg">
            Built for Extreme Speed &amp; Sovereign Privacy
          </h2>
          <p className="text-xs sm:text-sm text-fg-muted max-w-3xl leading-relaxed">
            Engineered with zero third-party tracking, zero external network calls, and instant offline survivability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PILLARS.map((pillar, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col justify-between gap-4"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand/10 text-brand border border-brand/20">
                    {pillar.badge}
                  </span>
                  <span className="font-mono text-xs font-bold text-fg-muted">
                    {pillar.metric}
                  </span>
                </div>
                <h3 className="text-base font-bold text-fg mt-1">
                  {pillar.title}
                </h3>
                <p className="text-xs text-fg-muted leading-relaxed">
                  {pillar.body}
                </p>
              </div>

              <div className="pt-2 border-t border-border/60 flex items-center gap-2 text-xs font-semibold text-fg-muted">
                <ShieldCheck className="w-4 h-4 text-brand" />
                <span>Verified Client-Side</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. Real-time Refresh Rate & Layout Monitor ── */}
      <FpsCounter />
    </div>
  );
}
