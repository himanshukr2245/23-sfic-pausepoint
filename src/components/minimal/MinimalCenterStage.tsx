'use client';

// components/minimal/MinimalCenterStage.tsx — Twin Focus Deck & Omni-Command Bar
// Enforces Commutative Layout Law: Balanced side-by-side chambers with identical heights.
// Distraction-Free Dark Comfort: Solid bg-surface-2, crisp borders, WCAG AAA text contrast.
import React, { useState, useRef, useEffect } from 'react';
import {
  Button,
  Input,
  TextArea,
  CopyIcon,
  CheckIcon,
  BotIcon,
  UserIcon,
} from '@/components/ui';
import {
  playHapticTick,
  playSuccessChime,
  unlockAudio,
} from '@/lib/audio/synthesizer';
import {
  type AmbientMessage,
  type AmbientModelId,
  type AmbientPersonaId,
  SUGGESTED_CHIPS,
} from './minimal-store';

export interface MinimalCenterStageProps {
  messages: AmbientMessage[];
  onSendMessage: (text: string) => void;
  isStreaming: boolean;
  streamedText: string;
  onStopStream: () => void;
  onClearThread: () => void;
  selectedModel: AmbientModelId;
  selectedPersona: AmbientPersonaId;
  tokensCount: number;
  tokensPerSec: number;
  scratchpad: string;
  setScratchpad: (v: string) => void;
  prompt: string;
  setPrompt: (v: string) => void;
  promptInputRef: React.RefObject<HTMLInputElement | null>;
}

export function MinimalCenterStage({
  messages,
  onSendMessage,
  isStreaming,
  streamedText,
  onStopStream,
  onClearThread,
  selectedModel,
  selectedPersona,
  tokensCount,
  tokensPerSec,
  scratchpad,
  setScratchpad,
  prompt,
  setPrompt,
  promptInputRef,
}: MinimalCenterStageProps) {
  const [copiedScratchpad, setCopiedScratchpad] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat stream to bottom without layout jitter
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, streamedText]);

  // Vitals calculation for Thought Scratchpad
  const wordCount = scratchpad.trim().split(/\s+/).filter(Boolean).length;
  const charCount = scratchpad.length;
  const readingTimeMin = (wordCount / 200).toFixed(1);

  function handleCopyScratchpad() {
    unlockAudio();
    playSuccessChime();
    navigator.clipboard.writeText(scratchpad);
    setCopiedScratchpad(true);
    setTimeout(() => setCopiedScratchpad(false), 2000);
  }

  function handleCopyMessage(id: string, content: string) {
    unlockAudio();
    playSuccessChime();
    navigator.clipboard.writeText(content);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  }

  function handleSubmitPrompt(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (trimmed && !isStreaming) {
      setPrompt('');
      onSendMessage(trimmed);
    }
  }

  return (
    <section className="flex h-full flex-1 flex-col gap-3 overflow-hidden p-3 select-none">
      {/* ── Top Zone: Floating Omni-Command Bar (h-12) with Quick Shelf ── */}
      <div className="flex flex-col gap-1.5 shrink-0">
        <div className="flex h-12 w-full items-center justify-between rounded-xl border border-border/80 bg-surface px-3 shadow-2xs focus-within:border-cyan/60 transition-colors">
          <form onSubmit={handleSubmitPrompt} className="flex h-full w-full items-center gap-2.5">
            <span className="font-mono text-sm font-bold text-fg-muted">›</span>
            <Input
              ref={promptInputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Ask in [${selectedPersona}] persona... (Press / to focus, Enter to send)`}
              className="h-9 flex-1 border-0 bg-transparent px-1 font-mono text-xs text-fg placeholder:text-fg-muted/60 focus:ring-0 focus:outline-hidden"
            />

            {isStreaming ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-lg bg-cyan/10 px-2.5 py-1 text-[11px] font-mono font-bold text-cyan">
                  <span className="h-1.5 w-1.5 animate-ping rounded-full bg-cyan" />
                  {tokensPerSec} tok/s
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  sound="tick"
                  onClick={onStopStream}
                  className="h-8 text-xs font-bold"
                >
                  ■ Stop
                </Button>
              </div>
            ) : (
              <Button
                type="submit"
                size="sm"
                variant="primary"
                sound="laser"
                className="h-8 text-xs font-bold"
              >
                Send ↵
              </Button>
            )}
          </form>
        </div>

        {/* Quick Suggestion Chips Shelf */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-1 py-0.5">
          <span className="text-[10px] font-bold text-fg-muted uppercase tracking-wider shrink-0 mr-1">
            Quick:
          </span>
          {SUGGESTED_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (!isStreaming) {
                  onSendMessage(chip);
                }
              }}
              className="shrink-0 rounded-full border border-border/80 bg-surface px-2.5 py-0.5 text-[10px] text-fg-muted hover:border-cyan/40 hover:bg-surface-2 hover:text-cyan transition-colors cursor-pointer shadow-2xs"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* ── Center Zone: Twin Focus Deck (Strictly Commutative Balanced Panes) ── */}
      <div className="grid h-[calc(100%-88px)] min-h-0 w-full grid-cols-1 md:grid-cols-2 gap-3">
        {/* ── Pane A: High-Speed AI Chat Stream Chamber ── */}
        <div className="flex h-full min-h-0 flex-col justify-between rounded-2xl border border-border/80 bg-surface p-3.5 shadow-2xs">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-border/60 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-fg">
                AI Chat Stream
              </span>
              {isStreaming ? (
                <span className="rounded bg-cyan/15 px-1.5 py-0.2 text-[9px] font-mono font-bold text-cyan animate-pulse">
                  STREAMING
                </span>
              ) : (
                <span className="rounded bg-surface-2 px-1.5 py-0.2 text-[9px] font-mono text-fg-muted">
                  IDLE
                </span>
              )}
              <span className="hidden sm:inline-block rounded bg-cyan/10 px-1.5 py-0.2 text-[9px] font-mono text-cyan font-semibold">
                {selectedModel}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-fg-muted">
                Tokens: <strong className="text-fg">{tokensCount}</strong>
              </span>
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    unlockAudio();
                    playHapticTick();
                    onClearThread();
                  }}
                  className="rounded px-1.5 py-0.5 text-[10px] font-mono text-fg-muted hover:text-danger hover:bg-surface-2 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Chat Stream Body */}
          <div
            ref={chatScrollRef}
            className="my-2.5 flex-1 min-h-0 overflow-y-auto rounded-xl border border-border/60 bg-surface-2 p-3 font-sans text-xs leading-relaxed space-y-3.5 select-text"
          >
            {messages.length === 0 && !isStreaming ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-fg-muted py-12 select-none">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan/15 text-cyan border border-cyan/30 mb-2">
                  <BotIcon className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-bold text-fg">AI Chat Stream Ready</h3>
                <p className="text-[11px] font-sans max-w-xs leading-normal mt-1">
                  Type a prompt above, pick a Quick chip, or click a Speed Preset from the left rail to converse with <strong className="text-cyan">{selectedModel}</strong>.
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  const isCopied = copiedMessageId === msg.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan/15 text-cyan border border-cyan/30 text-xs shadow-2xs mt-0.5">
                          <BotIcon className="h-3.5 w-3.5" />
                        </div>
                      )}

                      <div
                        className={`group relative max-w-[85%] rounded-xl p-3 text-xs leading-relaxed transition-all ${
                          isUser
                            ? 'bg-brand/90 border border-brand/50 text-brand-fg font-medium rounded-tr-xs shadow-2xs'
                            : 'bg-surface border border-border/80 text-fg rounded-tl-xs shadow-2xs'
                        }`}
                      >
                        {!isUser && (
                          <div className="mb-1.5 flex items-center justify-between border-b border-border/50 pb-1 text-[10px] font-mono text-fg-muted">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-cyan">{msg.model || selectedModel}</span>
                              {msg.persona && (
                                <span className="rounded bg-surface-2 px-1 py-0.2 font-medium text-fg">
                                  {msg.persona}
                                </span>
                              )}
                              {msg.latencyMs && (
                                <span className="text-success font-medium">{msg.latencyMs}ms</span>
                              )}
                            </div>

                            <Button
                              variant="plain"
                              size="none"
                              latencyMode="none"
                              type="button"
                              onClick={() => handleCopyMessage(msg.id, msg.content)}
                              title={isCopied ? 'Copied to clipboard' : 'Copy response'}
                              aria-label={isCopied ? 'Copied' : 'Copy response'}
                              className="flex h-5 w-5 items-center justify-center rounded border border-border/60 bg-surface-2 text-fg-muted hover:border-cyan/40 hover:bg-surface-3 hover:text-cyan transition-colors cursor-pointer"
                            >
                              {isCopied ? (
                                <CheckIcon className="h-3 w-3 text-success" />
                              ) : (
                                <CopyIcon className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        )}

                        <div className="whitespace-pre-wrap select-text font-mono text-[11px] leading-relaxed">
                          {msg.content}
                        </div>

                        {isUser && (
                          <div className="mt-1 text-right text-[9px] font-mono text-brand-fg/70">
                            {msg.timestamp}
                          </div>
                        )}
                      </div>

                      {isUser && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-2 border border-border/80 text-fg-muted text-xs shadow-2xs mt-0.5">
                          <UserIcon className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* In-Flight Streaming Response Bubble (Rock-Solid Anti-Jitter Layout) */}
                {isStreaming && (
                  <div className="flex gap-2.5 justify-start">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan/20 text-cyan border border-cyan/40 text-xs shadow-2xs mt-0.5">
                      <BotIcon className="h-3.5 w-3.5" />
                    </div>
                    <div className="w-full max-w-[85%] rounded-xl p-3 text-xs leading-relaxed bg-surface border border-cyan/40 text-fg rounded-tl-xs shadow-2xs [contain:layout_style]">
                      <div className="mb-1.5 flex h-5 items-center justify-between border-b border-border/50 pb-1 text-[10px] font-mono text-cyan">
                        <div className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_6px_var(--color-cyan)]" />
                          <span className="font-semibold">Generating</span>
                          <span className="tabular-nums text-fg-muted font-normal min-w-[56px]">
                            ({tokensPerSec} tok/s)
                          </span>
                        </div>
                        <Button
                          variant="plain"
                          size="none"
                          latencyMode="none"
                          type="button"
                          onClick={onStopStream}
                          className="rounded px-1.5 py-0.2 text-[9px] font-bold text-danger border border-danger/40 bg-danger/10 hover:bg-danger/20 transition-colors cursor-pointer"
                        >
                          ■ Stop
                        </Button>
                      </div>

                      <div className="whitespace-pre-wrap font-mono text-[11px] select-text text-fg leading-relaxed">
                        {streamedText}
                        <span className="inline-block w-1.5 h-3 ml-0.5 bg-cyan animate-pulse align-baseline" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Vitals */}
          <div className="flex shrink-0 items-center justify-between border-t border-border/60 pt-2 text-[10px] font-mono text-fg-muted">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_6px_var(--color-cyan)]" />
              <span>Zero-Drop Frame Buffer</span>
            </div>
            <span>
              Velocity: <strong className="text-fg">{tokensPerSec > 0 ? `${tokensPerSec}/s` : '0/s'}</strong>
            </span>
          </div>
        </div>

        {/* ── Pane B: Instant Thought Scratchpad ── */}
        <div className="flex h-full min-h-0 flex-col justify-between rounded-2xl border border-border/80 bg-surface p-3.5 shadow-2xs">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-border/60 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-fg">
                Thought Scratchpad
              </span>
              <span className="rounded bg-success/15 px-1.5 py-0.2 text-[9px] font-mono font-bold text-success">
                &lt;1ms LATENCY
              </span>
            </div>

            <Button
              size="none"
              variant="plain"
              type="button"
              onClick={handleCopyScratchpad}
              title={copiedScratchpad ? 'Copied to clipboard' : 'Copy scratchpad'}
              aria-label={copiedScratchpad ? 'Copied to clipboard' : 'Copy scratchpad'}
              className="flex h-6 w-6 items-center justify-center rounded-md border border-border/70 bg-surface-2 text-fg-muted hover:border-border hover:bg-surface hover:text-fg transition-all cursor-pointer shadow-2xs"
            >
              {copiedScratchpad ? (
                <CheckIcon className="h-3.5 w-3.5 text-success" />
              ) : (
                <CopyIcon className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>

          {/* Scratchpad Body */}
          <div className="my-2.5 flex-1 min-h-0 rounded-xl border border-border/60 bg-surface-2 p-1">
            <TextArea
              value={scratchpad}
              onChange={(e) => {
                setScratchpad(e.target.value);
                unlockAudio();
                playHapticTick();
              }}
              aria-label="Thought Scratchpad Text Editor"
              className="h-full w-full resize-none border-0 bg-transparent p-2 font-mono text-xs text-fg leading-relaxed placeholder:text-fg-muted/50 focus:ring-0 focus:outline-hidden"
            />
          </div>

          {/* Footer Vitals */}
          <div className="flex shrink-0 items-center justify-between border-t border-border/60 pt-2 text-[10px] font-mono text-fg-muted">
            <div className="flex items-center gap-3">
              <span>
                Words: <strong className="text-fg">{wordCount}</strong>
              </span>
              <span>
                Chars: <strong className="text-fg">{charCount}</strong>
              </span>
              <span>
                Est. Read: <strong className="text-fg">{readingTimeMin} min</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-success font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_6px_var(--color-success)]" />
              <span>Local Memory</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
