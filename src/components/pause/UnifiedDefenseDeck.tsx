'use client';

// src/components/pause/UnifiedDefenseDeck.tsx — The Unified Sovereign Cognitive Defense Deck.
// ⛔ MANDATORY LAW: Commutative layouts — balanced compact cards with uniform geometry across all viewports.
// ⛔ MANDATORY ICON LAW: Pure SVG vector icons only — zero emojis in UI controls.
// Consolidates the 10-Second Manipulation Decoder and the Interactive Scam Simulator Arena into a single high-precision tabbed terminal.

import React, { useState } from 'react';
import { Search, Zap, Shield, Sparkles } from 'lucide-react';
import { unlockAudio, playPop, playHapticTick } from '@/lib/audio/synthesizer';
import { DecoderWorkbench } from './DecoderWorkbench';
import { ScamSimulator } from './ScamSimulator';

type DefenseTab = 'decoder' | 'simulator';

export function UnifiedDefenseDeck() {
  const [activeTab, setActiveTab] = useState<DefenseTab>('decoder');

  function handleTabChange(tab: DefenseTab) {
    if (activeTab === tab) return;
    unlockAudio();
    playPop();
    setActiveTab(tab);
  }

  return (
    <div
      id="defense-deck"
      style={{ contain: 'paint layout' }}
      className="w-full rounded-2xl border border-border/80 bg-surface shadow-xs flex flex-col overflow-hidden"
    >
      {/* ── Console Header Bar & Tab Switcher ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-border bg-surface-2/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand">
                Interactive Citizen Defense Terminal
              </span>
              <span className="text-border">·</span>
              <span className="text-[10px] font-mono text-fg-muted">
                100% Client-Side Sandbox
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-extrabold tracking-tight text-fg">
              {activeTab === 'decoder'
                ? 'Psychological Manipulation Decoder'
                : 'Interactive Cyber Threat Simulator Arena'}
            </h2>
          </div>
        </div>

        {/* Tab Controls (Accessible tablist) */}
        <div
          role="tablist"
          aria-label="Cognitive Defense Engines"
          className="flex items-center gap-1.5 p-1 rounded-xl bg-surface border border-border/80 shrink-0 self-start sm:self-auto"
        >
          {/* Tab 1: Decoder */}
          <button
            type="button"
            role="tab"
            id="tab-decoder"
            aria-selected={activeTab === 'decoder'}
            aria-controls="panel-decoder"
            onClick={() => handleTabChange('decoder')}
            onMouseEnter={playHapticTick}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'decoder'
                ? 'bg-brand text-brand-fg shadow-xs'
                : 'text-fg-muted hover:text-fg hover:bg-surface-2'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Manipulation Decoder</span>
            <span
              className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded ${
                activeTab === 'decoder'
                  ? 'bg-brand-fg/20 text-brand-fg'
                  : 'bg-surface-2 text-fg-muted'
              }`}
            >
              10s Pause
            </span>
          </button>

          {/* Tab 2: Simulator */}
          <button
            type="button"
            role="tab"
            id="tab-simulator"
            aria-selected={activeTab === 'simulator'}
            aria-controls="panel-simulator"
            onClick={() => handleTabChange('simulator')}
            onMouseEnter={playHapticTick}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-brand text-brand-fg shadow-xs'
                : 'text-fg-muted hover:text-fg hover:bg-surface-2'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Attack Simulator</span>
            <span
              className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded ${
                activeTab === 'simulator'
                  ? 'bg-brand-fg/20 text-brand-fg'
                  : 'bg-surface-2 text-fg-muted'
              }`}
            >
              Live Drills
            </span>
          </button>
        </div>
      </div>

      {/* ── Subtitle & Educational Lead ── */}
      <div className="px-5 sm:px-6 pt-4 pb-2 border-b border-border/40 bg-surface/60 flex items-center justify-between text-xs text-fg-muted">
        <p className="leading-relaxed">
          {activeTab === 'decoder'
            ? 'Decompile deceptive urgency, fake legal authorities, and malicious Android APK links in real time with our 10-second cognitive pause engine.'
            : 'Experience realistic simulations of India’s top 4 cyber threats (Digital Arrest, Task Scams, Electricity Disconnections, and UPI PIN fraud) and watch PausePoint’s cognitive brake disarm them.'}
        </p>
        <span className="hidden md:inline-flex items-center gap-1.5 font-mono text-[11px] text-brand shrink-0 ml-4 font-semibold">
          <Sparkles className="w-3 h-3" />
          <span>Zero Network Latency</span>
        </span>
      </div>

      {/* ── Tab Panels (Retain state across tab switches via CSS display) ── */}
      <div className="p-4 sm:p-6">
        {/* Panel 1: Decoder Workbench */}
        <div
          role="tabpanel"
          id="panel-decoder"
          aria-labelledby="tab-decoder"
          className={activeTab === 'decoder' ? 'block' : 'hidden'}
        >
          <DecoderWorkbench />
        </div>

        {/* Panel 2: Scam Simulator Arena */}
        <div
          role="tabpanel"
          id="panel-simulator"
          aria-labelledby="tab-simulator"
          className={activeTab === 'simulator' ? 'block' : 'hidden'}
        >
          <ScamSimulator />
        </div>
      </div>
    </div>
  );
}
