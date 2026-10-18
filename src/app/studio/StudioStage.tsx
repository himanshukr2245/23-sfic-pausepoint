// tokens-ok-file: stage ambient grid matrices and optical coordinates
'use client';

// src/app/studio/StudioStage.tsx — Kinetic Main Stage (Hardware-Accelerated Stage & View Engine)
import React, { useRef, useCallback } from 'react';
import {
  type StudioBlock,
  type CanvasGridStyle,
  type CanvasDensity,
} from './studio-store';
import { BentoCanvasView } from './BentoCanvasView';

interface StudioStageProps {
  filteredBlocks: StudioBlock[];
  zoomLevel: number;
  gridStyle: CanvasGridStyle;
  density: CanvasDensity;
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onUpdateBlock: (updated: StudioBlock) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (block: StudioBlock) => void;
}

export function StudioStage({
  filteredBlocks,
  zoomLevel,
  gridStyle,
  density,
  selectedBlockId,
  onSelectBlock,
  onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
}: StudioStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);

  // Hardware-accelerated dynamic mouse spotlight tracking using CSS custom properties
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    stageRef.current.style.setProperty('--mouse-x', `${x}px`);
    stageRef.current.style.setProperty('--mouse-y', `${y}px`);
  }, []);

  // Grid styling classes
  const gridClasses: Record<CanvasGridStyle, string> = {
    dots: 'bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:20px_20px]',
    grid: 'bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] [background-size:32px_32px]',
    clean: 'bg-surface',
  };

  return (
    <main
      ref={stageRef}
      onPointerMove={handlePointerMove}
      className={`relative flex-1 overflow-auto p-4 sm:p-6 transition-colors duration-200 select-none ${gridClasses[gridStyle]}`}
      style={
        {
          '--mouse-x': '50%',
          '--mouse-y': '50%',
        } as React.CSSProperties
      }
    >
      {/* Ambient cursor illumination layer */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-300"
        style={{
          background:
            'radial-gradient(circle 420px at var(--mouse-x) var(--mouse-y), rgba(0, 240, 255, 0.07), transparent 75%)',
        }}
      />

      {/* Scalable Stage Viewport */}
      <div
        style={{
          transform: `scale(${zoomLevel / 100}) translate3d(0,0,0)`,
          transformOrigin: 'top left',
          willChange: 'transform',
        }}
        className="relative min-h-full w-full transition-transform duration-150"
      >
        <BentoCanvasView
          blocks={filteredBlocks}
          selectedBlockId={selectedBlockId}
          onSelectBlock={onSelectBlock}
          onUpdateBlock={onUpdateBlock}
          onDeleteBlock={onDeleteBlock}
          onDuplicateBlock={onDuplicateBlock}
          density={density}
        />
      </div>
    </main>
  );
}
