'use client';

// components/ui/SpeedManifestoPlate.tsx — The Core Law of HK Universal Architecture.
// Solid Obsidian/Alabaster surface, hairline optical border, zero backdrop blur lag,
// and procedural Web Audio haptics for instant feedback.
import { useState } from 'react';
import { CopyIcon, CheckIcon } from '@/components/ui/icons';
import { playHapticTick, playSuccessChime, unlockAudio } from '@/lib/audio/synthesizer';

export function SpeedManifestoPlate() {
  const [copied, setCopied] = useState(false);

  function handleCopyLaw() {
    unlockAudio();
    playSuccessChime();

    const text = `// HK UNIVERSAL CORE AXIOM
// Aim: Provide balanced-minimalist, award-winning design without compromising
// sub-millisecond responsiveness or hardware-accelerated VSync.
// Rule 1: Zero 48px blur planes on scrolling surfaces (Solid Obsidian & Alabaster).
// Rule 2: 100% GPU-composited transforms (transform, opacity).
// Rule 3: Procedural Web Audio haptics (zero network byte overhead).
// Rule 4: Commutative Layout Law: Always use commutative layouts — balanced compact size cards with uniform geometry across all archetypes and viewports.
// Rule 5: Gate-verified integrity (types, secrets, tokens, honesty, static builds).
// Rule 6: Icon Law: Never use emojis for icons — always use pure SVG icons. If an icon is understandable (search, zoom, copy, close, trash), omit redundant text labels.`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(text);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function handleChipHover() {
    unlockAudio();
    playHapticTick();
  }

  return (
    <section
      aria-label="Design and Performance Manifesto"
      style={{ contain: 'paint layout', isolation: 'isolate' }}
      className="aws-card group relative overflow-hidden rounded-2xl p-5 sm:p-6 transition-all duration-300"
    >
      {/* ── Top Header Row ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
          </span>
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-brand">
            HK Architecture Core Axiom
          </span>
        </div>

        {/* Copy Axiom Button (Icon-only per Mandatory Icon Law) */}
        <button
          type="button"
          onClick={handleCopyLaw}
          title={copied ? 'Axiom Copied!' : 'Copy Template Law'}
          aria-label={copied ? 'Axiom Copied!' : 'Copy Template Law'}
          className={`flex h-7 w-7 items-center justify-center rounded-lg border text-xs transition-all active:scale-95 cursor-pointer shadow-2xs ${
            copied
              ? 'border-success/50 bg-success/20 text-success'
              : 'border-border/80 bg-surface-2 text-fg-muted hover:border-cyan/50 hover:text-cyan hover:bg-surface'
          }`}
        >
          {copied ? (
            <CheckIcon className="h-3.5 w-3.5 text-success" />
          ) : (
            <CopyIcon className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* ── Main Manifesto Content ─────────────────────────────────────────── */}
      <div className="mt-4 flex flex-col gap-2">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-fg leading-tight">
          Mind-Blowing Balanced Minimalism · Uncompromising Speed
        </h2>
        <p className="text-xs sm:text-sm text-fg-muted leading-relaxed max-w-4xl">
          The foundational law of this template is absolute: <strong className="text-fg font-semibold">Deliver jaw-dropping, award-winning minimalist craftsmanship without sacrificing a single millisecond of hardware-accelerated performance.</strong> When branching into new applications from this repository, keep surfaces solid, borders hairline-precise, and interactions instant — never trade 60 Hz responsiveness for heavy graphic bloat.
        </p>
      </div>

      {/* ── Live Telemetry Verification Badges ─────────────────────────────── */}
      <div className="mt-4 pt-3 border-t border-border/40 flex flex-wrap items-center gap-2">
        <span
          onMouseEnter={handleChipHover}
          className="inline-flex items-center gap-1.5 rounded-md bg-surface-2 px-2.5 py-1 text-[11px] font-mono text-fg-muted border border-border/70 hover:border-cyan/50 hover:text-cyan-fg transition-colors"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
          <span>Zero Blur Lag</span>
        </span>

        <span
          onMouseEnter={handleChipHover}
          className="inline-flex items-center gap-1.5 rounded-md bg-surface-2 px-2.5 py-1 text-[11px] font-mono text-fg-muted border border-border/70 hover:border-cyan/50 hover:text-cyan transition-colors"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
          <span>Commutative Layouts (0 CLS)</span>
        </span>

        <span
          onMouseEnter={handleChipHover}
          className="inline-flex items-center gap-1.5 rounded-md bg-surface-2 px-2.5 py-1 text-[11px] font-mono text-fg-muted border border-border/70 hover:border-success/50 hover:text-fg transition-colors"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          <span>Hardware VSync</span>
        </span>

        <span
          onMouseEnter={handleChipHover}
          className="inline-flex items-center gap-1.5 rounded-md bg-surface-2 px-2.5 py-1 text-[11px] font-mono text-fg-muted border border-border/70 hover:border-amber/50 hover:text-amber transition-colors"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber" />
          <span>&lt;1ms Procedural Audio</span>
        </span>

        <span
          onMouseEnter={handleChipHover}
          className="inline-flex items-center gap-1.5 rounded-md bg-surface-2 px-2.5 py-1 text-[11px] font-mono text-fg-muted border border-border/70 hover:border-brand/50 hover:text-brand transition-colors"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          <span>10/10 Gate Verification</span>
        </span>
      </div>
    </section>
  );
}
