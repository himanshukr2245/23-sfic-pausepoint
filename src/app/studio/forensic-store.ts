// src/app/studio/forensic-store.ts — Reactive Forensic Triage Store for PausePoint Studio
'use client';

export type StudioMode = 'triage' | 'decompilation' | 'telemetry' | 'reconstruction' | 'certificate';

export interface ForensicCase {
  id: string;
  name: string;
  category: string;
  threatLevel: 'critical' | 'high' | 'medium';
  headline: string;
  rawPayload: string;
  utr?: string;
  amountInr?: number;
  payeeVpa?: string;
  payeeName?: string;
  suspectUrl?: string;
  tactics: { label: string; lever: string }[];
  timeline: { time: string; event: string; type: 'contact' | 'threat' | 'transfer' | 'escalation' }[];
}

export const PRESET_CASES: ForensicCase[] = [
  {
    id: 'case-digital-arrest',
    name: 'Mumbai Crime Branch Digital Arrest',
    category: 'Fear & Authority Impersonation',
    threatLevel: 'critical',
    headline: 'Fake Police Skype Video Warrant & Asset Verification Trap',
    rawPayload: `This is Inspector Sharma from Mumbai Crime Branch Cyber Cell. A courier parcel sent to Cambodia in your name contains 5 expired passports and 150g MDMA. Supreme Court has issued an arrest warrant. Stay on this video call, do not inform family, and transfer ₹50,000 to the RBI clearance account for asset verification. It will be returned after 30 minutes.`,
    utr: '429812345678',
    amountInr: 50000,
    payeeVpa: 'rbi.clearance.sec@okaxis',
    payeeName: 'RBI VERIFICATION CELL',
    suspectUrl: 'http://cbi-arrest-warrant.xyz/verify',
    tactics: [
      { label: 'Manufactured Authority', lever: 'Falsely claiming Crime Branch and Supreme Court jurisdiction over Skype.' },
      { label: 'Social Isolation', lever: 'Forbidding the victim from consulting family or disconnecting video call.' },
      { label: 'False Reassurance', lever: 'Promising asset verification fee will be refunded in 30 minutes.' },
    ],
    timeline: [
      { time: '14:10', event: 'Received automated IVR call claiming courier package intercepted', type: 'contact' },
      { time: '14:15', event: 'Connected to fake Skype video officer wearing police uniform', type: 'threat' },
      { time: '14:25', event: 'Shown fake Supreme Court non-bailable arrest warrant PDF', type: 'threat' },
      { time: '14:38', event: 'Coerced UPI transfer of ₹50,000 for "financial clearance"', type: 'transfer' },
      { time: '14:45', event: 'Scammers demand second transfer of ₹1,00,000 to halt CBI raid', type: 'escalation' },
    ],
  },
  {
    id: 'case-task-scam',
    name: 'Telegram Part-Time Task Scam',
    category: 'Financial / Repeat Deposit Trap',
    threatLevel: 'critical',
    headline: 'High-Commission Review Task with Frozen Balance Trap',
    rawPayload: `Congratulations! Your total task balance is ₹68,400. To release your payout to your bank account, you must pay the 18% GST clearance tax of ₹12,312 within 25 minutes, otherwise your account will be permanently frozen.`,
    utr: '512398765432',
    amountInr: 12312,
    payeeVpa: 'quicktask.pay@ybl',
    payeeName: 'GLOBAL REWARD COMMERCE',
    suspectUrl: 'https://vip-task-earning.top/dashboard',
    tactics: [
      { label: 'Sunk Cost Exploitation', lever: 'Showing a large fictional account balance to justify paying a release fee.' },
      { label: 'Artificial Time Pressure', lever: 'Threatening permanent account freeze within 25 minutes.' },
      { label: 'Fake Tax Legitimization', lever: 'Using "18% GST" terminology to simulate legal compliance.' },
    ],
    timeline: [
      { time: '10:00', event: 'Added to Telegram group offering ₹50 per Google Maps review', type: 'contact' },
      { time: '10:30', event: 'Paid small ₹150 incentive to build false trust', type: 'transfer' },
      { time: '11:45', event: 'Asked to deposit ₹3,000 for "VIP Commission Multiplier"', type: 'transfer' },
      { time: '12:20', event: 'Platform shows ₹68,400 balance but freezes withdrawal', type: 'threat' },
      { time: '12:35', event: 'Demanding ₹12,312 "clearance tax" before money is released', type: 'escalation' },
    ],
  },
  {
    id: 'case-electricity-cutoff',
    name: 'Electricity Cutoff at 9:30 PM',
    category: 'Urgency & Utility Disruption',
    threatLevel: 'high',
    headline: 'State Electricity DISCOM Impersonation with Malware Link',
    rawPayload: `Dear consumer your electricity power will be disconnected tonight at 9.30 pm from electricity office because your previous month bill was not updated. Please immediately contact our power officer 9876543210 or update bill: http://bijli-bill-update.apk`,
    suspectUrl: 'http://bijli-bill-update.apk',
    tactics: [
      { label: 'Severe Essential Deprivation', lever: 'Threatening to cut off household electricity in the dark tonight.' },
      { label: 'Malicious APK Distribution', lever: 'Providing personal mobile number and direct Android APK sideload.' },
    ],
    timeline: [
      { time: '18:30', event: 'Received urgent SMS threatening 9:30 PM power cutoff', type: 'contact' },
      { time: '18:40', event: 'Victim calls mobile number; scammer requests downloading APK', type: 'threat' },
    ],
  },
];

export interface StudioState {
  activeMode: StudioMode;
  activeCase: ForensicCase;
  customPayload: string;
  isProcessing: boolean;
  copiedDocket: boolean;
  audioFeedback: boolean;
}

const DEFAULT_STATE: StudioState = {
  activeMode: 'triage',
  activeCase: PRESET_CASES[0],
  customPayload: PRESET_CASES[0].rawPayload,
  isProcessing: false,
  copiedDocket: false,
  audioFeedback: true,
};

let state: StudioState = { ...DEFAULT_STATE };
const listeners = new Set<() => void>();

export function subscribeStudioStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getStudioStoreSnapshot(): StudioState {
  return state;
}

export function updateStudioStore(partial: Partial<StudioState>) {
  state = { ...state, ...partial };
  listeners.forEach((listener) => listener());
}

export function loadPresetCase(caseId: string) {
  const selected = PRESET_CASES.find((c) => c.id === caseId);
  if (selected) {
    updateStudioStore({
      activeCase: selected,
      customPayload: selected.rawPayload,
    });
  }
}
