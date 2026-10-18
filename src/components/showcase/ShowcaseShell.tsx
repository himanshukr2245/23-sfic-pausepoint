'use client';

// components/showcase/ShowcaseShell.tsx — Unified Layout Wrapper for Dedicated Archetype Pages.
import { type ReactNode } from 'react';
import { SpeedBenchmarkHud } from './SpeedBenchmarkHud';
import { ArchetypeAdopter, type ArchetypeAdopterProps } from './ArchetypeAdopter';

export interface ShowcaseShellProps {
  children: ReactNode;
  adopter: ArchetypeAdopterProps;
  title: string;
  subtitle: string;
}

export function ShowcaseShell({ children, adopter, title, subtitle }: ShowcaseShellProps) {
  return (
    <div className="min-h-screen py-8 pb-24">
      {/* ── Main Stage ── */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header Hero */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="rounded-full bg-cyan/15 text-cyan px-3 py-0.5 text-xs font-mono font-bold">
              {adopter.archetypeIcon} Archetype Showcase
            </span>
            <span className="text-xs text-fg-muted font-mono">
              Compositor Speed: <strong className="text-success">{adopter.paintTimeEstimate}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-fg">
            {title}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-fg-muted max-w-2xl">
            {subtitle}
          </p>
        </header>

        {/* Child Interactive Stage */}
        {children}

        {/* Bottom 1-Click Adopter Action Bar */}
        <ArchetypeAdopter {...adopter} />
      </main>

      {/* Real-Time Telemetry Monitor */}
      <SpeedBenchmarkHud />
    </div>
  );
}
