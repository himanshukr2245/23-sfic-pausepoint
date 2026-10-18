'use client';

// components/ui/SpotlightCard.tsx — Linear-style mouse-following radial spotlight card (HK Universal Library v3).
// Pure CSS custom properties (--mouse-x, --mouse-y) with 0 React re-renders for fluid compositor performance.
import { useRef, type ReactNode, type MouseEvent } from 'react';

export interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function SpotlightCard({
  children,
  className = '',
  id,
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  }

  return (
    <div
      ref={cardRef}
      id={id}
      onMouseMove={handleMouseMove}
      className={`spotlight-card relative overflow-hidden rounded-2xl border border-border/80 bg-surface/98 p-6 shadow-xs transition-all duration-300 hover:border-border hover:shadow-md ${className}`}
    >
      {/* Specular Top Rim */}
      <div className="pointer-events-none absolute inset-x-8 top-0 h-[1.5px] rounded-full bg-gradient-to-r from-transparent via-fg-muted/20 to-transparent opacity-80 z-10" />
      {children}
    </div>
  );
}
