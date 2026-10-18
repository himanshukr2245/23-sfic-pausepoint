'use client';

// components/showcase/ArchetypeAdopter.tsx — 1-Click CLI Generator Integration for Archetypes.
import { useState } from 'react';
import Link from 'next/link';
import { CheckIcon, BoltIcon } from '@/components/ui';
import { unlockAudio, playSuccessChime } from '@/lib/audio/synthesizer';

export interface ArchetypeAdopterProps {
  archetypeId:
    | 'ai'
    | 'editorial'
    | 'matrix'
    | 'cyber'
    | 'romantic'
    | 'studio'
    | string;
  archetypeName: string;
  archetypeIcon: string;
  targetApps: string;
  paintTimeEstimate: string;
}

export function ArchetypeAdopter({
  archetypeId,
  archetypeName,
  archetypeIcon,
  targetApps,
  paintTimeEstimate,
}: ArchetypeAdopterProps) {
  const [copied, setCopied] = useState(false);
  const command = `node scripts/genesis.mjs "My App" --archetype ${archetypeId} --reset-git`;

  async function handleCopy() {
    unlockAudio();
    playSuccessChime();
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // Fallback
    }
  }

  return (
    <section
      aria-label="Archetype Adoption and Genesis Action Bar"
      className="mt-12 rounded-3xl border border-border/80 bg-surface/90 p-5 sm:p-6 shadow-xl backdrop-blur-md transition-all"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left: Archetype Metadata */}
        <div className="flex items-start sm:items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-2 border border-border text-2xl shadow-inner">
            {archetypeIcon}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-extrabold text-fg tracking-tight">
                {archetypeName}
              </h3>
              <span className="rounded-full bg-cyan/15 text-cyan px-2.5 py-0.5 text-[11px] font-mono font-bold">
                {paintTimeEstimate}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-fg-muted">
              Ideal for: <strong className="text-fg">{targetApps}</strong>
            </p>
          </div>
        </div>

        {/* Right: 1-Click Genesis Command Generator */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-border/80 bg-surface-2 px-3.5 py-2 font-mono text-xs text-fg-muted overflow-x-auto shadow-inner">
            <span className="text-cyan font-bold select-none">$</span>
            <code className="whitespace-nowrap text-fg select-all">{command}</code>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm active:scale-95 ${
              copied
                ? 'bg-success text-fg font-extrabold shadow-success-soft'
                : 'bg-brand text-brand-fg hover:opacity-95'
            }`}
          >
            {copied ? (
              <>
                <CheckIcon className="h-3.5 w-3.5" />
                <span>Copied CLI Command!</span>
              </>
            ) : (
              <>
                <BoltIcon className="h-3.5 w-3.5" />
                <span>Adopt Archetype</span>
              </>
            )}
          </button>

          <Link
            href="/showcase"
            className="inline-flex items-center justify-center rounded-2xl border border-border bg-surface-2 px-4 py-2.5 text-xs font-bold text-fg-muted hover:text-fg hover:bg-surface-3 transition-colors"
          >
            All Archetypes →
          </Link>
        </div>
      </div>
    </section>
  );
}
