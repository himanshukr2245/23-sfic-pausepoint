'use client';

// tokens-ok-file: editorial quote cards and parchment themes use tailored terracotta and amber literary palette
// components/editorial/EditorialWorkspace.tsx — Master Editorial Studio Workspace Orchestrator
// Full-bleed edge-to-edge desktop viewport (fixed inset-0), zero fake window frames, 100% hydration-safe.
// Enforces Commutative Layout Law across all cards, docks, and chambers.
// Dark Comfort: Venetian Terracotta & Obsidian Espresso palette, WCAG AAA text contrast, zero opacity haze.
import React, { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import {
  playHapticTick,
  playLaserZip,
  playPop,
  playSuccessChime,
  unlockAudio,
} from '@/lib/audio/synthesizer';
import { EditorialTopBar } from './EditorialTopBar';
import { EditorialLeftRail } from './EditorialLeftRail';
import { EditorialCenterStage } from './EditorialCenterStage';
import { EditorialRightInspector } from './EditorialRightInspector';
import { EditorialKeyboardHudModal } from './EditorialKeyboardHudModal';
import {
  type EditorialEssay,
  type QuoteCardStyle,
  type TypefaceFamily,
  EDITORIAL_ESSAYS,
  subscribeTypographicSettings,
  getTypographicSettingsSnapshot,
  getTypographicSettingsServerSnapshot,
  updateTypographicSettings,
  subscribeMarginalia,
  getMarginaliaSnapshot,
  getMarginaliaServerSnapshot,
  addMarginaliaNote,
  deleteMarginaliaNote,
} from './editorial-store';

export function EditorialWorkspace() {
  const [activeEssay, setActiveEssay] = useState<EditorialEssay>(EDITORIAL_ESSAYS[0]);

  // React 19 useSyncExternalStore: Zero SSR Hydration Mismatch & Zero setState-in-effect
  const settings = useSyncExternalStore(
    subscribeTypographicSettings,
    getTypographicSettingsSnapshot,
    getTypographicSettingsServerSnapshot
  );

  const marginalia = useSyncExternalStore(
    subscribeMarginalia,
    getMarginaliaSnapshot,
    getMarginaliaServerSnapshot
  );

  const [leftRailOpen, setLeftRailOpen] = useState(true);
  const [rightInspectorOpen, setRightInspectorOpen] = useState(true);
  const [keyboardHudOpen, setKeyboardHudOpen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // Add marginalia note
  const handleAddMarginalia = useCallback(
    (text: string, quoteSnippet: string) => {
      addMarginaliaNote(text, quoteSnippet, activeEssay.id);
      playSuccessChime();
    },
    [activeEssay.id]
  );

  // Delete marginalia note
  const handleDeleteMarginalia = useCallback((id: string) => {
    deleteMarginaliaNote(id);
  }, []);

  // Send quote to QuoteMaker Studio
  const handleSendToQuoteMaker = useCallback(() => {
    // Open right inspector if closed
    setRightInspectorOpen(true);
    playPop();
  }, []);

  // Cycle typeface
  const handleCycleTypeface = useCallback(() => {
    const families: TypefaceFamily[] = ['serif', 'georgia', 'mono'];
    updateTypographicSettings((prev) => {
      const idx = families.indexOf(prev.typeface);
      const next = families[(idx + 1) % families.length];
      return { ...prev, typeface: next };
    });
    playHapticTick();
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keystrokes when typing in input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      unlockAudio();

      // [1 - 4]: Switch Treatise
      if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (EDITORIAL_ESSAYS[idx]) {
          e.preventDefault();
          setActiveEssay(EDITORIAL_ESSAYS[idx]);
          playHapticTick();
        }
        return;
      }

      // T: Cycle Typeface
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        handleCycleTypeface();
        return;
      }

      // V: Cycle Visual Theme
      if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        const themes: QuoteCardStyle[] = ['terracotta', 'obsidian', 'parchment', 'cyber'];
        updateTypographicSettings((prev) => {
          const idx = themes.indexOf(prev.selectedQuoteStyle);
          const next = themes[(idx + 1) % themes.length];
          return { ...prev, selectedQuoteStyle: next };
        });
        playPop();
        return;
      }

      // [: Toggle Left Rail
      if (e.key === '[') {
        e.preventDefault();
        playLaserZip();
        setLeftRailOpen((v) => !v);
        return;
      }

      // ]: Toggle Right Inspector
      if (e.key === ']') {
        e.preventDefault();
        playLaserZip();
        setRightInspectorOpen((v) => !v);
        return;
      }

      // C: Copy active pull quote
      if (e.key === 'c' || e.key === 'C') {
        if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          navigator.clipboard.writeText(
            `${activeEssay.pullQuote.text}\n— ${activeEssay.pullQuote.author}, ${activeEssay.pullQuote.work}`
          );
          playSuccessChime();
        }
        return;
      }

      // ?: Toggle HUD
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        playPop();
        setKeyboardHudOpen((v) => !v);
        return;
      }

      // Escape: Close HUD
      if (e.key === 'Escape') {
        if (keyboardHudOpen) {
          e.preventDefault();
          setKeyboardHudOpen(false);
          playPop();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCycleTypeface, activeEssay, keyboardHudOpen]);

  return (
    <div
      data-editorial-theme={settings.selectedQuoteStyle}
      className="fixed inset-0 z-50 flex h-dvh w-dvw flex-col overflow-hidden bg-[var(--ed-canvas)] text-[var(--ed-text)] select-none"
    >
      {/* ── MASTER UNIFIED 48px TOP-BAR ── */}
      <EditorialTopBar
        activeEssay={activeEssay}
        onSelectEssay={(essay) => {
          setActiveEssay(essay);
          setReadingProgress(0);
        }}
        typeface={settings.typeface}
        onSelectTypeface={(font) => {
          updateTypographicSettings((prev) => ({ ...prev, typeface: font }));
        }}
        selectedTheme={settings.selectedQuoteStyle}
        onSelectTheme={(theme) => {
          updateTypographicSettings((prev) => ({ ...prev, selectedQuoteStyle: theme }));
        }}
        leftRailOpen={leftRailOpen}
        onToggleLeftRail={() => {
          playLaserZip();
          setLeftRailOpen((v) => !v);
        }}
        rightInspectorOpen={rightInspectorOpen}
        onToggleRightInspector={() => {
          playLaserZip();
          setRightInspectorOpen((v) => !v);
        }}
        onOpenKeyboardHud={() => {
          playPop();
          setKeyboardHudOpen(true);
        }}
      />

      {/* ── WORKSPACE TRIPTYCH CHAMBER ── */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Left Rail: 280px Anthology & Marginalia */}
        <EditorialLeftRail
          isOpen={leftRailOpen}
          onClose={() => setLeftRailOpen(false)}
          activeEssay={activeEssay}
          onSelectEssay={(essay) => {
            setActiveEssay(essay);
            setReadingProgress(0);
          }}
          marginalia={marginalia}
          onDeleteMarginalia={handleDeleteMarginalia}
        />

        {/* Center Stage: Reading Atelier */}
        <EditorialCenterStage
          essay={activeEssay}
          settings={settings}
          onUpdateSettings={updateTypographicSettings}
          onAddMarginalia={handleAddMarginalia}
          onSendToQuoteMaker={handleSendToQuoteMaker}
          onScrollProgress={setReadingProgress}
        />

        {/* Right Inspector: 280px QuoteMaker Studio */}
        <EditorialRightInspector
          isOpen={rightInspectorOpen}
          onClose={() => setRightInspectorOpen(false)}
          activeQuote={activeEssay.pullQuote}
          settings={settings}
          onUpdateSettings={updateTypographicSettings}
          readingProgress={readingProgress}
        />
      </div>

      {/* ── KEYBOARD SHORTCUTS REFERENCE HUD ── */}
      <EditorialKeyboardHudModal
        isOpen={keyboardHudOpen}
        onClose={() => setKeyboardHudOpen(false)}
      />
    </div>
  );
}
