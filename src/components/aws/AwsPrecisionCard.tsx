'use client';

// components/aws/AwsPrecisionCard.tsx — Tightened, balanced AWS precision cloud card.
// Enterprise-grade padding, compact typography, <1ms procedural audio haptics, and signature aurora rim glow.
import { useState, useRef } from 'react';
import { playHapticTick, playSuccessChime, unlockAudio } from '@/lib/audio/synthesizer';

export interface AwsProduct {
  id: string;
  badge: string;
  badgeColor?: 'default' | 'cyan' | 'amber';
  pricingTier?: 'Free Tier eligible' | 'Paid plan exclusive' | 'Available on both plans' | '12 Months Free' | 'Always Free' | '750 Hours Free';
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  isFeatured?: boolean;
  category: 'ai' | 'storage' | 'compute' | 'database' | 'overview';
}

export interface AwsPrecisionCardProps {
  product: AwsProduct;
  isActive?: boolean;
  onCardClick?: (product: AwsProduct) => void;
  index?: number;
}

/* ── Lightweight Inline SVG Icons ────────────────────────────────────────── */
function IconArrowRight({ className = '' }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function IconPlus({ className = '' }: { className?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function IconTag({ className = '' }: { className?: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
      <path d="M7 7h.01" />
    </svg>
  );
}

function IconStar({ isFilled = false, className = '' }: { isFilled?: boolean; className?: string }) {
  return (
    <svg
      width="15"
      height="15"
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

function IconCheck({ className = '' }: { className?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function AwsPrecisionCard({ product, isActive = false, onCardClick, index }: AwsPrecisionCardProps) {
  const [isPinned, setIsPinned] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const categoryColorMap: Record<string, string> = {
    ai: 'spotlight-indigo',
    compute: 'spotlight-cyan',
    storage: 'spotlight-amber',
    database: 'spotlight-emerald',
  };
  const spotlightClass = categoryColorMap[product.category] || 'spotlight-cyan';

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  }

  const shouldGlow = isActive || isHovered;
  const isActionExpanded = isActive || isHovered;
  const actionLabel = product.actionText || 'Learn more';

  function handleTogglePin(e: React.MouseEvent) {
    e.stopPropagation();
    unlockAudio();
    playHapticTick();
    setIsPinned((prev) => !prev);
  }

  function handleToggleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    unlockAudio();
    playSuccessChime();
    setIsAdded((prev) => !prev);
  }

  function handleCardClick() {
    unlockAudio();
    playHapticTick();
    onCardClick?.(product);
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animationDelay: index !== undefined ? `${Math.min(index, 6) * 40}ms` : undefined,
        contain: 'paint layout',
        isolation: 'isolate',
      }}
      className={`aws-card-entrance spotlight-card ${spotlightClass} group relative overflow-hidden flex flex-col justify-between rounded-2xl p-5 sm:p-5.5 text-left cursor-pointer select-none transition-all duration-300 min-h-[190px] focus-within:ring-2 focus-within:ring-focus ${
        shouldGlow ? 'aws-card-aurora' : 'aws-card'
      }`}
    >
      {/* Specular Top Hairline Rim Highlight */}
      <div className="pointer-events-none absolute inset-x-8 top-0 h-[1.5px] rounded-full bg-gradient-to-r from-transparent via-fg-muted/20 to-transparent opacity-80 z-10" />

      {/* ── Top Header Row: Category Badge + Star Pin ────────────────────────── */}
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2">
          {/* Category Chip */}
          <span className="inline-flex items-center rounded-md bg-surface-2 px-2.5 py-0.5 text-[10.5px] font-mono font-medium tracking-tight text-fg-muted border border-border/60">
            {product.badge}
          </span>

          {/* Pin/Favorite Bookmark Button */}
          <button
            type="button"
            onClick={handleTogglePin}
            // z-10: above the title's stretched click area, so the star stays its own button
            title={isPinned ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={isPinned ? 'Remove from favorites' : 'Add to favorites'}
            className={`relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-lg transition-all cursor-pointer ${
              isPinned
                ? 'text-amber scale-110 bg-amber/10'
                : 'text-fg-muted/60 hover:text-fg hover:bg-surface-2 opacity-80 group-hover:opacity-100'
            }`}
          >
            <IconStar isFilled={isPinned} className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Pricing Plan Row */}
        {product.pricingTier && (
          <div className="mt-2 flex items-center gap-1.5 text-[10.5px] font-mono text-fg-muted">
            <IconTag className="h-3 w-3 shrink-0 text-fg-muted/80" />
            <span className="truncate">{product.pricingTier}</span>
          </div>
        )}

        {/* Card Title */}
        <h3 className="mt-2 text-lg font-bold tracking-tight text-fg group-hover:text-cyan-fg transition-colors sm:text-xl leading-snug">
          {/* The card's one main action. Its ::after covers the whole card (accessible "stretched button" pattern):
              clicking anywhere opens it, keyboard users get ONE stop, and the star / add buttons stay separate controls. */}
          <button type="button" onClick={handleCardClick}
            className="text-left outline-none after:absolute after:inset-0 after:rounded-2xl after:content-['']">
            {product.title}
          </button>
        </h3>

        {/* Description */}
        <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-fg-muted line-clamp-2 sm:line-clamp-3">
          {product.description}
        </p>
      </div>

      {/* ── Bottom Action Row: Action Link & Add Button ─────────────────────── */}
      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between gap-2">
        {/* Action Link: Circle Arrow at rest -> Slide-out "Learn more →" on Hover/Active */}
        <div className="flex items-center text-xs sm:text-sm font-semibold text-fg group-hover:text-cyan transition-colors">
          <div className="inline-flex items-center">
            {/* Slide-out animated text */}
            <span
              className={`inline-block overflow-hidden whitespace-nowrap text-xs font-semibold transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isActionExpanded
                  ? 'max-w-[130px] opacity-100 translate-x-0 pr-1.5'
                  : 'max-w-0 opacity-0 -translate-x-3 pr-0 pointer-events-none'
              }`}
            >
              {actionLabel}
            </span>

            {/* Circular Arrow Button */}
            <div
              className={`inline-flex h-7.5 w-7.5 items-center justify-center rounded-full border transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isActionExpanded
                  ? 'bg-cyan text-sheen border-cyan shadow-xs translate-x-0.5'
                  : 'bg-surface-2 border-border/80 text-fg group-hover:border-cyan/50'
              }`}
            >
              <IconArrowRight
                className={`h-3 w-3 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isActionExpanded ? 'translate-x-0.5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Quick-Add Architecture Blueprint Button */}
        <button
          type="button"
          onClick={handleToggleAdd}
          title={isAdded ? 'Added to Blueprint' : 'Add to Architecture'}
          aria-label={isAdded ? 'Added to Blueprint' : 'Add to Architecture'}
          className={`relative z-10 inline-flex h-7.5 w-7.5 items-center justify-center rounded-full border transition-all cursor-pointer ${
            isAdded
              ? 'bg-success/20 text-success border-success/40 scale-105'
              : 'border-border bg-surface-2 text-fg-muted hover:text-fg hover:border-cyan hover:bg-surface active:scale-95'
          }`}
        >
          {isAdded ? (
            <IconCheck className="h-3 w-3" />
          ) : (
            <IconPlus className="h-3 w-3" />
          )}
        </button>
      </div>
    </div>
  );
}
