'use client';

// components/aws/AwsFeatureCard.tsx — Ultra-fast AWS Precision Architecture Card (HK Universal Library v3).
// Zero-blur solid surface, 1.5px hairline optical border, hardware-accelerated rendering,
// and procedural Web Audio haptic feedback.
import { useState, useRef } from 'react';
import { playHapticTick, playSuccessChime, unlockAudio } from '@/lib/audio/synthesizer';

export interface FeatureCardData {
  title: string;
  badge: string;
  body: string;
  tag?: string;
  metric?: string;
  details?: string;
}

export interface AwsFeatureCardProps {
  feature: FeatureCardData;
  index?: number;
}

/* ── Lightweight Inline SVG Icons ────────────────────────────────────────── */
function IconStar({ isFilled = false, className = '' }: { isFilled?: boolean; className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={isFilled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function IconCopy({ className = '' }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function IconCheck({ className = '' }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function AwsFeatureCard({ feature, index }: AwsFeatureCardProps) {
  const [isPinned, setIsPinned] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLLIElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLLIElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  }

  function handleTogglePin(e: React.MouseEvent) {
    e.stopPropagation();
    unlockAudio();
    playHapticTick();
    setIsPinned((prev) => !prev);
  }

  function handleCopyBlueprint(e: React.MouseEvent) {
    e.stopPropagation();
    unlockAudio();
    playSuccessChime();

    const blueprintSnippet = `// HK-CORE-v3 Architecture: ${feature.title}\n// Badge: ${feature.badge}\n// Details: ${feature.body}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(blueprintSnippet);
    }

    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  }

  return (
    <li
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animationDelay: index !== undefined ? `${Math.min(index, 6) * 40}ms` : undefined,
        contain: 'paint layout',
        isolation: 'isolate',
      }}
      className={`aws-card-entrance spotlight-card spotlight-cyan group relative overflow-hidden flex flex-col justify-between rounded-2xl p-5 sm:p-5.5 text-left select-none transition-all duration-300 min-h-[185px] focus-within:ring-2 focus-within:ring-focus ${
        isHovered ? 'aws-card-aurora' : 'aws-card'
      }`}
    >
      {/* Specular Top Hairline Rim Highlight */}
      <div className="pointer-events-none absolute inset-x-8 top-0 h-[1.5px] rounded-full bg-gradient-to-r from-transparent via-fg-muted/20 to-transparent opacity-80 z-10" />

      {/* ── Top Header Row: Monospace Badge + Star Pin ───────────────────────── */}
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2">
          {/* Architectural Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-2 px-2.5 py-0.5 text-[10.5px] font-mono font-bold tracking-tight text-brand border border-border/70">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan" />
              {feature.badge}
            </span>
            {feature.metric && (
              <span className="hidden sm:inline-flex items-center text-[10px] font-mono text-fg-muted font-medium">
                {feature.metric}
              </span>
            )}
          </div>

          {/* Pin/Favorite Bookmark Button */}
          <button
            type="button"
            onClick={handleTogglePin}
            title={isPinned ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={isPinned ? `Remove ${feature.title} from favorites` : `Add ${feature.title} to favorites`}
            className={`relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-lg transition-all cursor-pointer ${
              isPinned
                ? 'text-amber scale-110 bg-amber/10'
                : 'text-fg-muted/60 hover:text-fg hover:bg-surface-2 opacity-80 group-hover:opacity-100'
            }`}
          >
            <IconStar isFilled={isPinned} className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Card Title */}
        <h3 className="mt-2.5 text-base sm:text-lg font-bold tracking-tight text-fg group-hover:text-cyan-fg transition-colors leading-snug">
          {feature.title}
        </h3>

        {/* Description Body */}
        <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-fg-muted">
          {feature.body}
        </p>
      </div>

      {/* ── Bottom Status & Quick Blueprint Action Bar ──────────────────────── */}
      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between gap-2 text-[11px] font-mono text-fg-muted">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-fg/80">HK-CORE-v3</span>
          <span className="inline-flex items-center gap-1 text-success font-semibold">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Active
          </span>
        </div>

        {/* Quick Copy Blueprint Button */}
        <button
          type="button"
          onClick={handleCopyBlueprint}
          title={isCopied ? 'Copied to clipboard' : 'Copy architecture snippet'}
          aria-label={`Copy architecture blueprint for ${feature.title}`}
          className={`relative z-10 inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-mono transition-all cursor-pointer ${
            isCopied
              ? 'bg-success/20 text-success border-success/40'
              : 'border-border/80 bg-surface-2 text-fg-muted hover:text-fg hover:border-cyan/50 hover:bg-surface active:scale-95'
          }`}
        >
          {isCopied ? (
            <>
              <IconCheck className="h-3 w-3" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <IconCopy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </li>
  );
}
