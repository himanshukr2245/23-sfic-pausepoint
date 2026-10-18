'use client';

// app/page.tsx — PausePoint Production Master Template (HK Universal Library v3).
// ⛔ MANDATORY LAW: Always use commutative layouts — balanced compact size cards with uniform geometry across all archetypes and viewports.
// ⛔ MANDATORY ICON LAW: Never use emojis for icons — always use pure SVG icons. If an icon is universally understandable (e.g. search, zoom, copy, close, trash), omit redundant text labels.
// Features AWS Precision Console styling, dual-mode optical GlassCard plates,
// TeroxiaDemo cyber typography buttons, AWS Precision Cards showcase (3 visible + show more), and <1ms latency haptics.
import { useState, useMemo } from 'react';
import { SITE } from '@/lib/site';
import { AwsFeatureCard, type FeatureCardData } from '@/components/aws/AwsFeatureCard';
import { Button, ButtonLink } from '@/components/ui/Button';
import { FpsCounter } from '@/components/ui';
import { AwsPrecisionCard } from '@/components/aws/AwsPrecisionCard';
import { AWS_PRODUCTS } from '@/data/awsProducts';
import { ChromaticHarmonyPicker } from '@/components/ui/ChromaticHarmonyPicker';
import { SpeedManifestoPlate } from '@/components/ui/SpeedManifestoPlate';
import { playHapticTick, unlockAudio } from '@/lib/audio/synthesizer';

const FEATURES: FeatureCardData[] = [
  {
    title: 'Deploys by git push',
    badge: 'LINUX CI',
    body: 'Cloudflare Workers Builds builds on Linux and deploys — never from Windows.',
    metric: '<12ms CI',
  },
  {
    title: 'Secure by default',
    badge: 'NONCE CSP',
    body: 'Per-request nonce CSP, security headers, server-side validation, secret scanning on every commit.',
    metric: 'Zero-Trust',
  },
  {
    title: 'Feels instant',
    badge: '<1ms LATENCY',
    body: 'Soft navigation with a top loader, skeletons on every route, zero font downloads.',
    metric: 'Sub-1ms P99',
  },
  {
    title: 'Honest about the network',
    badge: 'IDB SYNC',
    body: 'A calm offline notice everywhere; the offline module adds a real offline shell and sync.',
    metric: 'IndexedDB v3',
  },
  {
    title: 'Watched, not spied on',
    badge: 'ALLOW-LISTED',
    body: 'Allow-listed technical telemetry and a health endpoint — never personal data.',
    metric: 'Zero-Leak',
  },
  {
    title: 'Proven by gates',
    badge: 'GATE LADDER',
    body: 'Types, lint, secrets, tokens, RLS, honesty, assets, build, dynamic rendering and end-to-end tests.',
    metric: '10/10 Passed',
  },
];

type AwsCategoryFilter = 'all' | 'ai' | 'storage' | 'compute' | 'database';

interface CategoryOption {
  id: AwsCategoryFilter;
  label: string;
}

const CATEGORIES: CategoryOption[] = [
  { id: 'all', label: 'All Services' },
  { id: 'ai', label: 'Agentic AI & ML' },
  { id: 'storage', label: 'Storage' },
  { id: 'compute', label: 'Compute' },
  { id: 'database', label: 'Database' },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<AwsCategoryFilter>('all');
  const [showAllCards, setShowAllCards] = useState(false);

  const totalFilteredProducts = useMemo(() => {
    if (selectedCategory === 'all') {
      return AWS_PRODUCTS.slice(0, 9);
    }
    return AWS_PRODUCTS.filter((p) => p.category === selectedCategory).slice(0, 9);
  }, [selectedCategory]);

  const displayedProducts = useMemo(() => {
    if (showAllCards) {
      return totalFilteredProducts;
    }
    return totalFilteredProducts.slice(0, 3);
  }, [totalFilteredProducts, showAllCards]);

  function handleCategoryChange(category: AwsCategoryFilter) {
    unlockAudio();
    playHapticTick();
    setSelectedCategory(category);
    setShowAllCards(false);
  }

  function handleToggleShowMore() {
    unlockAudio();
    playHapticTick();
    setShowAllCards((prev) => !prev);
  }

  return (
    <div className="flex flex-col gap-14 pb-24">
      {/* ── 1. Hero Section: Precision AWS Console Header ─────────────────────── */}
      <section className="flex flex-col items-start gap-4 pt-2">
        {/* Precision Status Capsule */}
        <div className="inline-flex items-center gap-2 rounded-full border border-shade/10 bg-sheen/40 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-fg-muted shadow-sm backdrop-blur-md dark:border-sheen/10 dark:bg-sheen/5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
          </span>
          <span className="text-fg font-bold">HK Universal Starter v3.0</span>
          <span className="opacity-40">·</span>
          <span className="text-fg-muted font-mono">gate-tested · offline-ready</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-fg sm:text-6xl sm:leading-[1.1]">
          {SITE.name}
        </h1>
        <p className="max-w-2xl text-base sm:text-lg text-fg-muted leading-relaxed">
          {SITE.description}
        </p>

        {/* Cyber Action Buttons in TeroxiaDemo Typography (Screenshot 2 Match) */}
        <div className="flex flex-wrap items-center gap-3.5 pt-2 min-h-[50px]">
          {/* Button 1: Cyber Solid (Electric Cyan + Black text + Glowing Cyan Aura) */}
          <ButtonLink href="/studio" variant="cyber-solid" latencyMode="spring-pop" sound="laser" size="lg">
            <span>LAUNCH STUDIO</span>
            <span className="text-sm font-bold">→</span>
          </ButtonLink>

          {/* Button 2: Cyber Outline (Obsidian Glass + Cyan Border + White text) */}
          <ButtonLink href="/about" variant="cyber-outline" latencyMode="spring-pop" sound="tick" size="lg">
            <span>EXPLORE WORK</span>
          </ButtonLink>
        </div>

        {/* The Golden Core Axiom Manifesto Plate */}
        <div className="w-full pt-2">
          <SpeedManifestoPlate />
        </div>
      </section>

      {/* ── 2. Card Design 1: Amazon AWS Precision Architecture Cards ────────────────── */}
      <section aria-labelledby="inside" className="flex flex-col gap-5 min-h-[420px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="text-xs font-mono font-semibold uppercase tracking-wider text-brand">
              Minimalist Super-Fast Architecture
            </div>
            <h2 id="inside" className="text-2xl font-bold tracking-tight bg-gradient-to-r from-brand via-violet to-cyan bg-clip-text text-transparent sm:text-3xl">
              Universal Architecture
            </h2>
            <p className="text-xs sm:text-sm text-fg-muted">
              Engineered with solid AWS Precision cards: zero-blur obsidian surfaces, hairline optical borders, and hardware-accelerated VSync.
            </p>
          </div>

          {/* Dual-Mode Chromatic Harmony Switcher */}
          <ChromaticHarmonyPicker />
        </div>

        <ul className="grid gap-4.5 sm:grid-cols-2 lg:grid-cols-3 min-h-[360px]">
          {FEATURES.map((f, idx) => (
            <AwsFeatureCard
              key={f.title}
              feature={f}
              index={idx}
            />
          ))}
        </ul>
      </section>

      {/* ── 3. Card Design 2: Amazon AWS Precision Cloud Cards (Tightened & Show More) ── */}
      <section aria-labelledby="aws-products" className="cv-lazy flex flex-col gap-5 min-h-[440px]">
        {/* Section Heading */}
        <div className="flex flex-col gap-1">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-brand">
            Production Building Blocks
          </div>
          <h2 id="aws-products" className="text-2xl font-bold tracking-tight text-fg sm:text-3xl">
            Amazon AWS Precision Cloud Cards
          </h2>
          <p className="text-xs sm:text-sm text-fg-muted max-w-2xl">
            Alabaster light &amp; Obsidian dark surfaces with signature aurora rim glow on hover, star pin bookmarks, and slide-out actions.
          </p>
        </div>

        {/* Category Filter Pills (Dedicated New Line) */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-surface-2 border border-border/60 w-fit min-h-[44px]">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <Button variant="plain" size="none" latencyMode="none"
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-sans font-semibold transition-all active:scale-95 cursor-pointer select-none ${
                  isSelected
                    ? 'bg-brand text-brand-fg shadow-xs'
                    : 'text-fg-muted hover:text-fg hover:bg-surface/50'
                }`}
              >
                {cat.label}
              </Button>
            );
          })}
        </div>

        {/* Responsive Grid of Tightened AWS Precision Cards */}
        <div className="grid gap-4.5 sm:grid-cols-2 lg:grid-cols-3 min-h-[220px]">
          {displayedProducts.map((product, idx) => (
            <AwsPrecisionCard
              key={product.id}
              product={product}
              index={idx}
            />
          ))}
        </div>

        {/* Signature Pastel Gradient Expander Button (Same Aurora Bloom for Show More and Show Fewer) */}
        {totalFilteredProducts.length > 3 && (
          <div className="flex justify-center pt-2 min-h-[56px]">
            <Button
              type="button"
              variant="expander-pill"
              onClick={handleToggleShowMore}
              className="px-8 py-3"
            >
              <span>{showAllCards ? 'SHOW FEWER' : 'SHOW MORE'}</span>
              <span className="text-sm">{showAllCards ? '↑' : '↓'}</span>
            </Button>
          </div>
        )}
      </section>

      {/* ── Real-time Refresh Rate & Layout Monitor ── */}
      <FpsCounter />
    </div>
  );
}
