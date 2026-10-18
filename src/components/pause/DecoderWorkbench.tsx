'use client';

// src/components/pause/DecoderWorkbench.tsx — PausePoint 2.0 (The Manipulation Decoder)
// ⛔ MANDATORY LAW: Commutative layouts — balanced compact cards with uniform geometry across all viewports.
// ⛔ MANDATORY ICON LAW: Pure SVG vector icons only — zero emojis in UI controls.
// Desktop-responsive 12-column layout: 7-col Cognitive Disassembler + 5-col Golden Hour Cockpit & Telemetry.

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  ArrowRight,
  PhoneCall,
  Search,
  Clock,
  RotateCcw,
  Sparkles,
  FileText,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { decode, type Verdict } from '@/lib/engine/decoder.ts';

const SAMPLES = [
  {
    name: 'Digital Arrest Video Call',
    category: 'Authority / Fear',
    text: 'This is Inspector Sharma from Mumbai Crime Branch. A parcel in your name contains drugs. A warrant is issued. Stay on the video call and do not tell anyone or you will be arrested. Pay the clearance fee immediately.',
  },
  {
    name: 'Fake SBI KYC Update',
    category: 'Phishing',
    text: 'Dear customer your SBI account will be BLOCKED today. Update KYC immediately: http://sbi-kyc-update.xyz/login',
  },
  {
    name: 'RTO Challan APK Trojan',
    category: 'Malware',
    text: 'Your RTO challan of Rs 1500 is pending. Download the official mParivahan app to avoid court summons: https://rto-challan.top/mParivahan.apk',
  },
  {
    name: 'UPI PIN Cashback Trap',
    category: 'Financial',
    text: 'Congratulations! You won Rs 5000 cashback from PhonePe. Enter your UPI PIN now to receive money in your account.',
  },
  {
    name: 'Electricity Cutoff Tonight',
    category: 'Urgency',
    text: 'Dear consumer your electricity will be disconnected tonight at 9.30 pm due to pending bill. Contact electricity officer 9876543210 immediately.',
  },
  {
    name: 'College Notice (Normal)',
    category: 'Legitimate',
    text: 'Hey, the DBMS lab is shifted to room 304 tomorrow at 10 AM. Please bring your completed record books.',
  },
];

export const DecoderWorkbench: React.FC = () => {
  const [inputText, setInputText] = useState(SAMPLES[0]?.text ?? '');
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [countdown, setCountdown] = useState(10);
  const [isLocked, setIsLocked] = useState(true);
  const [copiedKit, setCopiedKit] = useState(false);
  const [goldenHourSeconds, setGoldenHourSeconds] = useState(3582); // 59m 42s

  // Golden hour active ticking countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setGoldenHourSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedGoldenHour = useMemo(() => {
    const mins = Math.floor(goldenHourSeconds / 60);
    const secs = goldenHourSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [goldenHourSeconds]);

  // Auto-decode on input change with slight debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!inputText.trim()) {
        setVerdict(null);
        return;
      }
      const res = decode(inputText);
      setVerdict(res);
      if (res.level === 'danger') {
        setCountdown(10);
        setIsLocked(true);
      } else {
        setIsLocked(false);
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [inputText]);

  // 10-Second Cognitive Pause Gate
  useEffect(() => {
    if (!isLocked || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLocked, countdown]);

  const handleCopyReportKit = () => {
    if (!verdict) return;
    const kitText = `CYBERCRIME REPORT KIT (NCRP / 1930)
Threat Level: ${verdict.level.toUpperCase()} (Score: ${verdict.score}/100)
Headline: ${verdict.headline}
Suspicious Message:
"${inputText}"
Tactics Detected: ${verdict.tactics.map((t) => t.label).join(', ')}
Matched Playbooks: ${verdict.playbooks.map((p) => p.name).join(', ')}
Suspect Links: ${verdict.links.map((l) => l.url).join(', ') || 'None'}
Generated locally by PausePoint (Citizen Cognitive Firewall)`;

    navigator.clipboard.writeText(kitText);
    setCopiedKit(true);
    setTimeout(() => setCopiedKit(false), 2000);
  };

  const handleDownloadReport = () => {
    if (!verdict) return;
    const kitText = `# NCRP / 1930 Forensic Triage Report
Generated: ${new Date().toISOString()} · 100% on-device by PausePoint

## Threat Assessment
- Threat Level: ${verdict.level.toUpperCase()}
- Threat Score: ${verdict.score}/100
- Assessment: ${verdict.headline}

## Incident Payload
\`\`\`text
${inputText}
\`\`\`

## Psychological Tactics Exposed
${verdict.tactics.map((t) => `- **${t.label}**: ${t.lever}`).join('\n')}

## Matched Indian Scam Vectors & Disproving Truths
${verdict.playbooks.map((p) => `- **${p.name}**: "${p.truth}"`).join('\n')}

## Link Forensics
${verdict.links.map((l) => `- ${l.url} (${l.official ? 'Verified Official' : `Risk: ${l.risk}/100`})`).join('\n') || '- No URLs detected'}
`;

    const blob = new Blob([kitText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pausepoint-incident-report-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full flex flex-col gap-8">
      {/* ── 1. Top Emergency Triage Rails (Commutative h-[76px] cards) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/report"
          className="h-[76px] rounded-2xl border border-danger/30 bg-danger/5 hover:bg-danger/10 px-5 py-3 flex items-center justify-between transition-all group shadow-xs"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-danger text-brand-fg flex items-center justify-center shrink-0 shadow-sm">
              <PhoneCall className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-danger uppercase tracking-wider block">Already Sent Money?</span>
              <span className="text-sm font-semibold text-fg">Start the 1930 Golden Hour Report</span>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-danger group-hover:translate-x-1.5 transition-transform" />
        </Link>

        <Link
          href="/verify"
          className="h-[76px] rounded-2xl border border-warning/30 bg-warning/5 hover:bg-warning/10 px-5 py-3 flex items-center justify-between transition-all group shadow-xs"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-warning/20 text-warning flex items-center justify-center shrink-0 shadow-sm">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-warning uppercase tracking-wider block">Demanding a Fee to Withdraw?</span>
              <span className="text-sm font-semibold text-fg">Check Repeat Deposit Brake</span>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-warning group-hover:translate-x-1.5 transition-transform" />
        </Link>
      </div>

      {/* ── 2. Master Responsive 12-Column Grid (7-col Disassembler + 5-col Command Cockpit) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── LEFT: Cognitive Disassembler (Col 1-7) ── */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Main Disassembler Input Card */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-brand/10 text-brand border border-brand/20">
                  Cognitive Firewall
                </span>
                <span className="text-xs text-fg-muted font-medium">
                  100% Client-Side Psychological X-Ray
                </span>
              </div>
              {inputText && (
                <button
                  type="button"
                  onClick={() => setInputText('')}
                  className="text-xs text-fg-muted hover:text-fg inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <h2 className="text-2xl font-extrabold text-fg tracking-tight">
              The Manipulation Decoder
            </h2>
            <p className="text-xs sm:text-sm text-fg-muted leading-relaxed">
              Paste any suspicious SMS, WhatsApp message, email, or link to expose high-pressure psychological levers and counterfeit Indian official domains.
            </p>

            {/* Input Box */}
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste message or link here..."
              className="w-full text-sm rounded-xl border border-border bg-surface-2 p-4 text-fg outline-none focus:border-brand/60 focus:ring-1 focus:ring-focus font-sans resize-y transition-colors"
            />

            {/* Real Scam Preset Selectors */}
            <div className="flex flex-col gap-2 pt-2 border-t border-border/60">
              <span className="text-[11px] font-semibold text-fg-muted uppercase tracking-wider">
                Select Real Incident Vector:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {SAMPLES.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setInputText(s.text)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      inputText === s.text
                        ? 'bg-brand text-brand-fg border-brand shadow-xs'
                        : 'bg-surface-2 hover:bg-surface-3 text-fg border-border'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Verdict Analysis Output */}
          {verdict && (
            <div className="flex flex-col gap-6">
              {/* Verdict Header Tile */}
              <div
                className={`rounded-2xl border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
                  verdict.level === 'danger'
                    ? 'border-danger/40 bg-danger/5'
                    : verdict.level === 'suspicious'
                    ? 'border-warning/40 bg-warning/5'
                    : 'border-success/40 bg-success/5'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                      verdict.level === 'danger'
                        ? 'bg-danger text-brand-fg'
                        : verdict.level === 'suspicious'
                        ? 'bg-warning text-brand-fg'
                        : 'bg-success text-brand-fg'
                    }`}
                  >
                    {verdict.level === 'danger' ? (
                      <ShieldAlert className="w-6 h-6" />
                    ) : verdict.level === 'suspicious' ? (
                      <AlertTriangle className="w-6 h-6" />
                    ) : (
                      <CheckCircle2 className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-black uppercase tracking-wider ${
                          verdict.level === 'danger'
                            ? 'bg-danger/20 text-danger'
                            : verdict.level === 'suspicious'
                            ? 'bg-warning/20 text-warning'
                            : 'bg-success/20 text-success'
                        }`}
                      >
                        {verdict.level === 'danger' ? 'STOP' : verdict.level === 'suspicious' ? 'PAUSE' : 'LOW RISK'}
                      </span>
                      <span className="text-xs font-bold text-fg-muted font-mono">
                        Threat Score: {verdict.score}/100
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-fg mt-1">
                      {verdict.headline}
                    </h3>
                  </div>
                </div>

                {/* Cognitive Pause Gate Countdown */}
                {verdict.level === 'danger' && isLocked && (
                  <div className="rounded-xl border border-danger/30 bg-surface px-4 py-3 flex items-center gap-3 shrink-0 shadow-xs">
                    <Lock className="w-5 h-5 text-danger animate-pulse" />
                    <div>
                      <div className="text-xs font-bold text-danger">Cognitive Pause Gate</div>
                      <div className="text-[11px] text-fg-muted">
                        Pause for <span className="font-mono font-bold text-danger">{countdown}s</span> before acting
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Matched Playbooks: The Single Truth That Shatters It */}
              {verdict.playbooks.length > 0 && (
                <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col gap-3">
                  <h4 className="text-xs font-bold uppercase text-fg-muted tracking-wider">
                    Matched Indian Scam Vectors &amp; Disproving Truths
                  </h4>
                  <div className="flex flex-col gap-3">
                    {verdict.playbooks.map((p, idx) => (
                      <div key={idx} className="rounded-xl border border-border/80 bg-surface-2/60 p-4">
                        <span className="text-xs font-bold text-danger uppercase tracking-wider block mb-1">
                          Pattern: {p.name}
                        </span>
                        <p className="text-xs sm:text-sm font-semibold text-fg leading-relaxed">
                          &ldquo;{p.truth}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Psychological Tactics Breakdown */}
              {verdict.tactics.length > 0 && (
                <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col gap-3">
                  <h4 className="text-xs font-bold uppercase text-fg-muted tracking-wider">
                    Psychological Manipulation Tactics Exposed ({verdict.tactics.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {verdict.tactics.map((t, idx) => (
                      <div key={idx} className="rounded-xl border border-border/80 bg-surface-2/50 p-4 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-brand uppercase tracking-wider">
                            {t.label}
                          </span>
                          {t.examples.length > 0 && (
                            <span className="text-[10px] text-fg-muted font-mono bg-surface-3 px-2 py-0.5 rounded">
                              &ldquo;{t.examples[0]}&rdquo;
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-fg leading-relaxed">{t.lever}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Link Forensics X-Ray */}
              {verdict.links.length > 0 && (
                <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col gap-3">
                  <h4 className="text-xs font-bold uppercase text-fg-muted tracking-wider flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-brand" />
                    <span>Forensic Link Decomposition ({verdict.links.length})</span>
                  </h4>
                  <div className="flex flex-col gap-2.5">
                    {verdict.links.map((l, idx) => (
                      <div key={idx} className="rounded-xl border border-border/80 bg-surface-2/60 p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-xs font-mono font-bold text-fg break-all">{l.url}</span>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              l.official ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
                            }`}
                          >
                            {l.official ? 'Verified Official Authority' : `Risk: ${l.risk}/100`}
                          </span>
                        </div>

                        {l.flags.length > 0 && (
                          <ul className="flex flex-col gap-1 pt-2 border-t border-border/60">
                            {l.flags.map((f, fi) => (
                              <li key={fi} className="text-xs text-danger flex items-start gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span>{f.why}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT: Golden Hour Incident Command Cockpit (Col 8-12) ── */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Cockpit Card 1: Live Golden Hour Triage Countdown */}
          <div className="rounded-2xl border border-danger/30 bg-surface p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-danger/10 text-danger border border-danger/20">
                Golden Window Active
              </span>
              <span className="text-xs font-mono font-semibold text-fg-muted flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-danger" />
                <span>60-Min Window</span>
              </span>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-mono font-black tracking-tight text-fg">
                {formattedGoldenHour}
              </div>
              <p className="text-xs text-fg-muted mt-1 leading-relaxed">
                Calling 1930 within the first 60 minutes gives police authorities the highest probability of freezing money in the destination beneficiary account.
              </p>
            </div>

            {/* Recovery Rate Progress Bar */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[11px] font-semibold text-fg-muted">
                <span>Account Freeze Probability</span>
                <span className="font-mono text-danger font-bold">~85% (High)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-danger via-warning to-success transition-all duration-1000"
                  style={{ width: `${Math.max(5, (goldenHourSeconds / 3600) * 100)}%` }}
                />
              </div>
            </div>

            {/* Direct Helpline Actions */}
            <div className="pt-2 flex flex-col gap-2.5">
              <Link
                href="/report"
                className="w-full h-12 rounded-xl bg-danger text-brand-fg font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition-all shadow-sm"
              >
                <PhoneCall className="w-4 h-4 fill-current" />
                <span>FILE 1930 EMERGENCY REPORT</span>
              </Link>
              <Link
                href="/verify"
                className="w-full h-11 rounded-xl border border-border bg-surface-2 hover:bg-surface-3 text-fg font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-brand" />
                <span>Verify Repeat Deposit Trap</span>
              </Link>
            </div>
          </div>

          {/* Cockpit Card 2: NCRP 1930 Cybercrime Incident Kit */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-fg uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand" />
                <span>1930 NCRP Report Kit</span>
              </h3>
              <span className="text-[11px] font-mono font-semibold text-fg-muted">
                One-Click Export
              </span>
            </div>

            <p className="text-xs text-fg-muted leading-relaxed">
              Synthesizes an immediate copy-paste statement formatted specifically for police officers at the National Cyber Crime Reporting Portal.
            </p>

            <div className="flex flex-col gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleCopyReportKit}
                className="w-full h-11 rounded-xl border border-border bg-surface-2 hover:bg-surface-3 text-fg font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {copiedKit ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                <span>{copiedKit ? 'Copied to Clipboard' : 'Copy Kit for 1930 Operator'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadReport}
                className="w-full h-11 rounded-xl border border-border/80 bg-surface hover:bg-surface-2 text-fg font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-fg-muted" />
                <span>Download Markdown Incident File</span>
              </button>
            </div>
          </div>

          {/* Cockpit Card 3: 4-Step Citizen Defense Protocol */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col gap-4">
            <h3 className="text-sm font-extrabold text-fg uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand" />
              <span>Emergency Golden Rules</span>
            </h3>

            <ul className="flex flex-col gap-3 text-xs leading-relaxed text-fg">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                <div>
                  <strong className="text-fg font-bold">Police Never Arrest Over Video Calls:</strong> Genuine law enforcement agencies never conduct digital arrests or demand money on Skype/WhatsApp.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                <div>
                  <strong className="text-fg font-bold">UPI PIN Only Sends Money:</strong> You never have to enter your UPI PIN or scan a QR code to receive money or refunds.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                <div>
                  <strong className="text-fg font-bold">Preserve All Proof:</strong> Screenshot SMS headers, transaction IDs (UTR), and beneficiary UPI IDs before blocking the scammer.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                <div>
                  <strong className="text-fg font-bold">100% On-Device Privacy:</strong> PausePoint processes every message entirely inside your browser sandbox — no server receives your data.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
