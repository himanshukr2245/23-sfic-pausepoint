'use client';

// components/ui/Button.tsx — Universal <1ms Perceptual Latency Law Button Primitive (HK Universal Library v3).
// Features high-impact cyber typography, cyber-solid & cyber-outline variants, and <1ms procedural audio haptics.
import {
  forwardRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
  type PointerEvent,
} from 'react';
import Link from 'next/link';
import {
  playHapticTick,
  playSuccessChime,
  playSubBassThud,
  playLaserZip,
  unlockAudio,
} from '@/lib/audio/synthesizer';

export type LatencyMode = 'scale-top' | 'scale-tap' | 'glow-flare' | 'spring-pop' | 'none';
export type SoundType = 'tick' | 'chime' | 'thud' | 'laser' | 'none';
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'quiet'
  | 'danger'
  | 'glass'
  | 'cyber-solid'
  | 'cyber-outline'
  | 'expander-pill'
  | 'plain';                                                         // no colours: the caller's className is the look
export type ButtonSize = 'sm' | 'md' | 'lg' | 'none';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  latencyMode?: LatencyMode;
  sound?: SoundType;
  size?: ButtonSize;
  font?: 'display' | 'teroxia' | 'sans' | 'mono';
  className?: string;
}


/** The class recipe shared by <Button> and <ButtonLink>: variant colours, size, press physics and typography. */
export function buttonClassName({ variant = 'primary', latencyMode = 'spring-pop', size = 'md', font, className = '' }: {
  variant?: ButtonVariant; latencyMode?: LatencyMode; size?: ButtonSize; font?: ButtonProps['font']; className?: string;
}): string {
  // ── 1. Variant Color Base ──
  let variantClasses = '';
  switch (variant) {
    case 'cyber-solid':
      // Solid cyber electric cyan button with black typography and luminous cyan glow
      variantClasses =
        'bg-cyber text-cyber-ink border border-transparent shadow-cyber-glow hover:shadow-cyber-glow-strong hover:brightness-105 active:brightness-95';
      break;

    case 'cyber-outline':
      // Dual-mode high-contrast cyber button:
      // Light Mode: ceramic background, sharp electric cyan border, deep obsidian text (never washes out!)
      // Dark Mode: translucent obsidian cyber-glass, electric cyan border, luminous white text
      variantClasses =
        'bg-cyber-surface border-[1.5px] border-cyber-edge text-cyber-fg backdrop-blur-sm hover:bg-cyber/15 dark:hover:bg-cyber/20 hover:border-cyber-edge-hover shadow-cyber-outline hover:shadow-cyber-outline-hover dark:shadow-cyber-outline-dark dark:hover:shadow-cyber-outline-dark-hover';
      break;

    case 'primary':
      variantClasses =
        'bg-brand text-brand-fg shadow-sm hover:brightness-110 active:brightness-95 border border-brand/50';
      break;

    case 'secondary':
      variantClasses =
        'bg-surface-2 text-fg border border-border shadow-xs hover:bg-surface-2/80 active:bg-surface-2/60';
      break;

    case 'quiet':
      variantClasses =
        'bg-transparent text-fg hover:bg-surface-2/80 active:bg-surface-2/60 border border-transparent hover:border-border';
      break;

    case 'danger':
      variantClasses =
        'bg-danger text-brand-fg shadow-sm hover:brightness-110 active:brightness-95 border border-danger/50';
      break;

    case 'glass':
      variantClasses =
        'bg-sheen/10 dark:bg-sheen/5 text-fg border border-sheen/20 dark:border-sheen/15 backdrop-blur-md shadow-md hover:bg-sheen/20 dark:hover:bg-sheen/10';
      break;

    case 'expander-pill':
      variantClasses =
        'aws-gradient-pill !rounded-full shadow-md';
      break;
  }

  // ── 2. Size Scaling (min-h-touch compliant, DEV-3) ──
  let sizeClasses = '';
  switch (size) {
    case 'sm':
      sizeClasses = 'min-h-[36px] px-3.5 py-1.5 text-[11px] rounded-xl';
      break;
    case 'md':
      sizeClasses = 'min-h-[44px] px-4.5 py-2 text-xs sm:text-[13px] rounded-xl';
      break;
    case 'lg':
      sizeClasses = 'min-h-[50px] px-6 py-2.5 text-xs sm:text-sm rounded-xl sm:rounded-2xl';
      break;
  }

  // ── 3. Latency Mode Physics (The <1ms Perceptual Latency Law) ──
  let latencyClasses = '';
  switch (latencyMode) {
    case 'scale-top':
    case 'scale-tap':
      // Instant lift on hover, snappy compress on press
      latencyClasses =
        'transition-transform duration-100 ease-out hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0';
      break;

    case 'glow-flare':
      // Radiant specular halo bloom on hover, intense flare around border
      latencyClasses =
        'transition-all duration-150 ease-out hover:shadow-cyber-flare hover:border-sheen active:scale-[0.98]';
      break;

    case 'none':
      latencyClasses = '';
      break;

    case 'spring-pop':
    default:
      // Tactile micro-compress on click with instantaneous bouncy micro-rebound
      latencyClasses =
        'transition-all duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:scale-[1.03] active:scale-[0.96]';
      break;
  }

  // ── 4. Typographic Token Assignment ──
  let fontClasses = variant === 'plain' ? '' : 'font-sans font-semibold tracking-normal';
  if (font === 'display' || font === 'teroxia' || (!font && variant === 'cyber-solid')) {
    fontClasses = 'font-display font-bold uppercase tracking-wider';
  } else if (!font && variant === 'expander-pill') {
    fontClasses = 'font-sans font-semibold uppercase tracking-wider text-xs';
  } else if (font === 'mono') {
    fontClasses = 'font-mono font-semibold tracking-tight';
  } else if (font === 'sans') {
    fontClasses = 'font-sans font-semibold tracking-normal';
  }


  return `group relative inline-flex items-center justify-center gap-2 overflow-hidden select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${fontClasses} ${variantClasses} ${sizeClasses} ${latencyClasses} ${className}`;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    variant = 'primary',
    latencyMode = 'spring-pop',
    sound = 'tick',
    size = 'md',
    font,
    className = '',
    onPointerDown,
    disabled,
    ...rest
  },
  ref
) {
  const [isPressed, setIsPressed] = useState(false);

  function handlePointerDown(e: PointerEvent<HTMLButtonElement>) {
    if (disabled) return;
    setIsPressed(true);

    // ── Instant Tactile Sound Generation (<1ms) ──
    if (sound !== 'none') {
      unlockAudio();
      if (sound === 'tick') playHapticTick();
      else if (sound === 'chime') playSuccessChime();
      else if (sound === 'thud') playSubBassThud();
      else if (sound === 'laser') playLaserZip();
    }

    onPointerDown?.(e);
  }

  function handlePointerUp() {
    setIsPressed(false);
  }

  function handlePointerLeave() {
    setIsPressed(false);
  }

  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      className={buttonClassName({ variant, latencyMode, size, font, className })}
      {...rest}
    >
      {/* Specular Top Light Rail (Active during hover on scale-top and glass modes) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-3 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-sheen/60 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 rounded-full"
      />

      {/* Internal Radial Shimmer on Click */}
      {isPressed && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-sheen/20 animate-fade-in"
        />
      )}

      {children}
    </button>
  );
});

/** A LINK that looks like a Button — for navigation. Never wrap <Button> in <Link>: a button inside a link is invalid HTML,
 *  gives keyboard users two tab stops and confuses screen readers (axe "nested-interactive"). Soft navigation + Top Loader stay. */
export function ButtonLink({
  href,
  children,
  variant = 'primary',
  latencyMode = 'spring-pop',
  sound = 'tick',
  size = 'md',
  font,
  className = '',
}: Omit<ButtonProps, 'onClick' | 'type'> & { href: string }) {
  const classes = buttonClassName({ variant, latencyMode, size, font, className });
  return (
    <Link
      href={href}
      onPointerDown={() => {
        if (sound === 'none') return;
        unlockAudio();
        if (sound === 'tick') playHapticTick();
        else if (sound === 'chime') playSuccessChime();
        else if (sound === 'thud') playSubBassThud();
        else if (sound === 'laser') playLaserZip();
      }}
      className={classes}
    >
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-3 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-sheen/60 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100 rounded-full" />
      {children}
    </Link>
  );
}
