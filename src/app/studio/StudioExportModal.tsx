'use client';

// src/app/studio/StudioExportModal.tsx — Export Studio Canvas to JSON or Markdown
import React, { useState } from 'react';
import { type StudioDoc, calculateQuoteTotal } from './studio-store';
import { Button, DownloadIcon, CopyIcon, CheckIcon, CloseIcon } from '@/components/ui';
import { playSuccessChime, playHapticTick, unlockAudio } from '@/lib/audio/synthesizer';

interface StudioExportModalProps {
  doc: StudioDoc;
  isOpen: boolean;
  onClose: () => void;
}

export function StudioExportModal({ doc, isOpen, onClose }: StudioExportModalProps) {
  const [activeTab, setActiveTab] = useState<'json' | 'markdown'>('json');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const jsonContent = JSON.stringify(doc, null, 2);

  const markdownContent = `# ${doc.title}
*Exported from Studio Workspace Canvas at ${new Date().toLocaleString()}*

${doc.blocks
  .map((b) => {
    let details = '';
    if (b.type === 'quote' && b.quoteData) {
      const { tax, total } = calculateQuoteTotal(b.quoteData);
      details = `\n- Item: ${b.quoteData.itemName}\n- Qty: ${b.quoteData.quantity} × $${b.quoteData.unitPrice.toFixed(2)}\n- Tax: ${b.quoteData.taxPercent}% ($${tax.toFixed(2)})\n- **Total: $${total.toFixed(2)}**`;
    } else if (b.type === 'spec' && b.specData) {
      details = `\n- Module: \`${b.specData.module}\`\n- Contract: ${b.specData.interfaceContract}\n- SLA: ${b.specData.latencySla}\n- Status: ${b.specData.status}`;
    } else if (b.type === 'speed' && b.speedData) {
      details = `\n- Target FPS: ${b.speedData.targetFps}\n- Render Budget: ${b.speedData.renderBudgetMs}ms\n- CLS: ${b.speedData.clsScore}\n- Reflow Guard: ${b.speedData.reflowGuarded ? 'Active' : 'Off'}`;
    } else if (b.type === 'note' && b.noteData) {
      details = `\n${b.noteData.markdown}\n\nTags: ${b.noteData.tags.map((t) => `#${t}`).join(' ')}`;
    }
    return `### [${b.type.toUpperCase()}] ${b.title} (${b.category})\n${details}`;
  })
  .join('\n\n---\n\n')}`;

  const currentContent = activeTab === 'json' ? jsonContent : markdownContent;

  function handleCopy() {
    unlockAudio();
    playSuccessChime();
    void navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    unlockAudio();
    playSuccessChime();
    const ext = activeTab === 'json' ? 'json' : 'md';
    const mime = activeTab === 'json' ? 'application/json' : 'text/markdown';
    const blob = new Blob([currentContent], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-shade/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl border border-border/80 bg-surface/98 p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <DownloadIcon className="h-4 w-4 text-cyan" />
            <h2 className="text-sm font-bold text-fg">Export Studio Document</h2>
          </div>
          <Button
            variant="plain"
            size="none"
            latencyMode="none"
            type="button"
            onClick={() => {
              unlockAudio();
              playHapticTick();
              onClose();
            }}
            aria-label="Close export modal"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 text-fg-muted hover:border-border hover:bg-surface-2 hover:text-fg transition-colors cursor-pointer"
          >
            <CloseIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Tab switch */}
        <div className="mt-3 flex items-center gap-1.5">
          <Button
            variant="plain"
            size="none"
            latencyMode="none"
            type="button"
            onClick={() => {
              unlockAudio();
              playHapticTick();
              setActiveTab('json');
            }}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'json'
                ? 'border border-cyan/40 bg-cyan/15 font-bold text-cyan shadow-2xs'
                : 'border border-transparent text-fg-muted hover:bg-surface-2 hover:text-fg'
            }`}
          >
            JSON Spec
          </Button>
          <Button
            variant="plain"
            size="none"
            latencyMode="none"
            type="button"
            onClick={() => {
              unlockAudio();
              playHapticTick();
              setActiveTab('markdown');
            }}
            className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'markdown'
                ? 'border border-cyan/40 bg-cyan/15 font-bold text-cyan shadow-2xs'
                : 'border border-transparent text-fg-muted hover:bg-surface-2 hover:text-fg'
            }`}
          >
            Markdown Doc
          </Button>
        </div>

        {/* Preview Container */}
        <div className="mt-2.5 max-h-64 overflow-y-auto rounded-xl border border-border/70 bg-surface-2/70 p-3 font-mono text-[11px] text-fg-muted leading-relaxed select-text">
          <pre className="whitespace-pre-wrap">{currentContent}</pre>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
          <span className="text-[11px] font-mono text-success">
            {copied ? (
              <span className="flex items-center gap-1.5 font-bold">
                <CheckIcon className="h-3.5 w-3.5 text-success shrink-0" />
                Copied to clipboard!
              </span>
            ) : (
              'Ready for download or copy'
            )}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="plain"
              size="none"
              latencyMode="none"
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-surface-2 px-3 py-1.5 text-xs font-semibold text-fg hover:border-border hover:bg-surface transition-all cursor-pointer"
            >
              <CopyIcon className="h-3.5 w-3.5 shrink-0" />
              <span>Copy</span>
            </Button>
            <Button
              variant="plain"
              size="none"
              latencyMode="none"
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg border border-cyan/40 bg-cyan/15 px-3 py-1.5 text-xs font-bold text-cyan hover:bg-cyan/25 transition-all cursor-pointer"
            >
              <DownloadIcon className="h-3.5 w-3.5 shrink-0" />
              <span>Download</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
