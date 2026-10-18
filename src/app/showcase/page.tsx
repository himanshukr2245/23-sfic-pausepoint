'use client';

// tokens-ok-file: archetype color swatch palettes are data for the showcase preview cards
// app/showcase/page.tsx — Master Archetypes Hub & Real-Time Performance Lab.
import Link from 'next/link';
import { SpeedBenchmarkHud } from '@/components/showcase/SpeedBenchmarkHud';
import {
  Button,
  AwsSpotlightCard,
  type SpotlightColorAccent,
  LayoutGridIcon,
  BoltIcon,
  BookOpenIcon,
  SparklesIcon,
  ScaleIcon,
} from '@/components/ui';
import { unlockAudio, playHapticTick, playSuccessChime } from '@/lib/audio/synthesizer';

interface ArchetypeItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  reference: string;
  badge: string;
  tagline: string;
  palette: string[];
  bestFor: string;
  colorAccent?: SpotlightColorAccent;
  liveUrl?: string;
  liveLabel?: string;
}

const ARCHETYPES: ArchetypeItem[] = [
  {
    id: 'studio',
    title: 'Creative Canvas Studio (QuoteMaker Style)',
    icon: LayoutGridIcon,
    href: '/studio',
    reference: 'QuoteMaker Studio, Figma, Miro',
    badge: '<0.5ms Paint',
    colorAccent: 'indigo',
    tagline: 'Interactive visual canvas, draggable cards, live tool rack, letterhead generator, and JSON data mobility.',
    palette: ['#0d0d11', '#18191f', '#06b6d4', '#10b981'],
    bestFor: 'QuoteMaker, Creative Workspaces, Document Designers, Visual Canvases',
    liveUrl: 'http://quotemaker.hkr.dpdns.org/studio',
    liveLabel: 'Production QuoteMaker',
  },
  {
    id: 'ai',
    title: 'AI Chat & Thought Canvas',
    icon: BoltIcon,
    href: '/ai',
    reference: 'ChatGPT, Google Gemini, Claude',
    badge: 'VSync Locked',
    colorAccent: 'cyan',
    tagline: 'Multi-turn conversational AI stream, 4-model cognitive switcher, instant Thought Scratchpad & hardware VSync telemetry.',
    palette: ['#09090b', '#18191f', '#06b6d4', '#ffffff'],
    bestFor: 'Conversational Agents, LLM Workspaces, Instant Thought Canvases, Fast Writing',
  },
  {
    id: 'editorial',
    title: 'Editorial & Typography',
    icon: BookOpenIcon,
    href: '/editorial',
    reference: 'Claude Artifacts, Substack, Medium',
    badge: '<0.8ms Paint',
    colorAccent: 'amber',
    tagline: 'Literary reading immersion, warm parchment surfaces, classical drop-caps & 1-click quote card exporter.',
    palette: ['#fdfbf7', '#161514', '#c25e40', '#d97706'],
    bestFor: 'QuoteMaker, Xeraphine, Digital Magazines, Long-form Essays',
  },
];

export default function ShowcaseHubPage() {
  function handleNavClick() {
    unlockAudio();
    playHapticTick();
  }

  function handleCopyCommand(archetypeId: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    unlockAudio();
    playSuccessChime();
    const cmd = `node scripts/genesis.mjs "My App" --archetype ${archetypeId} --reset-git`;
    navigator.clipboard.writeText(cmd).catch(() => {});
    alert(`Copied Genesis CLI command:\n${cmd}`);
  }

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
      {/* ── Hub Hero Header ── */}
      <header className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-cyan/15 border border-cyan/30 px-3.5 py-1 text-xs font-mono font-bold text-cyan shadow-sm">
          <span>⚡ Universal Interface Archetypes</span>
          <span>•</span>
          <span className="text-fg">HK Library v3.0</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-fg">
          The Universal Archetype Showcase
        </h1>

        <p className="text-sm sm:text-base text-fg-muted leading-relaxed">
          Never guess which design to use for a new application. Experience all six interface
          archetypes live, test their micro-interactions, listen to procedural acoustics, and verify
          their real-time hardware compositor speed.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-mono">
          <span className="rounded-full bg-surface-2 border border-border px-3 py-1 text-fg-muted">
            Hardware-Accelerated VSync
          </span>
          <span className="rounded-full bg-surface-2 border border-border px-3 py-1 text-fg-muted">
            Zero Cumulative Shift (CLS = 0.000)
          </span>
          <span className="rounded-full bg-surface-2 border border-border px-3 py-1 text-fg-muted">
            0 kB Web Audio Synthesizer
          </span>
        </div>
      </header>

      {/* ── Archetype Foundry & Dynamic Template Law Banner ── */}
      <section
        aria-label="Archetype Foundry & Adaptive Architecture Guide"
        className="aws-card spotlight-card spotlight-cyan rounded-3xl p-6 sm:p-7 border border-border/80 bg-surface/98 shadow-lg"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
            </span>
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-cyan">
              Template Adaptability Guide · How Showcase Becomes Your App
            </span>
          </div>
          <span className="text-[11px] font-mono text-fg-muted font-semibold">
            Universal Foundry v3.0
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-fg">
            Choose Your App Stage: How This Showcase Adapts Per Project
          </h2>
          <p className="text-xs sm:text-sm text-fg-muted leading-relaxed">
            When you branch from this template to build a specific app, <strong className="text-fg">this showcase transforms directly into that application&apos;s primary workspace:</strong>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="rounded-xl border border-border/60 bg-surface-2/60 p-3 flex flex-col gap-1">
              <span className="font-bold text-fg flex items-center gap-1.5">
                <LayoutGridIcon className="h-3.5 w-3.5 text-cyan" /> Productivity / Creative
              </span>
              <span className="text-fg-muted text-[11px]">
                Showcase transforms into <strong className="text-cyan">Studio Workspace</strong> (canvas, tool rack, letterhead).
              </span>
            </div>

            <div className="rounded-xl border border-border/60 bg-surface-2/60 p-3 flex flex-col gap-1">
              <span className="font-bold text-fg flex items-center gap-1.5">
                <BoltIcon className="h-3.5 w-3.5 text-brand" /> AI Agents &amp; Fast Writers
              </span>
              <span className="text-fg-muted text-[11px]">
                Showcase transforms into <strong className="text-cyan">Minimal Super-Fast</strong> (streaming typewriter, scratchpad).
              </span>
            </div>

            <div className="rounded-xl border border-border/60 bg-surface-2/60 p-3 flex flex-col gap-1">
              <span className="font-bold text-fg flex items-center gap-1.5">
                <BookOpenIcon className="h-3.5 w-3.5 text-amber" /> Essays &amp; Quotes
              </span>
              <span className="text-amber font-semibold text-[11px]">
                Showcase transforms into <strong>Editorial Typography</strong> (drop-caps, quote card exporter).
              </span>
            </div>

            <div className="rounded-xl border border-border/60 bg-surface-2/60 p-3 flex flex-col gap-1">
              <span className="font-bold text-fg flex items-center gap-1.5">
                <SparklesIcon className="h-3.5 w-3.5 text-purple" /> Games &amp; Interactive
              </span>
              <span className="text-cyan font-semibold text-[11px]">
                Showcase transforms into <strong>Play Arena</strong> (canvas game loop, audio haptics).
              </span>
            </div>
          </div>

          <div className="mt-2 rounded-xl border border-brand/40 bg-brand/5 p-3 text-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ScaleIcon className="h-4 w-4 text-brand" />
              <span className="text-fg font-semibold">
                Building an unlisted custom archetype? Always follow the Home Page Golden Axiom:
              </span>
            </div>
            <Link
              href="/"
              className="shrink-0 text-brand font-bold hover:underline font-mono text-[11px]"
            >
              View Template Law →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 7 Universal Archetypes Balanced Compact Showcase Grid ── */}
      <section
        aria-label="Archetype Gallery"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 auto-rows-fr"
      >
        {ARCHETYPES.map((arch) => (
          <AwsSpotlightCard
            key={arch.id}
            colorAccent={arch.colorAccent}
            sound={true}
            className="p-4.5 sm:p-5 cursor-pointer flex flex-col justify-between min-h-[220px] rounded-2xl border border-border/80 hover:border-border-strong transition-all duration-200"
            onClick={() => {
              unlockAudio();
              playHapticTick();
              window.location.href = arch.href;
            }}
          >
            {/* Top Row: Icon + Title Group (Left) & Badge + Palette (Right) */}
            <div>
              <div className="flex items-start justify-between gap-2.5">
                {/* Left: Icon + Title Cluster */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 border border-border/80 text-cyan shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                    <arch.icon className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-extrabold text-fg tracking-tight group-hover:text-cyan transition-colors truncate">
                      <Link
                        href={arch.href}
                        className="outline-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavClick();
                        }}
                      >
                        {arch.title}
                      </Link>
                    </h2>
                    <div className="text-[10.5px] font-mono text-fg-muted truncate">
                      Ref: <strong className="text-fg/80 font-semibold">{arch.reference.split(',')[0]}</strong>
                    </div>
                  </div>
                </div>

                {/* Right: Latency Badge + Color Swatch */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="rounded-full bg-surface-2 border border-border/80 px-2 py-0.5 text-[10px] font-mono font-bold text-fg-muted group-hover:text-cyan group-hover:border-cyan/40 transition-colors">
                    {arch.badge}
                  </span>
                  <div className="flex items-center gap-1 rounded-full bg-surface-2/60 border border-border/50 p-0.5 px-1">
                    {arch.palette.map((c, i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full shadow-xs"
                        style={{ backgroundColor: c }}
                        title={`Token ${i + 1}: ${c}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Tagline (Clamped to 2 lines for mathematical vertical harmony) */}
              <p className="mt-2.5 text-xs text-fg-muted leading-relaxed line-clamp-2">
                {arch.tagline}
              </p>
            </div>

            {/* Bottom Actions Footer */}
            <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between gap-2 text-xs">
              <span className="text-fg-muted truncate max-w-[130px] text-[10.5px] font-mono">
                {arch.bestFor.split(',')[0]}
              </span>

              <div className="flex items-center gap-1.5 shrink-0">
                {arch.liveUrl && (
                  <Button
                    variant="plain"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      unlockAudio();
                      playHapticTick();
                      window.open(arch.liveUrl, '_blank', 'noopener,noreferrer');
                    }}
                    title={`Open live production ${arch.liveLabel}`}
                    className="rounded-lg border border-cyan/40 bg-cyan/10 px-2 py-0.5 text-[10.5px] font-mono font-bold text-cyan hover:bg-cyan/20 transition-colors shadow-xs"
                  >
                    Prod ↗
                  </Button>
                )}
                <Button
                  variant="plain"
                  onClick={(e) => handleCopyCommand(arch.id, e)}
                  title="Copy Genesis CLI Command"
                  className="rounded-lg border border-border/80 bg-surface-2 px-2 py-0.5 text-[10.5px] font-mono font-bold text-fg-muted hover:text-cyan hover:border-cyan/40 transition-colors shadow-xs"
                >
                  CLI
                </Button>
                <Link
                  href={arch.href}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavClick();
                  }}
                  className="rounded-lg bg-brand text-brand-fg px-3 py-0.5 text-xs font-bold shadow-xs hover:opacity-95 transition-opacity"
                >
                  Explore →
                </Link>
              </div>
            </div>
          </AwsSpotlightCard>
        ))}
      </section>

      {/* ── Comparative Benchmark Matrix Table ── */}
      <section
        aria-label="Performance Benchmark Comparison"
        className="rounded-3xl border border-border/80 bg-surface shadow-2xl p-6 sm:p-8 overflow-hidden font-mono text-xs"
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-fg tracking-tight">
              Archetype Speed &amp; Architectural Telemetry
            </h2>
            <p className="mt-1 text-xs text-fg-muted">
              Live compositor paint budgets and DOM efficiency ratings across all six archetypes.
            </p>
          </div>
          <span className="rounded-full bg-success/15 text-success border border-success/30 px-3 py-1 text-xs font-bold">
            All Locked to Hardware VSync
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/80 text-[11px] text-fg-muted uppercase font-bold tracking-wider bg-surface-2/60">
                <th className="py-2.5 px-3">Archetype</th>
                <th className="py-2.5 px-4">Paint Duration</th>
                <th className="py-2.5 px-4">GPU Shaders</th>
                <th className="py-2.5 px-4">DOM Density</th>
                <th className="py-2.5 px-4">Primary Target Projects</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {ARCHETYPES.map((arch) => (
                <tr key={arch.id} className="hover:bg-surface-2/40 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-fg flex items-center gap-2">
                    <arch.icon className="h-4 w-4 text-cyan shrink-0" />
                    <span>{arch.title}</span>
                  </td>
                  <td className="py-2.5 px-4 font-bold text-success">{arch.badge}</td>
                  <td className="py-2.5 px-4 text-fg-muted">
                    {arch.id === 'cyber' ? 'CSS Variable Spotlights' : 'Zero-Blur Flat Engine'}
                  </td>
                  <td className="py-2.5 px-4 text-fg-muted">
                    {arch.id === 'matrix' || arch.id === 'studio' ? 'High Density (<95 nodes)' : 'Ultra Minimal (<60 nodes)'}
                  </td>
                  <td className="py-2.5 px-4 text-fg-muted truncate max-w-xs">{arch.bestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Floating Speed Benchmark HUD */}
      <SpeedBenchmarkHud />
    </main>
  );
}
