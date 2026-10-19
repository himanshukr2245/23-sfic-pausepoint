// src/app/studio/StudioStage.tsx — 12-Column Responsive Workspace for Forensic Studio
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  Phone,
  FileText,
  CreditCard,
  Zap,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import {
  type StudioMode,
  type ForensicCase,
  updateStudioStore,
} from './forensic-store';
import { unlockAudio, playPop, playHapticTick } from '@/lib/audio/synthesizer';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/Input';
import { IncidentStampCard } from './IncidentStampCard';

interface StudioStageProps {
  activeMode: StudioMode;
  activeCase: ForensicCase;
  customPayload: string;
}

export function StudioStage({
  activeMode,
  activeCase,
  customPayload,
}: StudioStageProps) {
  const [inputText, setInputText] = useState(customPayload);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedStatement, setCopiedStatement] = useState(false);

  function handlePayloadChange(text: string) {
    setInputText(text);
    updateStudioStore({ customPayload: text });
  }

  function handleCopyScript() {
    unlockAudio();
    playPop();
    const script = `MY CALL SCRIPT FOR 1930 HELPLINE:
"Hello, I am reporting an urgent cyber financial fraud.
Transaction UTR: ${activeCase.utr || 'PENDING'}
Amount Lost: ₹${activeCase.amountInr?.toLocaleString('en-IN') || '0'}
Beneficiary UPI ID: ${activeCase.payeeVpa || 'N/A'}
Recipient Name: ${activeCase.payeeName || 'N/A'}
Scam Type: ${activeCase.name}
Please trigger the inter-bank lien freeze on this beneficiary account immediately under the Golden Hour protocol."`;

    navigator.clipboard.writeText(script);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  }

  function handleCopyStatement() {
    unlockAudio();
    playPop();
    const statement = `NCRP INCIDENT COMPLAINT STATEMENT:
Incident Title: ${activeCase.name}
Incident Summary:
${inputText}

Detected Psychological Attack Levers:
${activeCase.tactics.map((t) => `- ${t.label}: ${t.lever}`).join('\n')}

Transaction Forensics:
- UTR / Reference: ${activeCase.utr || 'N/A'}
- Amount: ₹${activeCase.amountInr?.toLocaleString('en-IN') || '0'}
- Beneficiary: ${activeCase.payeeName || 'N/A'} (${activeCase.payeeVpa || 'N/A'})
${activeCase.suspectUrl ? `- Suspect URL: ${activeCase.suspectUrl}` : ''}

Generated on-device via PausePoint Sovereign Citizen Cognitive Firewall.`;

    navigator.clipboard.writeText(statement);
    setCopiedStatement(true);
    setTimeout(() => setCopiedStatement(false), 2000);
  }

  const incidentData = {
    id: activeCase.id,
    name: activeCase.name,
    category: activeCase.category,
    rawPayload: inputText || activeCase.rawPayload,
    threatLevel: activeCase.threatLevel,
    utr: activeCase.utr,
    amountInr: activeCase.amountInr,
    payeeVpa: activeCase.payeeVpa,
    payeeName: activeCase.payeeName,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* ── LEFT COLUMN (7 cols): Evidence Disassembler & Incident Chain ── */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {activeMode === 'certificate' && (
          <IncidentStampCard incident={incidentData} />
        )}

        {/* Evidence Input Card */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan/15 text-cyan border border-cyan/30">
                Evidence Payload · {activeMode}
              </span>
              <span className="text-xs text-fg-muted font-medium">
                Active Case: <strong className="text-fg">{activeCase.name}</strong>
              </span>
            </div>
            <Button
              variant="quiet"
              size="sm"
              onClick={() => handlePayloadChange('')}
              className="h-7 text-xs text-fg-muted hover:text-fg px-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </Button>
          </div>

          <TextArea
            rows={5}
            value={inputText}
            onChange={(e) => handlePayloadChange(e.target.value)}
            placeholder="Paste suspicious SMS, Telegram/WhatsApp message, or OCR transcript here..."
            className="w-full text-xs sm:text-sm font-sans rounded-xl border border-border bg-surface-2 p-4 text-fg outline-none focus:border-brand/60 focus:ring-1 focus:ring-focus leading-relaxed"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border/60 text-xs">
            <span className="text-fg-muted font-mono text-[11px]">
              Category: <strong className="text-fg">{activeCase.category}</strong>
            </span>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-danger/15 text-danger border border-danger/25">
              Threat Level: {activeCase.threatLevel.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Cognitive Manipulation Tactics Disassembler */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-fg uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand" />
              <span>Psychological Levers Exposed</span>
            </h3>
            <span className="text-[11px] font-mono text-fg-muted">
              {activeCase.tactics.length} Levers Identified
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {activeCase.tactics.map((tactic, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-border/70 bg-surface-2/60 p-3.5 flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand uppercase tracking-wider">
                    {tactic.label}
                  </span>
                  <span className="text-[10px] font-mono text-fg-muted">Vector #{idx + 1}</span>
                </div>
                <p className="text-xs text-fg leading-relaxed">
                  {tactic.lever}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Incident Timeline Chain */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-fg uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan" />
              <span>Incident Sequence Timeline</span>
            </h3>
            <span className="text-[11px] font-mono text-fg-muted">
              {activeCase.timeline.length} Recorded Steps
            </span>
          </div>

          <div className="relative pl-6 border-l-2 border-border/80 flex flex-col gap-5 py-2">
            {activeCase.timeline.map((step, idx) => (
              <div key={idx} className="relative flex flex-col gap-1">
                <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-surface border-2 border-brand flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-cyan bg-cyan/10 px-2 py-0.5 rounded">
                    {step.time}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-fg-muted">
                    [{step.type}]
                  </span>
                </div>
                <p className="text-xs text-fg leading-relaxed">
                  {step.event}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT COLUMN (5 cols): Financial Lien & 1930 Rescue Cockpit ── */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        {/* Financial Lien Telemetry */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-fg uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand" />
              <span>Financial Lien Telemetry</span>
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-warning/15 text-warning border border-warning/25">
              Golden Hour Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="rounded-xl border border-border bg-surface-2 p-3 flex flex-col gap-1">
              <span className="text-[10px] text-fg-muted uppercase">Amount Lost</span>
              <span className="text-lg font-extrabold text-danger">
                ₹{activeCase.amountInr?.toLocaleString('en-IN') || '0'}
              </span>
            </div>

            <div className="rounded-xl border border-border bg-surface-2 p-3 flex flex-col gap-1">
              <span className="text-[10px] text-fg-muted uppercase">Bank UTR Ref</span>
              <span className="text-xs font-bold text-fg truncate">
                {activeCase.utr || 'Pending Receipt'}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-2 p-3 flex flex-col gap-1 text-xs">
            <span className="text-[10px] font-mono text-fg-muted uppercase">Beneficiary UPI ID</span>
            <span className="font-mono font-semibold text-fg truncate">
              {activeCase.payeeVpa || 'None Detected'}
            </span>
          </div>

          {activeCase.suspectUrl && (
            <div className="rounded-xl border border-danger/30 bg-danger/5 p-3 flex items-center justify-between gap-2 text-xs">
              <div className="truncate">
                <span className="text-[10px] font-bold uppercase text-danger block">Counterfeit Domain</span>
                <span className="font-mono text-xs text-fg truncate block">{activeCase.suspectUrl}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-danger text-brand-fg shrink-0">
                BLOCKED
              </span>
            </div>
          )}
        </div>

        {/* 1-Click 1930 Call Script Action */}
        <div className="rounded-2xl border border-danger/30 bg-danger/5 p-6 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-danger text-brand-fg flex items-center justify-center shrink-0 shadow-md">
              <Phone className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-fg">
                Emergency 1930 Call Script
              </h3>
              <p className="text-xs text-fg-muted mt-0.5">
                Exact words to speak to the police helpline operator to freeze the account.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-danger/20 bg-surface/90 p-3.5 text-xs font-mono text-fg leading-relaxed">
            &ldquo;Hello, I am reporting an urgent cyber financial fraud. Transaction UTR is <strong>{activeCase.utr || '429812345678'}</strong> for ₹{activeCase.amountInr?.toLocaleString('en-IN') || '50,000'}. Please trigger the inter-bank lien freeze on this beneficiary account immediately.&rdquo;
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="danger"
              size="md"
              onClick={handleCopyScript}
              className="w-full text-xs font-bold flex items-center justify-center gap-2"
            >
              {copiedScript ? <Check className="w-4 h-4 text-brand-fg" /> : <Copy className="w-4 h-4" />}
              <span>{copiedScript ? 'Copied' : 'Copy Call Script'}</span>
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={handleCopyStatement}
              className="w-full text-xs font-semibold flex items-center justify-center gap-2"
            >
              {copiedStatement ? <Check className="w-4 h-4 text-success" /> : <FileText className="w-4 h-4" />}
              <span>{copiedStatement ? 'Copied' : 'Copy NCRP Draft'}</span>
            </Button>
          </div>
        </div>

        {/* Section 63 BSA 2023 Electronic Evidence Stamp Teaser */}
        {activeMode !== 'certificate' && (
          <div className="rounded-2xl border border-cyan/30 bg-cyan/5 p-5 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-cyan shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-fg">Court Certificate (BSA 2023)</h4>
                <p className="text-[11px] text-fg-muted">Sec 63 Bharatiya Sakshya Adhiniyam certified hash & QR code.</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                unlockAudio();
                playHapticTick();
                updateStudioStore({ activeMode: 'certificate' });
              }}
              className="w-full text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan" />
              <span>Inspect & Print Court Certificate</span>
            </Button>
          </div>
        )}

        {/* Quick Route to Specialized Flows */}
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col gap-3">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-fg-muted">
            Specialized Crisis Interventions
          </h4>

          <Link
            href="/report"
            className="p-3.5 rounded-xl border border-border hover:border-danger/40 bg-surface-2/60 hover:bg-surface-2 flex items-center justify-between text-xs font-semibold text-fg transition-all group"
          >
            <span>Launch Full 1930 Step-by-Step Report</span>
            <span className="text-danger group-hover:translate-x-1 transition-transform">→</span>
          </Link>

          <Link
            href="/verify"
            className="p-3.5 rounded-xl border border-border hover:border-warning/40 bg-surface-2/60 hover:bg-surface-2 flex items-center justify-between text-xs font-semibold text-fg transition-all group"
          >
            <span>Before You Pay Again (Deposit Brake)</span>
            <span className="text-warning group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
