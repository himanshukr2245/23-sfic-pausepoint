'use client';

// src/app/studio/StudioCanvas.tsx — Balanced-Minimalist Kinetic Hyper-Studio Master Engine v4.1
// HK Universal Library v3.0: 100% Client-Side Local-First, zero network roundtrips, sub-millisecond 60fps render.
import React, { useState, useEffect, useCallback, useMemo, useSyncExternalStore } from 'react';
import {
  type StudioDoc,
  type StudioBlock,
  type StudioBlockType,
  type CanvasGridStyle,
  type CanvasDensity,
  subscribeStudioDoc,
  getStudioDocSnapshot,
  getStudioDocServerSnapshot,
  saveStudioDoc,
} from './studio-store';
import { StudioRibbon } from './StudioRibbon';
import { StudioLeftRail } from './StudioLeftRail';
import { StudioStage } from './StudioStage';
import { StudioInspector } from './StudioInspector';
import { StudioAddBlockModal } from './StudioAddBlockModal';
import { StudioExportModal } from './StudioExportModal';
import { KeyboardHudModal } from './KeyboardHudModal';
import {
  playHapticTick,
  playSuccessChime,
  playSubBassThud,
  unlockAudio,
} from '@/lib/audio/synthesizer';

export function StudioCanvas() {
  const doc = useSyncExternalStore(
    subscribeStudioDoc,
    getStudioDocSnapshot,
    getStudioDocServerSnapshot
  );

  const [zoomLevel, setZoomLevel] = useState(100);
  const [gridStyle, setGridStyle] = useState<CanvasGridStyle>('dots');
  const [density, setDensity] = useState<CanvasDensity>('compact');

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const [leftRailOpen, setLeftRailOpen] = useState(true);
  const [rightInspectorOpen, setRightInspectorOpen] = useState(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [keyboardHudOpen, setKeyboardHudOpen] = useState(false);

  // Sync state changes to reactive store and localStorage
  const updateDoc = useCallback((newDoc: StudioDoc) => {
    saveStudioDoc(newDoc);
  }, []);

  // Update doc title
  const handleUpdateTitle = useCallback(
    (newTitle: string) => {
      unlockAudio();
      playSuccessChime();
      updateDoc({ ...doc, title: newTitle });
    },
    [doc, updateDoc]
  );

  // Add block
  const handleAddBlock = useCallback(
    (block: StudioBlock) => {
      unlockAudio();
      playSuccessChime();
      const updated = {
        ...doc,
        blocks: [block, ...doc.blocks],
      };
      updateDoc(updated);
      setSelectedBlockId(block.id);
    },
    [doc, updateDoc]
  );

  // Add block from 1-click template in Left Rail
  const handleAddFromTemplate = useCallback(
    (type: StudioBlockType) => {
      unlockAudio();
      playSuccessChime();
      const templateMap: Record<StudioBlockType, Partial<StudioBlock>> = {
        quote: {
          title: 'Consulting Architecture Retainer',
          category: 'Commercial',
          colorAccent: 'cyan',
          quoteData: {
            itemName: 'Dedicated Engineering Sprint',
            quantity: 1,
            unitPrice: 2400,
            taxPercent: 18,
            currency: 'USD',
          },
        },
        spec: {
          title: 'Data Ingestion Protocol',
          category: 'Architecture',
          colorAccent: 'indigo',
          specData: {
            module: 'ingest.ts',
            interfaceContract: 'Zero-Copy SharedArrayBuffer',
            latencySla: '< 0.2ms',
            status: 'Active',
          },
        },
        speed: {
          title: '60 FPS Frame Budget Spec',
          category: 'Performance',
          colorAccent: 'emerald',
          speedData: {
            targetFps: 60,
            renderBudgetMs: 16.6,
            clsScore: 0.0,
            reflowGuarded: true,
          },
        },
        note: {
          title: 'Productivity Philosophy',
          category: 'Creative',
          colorAccent: 'violet',
          noteData: {
            markdown: 'Minimal design removes friction between thought and realization.',
            tags: ['Focus', 'Speed'],
          },
        },
      };

      const preset = templateMap[type];
      const newBlock: StudioBlock = {
        id: `block-${Date.now()}`,
        type,
        title: preset.title || 'Untitled Block',
        category: preset.category || 'General',
        colorAccent: preset.colorAccent || 'cyan',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...preset,
      };

      const updated = {
        ...doc,
        blocks: [newBlock, ...doc.blocks],
      };
      updateDoc(updated);
      setSelectedBlockId(newBlock.id);
    },
    [doc, updateDoc]
  );

  // Update existing block
  const handleUpdateBlock = useCallback(
    (updated: StudioBlock) => {
      const nextBlocks = doc.blocks.map((b) => (b.id === updated.id ? updated : b));
      updateDoc({ ...doc, blocks: nextBlocks });
    },
    [doc, updateDoc]
  );

  // Delete block
  const handleDeleteBlock = useCallback(
    (id: string) => {
      unlockAudio();
      playSubBassThud();
      const nextBlocks = doc.blocks.filter((b) => b.id !== id);
      updateDoc({ ...doc, blocks: nextBlocks });
      if (selectedBlockId === id) {
        setSelectedBlockId(null);
      }
    },
    [doc, selectedBlockId, updateDoc]
  );

  // Duplicate block
  const handleDuplicateBlock = useCallback(
    (block: StudioBlock) => {
      unlockAudio();
      playSuccessChime();
      const duplicate: StudioBlock = {
        ...block,
        id: `block-${Date.now()}`,
        title: `${block.title} (Copy)`,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      const nextBlocks = [duplicate, ...doc.blocks];
      updateDoc({ ...doc, blocks: nextBlocks });
      setSelectedBlockId(duplicate.id);
    },
    [doc, updateDoc]
  );

  // Zoom controls
  const handleZoom = useCallback((delta: number) => {
    unlockAudio();
    playHapticTick();
    setZoomLevel((prev) => Math.min(200, Math.max(50, prev + delta)));
  }, []);

  const handleResetZoom = useCallback(() => {
    unlockAudio();
    playHapticTick();
    setZoomLevel(100);
  }, []);

  // Filtered blocks computation
  const filteredBlocks = useMemo(() => {
    return doc.blocks.filter((b) => {
      const matchesCategory =
        activeCategory === 'All' || b.category.toLowerCase() === activeCategory.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.noteData?.markdown.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.quoteData?.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.specData?.module.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [doc.blocks, activeCategory, searchQuery]);

  // Selected block
  const selectedBlock = useMemo(() => {
    return doc.blocks.find((b) => b.id === selectedBlockId) || null;
  }, [doc.blocks, selectedBlockId]);

  // Global Keyboard Navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key === '[') {
        unlockAudio();
        playHapticTick();
        setLeftRailOpen((prev) => !prev);
      } else if (e.key === ']') {
        unlockAudio();
        playHapticTick();
        setRightInspectorOpen((prev) => !prev);
      } else if (e.key === '+' || e.key === '=') {
        handleZoom(10);
      } else if (e.key === '-' || e.key === '_') {
        handleZoom(-10);
      } else if (e.key === '0') {
        handleResetZoom();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        unlockAudio();
        playHapticTick();
        setAddModalOpen(true);
      } else if (e.key === '?') {
        e.preventDefault();
        unlockAudio();
        playHapticTick();
        setKeyboardHudOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setAddModalOpen(false);
        setExportModalOpen(false);
        setKeyboardHudOpen(false);
        setSelectedBlockId(null);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleZoom, handleResetZoom]);

  return (
    <div className="fixed inset-0 z-30 flex h-dvh w-dvw flex-col overflow-hidden bg-bg text-fg select-none">
      {/* ── Master Unified Studio Header (48px) ── */}
      <StudioRibbon
        docTitle={doc.title}
        onUpdateTitle={handleUpdateTitle}
        zoomLevel={zoomLevel}
        onZoom={handleZoom}
        onResetZoom={handleResetZoom}
        leftRailOpen={leftRailOpen}
        onToggleLeftRail={() => setLeftRailOpen((prev) => !prev)}
        rightInspectorOpen={rightInspectorOpen}
        onToggleRightInspector={() => setRightInspectorOpen((prev) => !prev)}
        onOpenAddModal={() => setAddModalOpen(true)}
        onOpenExportModal={() => setExportModalOpen(true)}
        onOpenKeyboardHud={() => setKeyboardHudOpen(true)}
      />

      {/* ── Full-Bleed Studio Body (Left Rail + Main Stage + Right Inspector) ── */}
      <div className="flex flex-1 overflow-hidden relative">
        <StudioLeftRail
          blocks={doc.blocks}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          onAddBlockFromTemplate={handleAddFromTemplate}
          selectedBlockId={selectedBlockId}
          onSelectBlock={(id) => {
            setSelectedBlockId(id);
            setRightInspectorOpen(true);
          }}
          isOpen={leftRailOpen}
          onClose={() => setLeftRailOpen(false)}
        />

        <StudioStage
          filteredBlocks={filteredBlocks}
          zoomLevel={zoomLevel}
          gridStyle={gridStyle}
          density={density}
          selectedBlockId={selectedBlockId}
          onSelectBlock={(id) => {
            setSelectedBlockId(id);
            setRightInspectorOpen(true);
          }}
          onUpdateBlock={handleUpdateBlock}
          onDeleteBlock={handleDeleteBlock}
          onDuplicateBlock={handleDuplicateBlock}
        />

        <StudioInspector
          selectedBlock={selectedBlock}
          onUpdateBlock={handleUpdateBlock}
          onDeleteBlock={handleDeleteBlock}
          gridStyle={gridStyle}
          onSelectGridStyle={setGridStyle}
          density={density}
          onSelectDensity={setDensity}
          isOpen={rightInspectorOpen}
          onClose={() => setRightInspectorOpen(false)}
          totalBlocks={doc.blocks.length}
        />
      </div>

      {/* ── Modals ── */}
      <StudioAddBlockModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAddBlock={handleAddBlock}
      />

      <StudioExportModal
        doc={doc}
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />

      <KeyboardHudModal
        isOpen={keyboardHudOpen}
        onClose={() => setKeyboardHudOpen(false)}
      />
    </div>
  );
}
