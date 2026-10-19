// src/lib/engine/simulator.ts — Engine Data & Definitions for Interactive Scam Simulation Arena.
// ⛔ MANDATORY LAW: Zero JSX, pure TypeScript data engine. Usable in both SSR/Node unit tests and React components.

export interface SimulationScenario {
  id: 'task-scam' | 'digital-arrest' | 'electricity-apk' | 'upi-pin';
  tabTitle: string;
  category: string;
  severity: 'CRITICAL THREAT' | 'HIGH THREAT';
  threatScore: number;
  channel: 'Telegram' | 'WhatsApp Video' | 'SMS' | 'UPI App';
  sender: string;
  incomingMessage: string;
  iconName: 'Zap' | 'Video' | 'Smartphone' | 'CreditCard';
  pressureMetrics: {
    fear: number;
    urgency: number;
    authority: number;
    isolation: number;
  };
  complianceOutcome: {
    headline: string;
    lossAmount: string;
    escalationStep: string;
    recoveryChance: string;
    trapAnalysis: string;
  };
  pausepointIntervention: {
    headline: string;
    immutableTruth: string;
    statuteOrLaw: string;
    immediateAction: string;
    preventedLoss: string;
  };
}

export const SCENARIOS: SimulationScenario[] = [
  {
    id: 'task-scam',
    tabTitle: 'Task Scam Sunk Cost Trap',
    category: 'Investment Extortion',
    severity: 'CRITICAL THREAT',
    threatScore: 98,
    channel: 'Telegram',
    sender: 'VIP Group Admin @Aarti_Investments',
    iconName: 'Zap',
    incomingMessage:
      'VIP Task #12 Complete! Your platform balance is ₹4,82,500. To withdraw your commission, deposit 30% VIP Tax of ₹1,44,750 within 15 minutes or your account will be frozen permanently for non-compliance.',
    pressureMetrics: {
      fear: 80,
      urgency: 98,
      authority: 85,
      isolation: 90,
    },
    complianceOutcome: {
      headline: 'The Sunk-Cost Escalation Ladder Triggered',
      lossAmount: '₹1,44,750 + ₹2,88,000 Next Demand',
      escalationStep:
        '10 minutes after transfer, scammer claims: "Transaction reference code mismatched. Pay ₹2,88,000 AML clearance fee or lose full ₹4,82,500."',
      recoveryChance: '0% (Scammer operates from offshore mule network)',
      trapAnalysis:
        'Scammers exploit your invested time. The balance on screen is fake numbers in a rigged web portal. No money was ever placed in a real account.',
    },
    pausepointIntervention: {
      headline: 'Cognitive Brake Activated: Sunk Cost Trap Disarmed',
      immutableTruth:
        'Legitimate companies and employers NEVER ask you to deposit your personal money to withdraw your earned salary or commissions.',
      statuteOrLaw: 'NCRP Advisory 2026 / RBI Circular on Unauthorized Investment Portals',
      immediateAction:
        'HALT ALL TRANSFERS. Do not send ₹1. Disconnect contact immediately and dial 1930 to freeze the previous payments.',
      preventedLoss: 'Saved ₹1,44,750 from further secondary loss',
    },
  },
  {
    id: 'digital-arrest',
    tabTitle: 'Digital Arrest Video Summons',
    category: 'State Impersonation',
    severity: 'CRITICAL THREAT',
    threatScore: 99,
    channel: 'WhatsApp Video',
    sender: 'Inspector Rathore · CBI Cyber Crime Cell Mumbai',
    iconName: 'Video',
    incomingMessage:
      'OFFICIAL LEGAL NOTICE: Parcel #FDX-8829 seized at Mumbai Customs containing 3.2kg MDMA and 16 forged Indian passports in your name. Non-bailable arrest warrant issued. Deposit funds into RBI safe holding account immediately for asset verification to avoid arrest. DO NOT INFORM FAMILY OR LAWYERS.',
    pressureMetrics: {
      fear: 100,
      urgency: 95,
      authority: 100,
      isolation: 100,
    },
    complianceOutcome: {
      headline: 'Total Psychological Hostage Situation',
      lossAmount: '₹15,00,000 – ₹50,00,000 (Entire Savings)',
      escalationStep:
        'Victim is isolated in hotel room for 72 hours, shown counterfeit Supreme Court seals, and coerced into liquidating all FDs into "RBI Safe Holding Accounts".',
      recoveryChance: '<5% if delayed past 24 hours',
      trapAnalysis:
        'Complete exploitation of fear and respect for state authority. Victims obey because they are terrified of public disgrace and arrest.',
    },
    pausepointIntervention: {
      headline: 'Cognitive Brake Activated: State Impersonation Exposed',
      immutableTruth:
        'Indian courts, the CBI, and Police NEVER conduct video arrests or online judicial proceedings over Skype or WhatsApp. There is NO legal concept called Digital Arrest.',
      statuteOrLaw: 'Supreme Court of India & Ministry of Home Affairs Advisory (Jan 2026)',
      immediateAction:
        'HANG UP THE CALL IMMEDIATELY. They cannot arrest you through a smartphone screen. Dial 1930.',
      preventedLoss: 'Saved 100% of liquid assets from extortion transfer',
    },
  },
  {
    id: 'electricity-apk',
    tabTitle: 'Electricity Cutoff APK Trojan',
    category: 'Malware Trojan',
    severity: 'HIGH THREAT',
    threatScore: 94,
    channel: 'SMS',
    sender: 'Electricity Officer · +91-98441-29182',
    iconName: 'Smartphone',
    incomingMessage:
      'Dear Consumer, your electricity power will be disconnected tonight at 09:30 PM from the main grid because previous month bill was not updated. Immediately install the BESCOM_Update.apk from: http://bescom-billupdate.top/app.apk to clear status.',
    pressureMetrics: {
      fear: 90,
      urgency: 98,
      authority: 85,
      isolation: 60,
    },
    complianceOutcome: {
      headline: 'Complete Smartphone Takeover via Sideloaded Malware',
      lossAmount: 'All linked bank accounts drained via SMS interception',
      escalationStep:
        'The APK asks for RECEIVE_SMS permissions. The attacker intercepts netbanking OTPs silently while the victim sleeps, draining bank accounts.',
      recoveryChance: 'Low once bank OTPs are auto-forwarded',
      trapAnalysis:
        'Exploits fear of home darkness and utility cutoff. Disguises malware as an emergency customer support application.',
    },
    pausepointIntervention: {
      headline: 'Cognitive Brake Activated: Malware Sideloading Blocked',
      immutableTruth:
        'Electricity DISCOMs never send APK download links via SMS from personal mobile numbers. Legitimate utility bills are only paid through official DISCOM portals.',
      statuteOrLaw: 'Indian CERT-In Advisory on Android Banking Trojans',
      immediateAction:
        'DO NOT DOWNLOAD OR INSTALL THE .APK. Delete the SMS. Verify your actual bill directly at the official state electricity website.',
      preventedLoss: 'Prevented complete device compromise and credential theft',
    },
  },
  {
    id: 'upi-pin',
    tabTitle: 'UPI PIN Reverse Deduction Lure',
    category: 'Financial Phishing',
    severity: 'CRITICAL THREAT',
    threatScore: 96,
    channel: 'UPI App',
    sender: 'PhonePe Festive Desk · +91-99880-11223',
    iconName: 'CreditCard',
    incomingMessage:
      'Cashback Credited! You have received ₹5,000 festive bonus from PhonePe Merchant Services. Click to approve transfer and enter your 6-digit UPI PIN to deposit into your bank account: phonepe.rewards-claim.xyz',
    pressureMetrics: {
      fear: 20,
      urgency: 92,
      authority: 75,
      isolation: 40,
    },
    complianceOutcome: {
      headline: 'Immediate Account Debit Authorization',
      lossAmount: '₹5,000 deducted per attempt',
      escalationStep:
        'Victim enters PIN believing they are receiving money. The UPI switch immediately processes an outbound DEBIT to the fraudster handle.',
      recoveryChance: 'High if 1930 called within 60 minutes',
      trapAnalysis:
        'Exploits cognitive confusion regarding the technical direction of UPI transfers. Scammers reverse the semantics of PIN entry.',
    },
    pausepointIntervention: {
      headline: 'Cognitive Brake Activated: Fundamental UPI Law Enforced',
      immutableTruth:
        'Entering a UPI PIN ONLY deducts money from your account. Receiving money, cashback, or refunds NEVER requires entering your UPI PIN or scanning a QR code.',
      statuteOrLaw: 'National Payments Corporation of India (NPCI) Core Security Rule',
      immediateAction:
        'NEVER ENTER YOUR PIN TO RECEIVE MONEY. Close the app immediately. If PIN was entered, call 1930 within the Golden Hour.',
      preventedLoss: 'Saved account from instantaneous unauthorized debit',
    },
  },
];
