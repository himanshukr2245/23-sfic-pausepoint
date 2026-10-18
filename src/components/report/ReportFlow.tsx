'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Clock,
  Phone,
  Plus,
  Trash2,
  Share2,
  FileSpreadsheet,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';
import {
  type Txn,
  type Category,
  extractTxn,
  clock,
  firstPaidAt,
  total,
  suggestCategory,
  familyAlert,
  steps,
} from '@/lib/engine/golden.ts';
import { scanReceipt } from '@/lib/ocr/worker.ts';
import { FieldCard } from './FieldCard.tsx';
import { CallScriptModal } from './CallScriptModal.tsx';
import { AckSmsParser } from './AckSmsParser.tsx';
import { MultiPaymentList } from './MultiPaymentList.tsx';
import { EvidenceDocket } from './EvidenceDocket.tsx';

const SAMPLE_GPAY = `₹15,000
Paid to RAHUL SHARMA
rahul.jobs.hr@okaxis
Completed
18 Oct 2026, 3:42 pm
UPI transaction ID
429812345678
To: RAHUL SHARMA
Google Pay • rahul.jobs.hr@okaxis
From: HIMANSHU K (State Bank of India) ••1234
Google transaction ID
CICAgOjr7aDbHw`;

const SAMPLE_SBI_SMS = `Dear UPI user A/C X7788 debited by 50000.0 on date 18Oct26 trf to CBI VERIFY CELL Refno 512398765432. If not u? call 1800111109. -SBI`;

const SAMPLE_PHONEPE = `Paid Successfully
03:30 pm on 18 Oct 2026
Paid to
QUICK EARN TASKS
taskpay77@ybl
₹2,499
Transfer Details
Transaction ID
T2610181530123456789
Debited from
XXXXXXXX4321
UTR: 612345678901`;

export const ReportFlow: React.FC = () => {
  const [txns, setTxns] = useState<Txn[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStatus, setScanStatus] = useState<string>('');
  const [directText, setDirectText] = useState<string>('');
  const [showDirectPaste, setShowDirectPaste] = useState<boolean>(false);
  const [isScriptOpen, setIsScriptOpen] = useState<boolean>(false);
  const [familyAlertCopied, setFamilyAlertCopied] = useState<boolean>(false);
  const [now, setNow] = useState<Date>(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update clock every 15 seconds
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  const activeTxn = txns[activeIndex];
  const earliestPaid = firstPaidAt(txns, now);
  const clockStatus = earliestPaid
    ? clock(earliestPaid, now)
    : { minutes: null, message: 'Reporting fast gives the best chance of putting a bank lien on the money.' };
  const isUrgent = clockStatus.minutes !== null && clockStatus.minutes <= 60;
  const category: Category = txns.length > 0 ? suggestCategory(activeTxn?.payeeName ?? '', activeTxn?.payeeVpa ?? '').category : 'job-task';
  const totalAmount = total(txns) ?? 0;
  const orderedSteps = steps(txns, category);

  // Ingestion: File drop / upload
  const handleFileUpload = async (file: File) => {
    setIsScanning(true);
    setScanProgress(10);
    setScanStatus('Preprocessing image on device...');

    try {
      const result = await scanReceipt(file, (pct, status) => {
        setScanProgress(pct);
        setScanStatus(status);
      });

      setTxns((prev) => {
        const next = [...prev, result.txn];
        setActiveIndex(next.length - 1);
        return next;
      });
    } catch (err) {
      console.error('OCR scanning error:', err);
      // Fallback: create empty txn
      const fallbackTxn: Txn = {
        channel: 'unknown',
        warnings: ['OCR could not read text from this image. Please fill in the details manually.'],
      };
      setTxns((prev) => [...prev, fallbackTxn]);
      setActiveIndex(txns.length);
    } finally {
      setIsScanning(false);
      setScanProgress(0);
      setScanStatus('');
    }
  };

  // Ingestion: Direct SMS / Receipt text
  const handleDirectTextParse = (text: string) => {
    if (!text.trim()) return;
    const txn = extractTxn(text);
    setTxns((prev) => {
      const next = [...prev, txn];
      setActiveIndex(next.length - 1);
      return next;
    });
    setDirectText('');
    setShowDirectPaste(false);
  };

  // Update a single field on the active transaction
  const updateActiveField = (field: keyof Txn, value: unknown) => {
    setTxns((prev) => {
      const copy = [...prev];
      const cur = copy[activeIndex];
      if (!cur) return prev;
      copy[activeIndex] = { ...cur, [field]: value };
      return copy;
    });
  };

  const handleShareFamilyAlert = () => {
    const alertMsg = familyAlert(txns, category);
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: 'Emergency Alert',
        text: alertMsg,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(alertMsg);
      setFamilyAlertCopied(true);
      setTimeout(() => setFamilyAlertCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 py-6 px-4">
      {/* 1. Header & Golden Hour Banner */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-danger/10 text-danger border border-danger/20">
              Emergency Action
            </span>
            <span className="text-xs text-fg-muted font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-success" />
              100% On-Device · Zero Cloud Upload
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-fg tracking-tight">
            The Golden Hour: 1930 Cyber Fraud Report
          </h1>
          <p className="text-sm text-fg-muted mt-1">
            Share your payment receipt to get everything the 1930 police helpline needs in under a minute.
          </p>
        </div>

        {/* Live Clock / Timer Pill */}
        <div className="rounded-xl border border-border bg-surface-2 p-3.5 flex items-center gap-3 shrink-0">
          <Clock className={`w-5 h-5 ${isUrgent ? 'text-danger animate-pulse' : 'text-warning'}`} />
          <div>
            <div className="text-xs font-semibold text-fg">
              {clockStatus.minutes === null ? 'Reporting Window' : `${clockStatus.minutes} min since payment`}
            </div>
            <div className="text-[11px] text-fg-muted max-w-[200px] leading-tight">
              {clockStatus.message}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Ingestion Zone (When no transactions or adding another) */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-fg flex items-center gap-2">
            <Upload className="w-4 h-4 text-brand" />
            <span>Step 1: Share Payment Screenshot or Bank SMS</span>
          </h2>
          <button
            onClick={() => setShowDirectPaste(!showDirectPaste)}
            className="text-xs font-semibold text-brand hover:underline"
          >
            {showDirectPaste ? 'Upload Screenshot instead' : 'Paste SMS Text instead'}
          </button>
        </div>

        {isScanning ? (
          <div className="p-8 rounded-xl border border-dashed border-brand/50 bg-brand/5 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full border-3 border-brand border-t-transparent animate-spin mb-3" />
            <p className="text-sm font-bold text-fg">{scanStatus || 'Analyzing receipt locally...'}</p>
            <p className="text-xs text-fg-muted mt-1">{scanProgress}% completed</p>
          </div>
        ) : showDirectPaste ? (
          <div className="flex flex-col gap-3">
            <textarea
              rows={4}
              value={directText}
              onChange={(e) => setDirectText(e.target.value)}
              placeholder="Paste Google Pay, PhonePe receipt text or bank debit SMS (e.g. Sent Rs. 2499 to QUICK EARN TASKS Ref 612345678901...)"
              className="w-full text-xs md:text-sm rounded-xl border border-border bg-surface-2 p-3 text-fg outline-none focus:border-brand/60 font-mono"
            />
            <button
              onClick={() => handleDirectTextParse(directText)}
              className="h-11 rounded-xl bg-brand text-brand-fg font-semibold text-xs flex items-center justify-center gap-2 hover:bg-brand/90 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Extract Details Now</span>
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) handleFileUpload(f);
            }}
            className="group cursor-pointer rounded-xl border-2 border-dashed border-border hover:border-brand/60 bg-surface-2/40 hover:bg-brand/5 p-8 flex flex-col items-center justify-center text-center transition-all"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileUpload(f);
              }}
            />
            <div className="w-12 h-12 rounded-xl bg-surface border border-border group-hover:scale-105 group-hover:border-brand/40 flex items-center justify-center text-fg-muted group-hover:text-brand transition-all mb-2">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-fg">Drop screenshot here or tap to select from gallery</p>
            <p className="text-xs text-fg-muted mt-1">Google Pay, PhonePe, Paytm, BHIM, or Mobile Banking screenshots</p>
          </div>
        )}

        {/* Sample chips for live judge demonstration */}
        <div className="pt-2 border-t border-border/60 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-fg-muted">Quick Test Samples:</span>
          <button
            onClick={() => handleDirectTextParse(SAMPLE_GPAY)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-2 hover:bg-surface-3 text-fg border border-border transition-colors"
          >
            Google Pay (₹15,000)
          </button>
          <button
            onClick={() => handleDirectTextParse(SAMPLE_PHONEPE)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-2 hover:bg-surface-3 text-fg border border-border transition-colors"
          >
            PhonePe Task Scam (₹2,499)
          </button>
          <button
            onClick={() => handleDirectTextParse(SAMPLE_SBI_SMS)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-2 hover:bg-surface-3 text-fg border border-border transition-colors"
          >
            SBI Digital Arrest SMS (₹50,000)
          </button>
        </div>
      </div>

      {/* 3. Multi-Payment Aggregator Ledger (When >1 transfer) */}
      {txns.length > 1 && (
        <MultiPaymentList
          txns={txns}
          activeIndex={activeIndex}
          onSelect={(idx) => setActiveIndex(idx)}
          onRemove={(idx) => {
            setTxns((prev) => prev.filter((_, i) => i !== idx));
            setActiveIndex(0);
          }}
          onAddNew={() => fileInputRef.current?.click()}
        />
      )}

      {/* 4. Active Transaction Details Review */}
      {txns.length > 0 && activeTxn && (
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col gap-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-border">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-fg">
                  {txns.length > 1 ? `Editing Transfer #${activeIndex + 1}` : 'Transaction Details Review'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-brand/10 text-brand">
                  Total: ₹{totalAmount.toLocaleString('en-IN')} ({txns.length} payment{txns.length > 1 ? 's' : ''})
                </span>
              </div>
              <p className="text-xs text-fg-muted">
                Confirm extracted fields before calling 1930. Any uncertain OCR reading is flagged in amber.
              </p>
            </div>

            {/* Multi-payment tab pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {txns.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    activeIndex === idx
                      ? 'bg-brand text-brand-fg'
                      : 'bg-surface-2 text-fg hover:bg-surface-3 border border-border'
                  }`}
                >
                  #{idx + 1} · ₹{(t.amountInr ?? 0).toLocaleString('en-IN')}
                </button>
              ))}
              <button
                onClick={() => {
                  if (fileInputRef.current) fileInputRef.current.click();
                }}
                className="p-1.5 rounded-lg border border-dashed border-border hover:border-brand text-fg-muted hover:text-brand"
                title="Add another payment (Task / Investment scam)"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Field Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FieldCard
              label="Transaction Amount (₹)"
              value={activeTxn.amountInr}
              placeholder="e.g. 15000"
              required
              type="number"
              onChange={(val) => updateActiveField('amountInr', Number(val))}
              warning={activeTxn.warnings.find((w) => w.includes('amount'))}
            />

            <FieldCard
              label="Bank UTR / Ref (12 Digits)"
              value={activeTxn.utr}
              placeholder="e.g. 429812345678"
              required
              badge="Critical for Bank Lien"
              onChange={(val) => updateActiveField('utr', val)}
              warning={activeTxn.warnings.find((w) => w.includes('UTR') || w.includes('utr'))}
              helperText="The bank-side reference that traces money across banks (not the app ID)"
            />

            <FieldCard
              label="Recipient Name / Business"
              value={activeTxn.payeeName}
              placeholder="e.g. QUICK EARN TASKS"
              onChange={(val) => updateActiveField('payeeName', val)}
            />

            <FieldCard
              label="Recipient UPI ID / VPA"
              value={activeTxn.payeeVpa}
              placeholder="e.g. taskpay77@ybl"
              onChange={(val) => updateActiveField('payeeVpa', val)}
              warning={activeTxn.warnings.find((w) => w.includes('UPI'))}
            />

            <FieldCard
              label="Date & Time of Payment"
              value={activeTxn.when}
              placeholder="e.g. 18 Oct 2026, 3:42 pm"
              onChange={(val) => updateActiveField('when', val)}
            />

            <FieldCard
              label="Bank & Payment Channel"
              value={activeTxn.bank ? `${activeTxn.bank} (${activeTxn.channel.toUpperCase()})` : activeTxn.channel.toUpperCase()}
              placeholder="e.g. SBI (UPI)"
              onChange={(val) => updateActiveField('bank', val)}
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-col md:flex-row items-center gap-3 pt-3 border-t border-border">
            <button
              onClick={() => setIsScriptOpen(true)}
              className="w-full md:flex-1 h-14 rounded-xl bg-danger text-brand-fg font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-danger/25 hover:bg-danger/90 active:scale-[0.98] transition-all"
            >
              <Phone className="w-5 h-5 fill-current" />
              <span>Call 1930 Helpline (View Script)</span>
            </button>

            <button
              onClick={handleShareFamilyAlert}
              className="w-full md:w-auto h-14 px-5 rounded-xl border border-border bg-surface hover:bg-surface-2 text-fg font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              {familyAlertCopied ? <Check className="w-4 h-4 text-success" /> : <Share2 className="w-4 h-4" />}
              <span>{familyAlertCopied ? 'Alert Copied' : 'Alert Family Member'}</span>
            </button>

            {txns.length > 1 && (
              <button
                onClick={() => {
                  setTxns((prev) => prev.filter((_, idx) => idx !== activeIndex));
                  setActiveIndex(0);
                }}
                className="p-3 text-fg-muted hover:text-danger rounded-xl hover:bg-surface-2"
                title="Remove this payment"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 5. Stage 2: Acknowledgement SMS & cybercrime.gov.in Draft */}
      {txns.length > 0 && (
        <AckSmsParser txns={txns} category={category} />
      )}

      {/* 6. Stage 3: Digital Evidence Docket (BSA 2023) */}
      {txns.length > 0 && (
        <EvidenceDocket />
      )}

      {/* 5. Ordered Emergency Steps (Playbook) */}
      {txns.length > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col gap-3">
          <h4 className="text-sm font-bold text-fg flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-brand" />
            <span>Ordered Recovery Checklist (NCRP & Bank Protocol)</span>
          </h4>
          <ol className="flex flex-col gap-2.5">
            {orderedSteps.map((s, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-fg leading-relaxed">
                <span className="w-5 h-5 rounded-full bg-surface-2 border border-border flex items-center justify-center shrink-0 font-bold text-[11px] text-fg-muted">
                  {idx + 1}
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Script Modal */}
      <CallScriptModal
        txns={txns}
        category={category}
        isOpen={isScriptOpen}
        onClose={() => setIsScriptOpen(false)}
      />
    </div>
  );
};
