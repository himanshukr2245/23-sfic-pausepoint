// src/app/studio/ForensicStudio.tsx — Master Orchestrator for PausePoint Forensic Studio
'use client';

import React, { useSyncExternalStore } from 'react';
import { StudioRibbon } from './StudioRibbon';
import { StudioStage } from './StudioStage';
import {
  getStudioStoreSnapshot,
  subscribeStudioStore,
} from './forensic-store';
import { FpsCounter } from '@/components/ui';
import { unlockAudio, playSuccessChime } from '@/lib/audio/synthesizer';

export function ForensicStudio() {
  const store = useSyncExternalStore(
    subscribeStudioStore,
    getStudioStoreSnapshot,
    getStudioStoreSnapshot
  );

  const [copiedDocket, setCopiedDocket] = React.useState(false);

  function handleCopyDocket() {
    unlockAudio();
    playSuccessChime();

    const text = `# PAUSEPOINT INCIDENT DOSSIER (${store.activeCase.name})
Timestamp: ${new Date().toISOString()} · 100% On-Device Sovereign Privacy
Threat Assessment: ${store.activeCase.threatLevel.toUpperCase()}
Category: ${store.activeCase.category}

## 1. Raw Incident Payload
\`\`\`
${store.customPayload}
\`\`\`

## 2. Psychological Levers Detected
${store.activeCase.tactics.map((t) => `- [${t.label}]: ${t.lever}`).join('\n')}

## 3. Financial Lien Telemetry
- Bank UTR: ${store.activeCase.utr || 'N/A'}
- Amount (INR): ₹${store.activeCase.amountInr?.toLocaleString('en-IN') || '0'}
- Beneficiary UPI VPA: ${store.activeCase.payeeVpa || 'N/A'}
- Beneficiary Name: ${store.activeCase.payeeName || 'N/A'}

## 4. Incident Timeline
${store.activeCase.timeline.map((s) => `- [${s.time}] (${s.type}): ${s.event}`).join('\n')}

Generated on-device by PausePoint Studio.`;

    navigator.clipboard.writeText(text);
    setCopiedDocket(true);
    setTimeout(() => setCopiedDocket(false), 2200);
  }

  return (
    <div className="flex flex-col gap-6 pb-24">
      {/* ── 1. Master Control Ribbon ── */}
      <StudioRibbon
        activeMode={store.activeMode}
        activeCaseId={store.activeCase.id}
        onCopyDocket={handleCopyDocket}
        copiedDocket={copiedDocket}
      />

      {/* ── 2. Master Responsive 12-Column Stage ── */}
      <StudioStage
        key={store.activeCase.id}
        activeMode={store.activeMode}
        activeCase={store.activeCase}
        customPayload={store.customPayload}
      />

      {/* ── 3. Performance Monitor ── */}
      <FpsCounter />
    </div>
  );
}
