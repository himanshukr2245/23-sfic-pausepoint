// src/app/studio/IncidentStampCard.tsx — Court-Ready BSA 2023 Certificate & QR Card
/* tokens-ok-file: court certificate print styles and QR canvas require monochrome ink rendering for statutory evidence */
'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Printer,
  Download,
  Copy,
  Check,
  QrCode,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  buildIncidentDigest,
  formatCertificateText,
  formatDigestForQr,
  type IncidentVerificationDigest,
} from '@/lib/qr/incident-digest';
import { generateQRSvg } from '@/lib/qr/qrcode';
import { unlockAudio, playSuccessChime } from '@/lib/audio/synthesizer';

interface IncidentStampCardProps {
  incident: {
    id: string;
    name: string;
    category: string;
    rawPayload: string;
    threatLevel: 'critical' | 'high' | 'medium';
    utr?: string;
    amountInr?: number;
    payeeVpa?: string;
    payeeName?: string;
  };
}

export const IncidentStampCard: React.FC<IncidentStampCardProps> = ({ incident }) => {
  const [digest, setDigest] = useState<IncidentVerificationDigest | null>(null);
  const [qrSvg, setQrSvg] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedCert, setCopiedCert] = useState(false);

  useEffect(() => {
    let cancelled = false;

    buildIncidentDigest({
      id: incident.id,
      category: incident.category,
      rawPayload: incident.rawPayload,
      threatLevel: incident.threatLevel,
      utr: incident.utr,
      amountInr: incident.amountInr,
      payeeVpa: incident.payeeVpa,
      payeeName: incident.payeeName,
    }).then((d) => {
      if (cancelled) return;
      setDigest(d);
      const qrPayload = formatDigestForQr(d);
      const svg = generateQRSvg(qrPayload, {
        size: 160,
        margin: 1,
        darkColor: '#0a0a0a',
        lightColor: '#ffffff',
      });
      setQrSvg(svg);
    });

    return () => {
      cancelled = true;
    };
  }, [incident]);

  function handleCopyHash() {
    if (!digest) return;
    unlockAudio();
    playSuccessChime();
    navigator.clipboard.writeText(digest.sha256Hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  }

  function handleCopyCertificate() {
    if (!digest) return;
    unlockAudio();
    playSuccessChime();
    const cert = formatCertificateText(digest);
    navigator.clipboard.writeText(cert);
    setCopiedCert(true);
    setTimeout(() => setCopiedCert(false), 2000);
  }

  function handleDownloadCertificate() {
    if (!digest) return;
    unlockAudio();
    playSuccessChime();
    const cert = formatCertificateText(digest);
    const blob = new Blob([cert], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PausePoint_BSA2023_Certificate_${incident.id}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handlePrint() {
    unlockAudio();
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  if (!digest) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center text-xs text-fg-muted animate-pulse">
        Generating cryptographic BSA 2023 verification stamp on device...
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-brand/40 bg-surface p-6 shadow-md flex flex-col gap-5 print:border-black print:p-2 print:shadow-none">
      {/* ── Official Stamp Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border print:border-black">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand border border-brand/30 flex items-center justify-center shrink-0 shadow-xs print:border-black">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-brand/15 text-brand border border-brand/30 print:border-black print:text-black">
                Evidence Digest · SHA-256
              </span>
              <span className="text-[11px] font-mono text-fg-muted flex items-center gap-1">
                <Lock className="w-3 h-3 text-success" />
                Tamper-Evident Hash Sealed
              </span>
            </div>
            <h3 className="text-base font-extrabold text-fg tracking-tight print:text-black">
              Digital Evidence Summary &amp; Audit Trail
            </h3>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] font-mono text-fg-muted block uppercase">Incident ID</span>
          <span className="text-xs font-mono font-bold text-fg block print:text-black">{digest.incidentId}</span>
        </div>
      </div>

      {/* ── QR Code & Core Telemetry Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Visual QR Code Verification Box */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-surface-2/60 text-center print:border-black print:bg-white">
          <div
            className="w-36 h-36 bg-white p-2 rounded-lg border border-border shadow-xs flex items-center justify-center print:border-black"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
          <span className="mt-2 text-[10px] font-mono text-fg-muted flex items-center gap-1 print:text-black">
            <QrCode className="w-3 h-3 text-brand" />
            Scan to verify offline
          </span>
        </div>

        {/* Financial & Legal Telemetry Breakdown */}
        <div className="md:col-span-8 flex flex-col gap-2.5 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-border bg-surface-2 p-2.5 print:border-black">
              <span className="text-[10px] font-mono text-fg-muted block uppercase">Bank UTR Reference</span>
              <span className="font-mono font-bold text-fg text-sm print:text-black">
                {digest.financial.utr || 'NOT EXTRACTED'}
              </span>
            </div>
            <div className="rounded-lg border border-border bg-surface-2 p-2.5 print:border-black">
              <span className="text-[10px] font-mono text-fg-muted block uppercase">Fraud Amount (INR)</span>
              <span className="font-mono font-bold text-danger text-sm print:text-black">
                ₹{digest.financial.amountInr?.toLocaleString('en-IN') || '0'}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface-2 p-2.5 print:border-black">
            <span className="text-[10px] font-mono text-fg-muted block uppercase">Beneficiary Identity</span>
            <span className="font-mono text-xs text-fg block truncate print:text-black">
              {digest.financial.payeeName || 'Unknown'} ({digest.financial.payeeVpa || 'No VPA'})
            </span>
          </div>

          <div className="rounded-lg border border-border bg-surface-2 p-2.5 flex items-center justify-between text-[11px] print:border-black">
            <span className="text-fg-muted">Device Timestamp:</span>
            <span className="font-mono text-fg print:text-black">{digest.timestamp}</span>
          </div>
        </div>
      </div>

      {/* ── Cryptographic SHA-256 Digest Box ── */}
      <div className="rounded-xl border border-border bg-surface-2/80 p-3.5 flex flex-col gap-1.5 print:border-black">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-fg-muted">
            SHA-256 Digital Evidence Fingerprint
          </span>
          <Button
            type="button"
            variant="quiet"
            size="none"
            onClick={handleCopyHash}
            className="text-[11px] font-semibold text-brand hover:underline flex items-center gap-1 cursor-pointer print:hidden"
          >
            {copiedHash ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedHash ? 'Hash Copied' : 'Copy Hash'}</span>
          </Button>
        </div>
        <div className="font-mono text-xs text-fg font-bold break-all select-all tracking-wider p-2 rounded bg-surface border border-border/80 print:border-black print:text-black">
          {digest.sha256Hash}
        </div>
      </div>

      {/* ── Evidence Integrity Note ── */}
      <p className="text-[11px] text-fg-muted leading-relaxed border-t border-border pt-3 print:text-black print:border-black">
        <strong>Evidence Integrity Notice:</strong> This summary details the contemporaneous cryptographic hashing of cyber financial fraud evidence generated on-device via Web Crypto SHA-256. Provides a verifiable fingerprint that the underlying incident record has not been altered.
      </p>

      {/* ── Actions Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 print:hidden">
        <Button
          variant="primary"
          size="sm"
          onClick={handlePrint}
          className="flex items-center gap-2 font-bold cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Certificate</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyCertificate}
            className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            {copiedCert ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCert ? 'Copied' : 'Copy Full Statement'}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleDownloadCertificate}
            className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-brand" />
            <span>Export (.txt)</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
