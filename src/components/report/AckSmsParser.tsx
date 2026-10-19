'use client';

import React, { useState } from 'react';
import { FileText, Copy, Check, ExternalLink, CheckCircle2, MessageSquare } from 'lucide-react';
import { extractAck, complaintDraft, type Txn, type Category } from '@/lib/engine/golden';
import { useTranslation } from '@/lib/i18n';
import { Button, ButtonLink } from '@/components/ui/Button';
import { AwsSpotlightCard } from '@/components/ui/AwsSpotlightCard';
import { unlockAudio, playPop } from '@/lib/audio/synthesizer';

interface AckSmsParserProps {
  txns: Txn[];
  category: Category;
}

export const AckSmsParser: React.FC<AckSmsParserProps> = ({ txns, category }) => {
  const { t } = useTranslation();
  const [smsInput, setSmsInput] = useState('');
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [customStory, setCustomStory] = useState('');

  const ackNumber = extractAck(smsInput);
  const draftText = complaintDraft(txns, category, {
    story: customStory.trim() || undefined,
  });

  const handleCopyDraft = () => {
    unlockAudio();
    playPop();
    navigator.clipboard.writeText(draftText);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  return (
    <AwsSpotlightCard
      colorAccent="cyan"
      sound={true}
      className="p-6 flex flex-col gap-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand border border-brand/30 flex items-center justify-center shrink-0">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-base font-extrabold text-fg tracking-tight">{t.ackSmsStageTitle}</h4>
          <p className="text-xs text-fg-muted">
            {t.ackSmsSub}
          </p>
        </div>
      </div>

      {/* SMS Input */}
      <div>
        <textarea
          rows={3}
          value={smsInput}
          onChange={(e) => setSmsInput(e.target.value)}
          placeholder={t.ackInputPlaceholder}
          className="w-full text-xs md:text-sm rounded-xl border border-border bg-surface-2 p-3 text-fg outline-none focus:border-brand/60 focus:ring-1 focus:ring-focus font-mono"
        />
        {ackNumber && (
          <div className="mt-2 flex items-center gap-2 p-2.5 rounded-lg bg-success/10 border border-success/30 text-success text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>NCRP Acknowledgement ID: <span className="font-mono tracking-wider font-bold">{ackNumber.ack}</span></span>
          </div>
        )}
      </div>

      {/* Optional narrative */}
      <div>
        <label className="text-xs font-semibold text-fg-muted uppercase tracking-wide block mb-1">
          {t.scamStoryLabel}
        </label>
        <input
          type="text"
          value={customStory}
          onChange={(e) => setCustomStory(e.target.value)}
          placeholder={t.scamStoryPlaceholder}
          className="w-full text-xs rounded-xl border border-border bg-surface-2 px-3 py-2 text-fg outline-none focus:border-brand/60"
        />
      </div>

      {/* Generated Complaint Draft */}
      <div className="rounded-xl border border-border bg-surface-2/60 p-4">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/60">
          <span className="text-xs font-bold text-fg flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-brand" />
            {t.officialComplaintLabel}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            sound="tick"
            onClick={handleCopyDraft}
            className="flex items-center gap-1.5"
          >
            {copiedDraft ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedDraft ? t.copiedFeedback : t.copyDraftButton}</span>
          </Button>
        </div>

        <pre className="text-xs font-sans leading-relaxed text-fg-muted whitespace-pre-wrap select-text max-h-48 overflow-y-auto">
          {draftText}
        </pre>
      </div>

      {/* Action links */}
      <div className="flex items-center gap-3 pt-1">
        <ButtonLink
          href="https://cybercrime.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          variant="primary"
          size="md"
          sound="laser"
          className="w-full flex items-center justify-center gap-2"
        >
          <span>{t.portalLink}</span>
          <ExternalLink className="w-4 h-4" />
        </ButtonLink>
      </div>
    </AwsSpotlightCard>
  );
};
