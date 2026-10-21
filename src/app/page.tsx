'use client';

// app/page.tsx — PausePoint Sovereign Citizen Cognitive Firewall (SFIC 2026 Master Showcase).
// ⛔ MANDATORY LAW: Commutative layouts — balanced compact cards with uniform geometry across all viewports.
// ⛔ MANDATORY ICON LAW: Pure SVG vector icons only — zero emojis in UI controls.
// Master Balanced-Minimalist Super-Fast Home Page with Defense Hub Bento Matrix & Radial Spotlight Physics.

import Link from 'next/link';
import { ButtonLink } from '@/components/ui/Button';
import { FpsCounter } from '@/components/ui';
import { AwsSpotlightCard } from '@/components/ui/AwsSpotlightCard';
import { GoldenHourCurveCard } from '@/components/pause/GoldenHourCurveCard';
import {
  Video,
  Smartphone,
  CreditCard,
  ShieldCheck,
  Zap,
  Lock,
  FileCheck2,
  Scale,
  ArrowRight,
  Sparkles,
  Search,
  ShieldAlert,
  LayoutGrid,
  PhoneCall,
} from 'lucide-react';

interface DefenseModule {
  href: string;
  title: string;
  badge: string;
  metric: string;
  description: string;
  colorAccent: 'rose' | 'amber' | 'cyan' | 'indigo' | 'emerald' | 'neutral';
  icon: typeof Zap;
  actionText: string;
}

const DEFENSE_MODULES: DefenseModule[] = [
  {
    href: '/report',
    title: '1930 Emergency Report',
    badge: 'GOLDEN HOUR HELP',
    metric: '<60s Triage',
    description:
      'Instant payment receipt extraction, 1-tap phone script, and automated cyber fraud portal draft before bank funds disperse.',
    colorAccent: 'rose',
    icon: Zap,
    actionText: 'Open 1930 Triage',
  },
  {
    href: '/verify',
    title: 'Before You Pay Again',
    badge: 'STOP-LOSS BRAKE',
    metric: 'Truth Check',
    description:
      'Stops compounding financial losses from fake task withdrawals, investment traps, and digital arrest bail demands.',
    colorAccent: 'amber',
    icon: ShieldAlert,
    actionText: 'Test Verification Brake',
  },
  {
    href: '/xray',
    title: 'X-Ray Scam Decoder',
    badge: 'INSTANT SCANNER',
    metric: '0ms On-Device',
    description:
      'Inspects suspicious WhatsApp messages, fake police threats, and APK download links directly in your browser.',
    colorAccent: 'cyan',
    icon: Search,
    actionText: 'Launch X-Ray',
  },
  {
    href: '/simulator',
    title: 'Attack Simulator Arena',
    badge: 'INTERACTIVE PRACTICE',
    metric: '4 Common Scams',
    description:
      'Experience realistic simulations of Digital Arrest calls and UPI PIN traps so you and your family learn how to spot them.',
    colorAccent: 'indigo',
    icon: Video,
    actionText: 'Enter Simulator Arena',
  },
  {
    href: '/studio',
    title: 'Evidence Certificate Studio',
    badge: 'POLICE & COURT READY',
    metric: 'BSA 2023 Valid',
    description:
      'Generates official digital evidence dockets with verifiable QR codes for police investigations under Section 63 BSA 2023.',
    colorAccent: 'emerald',
    icon: Scale,
    actionText: 'Open Evidence Studio',
  },
  {
    href: '/about',
    title: 'Security & Privacy Specs',
    badge: '100% PRIVATE',
    metric: 'Zero Cloud',
    description:
      'Learn how PausePoint permanently protects your personal data with zero external cloud tracking or network leakage.',
    colorAccent: 'neutral',
    icon: LayoutGrid,
    actionText: 'Read Security Specs',
  },
];

interface ScamVectorCard {
  title: string;
  badge: string;
  badgeColor: 'danger' | 'warning' | 'brand';
  description: string;
  disprovingTruth: string;
  icon: typeof Video;
  colorAccent: 'rose' | 'amber' | 'cyan';
}

const SCAM_VECTORS: ScamVectorCard[] = [
  {
    title: 'Digital Arrest Video Impersonation',
    badge: 'FEAR & FAKE AUTHORITY',
    badgeColor: 'danger',
    description:
      'Impersonators posing as Mumbai Crime Branch, CBI, or Supreme Court on Skype/WhatsApp video calls, alleging narcotics found in courier parcels.',
    disprovingTruth:
      'Indian law enforcement NEVER conducts video arrests or online judicial proceedings. There is no statutory concept called "Digital Arrest".',
    icon: Video,
    colorAccent: 'rose',
  },
  {
    title: 'UPI PIN Cashback & Refund Lures',
    badge: 'GREED / FINANCIAL FRAUD',
    badgeColor: 'warning',
    description:
      'Fake notifications claiming lottery rewards, scratch card cashbacks, or mistaken bank transfers asking for your UPI PIN to receive money.',
    disprovingTruth:
      'Entering a UPI PIN ONLY deducts money from your bank account. Receiving money NEVER requires entering your UPI PIN or scanning a QR code.',
    icon: CreditCard,
    colorAccent: 'amber',
  },
  {
    title: 'Electricity & Challan APK Trojans',
    badge: 'URGENCY / MALWARE TROJANS',
    badgeColor: 'danger',
    description:
      'Urgent SMS threatening power disconnection tonight at 9:30 PM, or pending traffic challans with links to sideload malicious Android APK files.',
    disprovingTruth:
      'State electricity DISCOMs never send APK links via personal mobile numbers. Real traffic challans are strictly hosted on echallan.parivahan.gov.in.',
    icon: Smartphone,
    colorAccent: 'cyan',
  },
];

interface ArchitecturePillar {
  title: string;
  badge: string;
  metric: string;
  body: string;
  icon: typeof Zap;
  colorAccent: 'cyan' | 'emerald' | 'indigo';
}

const PILLARS: ArchitecturePillar[] = [
  {
    title: 'Instant 60-Second Triage',
    badge: 'GOLDEN HOUR',
    metric: '<60s P99',
    body: 'Extracts critical transaction UTRs, beneficiary UPI IDs, and scam categories within seconds before the inter-bank freeze window closes.',
    icon: Zap,
    colorAccent: 'cyan',
  },
  {
    title: '100% On-Device Sovereign Privacy',
    badge: 'ZERO CLOUD',
    metric: 'Client Sandbox',
    body: 'Zero network calls. All psychological decompilation, link safety analysis, and OCR run locally inside your browser sandbox.',
    icon: Lock,
    colorAccent: 'emerald',
  },
  {
    title: 'NCRP 1930 Complaint Docket',
    badge: 'COMPLIANT',
    metric: '1-Click Kit',
    body: 'Generates a standardized incident statement formatted precisely for National Cyber Crime Reporting Portal (NCRP) operators with SHA-256 evidence.',
    icon: FileCheck2,
    colorAccent: 'indigo',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-14 sm:gap-20 pb-20">
      {/* ── 1. Hero Section: Sovereign Command Capsule ─────────────────────── */}
      <section className="flex flex-col items-start gap-6 pt-2">
        {/* Precision Status Capsule */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1 text-xs font-mono font-bold text-success shadow-xs backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          <span>100% OFFLINE · NO INTERNET NEEDED</span>
        </div>

        {/* Title & Core Proposition */}
        <div className="flex flex-col gap-3 max-w-4xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-fg sm:text-6xl sm:leading-[1.1]">
            PausePoint
            <span className="block text-2xl sm:text-4xl text-brand font-bold mt-1">
              Check Before You Get Scammed
            </span>
          </h1>
          <p className="text-base sm:text-xl text-fg-muted leading-relaxed font-sans max-w-3xl">
            A free, completely private on-device tool to check suspicious messages, disarm fake police calls, and report directly to the 1930 helpline in under 60 seconds.
          </p>
        </div>

        {/* ── "Am I Protected?" Shield Status Card ── */}
        <AwsSpotlightCard
          colorAccent="emerald"
          className="w-full max-w-4xl p-5 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 text-success border border-success/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-success uppercase tracking-wider">
                    PROTECTION ACTIVE
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-2 text-fg-muted border border-border">
                    100% On-Device · Zero Cloud
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-fg">
                  Your device is protected against fake police calls, task scams, and payment traps.
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <ButtonLink
                href="/cases"
                variant="secondary"
                size="sm"
                className="text-xs font-mono flex items-center gap-1.5"
              >
                <span>Shield Vault</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </ButtonLink>
              <ButtonLink
                href="/welcome"
                variant="quiet"
                size="sm"
                className="text-xs font-mono text-fg-muted hover:text-fg"
              >
                Setup Guide
              </ButtonLink>
            </div>
          </div>

          {/* 3 Active Defense Modules Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-surface-2/60 border border-border/60 flex items-center justify-between">
              <span className="text-fg-muted">Message Guard:</span>
              <span className="text-success font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" /> ON (SMS &amp; Chat)
              </span>
            </div>
            <div className="p-3 rounded-xl bg-surface-2/60 border border-border/60 flex items-center justify-between">
              <span className="text-fg-muted">Call Guard:</span>
              <span className="text-cyan font-bold">Fake Call Screener Active</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-2/60 border border-border/60 flex items-center justify-between">
              <span className="text-fg-muted">Money Watch:</span>
              <span className="text-brand font-bold">Debit Alert Armed</span>
            </div>
          </div>
        </AwsSpotlightCard>

        {/* ── The 4 Situational Action Doors (LAW-13 Master Parity) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1 w-full max-w-5xl">
          {/* Door 1: Check Message/Link */}
          <ButtonLink
            href="/xray"
            variant="secondary"
            latencyMode="spring-pop"
            sound="tick"
            size="lg"
            className="w-full flex items-center justify-between border-cyan/40 hover:border-cyan"
          >
            <div className="flex flex-col items-start text-left">
              <span className="text-[10px] font-mono font-bold text-cyan uppercase tracking-wider">SCANNER</span>
              <span className="text-xs font-extrabold text-fg">CHECK A MESSAGE / LINK</span>
              <span className="text-[11px] font-normal font-sans text-fg-muted">Scan SMS, WhatsApp or APK</span>
            </div>
            <Search className="w-4 h-4 ml-2 text-cyan shrink-0 group-hover:scale-110 transition-transform" />
          </ButtonLink>

          {/* Door 2: Scammer Called Me */}
          <ButtonLink
            href="/simulator?scam=digital-arrest"
            variant="cyber-outline"
            latencyMode="spring-pop"
            sound="tick"
            size="lg"
            className="w-full flex items-center justify-between border-amber/40 hover:border-amber"
          >
            <div className="flex flex-col items-start text-left">
              <span className="text-[10px] font-mono font-bold text-amber uppercase tracking-wider">CALL DEFENSE</span>
              <span className="text-xs font-extrabold text-fg">SCAMMER CALLED ME</span>
              <span className="text-[11px] font-normal font-sans text-fg-muted">Fake police &amp; Digital Arrest</span>
            </div>
            <PhoneCall className="w-4 h-4 ml-2 text-amber shrink-0 group-hover:scale-110 transition-transform" />
          </ButtonLink>

          {/* Door 3: Someone Wants Me to Pay */}
          <ButtonLink
            href="/verify"
            variant="cyber-outline"
            latencyMode="spring-pop"
            sound="tick"
            size="lg"
            className="w-full flex items-center justify-between border-brand/50 hover:border-brand"
          >
            <div className="flex flex-col items-start text-left">
              <span className="text-[10px] font-mono font-bold text-brand uppercase tracking-wider">PAYMENT BRAKE</span>
              <span className="text-xs font-extrabold text-fg">TOLD TO SEND MONEY</span>
              <span className="text-[11px] font-normal font-sans text-fg-muted">Task deposit &amp; UPI PIN trap</span>
            </div>
            <ShieldCheck className="w-4 h-4 ml-2 text-brand shrink-0 group-hover:scale-110 transition-transform" />
          </ButtonLink>

          {/* Door 4: Lost Money Emergency Action */}
          <ButtonLink
            href="/report"
            variant="cyber-danger"
            latencyMode="spring-pop"
            sound="laser"
            size="lg"
            className="w-full flex items-center justify-between"
          >
            <div className="flex flex-col items-start text-left">
              <span className="text-[10px] font-mono font-bold text-danger-fg/80 uppercase tracking-wider">EMERGENCY</span>
              <span className="text-xs font-extrabold text-danger-fg">I PAID MONEY</span>
              <span className="text-[11px] font-normal font-sans text-danger-fg/90">Call 1930 &amp; freeze bank</span>
            </div>
            <ArrowRight className="w-4 h-4 ml-2 shrink-0 group-hover:translate-x-1 transition-transform" />
          </ButtonLink>
        </div>

        {/* ── Hairline Micro-Telemetry Status Strip ── */}
        <div className="w-full flex flex-wrap items-center gap-y-2 gap-x-4 pt-1 text-xs font-mono text-fg-muted border-t border-border/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span className="text-fg font-semibold">&lt;60s P99 Triage</span>
          </div>
          <span className="opacity-30">|</span>
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-brand" />
            <span>100% Client-Side Sandbox</span>
          </div>
          <span className="opacity-30">|</span>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span>Zero Network Calls</span>
          </div>
          <span className="opacity-30">|</span>
          <div className="flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-brand" />
            <span>Bharatiya Sakshya Adhiniyam, 2023 Compliant</span>
          </div>
        </div>
      </section>

      {/* ── 2. Golden Hour Telemetry & Lien Window Curve ────────────────────── */}
      <section aria-labelledby="golden-hour-title" className="w-full">
        <GoldenHourCurveCard />
      </section>

      {/* ── 3. The Defense Hub Bento Matrix (Dedicated Routes Showcase) ──────── */}
      <section id="defense-hub" aria-labelledby="defense-hub-title" className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-brand flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
              </span>
              <span>Sovereign Citizen Capabilities</span>
            </div>
            <h2 id="defense-hub-title" className="text-2xl sm:text-4xl font-extrabold tracking-tight text-fg">
              The Defense Hub
            </h2>
            <p className="text-xs sm:text-sm text-fg-muted max-w-3xl leading-relaxed">
              Explore our complete suite of on-device cyber defense modules. Hover over any capability to experience real-time optical mouse tracking and tactile audio feedback.
            </p>
          </div>
        </div>

        {/* 6-Card Commutative Bento Grid with Mouse-Following Spotlight Physics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {DEFENSE_MODULES.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group block h-full focus:outline-none"
              >
                <AwsSpotlightCard
                  colorAccent={item.colorAccent}
                  sound={true}
                  className="flex flex-col justify-between h-full gap-5 cursor-pointer hover:-translate-y-1"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-surface-2 border border-border/80 text-fg-muted group-hover:text-fg transition-colors">
                        {item.badge}
                      </span>
                      <span className="text-xs font-mono font-bold text-brand">
                        {item.metric}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 mt-1">
                      <div className="w-9 h-9 rounded-xl bg-surface-2 border border-border/80 flex items-center justify-center text-brand shrink-0 group-hover:scale-105 transition-transform">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-base font-extrabold text-fg group-hover:text-brand transition-colors">
                        {item.title}
                      </h3>
                    </div>

                    <p className="text-xs text-fg-muted leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Card Action Link Bar */}
                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-bold text-fg group-hover:text-brand transition-colors">
                    <span>{item.actionText}</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </AwsSpotlightCard>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── 4. Commutative Indian Scam Vector Playbooks ──────────────────────── */}
      <section aria-labelledby="playbooks-title" className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-brand">
            Pre-Emptive Cognitive Immunization
          </div>
          <h2 id="playbooks-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fg">
            The Three Major Indian Scam Playbooks
          </h2>
          <p className="text-xs sm:text-sm text-fg-muted max-w-3xl leading-relaxed">
            Over 85% of citizen cyber-financial fraud in India relies on three recurring psychological attack vectors. Exposing the core statutory fact disarms the scam immediately.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SCAM_VECTORS.map((vector, idx) => {
            const Icon = vector.icon;
            return (
              <AwsSpotlightCard
                key={idx}
                colorAccent={vector.colorAccent}
                sound={true}
                className="flex flex-col justify-between gap-4"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                        vector.badgeColor === 'danger'
                          ? 'bg-danger/10 text-fg border border-danger/30 dark:bg-danger/20 dark:text-danger'
                          : 'bg-warning/10 text-fg border border-warning/30 dark:bg-warning/20 dark:text-warning'
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

                <div className="rounded-xl border border-success/30 bg-success/5 dark:bg-success/10 p-3.5 flex flex-col gap-1.5 mt-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-success">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>The Disproving Statutory Truth</span>
                  </div>
                  <p className="text-xs font-semibold text-fg leading-relaxed">
                    &ldquo;{vector.disprovingTruth}&rdquo;
                  </p>
                </div>
              </AwsSpotlightCard>
            );
          })}
        </div>
      </section>

      {/* ── 5. Zero-Cloud Sovereign Safety Architecture ──────────────────────── */}
      <section aria-labelledby="architecture-title" className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-brand">
            Sovereign Safety Architecture
          </div>
          <h2 id="architecture-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-fg">
            Built for Extreme Speed &amp; Sovereign Privacy
          </h2>
          <p className="text-xs sm:text-sm text-fg-muted max-w-3xl leading-relaxed">
            Engineered strictly with zero third-party tracking, zero external network telemetry, and instant offline survivability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <AwsSpotlightCard
                key={idx}
                colorAccent={pillar.colorAccent}
                sound={true}
                className="flex flex-col justify-between gap-4"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-surface-2 text-fg border border-border">
                      {pillar.badge}
                    </span>
                    <span className="font-mono text-xs font-bold text-fg-muted">
                      {pillar.metric}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Icon className="w-4 h-4 text-brand shrink-0" />
                    <h3 className="text-base font-bold text-fg">
                      {pillar.title}
                    </h3>
                  </div>
                  <p className="text-xs text-fg-muted leading-relaxed">
                    {pillar.body}
                  </p>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center gap-2 text-xs font-semibold text-fg-muted">
                  <ShieldCheck className="w-4 h-4 text-brand" />
                  <span>Verified Client-Side Sandbox</span>
                </div>
              </AwsSpotlightCard>
            );
          })}
        </div>
      </section>

      {/* ── 6. Institutional Footnote & Specifications ──────────────────────── */}
      <section className="rounded-2xl border border-border/80 bg-surface-2/40 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-fg-muted">
        <div>
          <span className="font-bold text-fg block">
            JAIN (Deemed-to-be University) · Team DELTA
          </span>
          <span className="leading-relaxed">
            Seva First Innovation Challenge (SFIC) 2026 · Ministry of Education / IISc Bengaluru
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <ButtonLink href="/about" variant="secondary" size="sm" sound="tick">
            <span>Explore Work &amp; Specs ↗</span>
          </ButtonLink>
          <ButtonLink href="/design" variant="quiet" size="sm" sound="tick">
            <span>Design Tokens</span>
          </ButtonLink>
        </div>
      </section>

      {/* ── 7. Real-time Refresh Rate & Layout Monitor (Dev / Debug) ── */}
      <FpsCounter />
    </div>
  );
}
