'use client';

// app/welcome/page.tsx — PausePoint Shield Onboarding & Permissions Walkthrough.
// Single-permission-per-screen calm onboarding with zero network disclosure and OEM battery optimization guides.
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AwsSpotlightCard } from '@/components/ui/AwsSpotlightCard';
import { Button } from '@/components/ui/Button';
import { playHapticTick, unlockAudio } from '@/lib/audio/synthesizer';
import {
  ShieldCheck,
  Bell,
  PhoneCall,
  MessageSquare,
  Eye,
  BatteryCharging,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Lock,
} from 'lucide-react';

interface OnboardingStep {
  step: number;
  badge: string;
  title: string;
  headline: string;
  explanation: string;
  neverDoes: string;
  icon: typeof ShieldCheck;
  actionLabel: string;
  secondaryLabel?: string;
}

const STEPS: OnboardingStep[] = [
  {
    step: 1,
    badge: 'THE PRIVACY PROMISE',
    title: 'Zero-Internet Architecture',
    headline: 'PausePoint checks messages and calls on this phone. It has no internet permission, so nothing can leave.',
    explanation: 'Unlike commercial anti-spam apps that upload your contacts and messages to cloud servers, PausePoint has no network access. Everything is evaluated locally in under 50 milliseconds.',
    neverDoes: 'Never connects to any server, never uploads messages, never creates an account.',
    icon: Lock,
    actionLabel: 'I Understand, Let’s Begin',
  },
  {
    step: 2,
    badge: 'ALERT NOTIFICATIONS',
    title: 'Sub-Second Threat Alerts',
    headline: 'Receive calm, immediate warnings the moment a high-risk scam message arrives.',
    explanation: 'Android requires notification permission so PausePoint can deliver high-priority threat warnings and the 1930 Golden Hour emergency dialer trigger.',
    neverDoes: 'Never sends promotional ads, promotional summaries, or loud ringtones.',
    icon: Bell,
    actionLabel: 'Grant Notification Access',
  },
  {
    step: 3,
    badge: 'CALL GUARD',
    title: 'TRAI 1600 Series Call Screening',
    headline: 'Screen unknown callers before the phone rings using TRAI’s official BFSI 1600 mandate.',
    explanation: 'Commercial banks in India must call from 1600 series numbers. PausePoint verifies unknown incoming mobile numbers claiming to be banks, police, or courier companies.',
    neverDoes: 'Never listens to call audio, never records calls, never accesses call history.',
    icon: PhoneCall,
    actionLabel: 'Set as Call Screening App',
  },
  {
    step: 4,
    badge: 'SMS GUARD (SHIELD EDITION)',
    title: 'New Incoming SMS Scanner',
    headline: 'Automatically scans each newly arriving SMS for bank imposter headers and APK malware.',
    explanation: 'Only newly arrived SMS broadcasts are scanned. Safe messages are forgotten instantly; flagged messages stay 7 days on your phone for verification.',
    neverDoes: 'Never reads your past inbox history, never asks for READ_SMS, never reads contacts.',
    icon: MessageSquare,
    actionLabel: 'Enable Incoming SMS Check',
  },
  {
    step: 5,
    badge: 'CHAT GUARD (SHIELD EDITION)',
    title: 'WhatsApp & Telegram Notification Scanner',
    headline: 'Catches task scams, part-time job lures, and trading group traps directly in notification text.',
    explanation: 'Most financial scams now occur on WhatsApp and Telegram. Notification access allows PausePoint to flag scam tactics before you open the chat.',
    neverDoes: 'Never reads your full chat conversations, never monitors personal messaging apps without notifications.',
    icon: Eye,
    actionLabel: 'Enable Chat Notification Guard',
  },
  {
    step: 6,
    badge: 'BACKGROUND RELIABILITY',
    title: 'Battery Optimization Whitelist',
    headline: 'Prevent Xiaomi, Samsung, Oppo, Vivo, and Realme from killing PausePoint in the background.',
    explanation: 'Aggressive Android battery savers terminate background security listeners. Disabling battery optimization ensures PausePoint is alive when a bank debit or scam call arrives.',
    neverDoes: 'Uses negligible battery (<1% per day) because it only runs when a message or call arrives.',
    icon: BatteryCharging,
    actionLabel: 'Exclude from Battery Optimization',
  },
  {
    step: 7,
    badge: 'FAMILY DEFENSE (OPTIONAL)',
    title: 'Trusted Family Contact',
    headline: 'Designate one family member or advisor who can be alerted with 1-tap if you are targeted.',
    explanation: 'Scammers rely on isolation and secrecy. Setting a trusted contact allows you to send an instant "Tell Family" alert to prevent impulsive payments.',
    neverDoes: 'Never contacts your family automatically. You always review and tap send.',
    icon: Users,
    actionLabel: 'Complete Setup & Enter Shield',
  },
];

export default function WelcomePage() {
  const router = useRouter();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const currentStep = STEPS[currentStepIdx];

  function handleNext() {
    unlockAudio();
    playHapticTick();
    if (currentStepIdx < STEPS.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    } else {
      router.push('/');
    }
  }

  function handleBack() {
    unlockAudio();
    playHapticTick();
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
    }
  }

  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-6 py-6 pb-20">
      {/* ── Progress Indicator ── */}
      <div className="flex items-center justify-between text-xs font-mono text-fg-muted pb-2">
        <span>STEP {currentStep.step} OF {STEPS.length}</span>
        <span>{Math.round(((currentStep.step) / STEPS.length) * 100)}% COMPLETE</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden border border-border/60">
        <div
          className="h-full bg-cyan transition-all duration-300 ease-out"
          style={{ width: `${(currentStep.step / STEPS.length) * 100}%` }}
        />
      </div>

      {/* ── Main Onboarding Card ── */}
      <AwsSpotlightCard
        colorAccent="cyan"
        className="p-6 sm:p-8 flex flex-col gap-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan/10 text-cyan border border-cyan/30 flex items-center justify-center shrink-0">
            <currentStep.icon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan">
              {currentStep.badge}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-fg tracking-tight">
              {currentStep.title}
            </h2>
          </div>
        </div>

        <div className="rounded-xl bg-surface-2 p-4 border border-border/80">
          <p className="text-sm sm:text-base font-semibold text-fg leading-relaxed">
            {currentStep.headline}
          </p>
        </div>

        <p className="text-xs sm:text-sm text-fg-muted leading-relaxed font-sans">
          {currentStep.explanation}
        </p>

        {/* ── What PausePoint Never Does Guarantee ── */}
        <div className="rounded-xl border border-success/30 bg-success/5 p-3.5 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
          <div className="text-xs text-fg leading-snug">
            <strong className="text-success font-mono uppercase">Privacy Guarantee: </strong>
            {currentStep.neverDoes}
          </div>
        </div>

        {/* ── Actions Bar ── */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-border">
          {currentStepIdx > 0 ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleBack}
              className="text-xs font-mono flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Button>
          ) : (
            <div />
          )}

          <Button
            variant="primary"
            size="md"
            onClick={handleNext}
            className="text-xs font-mono font-bold flex items-center gap-2 cursor-pointer"
          >
            <span>{currentStep.actionLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </AwsSpotlightCard>
    </div>
  );
}
