'use client';

// components/CommandPalette.tsx — Universal Cyber Command Palette (Cmd+K / Ctrl+K).
// High-speed keyboard switcher with instant route jumps, theme toggles, chromatic presets, and procedural haptics.
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { playHapticTick, playSuccessChime, unlockAudio } from '@/lib/audio/synthesizer';
import { CHROMATIC_PRESETS } from '@/components/ui/ChromaticHarmonyPicker';
import { toggleLanguage } from '@/lib/i18n';
import { panicPurgeAllData } from '@/lib/draft';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Emergency Response' | 'Safety Intelligence' | 'Accessibility & Language' | 'Appearance & Theme' | 'System & Cache';
  shortcut?: string;
  badge?: string;
  run: (context: {
    router: ReturnType<typeof useRouter>;
    close: () => void;
    toggleTheme: () => void;
    toggleSound: () => void;
    applyPreset: (presetId: string) => void;
  }) => void;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Command definitions
  const commands: CommandItem[] = [
    // ── Emergency Response ──
    {
      id: 'nav-report',
      title: 'Report Fraud to 1930 (Golden Hour)',
      subtitle: 'Instant on-device OCR receipt triage, 12-digit UTR isolation & police call script',
      category: 'Emergency Response',
      shortcut: 'G R',
      badge: '1930',
      run: ({ router, close }) => {
        router.push('/report');
        close();
      },
    },
    {
      id: 'nav-verify',
      title: 'Before You Pay Again (Deposit Brake)',
      subtitle: 'Halt extortionate withdrawal clearance taxes & fake digital arrest bail',
      category: 'Emergency Response',
      shortcut: 'G V',
      badge: 'BRAKE',
      run: ({ router, close }) => {
        router.push('/verify');
        close();
      },
    },
    {
      id: 'action-dial-1930',
      title: 'Direct Dial 1930 Police Helpline',
      subtitle: 'Launch phone dialer for National Cybercrime Reporting Helpline',
      category: 'Emergency Response',
      shortcut: '⌘ 9',
      badge: 'DIAL',
      run: ({ close }) => {
        if (typeof window !== 'undefined') {
          window.location.href = 'tel:1930';
        }
        close();
      },
    },
    {
      id: 'action-panic-purge',
      title: 'Panic Purge (Instant Trace Erasure)',
      subtitle: 'Instantly clear all local drafts, scanned receipts, and contact lists',
      category: 'Emergency Response',
      shortcut: '⌘ ⌫',
      badge: 'PURGE',
      run: ({ close }) => {
        unlockAudio();
        panicPurgeAllData();
        close();
      },
    },

    // ── Safety Intelligence ──
    {
      id: 'nav-decode',
      title: 'Psychological Manipulation Decoder',
      subtitle: '10-second cognitive pause & deceptive link autopsy workbench',
      category: 'Safety Intelligence',
      shortcut: 'G D',
      badge: 'DECODE',
      run: ({ router, close }) => {
        router.push('/#decoder');
        close();
      },
    },
    {
      id: 'nav-truths',
      title: 'Three Permanent Truths That Break Frauds',
      subtitle: 'Permanent disproving axioms against cyber extortion and fake arrest',
      category: 'Safety Intelligence',
      shortcut: 'G T',
      badge: 'TRUTHS',
      run: ({ router, close }) => {
        router.push('/verify');
        close();
      },
    },
    {
      id: 'nav-docket',
      title: 'Digital Evidence Integrity Docket',
      subtitle: 'On-device SHA-256 cryptographic file digests under BSA 2023',
      category: 'Safety Intelligence',
      shortcut: 'G E',
      badge: 'BSA-2023',
      run: ({ router, close }) => {
        router.push('/report#docket');
        close();
      },
    },
    {
      id: 'nav-about',
      title: 'Surakshit Bharat Architecture & Specs',
      subtitle: 'SFIC 2026 Level 3 Open Track specifications & privacy baseline',
      category: 'Safety Intelligence',
      shortcut: 'G A',
      badge: 'SPECS',
      run: ({ router, close }) => {
        router.push('/about');
        close();
      },
    },

    // ── Accessibility & Language ──
    {
      id: 'toggle-senior',
      title: 'Toggle Senior Citizen Mode',
      subtitle: 'Enlarge typography to 22px, expand touch targets to 64px, and maximize contrast',
      category: 'Accessibility & Language',
      shortcut: '⌘ S',
      badge: 'SENIOR',
      run: ({ close }) => {
        if (typeof window !== 'undefined') {
          const isSenior = document.documentElement.classList.toggle('senior-mode');
          try {
            localStorage.setItem('pausepoint_senior_mode', String(isSenior));
          } catch {
            // Ignore storage errors
          }
        }
        close();
      },
    },
    {
      id: 'toggle-lang',
      title: 'Toggle Language (English ⇄ हिन्दी)',
      subtitle: 'Switch between English and Hindi across emergency crisis interfaces',
      category: 'Accessibility & Language',
      shortcut: '⌘ L',
      badge: 'LANG',
      run: ({ close }) => {
        toggleLanguage();
        close();
      },
    },

    // ── Appearance & Theme ──
    {
      id: 'theme-toggle',
      title: 'Toggle Dark / Light Mode',
      subtitle: 'Switch between Obsidian OLED and Ceramic Light themes',
      category: 'Appearance & Theme',
      shortcut: '⌘ T',
      badge: 'THEME',
      run: ({ toggleTheme, close }) => {
        toggleTheme();
        close();
      },
    },
    {
      id: 'sound-toggle',
      title: 'Toggle Audio Synthesizer Haptics',
      subtitle: 'Mute or unmute procedural Web Audio clicks and chimes',
      category: 'Appearance & Theme',
      shortcut: '⌘ M',
      badge: 'AUDIO',
      run: ({ toggleSound, close }) => {
        toggleSound();
        close();
      },
    },
    // Dynamic Chromatic Presets
    ...CHROMATIC_PRESETS.map((preset) => ({
      id: `preset-${preset.id}`,
      title: `Set Theme Accent: ${preset.name}`,
      subtitle: `Apply dynamic ${preset.name} palette with live OKLCH tokens`,
      category: 'Appearance & Theme' as const,
      badge: preset.id.toUpperCase(),
      run: ({ applyPreset, close }: { applyPreset: (presetId: string) => void; close: () => void }) => {
        applyPreset(preset.id);
        close();
      },
    })),

    // ── System & Cache ──
    {
      id: 'copy-url',
      title: 'Copy Current Link to Clipboard',
      subtitle: 'Share direct URL with route parameters',
      category: 'System & Cache',
      badge: 'CLIPBOARD',
      run: ({ close }) => {
        if (typeof window !== 'undefined') {
          navigator.clipboard.writeText(window.location.href);
        }
        close();
      },
    },
    {
      id: 'clear-storage',
      title: 'Purge Local Session & Storage Cache',
      subtitle: 'Reset client state, IndexedDB cache, and sound settings',
      category: 'System & Cache',
      badge: 'PURGE',
      run: ({ close }) => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('hk-sound-muted');
          localStorage.removeItem('hk-brand-color');
          window.location.reload();
        }
        close();
      },
    },
  ];

  // Filter commands by search query
  const filteredCommands = query.trim()
    ? commands.filter(
        (cmd) =>
          cmd.title.toLowerCase().includes(query.toLowerCase()) ||
          cmd.subtitle?.toLowerCase().includes(query.toLowerCase()) ||
          cmd.category.toLowerCase().includes(query.toLowerCase()) ||
          cmd.badge?.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  // Global Keyboard Listener (Cmd+K / Ctrl+K and Escape)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        unlockAudio();
        playHapticTick();
        setIsOpen((prev) => {
          if (!prev) {
            setQuery('');
            setSelectedIndex(0);
          }
          return !prev;
        });
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector<HTMLElement>('[data-active="true"]');
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Keyboard navigation inside palette
  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      unlockAudio();
      playHapticTick();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      unlockAudio();
      playHapticTick();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const activeCmd = filteredCommands[selectedIndex];
      if (activeCmd) {
        unlockAudio();
        playSuccessChime();
        executeCommand(activeCmd);
      }
    }
  }

  function executeCommand(cmd: CommandItem) {
    cmd.run({
      router,
      close: () => setIsOpen(false),
      toggleTheme: () => {
        const isDark = document.documentElement.classList.toggle('dark');
        document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
      },
      toggleSound: () => {
        const current = localStorage.getItem('hk-sound-muted') === 'true';
        localStorage.setItem('hk-sound-muted', String(!current));
        window.dispatchEvent(new Event('hk-sound-toggle'));
      },
      applyPreset: (presetId: string) => {
        const found = CHROMATIC_PRESETS.find((p) => p.id === presetId);
        if (!found) return;
        localStorage.setItem('hk-brand-color', found.id);
        const isDark = document.documentElement.classList.contains('dark');
        document.documentElement.style.setProperty('--color-brand', isDark ? found.darkOklch : found.lightOklch);
        window.dispatchEvent(new Event('hk-brand-change'));
      },
    });
  }

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Universal Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh] sm:pt-[14vh] backdrop-blur-md bg-shade/55 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
    >
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-sheen/15 bg-surface/98 shadow-2xl backdrop-blur-2xl transition-all dark:border-sheen/10 dark:bg-bg/98">
        {/* Specular Ambient Glow Header Accent */}
        <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan to-transparent opacity-80" />

        {/* Search Bar Input */}
        <div className="relative flex items-center border-b border-border/80 px-4 py-3.5">
          <svg
            className="h-5 w-5 shrink-0 text-brand"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Type a command or search actions..."
            className="w-full bg-transparent px-3 text-sm font-medium text-fg placeholder:text-fg-muted outline-none"
          />

          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="hidden sm:inline-flex items-center rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-fg-muted">
              ESC
            </kbd>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-fg-muted hover:bg-surface-2 hover:text-fg transition-colors"
              aria-label="Close Command Palette"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-[380px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
        >
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-xs text-fg-muted">
              No matching commands found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  data-active={isSelected}
                  onMouseEnter={() => {
                    setSelectedIndex(idx);
                  }}
                  onClick={() => {
                    unlockAudio();
                    playSuccessChime();
                    executeCommand(cmd);
                  }}
                  className={`group relative flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 transition-all duration-100 ${
                    isSelected
                      ? 'bg-brand/15 text-brand shadow-xs border border-brand/30'
                      : 'text-fg hover:bg-surface-2/60 border border-transparent'
                  }`}
                >
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${isSelected ? 'text-brand' : 'text-fg'}`}>
                        {cmd.title}
                      </span>
                      {cmd.badge && (
                        <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-fg-muted">
                          {cmd.badge}
                        </span>
                      )}
                    </div>
                    {cmd.subtitle && (
                      <span className="truncate text-[11px] text-fg-muted mt-0.5">
                        {cmd.subtitle}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {cmd.shortcut && (
                      <kbd className="rounded border border-border bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-fg-muted">
                        {cmd.shortcut}
                      </kbd>
                    )}
                    {isSelected && (
                      <kbd className="rounded bg-brand px-1.5 py-0.5 font-mono text-[10px] font-bold text-brand-fg">
                        ↵
                      </kbd>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hotkeys Hint */}
        <div className="flex items-center justify-between border-t border-border/80 bg-surface-2/40 px-4 py-2 text-[11px] text-fg-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-mono">
              <kbd className="rounded border border-border bg-surface px-1 text-[10px]">↑</kbd>
              <kbd className="rounded border border-border bg-surface px-1 text-[10px]">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1 font-mono">
              <kbd className="rounded border border-border bg-surface px-1 text-[10px]">↵</kbd>
              Execute
            </span>
          </div>
          <span className="font-mono text-[10px] text-brand uppercase tracking-wider">
            Sub-millisecond Local Response
          </span>
        </div>
      </div>
    </div>
  );
}
