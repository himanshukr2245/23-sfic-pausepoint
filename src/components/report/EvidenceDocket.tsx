'use client';

import React, { useState } from 'react';
import { ShieldCheck, FileCheck, Download, Copy, Check, Hash } from 'lucide-react';
import { evidenceManifest, type EvidenceItem } from '@/lib/engine/golden.ts';
import { useTranslation } from '@/lib/i18n';

interface AttachedFile {
  name: string;
  bytes: number;
  sha256: string;
}

export const EvidenceDocket: React.FC = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<AttachedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFileAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    try {
      const fileBuffers = await Promise.all(
        Array.from(files).map(async (file) => ({
          name: file.name,
          data: new Uint8Array(await file.arrayBuffer()),
        }))
      );

      const manifest = await evidenceManifest(fileBuffers);
      setItems((prev) => [...prev, ...manifest.items]);
    } catch (err) {
      console.error('Evidence hashing error:', err);
    } finally {
      setIsProcessing(false);
      // Reset input value
      e.target.value = '';
    }
  };

  const getManifestText = (): string => {
    const lines = [
      '==============================================================',
      'PAUSEPOINT DIGITAL EVIDENCE MANIFEST',
      'Integrity Aid under Bharatiya Sakshya Adhiniyam, 2023',
      `Generated: ${new Date().toLocaleString('en-IN')}`,
      '==============================================================',
      '',
      ...items.map(
        (item, idx) =>
          `[Item #${idx + 1}]\nFile: ${item.name}\nSize: ${(item.bytes / 1024).toFixed(1)} KB\nSHA-256: ${item.sha256}\n`
      ),
      'NOTE: SHA-256 fingerprints were computed on-device via Web Crypto API.',
      'They prove the attached electronic files were not modified after registration.',
    ];
    return lines.join('\n');
  };

  const handleCopyManifest = () => {
    navigator.clipboard.writeText(getManifestText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadManifest = () => {
    const text = getManifestText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PausePoint_Evidence_Manifest_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-fg flex items-center gap-2">
              <span>{t.evidenceDocketTitle}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-2 text-fg-muted border border-border">
                {t.bsaIntegrityBadge}
              </span>
            </h4>
            <p className="text-xs text-fg-muted mt-0.5">
              {t.evidenceDocketSub}
            </p>
          </div>
        </div>

        <label className="cursor-pointer shrink-0 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-surface-2 hover:bg-surface-3 text-fg text-xs font-semibold border border-border transition-colors">
          <FileCheck className="w-4 h-4 text-brand" />
          <span>{isProcessing ? t.hashingInProgress : t.attachScreenshotsButton}</span>
          <input
            type="file"
            multiple
            accept="image/*,application/pdf"
            onChange={handleFileAttach}
            disabled={isProcessing}
            className="hidden"
          />
        </label>
      </div>

      {items.length > 0 ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
            {items.map((item: EvidenceItem, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-border bg-surface-2/60 p-3 flex flex-col gap-1 text-xs"
              >
                <div className="flex items-center justify-between font-semibold text-fg">
                  <span className="truncate max-w-[280px]">{item.name}</span>
                  <span className="text-fg-muted font-mono text-[11px]">
                    {(item.bytes / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-fg-muted break-all">
                  <Hash className="w-3.5 h-3.5 text-brand shrink-0" />
                  <span className="select-all">{item.sha256}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/60">
            <span className="text-xs text-fg-muted font-medium">
              {items.length} file{items.length > 1 ? 's' : ''} cryptographically sealed
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyManifest}
                className="h-8 px-2.5 rounded-lg border border-border bg-surface hover:bg-surface-2 text-fg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t.copiedFeedback : t.copyManifestButton}</span>
              </button>
              <button
                onClick={handleDownloadManifest}
                className="h-8 px-2.5 rounded-lg border border-border bg-surface hover:bg-surface-2 text-fg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-brand" />
                <span>{t.downloadDocketButton}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-dashed border-border/80 bg-surface-2/30 text-center text-xs text-fg-muted">
          {t.evidenceDocketSub}
        </div>
      )}
    </div>
  );
};
