// tokens-ok-file: decorative optical gradient stops of the glass shapes — art, not interface colours
'use client';

// components/ui/GlassCard.tsx — Reusable dual-mode optical glass plate (HK Universal Library v3).
// Light Mode ☀️: Geometric Lenses (visionOS Acrylic with 32px blur and soft rainbow shape diffusion).
// Dark Mode 🌙: Studio Minimal (Figma Frosted White Glass with 48px blur, zero colored shapes, and pure white halo glow on hover).
import { useState, useEffect, type ReactNode, type CSSProperties, type MouseEvent } from 'react';
import { playHapticTick, unlockAudio } from '@/lib/audio/synthesizer';

export type GlassShapeType = 'circle' | 'square' | 'kite' | 'hexagon' | 'pill' | 'prism' | 'none';
export type GlassShapeColor = 'cyan' | 'purple' | 'rose' | 'emerald' | 'amber' | 'indigo' | 'white';

export interface GlassCardProps {
  as?: 'div' | 'li' | 'article' | 'section';
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  interactive?: boolean;
  borderRadius?: number;
  style?: CSSProperties;
  haptic?: boolean;
  role?: string;
  tabIndex?: number;
  'aria-label'?: string;
  id?: string;
  shape?: GlassShapeType;
  shapeColor?: GlassShapeColor;
  shapeScale?: number;
}

function useIsDark(): boolean {
  const [isDark, setIsDark] = useState<boolean>(true);

  useEffect(() => {
    const update = () => {
      const theme = document.documentElement.dataset.theme;
      if (theme === 'dark') {
        setIsDark(true);
      } else if (theme === 'light') {
        setIsDark(false);
      } else {
        setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
    };

    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    mql.addEventListener('change', update);

    return () => {
      observer.disconnect();
      mql.removeEventListener('change', update);
    };
  }, []);

  return isDark;
}

export function GlassCard({
  as: Component = 'div',
  children,
  className = '',
  onClick,
  interactive = true,
  borderRadius = 26,
  style = {},
  haptic = true,
  role,
  tabIndex,
  'aria-label': ariaLabel,
  id,
  shape = 'none',
  shapeColor = 'cyan',
  shapeScale = 85,
}: GlassCardProps) {
  const isDark = useIsDark();
  const [isHovered, setIsHovered] = useState(false);

  function handleMouseEnter() {
    if (!interactive) return;
    setIsHovered(true);
    if (haptic) {
      unlockAudio();
      playHapticTick();
    }
  }

  function handleMouseLeave() {
    if (!interactive) return;
    setIsHovered(false);
  }

  function handleClick(e: MouseEvent<HTMLElement>) {
    if (haptic) {
      unlockAudio();
      playHapticTick();
    }
    onClick?.(e);
  }

  // ── Baseline Glass Geometry & Optics ──────────────────────────────────────
  let cardPlateStyle: CSSProperties = {
    borderRadius: `${borderRadius}px`,
    transform: 'translateZ(0)',
    WebkitTransform: 'translateZ(0)',
    ...style,
  };

  let outerShadow = '0 8px 20px -2px rgba(15, 23, 42, 0.06)';
  const hasShape = shape && shape !== 'none';

  if (isDark) {
    // 🌙 Dark Mode Base: Studio Minimal (Figma Frosted White Glass — composited on the GPU)
    cardPlateStyle = {
      ...cardPlateStyle,
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      background:
        'linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.04) 100%)',
      borderColor: 'rgba(255, 255, 255, 0.35)',
      borderWidth: '1.5px',
      boxShadow:
        'inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.65), inset 0 0 20px 0 rgba(255, 255, 255, 0.08)',
    };
    outerShadow = '0 20px 48px -12px rgba(0, 0, 0, 0.85)';
  } else {
    // ☀️ Light Mode Base: Geometric Lenses / Apple visionOS Acrylic (composited on the GPU)
    // Pre-blurred radiant shape layer + lightweight 10px glass plate gives crystal transmission without scroll stall
    cardPlateStyle = {
      ...cardPlateStyle,
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      background: 'rgba(255, 255, 255, 0.72)',
      borderColor: 'rgba(255, 255, 255, 0.95)',
      borderWidth: '1.5px',
      boxShadow: 'inset 0 1.5px 1px 0 #ffffff, inset 0 0 14px 0 rgba(255, 255, 255, 0.45)',
    };
    outerShadow = '0 12px 30px -6px rgba(15, 23, 42, 0.10)';
  }

  // ── Interactive Hover State ───────────────────────────────────────────────
  if (interactive && isHovered) {
    if (isDark) {
      // Dark Mode Hover: Pure white specular border + radiant pure white halo glow
      cardPlateStyle = {
        ...cardPlateStyle,
        borderColor: '#ffffff',
        borderWidth: '1.5px',
        boxShadow:
          'inset 0 2px 2px 0 #ffffff, inset 0 -1px 2px 0 rgba(255, 255, 255, 0.7), inset 0 0 24px 0 rgba(255, 255, 255, 0.25)',
      };
      outerShadow =
        '0 0 0 1.5px rgba(255, 255, 255, 0.85), 0 0 32px 3px rgba(255, 255, 255, 0.4), 0 16px 36px -4px rgba(0, 0, 0, 0.85)';
    } else {
      // Light Mode Hover: Refractive slate contour + inner specular white bevel
      cardPlateStyle = {
        ...cardPlateStyle,
        borderColor: 'rgba(71, 85, 105, 0.38)',
        borderWidth: '1.5px',
        boxShadow:
          'inset 0 2px 2px 0 #ffffff, inset 0 -1.5px 2px 0 rgba(255, 255, 255, 0.9), inset 0 0 18px 0 rgba(255, 255, 255, 0.5)',
      };
      outerShadow =
        '0 0 0 1px rgba(255, 255, 255, 0.95), 0 18px 38px -8px rgba(51, 65, 85, 0.25), 0 8px 16px -3px rgba(51, 65, 85, 0.15)';
    }
  }

  // ── Geometric Lenses Shape Styler (Rendered ONLY in Light Mode behind the blur plate!) ──
  function renderShape() {
    // In Dark Mode (Studio Minimal), zero colored shapes are rendered — clean monochrome glass!
    if (isDark || !hasShape) return null;

    const gradients: Record<GlassShapeColor, string> = {
      cyan: 'bg-gradient-to-br from-[#00d2ff] via-[#06b6d4] to-[#2563eb]',
      purple: 'bg-gradient-to-tr from-[#8b5cf6] via-[#a855f7] to-[#ec4899]',
      rose: 'bg-gradient-to-tr from-[#f43f5e] via-[#fb7185] to-[#f59e0b]',
      emerald: 'bg-gradient-to-br from-[#10b981] via-[#059669] to-[#0284c7]',
      amber: 'bg-gradient-to-tr from-[#f59e0b] via-[#ea580c] to-[#ef4444]',
      indigo: 'bg-gradient-to-br from-[#6366f1] via-[#4f46e5] to-[#0284c7]',
      white: 'bg-gradient-to-br from-white via-slate-100 to-slate-300',
    };

    const gradient = gradients[shapeColor] || gradients.cyan;

    let shapeClasses = 'rounded-full h-36 w-36 sm:h-44 sm:w-44 -right-2 -bottom-2';
    let rotateStyle = '';

    if (shape === 'square') {
      shapeClasses = 'rounded-3xl h-32 w-32 sm:h-40 sm:w-40 -right-2 -bottom-2';
      rotateStyle = 'rotate(12deg)';
    } else if (shape === 'kite') {
      shapeClasses = 'rounded-2xl h-28 w-28 sm:h-36 sm:w-36 -right-1 -bottom-1';
      rotateStyle = 'rotate(45deg)';
    } else if (shape === 'hexagon') {
      shapeClasses = 'rounded-[28px] h-32 w-32 sm:h-40 sm:w-40 -right-2 -bottom-2';
      rotateStyle = 'rotate(-12deg)';
    } else if (shape === 'pill') {
      shapeClasses = 'rounded-full aspect-[1.3/1] h-30 w-38 sm:h-36 sm:w-44 -right-2 -bottom-2';
      rotateStyle = 'rotate(35deg)';
    } else if (shape === 'prism') {
      shapeClasses = 'rounded-3xl h-32 w-32 sm:h-40 sm:w-40 -right-2 -bottom-2';
      rotateStyle = 'rotate(-6deg)';
    }

    return (
      <div
        style={{
          transform: `scale(${shapeScale / 100}) ${rotateStyle}`.trim(),
          transformOrigin: 'bottom right',
          filter: 'blur(20px)',
          WebkitFilter: 'blur(20px)',
          willChange: 'transform',
        }}
        className={`pointer-events-none absolute z-0 transition-transform duration-300 group-hover:scale-105 opacity-85 ${shapeClasses} ${gradient}`}
      />
    );
  }

  return (
    <Component
      id={id}
      role={role}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative flex flex-col overflow-hidden transition-transform duration-200 select-none ${
        interactive ? 'cursor-pointer' : ''
      } ${interactive && isHovered ? 'scale-[1.01]' : ''}`}
      style={{
        borderRadius: `${borderRadius}px`,
        boxShadow: outerShadow,
        contain: 'paint layout',
        isolation: 'isolate',
        willChange: 'transform',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
      }}
    >
      {/* 1. Behind-Glass Optical Shape (Rendered strictly in Light Mode at z-0, clipped by outer container) */}
      {renderShape()}

      {/* 2. Frosted Optical Glass Card Plate (Sits at z-10 on top with GPU optimized 10px blur) */}
      <div
        style={cardPlateStyle}
        className={`relative z-10 flex flex-col h-full w-full justify-between border transition-all duration-200 ${className}`}
      >
        {/* Specular Top Light Rail (Physical Bevel Highlight) */}
        <div className="pointer-events-none absolute inset-x-6 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full opacity-80" />

        {/* Card Content Protected in Foreground Layer */}
        {children}
      </div>
    </Component>
  );
}
