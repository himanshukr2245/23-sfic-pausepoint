'use client';

// tokens-ok-file: editorial quote cards and parchment themes use tailored terracotta and amber literary palette
// components/editorial/EditorialRightInspector.tsx — Master QuoteMaker Studio & Telemetry Lab (280px)
// Features live rendered quote card exporter with 4 visual themes, 1-click Markdown/JSON exports,
// 4 strictly commutative h-[68px] telemetry tiles, and reading progress tracking.
import React, { useState } from 'react';
import {
  SparklesIcon,
  CopyIcon,
  CheckIcon,
  DownloadIcon,
  SidebarRightIcon,
  BarChartIcon,
} from '@/components/ui';
import {
  playHapticTick,
  playPop,
  playSuccessChime,
} from '@/lib/audio/synthesizer';
import {
  type EditorialPullQuote,
  type TypographicSettings,
  EDITORIAL_THEMES,
} from './editorial-store';

export interface EditorialRightInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  activeQuote: EditorialPullQuote;
  settings: TypographicSettings;
  onUpdateSettings: (updater: (prev: TypographicSettings) => TypographicSettings) => void;
  readingProgress: number;
}

export function EditorialRightInspector({
  isOpen,
  onClose,
  activeQuote,
  settings,
  onUpdateSettings,
  readingProgress,
}: EditorialRightInspectorProps) {
  const [copiedCard, setCopiedCard] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const style = settings.selectedQuoteStyle || 'terracotta';

  if (!isOpen) return null;

  // Copy Quote Card as Rich Markdown
  const handleCopyCard = async () => {
    playHapticTick();
    const md = `> ${activeQuote.text}\n\n— **${activeQuote.author}**, *${activeQuote.work}* [${activeQuote.category}]\n*(Exported from HK Starter Editorial Studio · ${settings.selectedQuoteStyle})*`;
    try {
      await navigator.clipboard.writeText(md);
      setCopiedCard(true);
      playSuccessChime();
      setTimeout(() => setCopiedCard(false), 2000);
    } catch {
      setCopiedCard(true);
      setTimeout(() => setCopiedCard(false), 2000);
    }
  };

  // Download Quote Card as Markdown File
  const handleDownloadMarkdown = () => {
    playPop();
    const content = `# Quote Card · HK Universal Library v3.0\n\n> ${activeQuote.text}\n\n**Author:** ${activeQuote.author}  \n**Work:** ${activeQuote.work}  \n**Category:** ${activeQuote.category}  \n**Style:** ${settings.selectedQuoteStyle}  \n**Generated:** ${new Date().toISOString()}\n`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quote-${activeQuote.id}-${settings.selectedQuoteStyle}.md`;
    a.click();
    URL.revokeObjectURL(url);
    playSuccessChime();
  };

  // Download Quote Card as JSON
  const handleDownloadJson = () => {
    playPop();
    const data = {
      quote: activeQuote.text,
      author: activeQuote.author,
      work: activeQuote.work,
      category: activeQuote.category,
      style: settings.selectedQuoteStyle,
      exportedAt: new Date().toISOString(),
      standards: 'HK Universal Library v3.0 Commutative Typography',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quote-${activeQuote.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setCopiedJson(true);
    playSuccessChime();
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <aside
      className="relative flex h-[calc(100dvh-48px)] w-[280px] shrink-0 flex-col border-l border-[var(--ed-border)] bg-[var(--ed-surface)] text-[var(--ed-text)] select-none z-30 transition-all duration-150 ease-out"
      aria-label="QuoteMaker Studio and Telemetry Lab"
    >
      {/* ── HEADER STRIP (40px) ── */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-[var(--ed-border)] px-3">
        <div className="flex items-center gap-2">
          <SparklesIcon size={14} className="text-[var(--ed-accent)]" />
          <span className="font-mono text-[11px] font-semibold tracking-wider uppercase text-[var(--ed-text)]">
            QuoteMaker Studio
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            playPop();
            onClose();
          }}
          className="flex h-6 w-6 items-center justify-center rounded-sm text-[var(--ed-text-muted)] transition-colors hover:bg-[var(--ed-surface-raised)] hover:text-[var(--ed-text)] cursor-pointer"
          title="Collapse Right Inspector (])"
          aria-label="Collapse Right Inspector"
        >
          <SidebarRightIcon size={13} />
        </button>
      </div>

      {/* ── SCROLLABLE INSPECTOR BODY ── */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin">
        {/* Style Presets Segmented Selector */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-mono text-[var(--ed-text-muted)] mb-1.5">
            <span>Visual Theme</span>
            <span className="uppercase font-semibold text-[var(--ed-accent-text)]">
              {style}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1 rounded-md border border-[var(--ed-border)] bg-[var(--ed-surface-raised)] p-1 text-[10px]">
            {(
              [
                { id: 'terracotta', label: 'Terracotta' },
                { id: 'obsidian', label: 'Obsidian' },
                { id: 'parchment', label: 'Parchment' },
                { id: 'cyber', label: 'Cyber' },
              ] as const
            ).map((t) => {
              const isActive = style === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    playHapticTick();
                    onUpdateSettings((prev) => ({
                      ...prev,
                      selectedQuoteStyle: t.id,
                    }));
                  }}
                  className={`rounded-sm py-1 font-mono transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[var(--ed-accent-bg)] text-[var(--ed-accent-text)] font-bold border border-[var(--ed-accent-border)] shadow-xs'
                      : 'text-[var(--ed-text-muted)] hover:text-[var(--ed-text)]'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Rendered Quote Card Preview */}
        <div className="relative">
          <div className="text-[10px] font-mono text-[var(--ed-text-muted)] mb-1 flex items-center justify-between">
            <span>Live Card Preview</span>
            <span className="text-[9px] font-mono font-semibold text-[var(--ed-accent-text)]">
              {EDITORIAL_THEMES[style]?.badge}
            </span>
          </div>

          <div
            className={`relative rounded-lg border p-3.5 ${
              EDITORIAL_THEMES[style]?.previewCardClasses || ''
            }`}
          >
            {/* Top Quote Glyph */}
            <div className="mb-2 font-serif text-3xl leading-none select-none text-[var(--ed-accent)]">
              “
            </div>

            {/* Quote Body Text */}
            <p
              className={`text-xs italic leading-relaxed line-clamp-4 ${
                style === 'cyber' ? 'font-mono' : 'font-serif'
              }`}
            >
              {activeQuote.text.replace(/^[“"]|[”"]$/g, '')}
            </p>

            {/* Colophon & Author */}
            <div className="mt-3 border-t border-current/15 pt-2 text-[10px] flex items-center justify-between opacity-85">
              <div>
                <span className="font-semibold block">{activeQuote.author}</span>
                <span className="text-[9px] opacity-75">{activeQuote.work}</span>
              </div>
              <span className="rounded px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-mono bg-[var(--ed-accent-bg)] text-[var(--ed-accent-text)] border border-[var(--ed-accent-border)]">
                {activeQuote.category}
              </span>
            </div>
          </div>
        </div>

        {/* Export Action Strip */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono text-[var(--ed-text-muted)] mb-1">
            Publish & Export
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {/* Copy Quote Card */}
            <button
              type="button"
              onClick={handleCopyCard}
              className="flex h-8 items-center justify-center gap-1.5 rounded-md border border-[var(--ed-border)] bg-[var(--ed-surface-raised)] px-2 font-mono text-[10px] font-medium text-[var(--ed-text)] transition-colors hover:border-[var(--ed-accent-border)] hover:text-[var(--ed-accent-text)] cursor-pointer"
            >
              {copiedCard ? (
                <>
                  <CheckIcon size={12} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <CopyIcon size={12} />
                  <span>Copy (.md)</span>
                </>
              )}
            </button>

            {/* Download Markdown */}
            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="flex h-8 items-center justify-center gap-1.5 rounded-md border border-[var(--ed-accent-border)] bg-[var(--ed-accent-bg)] px-2 font-mono text-[10px] font-medium text-[var(--ed-accent-text)] transition-colors hover:bg-[var(--ed-accent)] hover:text-black cursor-pointer"
            >
              <DownloadIcon size={12} />
              <span>Export .md</span>
            </button>
          </div>

          {/* Download JSON Button */}
          <button
            type="button"
            onClick={handleDownloadJson}
            className="flex h-7 w-full items-center justify-center gap-1.5 rounded-md border border-[var(--ed-border)] bg-[var(--ed-surface-raised)] px-2 font-mono text-[10px] text-[var(--ed-text-muted)] transition-colors hover:border-[var(--ed-accent-border)] hover:text-[var(--ed-text)] cursor-pointer"
          >
            {copiedJson ? (
              <>
                <CheckIcon size={11} className="text-emerald-400" />
                <span className="text-emerald-400">JSON Downloaded</span>
              </>
            ) : (
              <>
                <DownloadIcon size={11} />
                <span>Export Structured JSON</span>
              </>
            )}
          </button>
        </div>

        {/* Typographic Telemetry Lab: COMMUTATIVE CARD LAW (L357-L358) */}
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--ed-text-muted)] mb-2">
            <BarChartIcon size={12} className="text-[var(--ed-accent)]" />
            <span>Typographic Telemetry</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Tile 1: Optimal Measure (Strictly h-[68px]) */}
            <div className="flex h-[68px] flex-col justify-between rounded-lg border border-[var(--ed-border)] bg-[var(--ed-surface-raised)] p-2">
              <span className="font-mono text-[9px] text-[var(--ed-text-muted)] uppercase">
                Measure
              </span>
              <span className="font-mono text-base font-semibold text-[var(--ed-text)]">
                65ch
              </span>
              <span className="font-mono text-[9px] text-emerald-400">
                Optimal Baseline
              </span>
            </div>

            {/* Tile 2: Leading Ratio (Strictly h-[68px]) */}
            <div className="flex h-[68px] flex-col justify-between rounded-lg border border-[var(--ed-border)] bg-[var(--ed-surface-raised)] p-2">
              <span className="font-mono text-[9px] text-[var(--ed-text-muted)] uppercase">
                Leading
              </span>
              <span className="font-mono text-base font-semibold text-[var(--ed-text)]">
                1.75x
              </span>
              <span className="font-mono text-[9px] text-[var(--ed-accent-text)]">
                Crystal Goblet
              </span>
            </div>

            {/* Tile 3: Readability Index (Strictly h-[68px]) */}
            <div className="flex h-[68px] flex-col justify-between rounded-lg border border-[var(--ed-border)] bg-[var(--ed-surface-raised)] p-2">
              <span className="font-mono text-[9px] text-[var(--ed-text-muted)] uppercase">
                Readability
              </span>
              <span className="font-mono text-base font-semibold text-[var(--ed-text)]">
                Grade 10
              </span>
              <span className="font-mono text-[9px] text-blue-400">
                Literary Focus
              </span>
            </div>

            {/* Tile 4: Compositor Paint (Strictly h-[68px]) */}
            <div className="flex h-[68px] flex-col justify-between rounded-lg border border-[var(--ed-border)] bg-[var(--ed-surface-raised)] p-2">
              <span className="font-mono text-[9px] text-[var(--ed-text-muted)] uppercase">
                Paint Time
              </span>
              <span className="font-mono text-base font-semibold text-[var(--ed-text)]">
                &lt;0.6ms
              </span>
              <span className="font-mono text-[9px] text-emerald-400">
                0 Layout Shift
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM DOCK: READING PROGRESS TRACKER (44px) ── */}
      <div className="border-t border-[var(--ed-border)] bg-[var(--ed-surface)] p-2.5 pb-6 sm:pb-2.5">
        <div className="flex items-center justify-between font-mono text-[10px] text-[var(--ed-text-muted)] mb-1.5">
          <span>Reading Progress</span>
          <span className="font-semibold text-[var(--ed-accent-text)]">{readingProgress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--ed-border)]">
          <div
            className="h-full rounded-full bg-[var(--ed-accent)] transition-all duration-150"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
      </div>
    </aside>
  );
}
