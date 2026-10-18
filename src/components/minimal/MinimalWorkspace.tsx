'use client';

// components/minimal/MinimalWorkspace.tsx — Master Minimalist AI Chat Workspace Orchestrator
// Full-bleed edge-to-edge desktop viewport (fixed inset-0), zero fake window frames, 100% hydration-safe.
// Enforces Commutative Layout Law across all cards, docks, and chambers.
// Dark Comfort: Solid bg-surface-2, zero opacity haze, WCAG AAA text contrast.
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  playHapticTick,
  playLaserZip,
  playPop,
  playSuccessChime,
  unlockAudio,
} from '@/lib/audio/synthesizer';
import { MinimalTopBar } from './MinimalTopBar';
import { MinimalLeftRail } from './MinimalLeftRail';
import { MinimalCenterStage } from './MinimalCenterStage';
import { MinimalRightInspector } from './MinimalRightInspector';
import { MinimalKeyboardHudModal } from './MinimalKeyboardHudModal';
import {
  type AmbientModelId,
  type AmbientPersonaId,
  type AmbientSession,
  type WorkspaceMode,
  type PresetItem,
  AMBIENT_MODELS,
  AMBIENT_PERSONAS,
  loadStoredSessions,
  saveStoredSessions,
  loadStoredScratchpad,
  saveStoredScratchpad,
  DEFAULT_SCRATCHPAD,
} from './minimal-store';

export function MinimalWorkspace() {
  const [sessions, setSessions] = useState<AmbientSession[]>(loadStoredSessions);
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const list = loadStoredSessions();
    const pinned = list.find((s) => s.pinned);
    return pinned?.id || 'sess-1';
  });

  const [mode, setMode] = useState<WorkspaceMode>('draft');
  const [leftRailOpen, setLeftRailOpen] = useState(true);
  const [rightInspectorOpen, setRightInspectorOpen] = useState(true);
  const [keyboardHudOpen, setKeyboardHudOpen] = useState(false);

  const [prompt, setPrompt] = useState('');
  const [streamedText, setStreamedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [tokensCount, setTokensCount] = useState(0);
  const [tokensPerSec, setTokensPerSec] = useState(0);
  const [activePresetId, setActivePresetId] = useState<string | undefined>(undefined);
  const [scratchpad, setScratchpad] = useState(loadStoredScratchpad);

  const streamTimerRef = useRef<NodeJS.Timeout | null>(null);
  const promptInputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<number>(0);

  // Auto-save sessions and scratchpad
  useEffect(() => {
    saveStoredSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    saveStoredScratchpad(scratchpad);
  }, [scratchpad]);

  // Clean up streaming intervals on unmount
  useEffect(() => {
    return () => {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    };
  }, []);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const selectedModel = activeSession?.model || 'Gemini 2.5 Pro';
  const selectedPersona = activeSession?.persona || 'Architect';

  const handleSelectModel = useCallback((model: AmbientModelId) => {
    unlockAudio();
    playPop();
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, model } : s))
    );
  }, [activeSessionId]);

  const handleSelectPersona = useCallback((persona: AmbientPersonaId) => {
    unlockAudio();
    playPop();
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, persona } : s))
    );
  }, [activeSessionId]);

  // Keyboard shortcut listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';

      if (!isInput) {
        if (['1', '2', '3', '4'].includes(e.key)) {
          const idx = parseInt(e.key, 10) - 1;
          const targetModel = AMBIENT_MODELS[idx];
          if (targetModel) {
            e.preventDefault();
            handleSelectModel(targetModel.id);
          }
        } else if (e.key === '[' && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          unlockAudio();
          playHapticTick();
          setLeftRailOpen((prev) => !prev);
        } else if (e.key === ']' && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          unlockAudio();
          playHapticTick();
          setRightInspectorOpen((prev) => !prev);
        } else if (e.key === '?') {
          e.preventDefault();
          unlockAudio();
          playHapticTick();
          setKeyboardHudOpen((prev) => !prev);
        } else if (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) {
          e.preventDefault();
          unlockAudio();
          playPop();
          promptInputRef.current?.focus();
        }
      } else if (e.key === 'Escape') {
        promptInputRef.current?.blur();
        setKeyboardHudOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSelectModel]);

  function handleNewSession() {
    const currentActive = sessions.find((s) => s.id === activeSessionId);
    if (
      currentActive &&
      currentActive.messages.length === 0 &&
      currentActive.title === 'New Conversation Thread'
    ) {
      return;
    }

    const id = `sess-${Date.now()}`;
    const newSession: AmbientSession = {
      id,
      title: 'New Conversation Thread',
      createdAt: 'Just now',
      updatedAt: 'Just now',
      pinned: false,
      model: selectedModel,
      persona: selectedPersona,
      messages: [],
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(id);
  }

  function handleDeleteSession(id: string) {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (filtered.length === 0) {
        return [
          {
            id: 'sess-default',
            title: 'New Conversation',
            createdAt: 'Just now',
            updatedAt: 'Just now',
            pinned: false,
            model: 'Gemini 2.5 Pro',
            persona: 'Architect',
            messages: [],
          },
        ];
      }
      return filtered;
    });

    if (activeSessionId === id) {
      const remaining = sessions.filter((s) => s.id !== id);
      if (remaining.length > 0) {
        setActiveSessionId(remaining[0].id);
      }
    }
  }

  function handleTogglePinSession(id: string) {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s))
    );
  }

  function handleClearThread() {
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [] } : s))
    );
  }

  const handleSendMessage = useCallback(
    (text: string, customStreamContent?: string, presetId?: string) => {
      if (isStreaming) return;

      unlockAudio();
      playLaserZip();

      if (streamTimerRef.current) clearInterval(streamTimerRef.current);

      const userMessageId = `msg-${Date.now()}`;
      const userMsg = {
        id: userMessageId,
        role: 'user' as const,
        content: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const currentTitle = activeSession.title;
      const nextTitle =
        currentTitle === 'New Conversation Thread' || currentTitle === 'New Conversation'
          ? text.slice(0, 36) + (text.length > 36 ? '…' : '')
          : currentTitle;

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                title: nextTitle,
                updatedAt: 'Just now',
                messages: [...s.messages, userMsg],
              }
            : s
        )
      );

      setActivePresetId(presetId);
      setIsStreaming(true);
      setStreamedText('');
      setTokensCount(0);

      const personaMeta = AMBIENT_PERSONAS.find((p) => p.id === selectedPersona);
      const contentToStream =
        customStreamContent ||
        `[${selectedModel} · ${selectedPersona}]\n\nThe Minimalist AI Chat workspace processes requests under strict hardware compositor synchronization.\n\n### Key Architectural Principles:\n1. **Commutative Layouts**: Strict bounding geometry prevents all cumulative layout shifts (CLS = 0.000).\n2. **Zero-Blur Turbo Compositor**: High-speed VSync locked performance without Gaussian fill-rate bottlenecks.\n3. **Dark Comfort High Contrast**: WCAG AAA text visibility with solid tactile surfaces.\n\n*Response synthesized in response to: "${text}". Persona doctrine: ${personaMeta?.subtitle || 'Active reasoning complete.'}*`;

      const words = contentToStream.split(' ');
      let currentIndex = 0;
      startTimeRef.current = performance.now();

      streamTimerRef.current = setInterval(() => {
        if (currentIndex < words.length) {
          const nextChunk = words.slice(0, currentIndex + 1).join(' ');
          setStreamedText(nextChunk);
          currentIndex++;
          setTokensCount(currentIndex);

          const elapsedSeconds = (performance.now() - startTimeRef.current) / 1000;
          if (elapsedSeconds > 0 && currentIndex % 4 === 0) {
            setTokensPerSec(Math.round(currentIndex / elapsedSeconds));
          }
        } else {
          if (streamTimerRef.current) clearInterval(streamTimerRef.current);
          setIsStreaming(false);
          playSuccessChime();

          const assistantMsg = {
            id: `asst-${Date.now()}`,
            role: 'assistant' as const,
            model: selectedModel,
            persona: selectedPersona,
            content: words.join(' '),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            tokenCount: words.length,
            latencyMs: 14.2,
          };

          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSessionId
                ? {
                    ...s,
                    updatedAt: 'Just now',
                    messages: [...s.messages, assistantMsg],
                  }
                : s
            )
          );
          setStreamedText('');
        }
      }, 16);
    },
    [activeSession, activeSessionId, isStreaming, selectedModel, selectedPersona]
  );

  const handleStopStream = useCallback(() => {
    if (streamTimerRef.current) {
      clearInterval(streamTimerRef.current);
      streamTimerRef.current = null;
    }
    setIsStreaming(false);
    if (streamedText.trim()) {
      const assistantMsg = {
        id: `asst-${Date.now()}`,
        role: 'assistant' as const,
        model: selectedModel,
        persona: selectedPersona,
        content: streamedText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tokenCount: streamedText.split(/\s+/).length,
        latencyMs: 12.0,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, assistantMsg] }
            : s
        )
      );
      setStreamedText('');
    }
  }, [activeSessionId, selectedModel, selectedPersona, streamedText]);

  function handleSelectPreset(preset: PresetItem) {
    handleSendMessage(preset.text, preset.streamContent, preset.id);
  }

  function handleClearAll() {
    handleStopStream();
    setScratchpad(DEFAULT_SCRATCHPAD);
    setPrompt('');
    handleClearThread();
    setActivePresetId(undefined);
  }

  return (
    <div className="fixed inset-0 z-30 flex h-dvh w-dvw flex-col overflow-hidden bg-bg text-fg select-none">
      {/* ── Top-Bar: Unified Master Header (48px) ── */}
      <MinimalTopBar
        selectedModel={selectedModel}
        onSelectModel={handleSelectModel}
        activeSessionTitle={activeSession?.title || 'Minimalist AI Chat'}
        leftRailOpen={leftRailOpen}
        onToggleLeftRail={() => setLeftRailOpen((prev) => !prev)}
        rightInspectorOpen={rightInspectorOpen}
        onToggleRightInspector={() => setRightInspectorOpen((prev) => !prev)}
        onOpenKeyboardHud={() => setKeyboardHudOpen(true)}
      />

      {/* ── Main Workspace Body: Full-Bleed 3-Column Docked Layout ── */}
      <main className="relative flex flex-1 min-h-0 w-full overflow-hidden bg-bg">
        {/* Left Dock: Speed Presets, Personas & Chats Navigator */}
        {leftRailOpen && (
          <div className="h-full shrink-0 animate-in slide-in-from-left duration-150">
            <MinimalLeftRail
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelectSession={setActiveSessionId}
              onNewSession={handleNewSession}
              onDeleteSession={handleDeleteSession}
              onTogglePinSession={handleTogglePinSession}
              selectedPersona={selectedPersona}
              onSelectPersona={handleSelectPersona}
              mode={mode}
              onModeChange={(m) => {
                setMode(m);
                setActivePresetId(undefined);
              }}
              onSelectPreset={handleSelectPreset}
              activePresetId={activePresetId}
              isStreaming={isStreaming}
            />
          </div>
        )}

        {/* Center Stage: Floating Omni-Command & Twin Focus Deck */}
        <MinimalCenterStage
          messages={activeSession?.messages || []}
          onSendMessage={handleSendMessage}
          isStreaming={isStreaming}
          streamedText={streamedText}
          onStopStream={handleStopStream}
          onClearThread={handleClearThread}
          selectedModel={selectedModel}
          selectedPersona={selectedPersona}
          tokensCount={tokensCount}
          tokensPerSec={tokensPerSec}
          scratchpad={scratchpad}
          setScratchpad={setScratchpad}
          prompt={prompt}
          setPrompt={setPrompt}
          promptInputRef={promptInputRef}
        />

        {/* Right Dock: Hardware Telemetry Lab & Model Intel */}
        {rightInspectorOpen && (
          <div className="h-full shrink-0 animate-in slide-in-from-right duration-150">
            <MinimalRightInspector
              streamedText={streamedText}
              scratchpad={scratchpad}
              onClearAll={handleClearAll}
              tokensCount={tokensCount}
              tokensPerSec={tokensPerSec}
              selectedModel={selectedModel}
              selectedPersona={selectedPersona}
              messagesCount={activeSession?.messages.length || 0}
            />
          </div>
        )}
      </main>

      {/* ── Keyboard Shortcuts HUD Modal ── */}
      <MinimalKeyboardHudModal
        isOpen={keyboardHudOpen}
        onClose={() => setKeyboardHudOpen(false)}
      />
    </div>
  );
}
