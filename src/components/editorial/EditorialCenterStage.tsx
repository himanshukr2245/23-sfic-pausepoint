'use client';

// tokens-ok-file: editorial quote cards and parchment themes use tailored terracotta and amber literary palette
// components/editorial/EditorialCenterStage.tsx — Master Reading Atelier Center Stage
// Features calibrated 65ch reading measure, classical drop-cap lead paragraph,
// interactive pull-quote highlight engine, dynamic font scale/leading controls,
// zero-reflow layout containment, and instant pre-hydration CSS variable theming.
import React, { useState, useRef, useEffect } from 'react';
import {
  SparklesIcon,
  CopyIcon,
  CheckIcon,
  PinIcon,
  CloseIcon,
  BookOpenIcon,
} from '@/components/ui';
import { playHapticTick, playPop, playSuccessChime } from '@/lib/audio/synthesizer';
import {
  type EditorialEssay,
  type EditorialPullQuote,
  type TypographicSettings,
} from './editorial-store';

export interface EditorialCenterStageProps {
  essay: EditorialEssay;
  settings: TypographicSettings;
  onUpdateSettings: (updater: (prev: TypographicSettings) => TypographicSettings) => void;
  onAddMarginalia: (text: string, quoteSnippet: string) => void;
  onSendToQuoteMaker: (quote: EditorialPullQuote) => void;
  onScrollProgress?: (progress: number) => void;
}

export function EditorialCenterStage({
  essay,
  settings,
  onUpdateSettings,
  onAddMarginalia,
  onSendToQuoteMaker,
  onScrollProgress,
}: EditorialCenterStageProps) {
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [annotating, setAnnotating] = useState(false);
  const [noteText, setNoteText] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Compute font family style
  const fontFamilyClass =
    settings.typeface === 'serif'
      ? 'font-serif'
      : settings.typeface === 'georgia'
      ? 'font-serif [font-family:Georgia,Cambria,serif]'
      : 'font-mono';

  // Compute font scale class
  const fontScaleClass =
    settings.scale === 'sm'
      ? 'text-[15px]'
      : settings.scale === 'lg'
      ? 'text-[19px]'
      : 'text-[17px]';

  // Compute line height class
  const lineHeightClass =
    settings.lineHeight === 'compact'
      ? 'leading-relaxed'
      : settings.lineHeight === 'spacious'
      ? 'leading-loose'
      : 'leading-[1.78]';

  // Compute measure width
  const measureClass =
    settings.measure === 'narrow'
      ? 'max-w-[54ch]'
      : settings.measure === 'wide'
      ? 'max-w-[78ch]'
      : 'max-w-[65ch]';

  // Scroll listener to update reading progress
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || !onScrollProgress) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const totalScroll = scrollHeight - clientHeight;
      if (totalScroll <= 0) {
        onScrollProgress(100);
      } else {
        const pct = Math.min(100, Math.max(0, Math.round((scrollTop / totalScroll) * 100)));
        onScrollProgress(pct);
      }
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => el.removeEventListener('scroll', handleScroll);
  }, [essay.id, onScrollProgress]);

  // Copy quote handler
  const handleCopyQuote = async () => {
    playHapticTick();
    try {
      await navigator.clipboard.writeText(
        `${essay.pullQuote.text}\n— ${essay.pullQuote.author}, ${essay.pullQuote.work}`
      );
      setCopiedQuote(true);
      playSuccessChime();
      setTimeout(() => setCopiedQuote(false), 2000);
    } catch {
      setCopiedQuote(true);
      setTimeout(() => setCopiedQuote(false), 2000);
    }
  };

  // Submit note handler
  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    playPop();
    onAddMarginalia(noteText.trim(), essay.pullQuote.text);
    setNoteText('');
    setAnnotating(false);
  };

  return (
    <section
      className="relative flex h-[calc(100dvh-48px)] flex-1 flex-col overflow-hidden bg-[var(--ed-canvas)] text-[var(--ed-text)] select-text [contain:layout_style]"
      aria-label="Reading Atelier Center Stage"
    >
      {/* ── TOP AMBIENT OPTICAL AURA ── */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-44 w-full max-w-4xl opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(ellipse at top, var(--ed-accent) 0%, transparent 70%)',
        }}
      />

      {/* ── TYPOGRAPHIC CONTROL STRIP (h-10) ── */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-[var(--ed-border)] bg-[var(--ed-surface)] px-4 text-xs select-none z-10">
        {/* Left: Measure & Leading controls */}
        <div className="flex items-center gap-3">
          {/* Measure: Narrow / Balanced / Wide */}
          <div className="flex items-center gap-1">
            <span className="font-mono text-[10px] text-[var(--ed-text-muted)] mr-1">
              Measure:
            </span>
            {(['narrow', 'balanced', 'wide'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  playHapticTick();
                  onUpdateSettings((prev) => ({ ...prev, measure: m }));
                }}
                className={`rounded px-1.5 py-0.5 font-mono text-[10px] cursor-pointer ${
                  settings.measure === m
                    ? 'bg-[var(--ed-accent-bg)] font-semibold text-[var(--ed-accent-text)] border border-[var(--ed-accent-border)]'
                    : 'text-[var(--ed-text-muted)] hover:bg-[var(--ed-border)]/50 hover:text-[var(--ed-text)]'
                }`}
              >
                {m === 'narrow' ? '54ch' : m === 'balanced' ? '65ch' : '78ch'}
              </button>
            ))}
          </div>

          <span className="h-3 w-[1px] bg-[var(--ed-border)]" />

          {/* Scale: A- / A / A+ */}
          <div className="flex items-center gap-1">
            <span className="font-mono text-[10px] text-[var(--ed-text-muted)] mr-1">
              Scale:
            </span>
            {(['sm', 'md', 'lg'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  playHapticTick();
                  onUpdateSettings((prev) => ({ ...prev, scale: s }));
                }}
                className={`rounded px-1.5 py-0.5 font-mono text-[10px] cursor-pointer ${
                  settings.scale === s
                    ? 'bg-[var(--ed-accent-bg)] font-semibold text-[var(--ed-accent-text)] border border-[var(--ed-accent-border)]'
                    : 'text-[var(--ed-text-muted)] hover:bg-[var(--ed-border)]/50 hover:text-[var(--ed-text)]'
                }`}
              >
                {s === 'sm' ? 'A-' : s === 'md' ? 'A' : 'A+'}
              </button>
            ))}
          </div>

          <span className="h-3 w-[1px] bg-[var(--ed-border)]" />

          {/* Line Height */}
          <div className="hidden sm:flex items-center gap-1">
            <span className="font-mono text-[10px] text-[var(--ed-text-muted)] mr-1">
              Leading:
            </span>
            {(['compact', 'relaxed', 'spacious'] as const).map((lh) => (
              <button
                key={lh}
                type="button"
                onClick={() => {
                  playHapticTick();
                  onUpdateSettings((prev) => ({ ...prev, lineHeight: lh }));
                }}
                className={`rounded px-1.5 py-0.5 font-mono text-[10px] cursor-pointer ${
                  settings.lineHeight === lh
                    ? 'bg-[var(--ed-accent-bg)] font-semibold text-[var(--ed-accent-text)] border border-[var(--ed-accent-border)]'
                    : 'text-[var(--ed-text-muted)] hover:bg-[var(--ed-border)]/50 hover:text-[var(--ed-text)]'
                }`}
              >
                {lh === 'compact' ? '1.6' : lh === 'relaxed' ? '1.75' : '2.0'}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Drop Cap Toggle & Quick Annotate */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              playHapticTick();
              onUpdateSettings((prev) => ({ ...prev, dropCap: !prev.dropCap }));
            }}
            className={`flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[10px] cursor-pointer ${
              settings.dropCap
                ? 'bg-[var(--ed-accent-bg)] border border-[var(--ed-accent-border)] text-[var(--ed-accent-text)]'
                : 'text-[var(--ed-text-muted)] hover:bg-[var(--ed-border)]/50 hover:text-[var(--ed-text)]'
            }`}
          >
            <span>Drop Cap:</span>
            <span className="font-semibold">{settings.dropCap ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* ── PROSE READING STAGE ── */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-8 sm:px-8 sm:py-12 scrollbar-thin z-10"
      >
        <article className={`mx-auto ${measureClass}`}>
          {/* Issue Header Tag */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="rounded bg-[var(--ed-badge-bg)] border border-[var(--ed-badge-border)] px-2 py-0.5 font-mono text-[10px] font-semibold text-[var(--ed-badge-text)]">
                {essay.issueNo}
              </span>
              <span className="font-mono text-[11px] text-[var(--ed-text-muted)]">
                {essay.readTimeMin} min read · {essay.wordCount} words
              </span>
            </div>

            {/* Essay Title */}
            <h1
              className={`${fontFamilyClass} text-2xl sm:text-4xl font-normal tracking-tight text-[var(--ed-text)] leading-[1.18]`}
            >
              {essay.title}
            </h1>

            {/* Essay Subtitle */}
            <p className="mt-3 font-sans text-sm sm:text-base text-[var(--ed-text-muted)] leading-relaxed">
              {essay.subtitle}
            </p>

            {/* Author / Metadata strip */}
            <div className="mt-4 flex items-center justify-between border-y border-[var(--ed-border)] py-2.5 font-mono text-[11px] text-[var(--ed-text-muted)]">
              <div className="flex items-center gap-2">
                <span className="font-medium text-[var(--ed-text)]">{essay.author}</span>
                <span>·</span>
                <span>HK Universal Library v3.0</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Optical Measure:</span>
                <span className="font-semibold text-[var(--ed-accent-text)]">
                  {settings.measure === 'narrow' ? '54ch' : settings.measure === 'balanced' ? '65ch' : '78ch'}
                </span>
              </div>
            </div>
          </header>

          {/* Lead Paragraph with classical Drop Cap */}
          <section className={`mb-6 text-[var(--ed-text)] ${fontFamilyClass} ${fontScaleClass} ${lineHeightClass}`}>
            {settings.dropCap && essay.dropCapLetter ? (
              <span
                className="float-left text-5xl sm:text-6xl font-serif font-bold text-[var(--ed-accent)] leading-none pr-3 pt-1 select-none"
                aria-hidden="true"
              >
                {essay.dropCapLetter}
              </span>
            ) : null}
            <p className="inline">{essay.leadParagraph}</p>
          </section>

          {/* Body Paragraphs */}
          {essay.bodyParagraphs.map((para, i) => (
            <p
              key={i}
              className={`mb-6 text-[var(--ed-text)] opacity-90 ${fontFamilyClass} ${fontScaleClass} ${lineHeightClass}`}
            >
              {para}
            </p>
          ))}

          {/* Interactive Pull-Quote Block */}
          <figure className="my-8 rounded-xl border border-[var(--ed-border)] bg-[var(--ed-quote-bg)] p-5 shadow-md relative overflow-hidden">
            {/* Top Accent Strip */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-[var(--ed-accent)] shadow-[0_0_8px_var(--ed-accent-glow)]" />

            <div className="flex items-start gap-3">
              <div className="shrink-0 pt-0.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--ed-accent-bg)] text-[var(--ed-accent-text)]">
                  <SparklesIcon size={14} />
                </div>
              </div>

              <div className="flex-1">
                <blockquote
                  className={`text-base sm:text-lg italic text-[var(--ed-text)] leading-snug ${
                    settings.selectedQuoteStyle === 'cyber' ? 'font-mono' : 'font-serif'
                  }`}
                >
                  {essay.pullQuote.text}
                </blockquote>
                <figcaption className="mt-2.5 flex items-center justify-between font-mono text-[10px] text-[var(--ed-text-muted)]">
                  <div>
                    <span className="font-semibold text-[var(--ed-text)]">
                      {essay.pullQuote.author}
                    </span>
                    <span className="mx-1">·</span>
                    <span>{essay.pullQuote.work}</span>
                  </div>
                  <span className="rounded bg-[var(--ed-accent-bg)] border border-[var(--ed-accent-border)] px-1.5 py-0.5 text-[var(--ed-accent-text)]">
                    {essay.pullQuote.category}
                  </span>
                </figcaption>
              </div>
            </div>

            {/* Action Bar for Pull-Quote */}
            <div className="mt-4 flex items-center justify-end gap-2 border-t border-[var(--ed-border)] pt-3">
              <button
                type="button"
                onClick={() => {
                  playHapticTick();
                  setAnnotating((v) => !v);
                }}
                className="flex items-center gap-1.5 rounded-md border border-[var(--ed-border)] bg-[var(--ed-surface)] px-2.5 py-1 font-mono text-[11px] text-[var(--ed-text-muted)] hover:border-[var(--ed-accent-border)] hover:text-[var(--ed-text)] cursor-pointer"
              >
                <PinIcon size={12} />
                <span>Annotate</span>
              </button>

              <button
                type="button"
                onClick={handleCopyQuote}
                className="flex items-center gap-1.5 rounded-md border border-[var(--ed-border)] bg-[var(--ed-surface)] px-2.5 py-1 font-mono text-[11px] text-[var(--ed-text-muted)] hover:border-[var(--ed-accent-border)] hover:text-[var(--ed-text)] cursor-pointer"
              >
                {copiedQuote ? (
                  <>
                    <CheckIcon size={12} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <CopyIcon size={12} />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  playPop();
                  onSendToQuoteMaker(essay.pullQuote);
                }}
                className="flex items-center gap-1.5 rounded-md border border-[var(--ed-accent-border)] bg-[var(--ed-accent-bg)] text-[var(--ed-accent-text)] hover:bg-[var(--ed-accent)] hover:text-black font-semibold px-3 py-1 font-mono text-[11px] shadow-xs active:scale-95 transition-transform cursor-pointer"
              >
                <SparklesIcon size={12} />
                <span>Make Quote Card</span>
              </button>
            </div>

            {/* Inline Note Annotation Box */}
            {annotating && (
              <div className="mt-3 rounded-lg border border-[var(--ed-border)] bg-[var(--ed-surface)] p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] font-semibold text-[var(--ed-accent-text)]">
                    Add Marginalia Note
                  </span>
                  <button
                    type="button"
                    onClick={() => setAnnotating(false)}
                    className="text-[var(--ed-text-muted)] hover:text-[var(--ed-text)] cursor-pointer"
                  >
                    <CloseIcon size={12} />
                  </button>
                </div>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Record your observation or literary reaction..."
                  rows={2}
                  className="w-full rounded border border-[var(--ed-border)] bg-[var(--ed-canvas)] p-2 font-sans text-xs text-[var(--ed-text)] placeholder:text-[var(--ed-text-muted)]/60 focus:outline-hidden"
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAnnotating(false)}
                    className="rounded px-2.5 py-1 font-mono text-[10px] text-[var(--ed-text-muted)] hover:text-[var(--ed-text)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNote}
                    disabled={!noteText.trim()}
                    className="rounded bg-[var(--ed-accent)] text-black font-bold px-3 py-1 font-mono text-[10px] disabled:opacity-40 cursor-pointer"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            )}
          </figure>

          {/* Conclusion Paragraph */}
          <section className={`mb-8 text-[var(--ed-text)] opacity-90 ${fontFamilyClass} ${fontScaleClass} ${lineHeightClass}`}>
            <p>{essay.conclusionParagraph}</p>
          </section>

          {/* Footer Tags & Colophon */}
          <footer className="mt-12 border-t border-[var(--ed-border)] pt-6">
            <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] text-[var(--ed-text-muted)]">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-[var(--ed-text)]">Topics:</span>
                {essay.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-[var(--ed-border)] bg-[var(--ed-surface)] px-2 py-0.5 text-[var(--ed-text)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1 text-[var(--ed-accent-text)]">
                <BookOpenIcon size={12} />
                <span>End of {essay.issueNo}</span>
              </div>
            </div>
          </footer>
        </article>
      </div>
    </section>
  );
}
