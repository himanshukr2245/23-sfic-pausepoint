'use client';

import React, { useState } from 'react';
import { FileText, Copy, Check, ExternalLink, CheckCircle2, MessageSquare } from 'lucide-react';
import { extractAck, complaintDraft, type Txn, type Category } from '@/lib/engine/golden.ts';

interface AckSmsParserProps {
  txns: Txn[];
  category: Category;
}

export const AckSmsParser: React.FC<AckSmsParserProps> = ({ txns, category }) => {
  const [smsInput, setSmsInput] = useState('');
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [customStory, setCustomStory] = useState('');

  const ackNumber = extractAck(smsInput);
  const draftText = complaintDraft(txns, category, {
    story: customStory.trim() || undefined,
  });

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(draftText);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-base font-bold text-fg">Stage 2: 1930 Acknowledgement SMS & Portal Draft</h4>
          <p className="text-xs text-fg-muted">
            After calling 1930, you will receive an SMS with a 14-digit acknowledgement number (starts with 3). Paste it below to finalize your complaint.
          </p>
        </div>
      </div>

      {/* SMS Input */}
      <div>
        <textarea
          rows={3}
          value={smsInput}
          onChange={(e) => setSmsInput(e.target.value)}
          placeholder="Paste the SMS received from NCRP here (e.g. Your complaint has been registered with acknowledgement number 31810260012345...)"
          className="w-full text-xs md:text-sm rounded-xl border border-border bg-surface-2 p-3 text-fg outline-none focus:border-brand/60 focus:ring-1 focus:ring-focus font-mono"
        />
        {ackNumber && (
          <div className="mt-2 flex items-center gap-2 p-2.5 rounded-lg bg-success/10 border border-success/30 text-success text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>NCRP Acknowledgement ID Detected: <span className="font-mono tracking-wider">{ackNumber.ack}</span></span>
          </div>
        )}
      </div>

      {/* Optional narrative */}
      <div>
        <label className="text-xs font-semibold text-fg-muted uppercase tracking-wide block mb-1">
          Brief description of how the scam occurred (Optional)
        </label>
        <input
          type="text"
          value={customStory}
          onChange={(e) => setCustomStory(e.target.value)}
          placeholder="e.g. Contacted on WhatsApp offering part-time YouTube video like job"
          className="w-full text-xs rounded-xl border border-border bg-surface-2 px-3 py-2 text-fg outline-none focus:border-brand/60"
        />
      </div>

      {/* Generated Complaint Draft */}
      <div className="rounded-xl border border-border bg-surface-2/60 p-4">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/60">
          <span className="text-xs font-bold text-fg flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-brand" />
            Official Complaint Description (for cybercrime.gov.in)
          </span>
          <button
            onClick={handleCopyDraft}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-surface border border-border hover:bg-surface-3 text-fg transition-colors"
          >
            {copiedDraft ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedDraft ? 'Copied' : 'Copy Draft'}</span>
          </button>
        </div>

        <pre className="text-xs font-sans leading-relaxed text-fg-muted whitespace-pre-wrap select-text max-h-48 overflow-y-auto">
          {draftText}
        </pre>
      </div>

      {/* Action links */}
      <div className="flex items-center gap-3 pt-1">
        <a
          href="https://cybercrime.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 h-11 rounded-xl bg-brand text-brand-fg font-semibold text-xs flex items-center justify-center gap-2 hover:bg-brand/90 transition-colors shadow-xs"
        >
          <span>Finish Details on cybercrime.gov.in</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
