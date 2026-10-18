// tokens-ok-file: operational mode presets include color tokens in example markdown
// src/components/minimal/minimal-store.ts — Master Minimalist AI Chat Workspace State Store
// HK Universal Library v3: Reactive, synchronized, local-first state.

export type WorkspaceMode = 'draft' | 'analyze' | 'code' | 'polish';

export type AmbientModelId = 'Gemini 2.5 Pro' | 'Claude 3.7 Sonnet' | 'GPT-4o' | 'DeepSeek R1';

export type AmbientPersonaId = 'Architect' | 'Engineer' | 'Creative' | 'Executive';

export interface AmbientModelInfo {
  id: AmbientModelId;
  name: string;
  badge: string;
  tagline: string;
  latencyTarget: string;
}

export const AMBIENT_MODELS: AmbientModelInfo[] = [
  {
    id: 'Gemini 2.5 Pro',
    name: 'Gemini 2.5 Pro',
    badge: 'Flagship Speed',
    tagline: '1.2M token context, sub-millisecond dispatch',
    latencyTarget: '<0.5ms',
  },
  {
    id: 'Claude 3.7 Sonnet',
    name: 'Claude 3.7 Sonnet',
    badge: 'Hybrid Reasoning',
    tagline: 'Dual cognitive trace, structured architecture',
    latencyTarget: '<0.7ms',
  },
  {
    id: 'GPT-4o',
    name: 'GPT-4o',
    badge: 'Omni Vector',
    tagline: 'Multilingual conversational velocity',
    latencyTarget: '<0.6ms',
  },
  {
    id: 'DeepSeek R1',
    name: 'DeepSeek R1',
    badge: 'Deep Logic',
    tagline: 'Chain-of-thought verification engine',
    latencyTarget: '<0.8ms',
  },
];

export interface AmbientPersonaInfo {
  id: AmbientPersonaId;
  name: string;
  subtitle: string;
  systemPrompt: string;
}

export const AMBIENT_PERSONAS: AmbientPersonaInfo[] = [
  {
    id: 'Architect',
    name: 'System Architect',
    subtitle: 'Commutative layouts, 60 Hz VSync & zero-blur compositing',
    systemPrompt:
      'You are a Principal Software Architect enforcing zero-CLS commutative layouts, hardware-accelerated VSync, and clean zero-dependency design systems.',
  },
  {
    id: 'Engineer',
    name: 'Code Synthesizer',
    subtitle: 'High-speed TypeScript, strict typing & pure SVG hygiene',
    systemPrompt:
      'You are an expert Performance Engineer writing ultra-clean, type-safe TypeScript code without bloat or emojis.',
  },
  {
    id: 'Creative',
    name: 'Creative Thinker',
    subtitle: 'Refined prose, aesthetic balance & literary rhythm',
    systemPrompt:
      'You are a Creative Strategist shaping captivating ideas with crisp minimalist clarity and emotional precision.',
  },
  {
    id: 'Executive',
    name: 'Executive Brief',
    subtitle: 'Concise bullet points, decision trade-offs & actionable outcomes',
    systemPrompt:
      'You are an Executive Advisor delivering ultra-condensed, high-impact briefs with zero fluff.',
  },
];

export interface AmbientMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  persona?: string;
  timestamp: string;
  tokenCount?: number;
  latencyMs?: number;
}

export interface AmbientSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: AmbientMessage[];
  pinned?: boolean;
  model: AmbientModelId;
  persona: AmbientPersonaId;
}

export interface PresetItem {
  id: string;
  label: string;
  desc: string;
  text: string;
  streamContent: string;
}

export const WORKSPACE_PRESETS: Record<WorkspaceMode, PresetItem[]> = {
  draft: [
    {
      id: 'thesis',
      label: 'System Thesis',
      desc: 'Zero-cost compositor architecture & frame-budget principles',
      text: 'Draft the architectural thesis for a high-concurrency micro-frontend platform.',
      streamContent:
        '# Core Architectural Thesis: Zero-Cost Compositor Architecture\n\nModern web performance is fundamentally constrained not by network bandwidth, but by client-side compositing bottlenecks. By removing heavy Gaussian backdrop filters, multi-pass GPU layer compositing can be completely avoided.\n\n### Primary Tenets\n1. **Hardware VSync Alignment**: All animations are locked to requestAnimationFrame with transform and opacity.\n2. **Hairline Optical Borders**: 1px alpha-blended borders replace expensive layered box-shadows.\n3. **Proportional Typography**: Optical scaling eliminates reflow cascading during hydration.\n4. **Synthesized Acoustic Haptics**: Micro-interactions provide tactile acoustic feedback using the native Web Audio API.\n\nResult: Sustained VSync framerate on high-refresh displays with under 1.2ms input-to-paint latency.',
    },
    {
      id: 'exec-brief',
      label: 'Executive Brief',
      desc: 'Edge routing & 40% compute overhead reduction roadmap',
      text: 'Draft an executive summary on reducing cloud compute overhead by 40%.',
      streamContent:
        '# Executive Brief: Compute Efficiency & Edge Routing\n\n### Executive Summary\nBy offloading non-personalized static assets to Cloudflare Workers and deploying edge-rendered islands, origin server load is reduced by 42.6% within 30 days.\n\n- **P99 TTFB**: Reduced from 380ms to 42ms worldwide.\n- **Origin Memory Pressure**: Decreased by 3.8GB sustained.\n- **Client Bundle Size**: Under 48kB gzipped for core routing.\n\nRecommendation: Migrate existing container clusters to edge-first micro-regions immediately.',
    },
    {
      id: 'speed-manifesto',
      label: 'Speed Manifesto',
      desc: 'Commutative layout rules & zero-CLS engineering doctrine',
      text: 'Draft the Commutative Layout and Speed Manifesto for desktop apps.',
      streamContent:
        '# The Commutative Layout & Speed Manifesto\n\n### Article I — Spatial Invariance\nAll sibling modules, cards, and data surfaces within a grid must preserve strictly identical outer bounds regardless of state transitions. A ragged baseline is a failure of structural discipline.\n\n### Article II — Sub-Millisecond Input Latency\nNo user keystroke shall wait for synthetic runtime dispatches. Local text buffers must update synchronously on the main thread before auxiliary background tasks are scheduled.\n\n### Article III — Optical Comfort\nDark mode must never be an afterthought of arbitrary opacity math. High-contrast solid surfaces with deliberate border luminance provide eye comfort over long engineering sessions.',
    },
    {
      id: 'micro-kernel',
      label: 'RFC: Micro-Kernel UI',
      desc: 'Zero-hydration island architecture specification',
      text: 'Write an RFC for a zero-hydration micro-kernel web application architecture.',
      streamContent:
        '# RFC 104: Zero-Hydration Micro-Kernel Architecture\n\n### Status: Adopted\n\n### Overview\nTraditional single-page apps suffer from massive client bundle decompression and hydration re-rendering. The Micro-Kernel architecture delegates static presentation strictly to the edge, mounting client state only on interactive boundary islands.\n\n### Key Metrics\n- Total Initial JS: < 32 KB\n- First Contentful Paint: < 180 ms\n- Time to Interactive: Synchronous with DOMContentLoaded\n- Hydration Overhead: 0.00 ms',
    },
  ],
  analyze: [
    {
      id: 'vsync-audit',
      label: 'VSync Latency Audit',
      desc: 'Frame timing budget & zero compositor overhead breakdown',
      text: 'Analyze the frame timing budget on high-refresh displays.',
      streamContent:
        '# VSync Latency & Frame Timing Audit\n\n```telemetry\nTarget Screen Refresh: Hardware VSync\nFrame Budget Ceiling:   8.33 ms (120Hz) / 16.6ms (60Hz)\nMeasured Average Frame: 1.14 ms\nJank Probability:       0.00%\nMain Thread Freeze:     0.00 ms (0 longtasks)\n```\n\n### Key Findings\n- **Zero Composite Overhead**: Eliminating backdrop-filter: blur(20px) freed 6.2ms of GPU fill-rate per frame.\n- **Memory Footprint**: Flat DOM tree maintains garbage collection pauses under 0.8ms.\n- **Hydration Delta**: useSyncExternalStore prevents all hydration re-renders.',
    },
    {
      id: 'db-index',
      label: 'DB Index Bottleneck',
      desc: 'PostgreSQL B-Tree scan vs BRIN index throughput benchmarks',
      text: 'Analyze PostgreSQL B-Tree scan vs Hash index on high-write billing tables.',
      streamContent:
        '# Query Plan Analysis: PostgreSQL Partitioning\n\n```sql\nEXPLAIN ANALYZE \nSELECT * FROM invoices \nWHERE workspace_id = $1 \nORDER BY created_at DESC \nLIMIT 50;\n```\n\n- **Before Composite Index**: Sequential Scan (Execution Time: 84.2 ms)\n- **After Composite BRIN Index**: Index Only Scan (Execution Time: 0.82 ms)\n- **Performance Delta**: 102.6x throughput increase, zero lock contention.',
    },
    {
      id: 'bundle-alloc',
      label: 'Bundle Allocation',
      desc: 'Turbopack tree-shaking & chunk splitting verification',
      text: 'Analyze Turbopack tree-shaking and dynamic import chunk sizes.',
      streamContent:
        '# Turbopack Bundle Tree-Shaking Analysis\n\n```telemetry\nRoute Target: /minimal\nRaw JavaScript:        42.1 kB\nTree-Shaken Savings:   128.4 kB (-75.3%)\nFirst Load JS Shared:  87.2 kB\nShared Chunks:         3 (framework, react-dom, telemetry)\nCSS Payloads:          11.4 kB (inlined zero-flash)\n```\n\n### Verification\n- All Lucide icon barrel imports replaced with direct SVG primitives.\n- Zero lodash/moment dependencies detected.\n- Clean production build under 10 seconds.',
    },
    {
      id: 'memory-gc',
      label: 'Memory GC Profile',
      desc: 'JS heap allocation & flat DOM hierarchy inspection',
      text: 'Analyze memory garbage collection pauses and DOM depth.',
      streamContent:
        '# JS Heap & DOM Hierarchy Profile\n\n- **Max DOM Depth**: 6 levels (Flat layout)\n- **Total DOM Nodes**: < 450 nodes\n- **Heap Footprint**: ~ 24.8 MB sustained\n- **GC Pauses**: Minor GC < 0.4ms, Major GC absent\n- **Leak Detection**: 0 detached DOM trees across 5,000 route transitions.',
    },
  ],
  code: [
    {
      id: 'event-bus',
      label: 'Typed Event Bus',
      desc: 'Zero-dependency browser event emitter with typed channels',
      text: 'Generate a typed, zero-dependency browser Event Bus in TypeScript.',
      streamContent:
        '```typescript\n// Zero-dependency typed event emitter\ntype EventMap = Record<string, unknown>;\ntype Listener<T> = (data: T) => void;\n\nexport class TypedEventBus<T extends EventMap> {\n  private listeners = new Map<keyof T, Set<Listener<any>>>();\n\n  on<K extends keyof T>(event: K, fn: Listener<T[K]>): () => void {\n    if (!this.listeners.has(event)) this.listeners.set(event, new Set());\n    this.listeners.get(event)!.add(fn);\n    return () => this.listeners.get(event)?.delete(fn);\n  }\n\n  emit<K extends keyof T>(event: K, data: T[K]): void {\n    this.listeners.get(event)?.forEach((fn) => fn(data));\n  }\n}\n```',
    },
    {
      id: 'ring-buffer',
      label: 'Zero-Alloc RingBuffer',
      desc: 'High-speed fixed-size ring buffer for telemetry metrics',
      text: 'Generate a zero-allocation circular ring buffer for real-time telemetry metrics.',
      streamContent:
        '```typescript\n// Fixed-capacity zero-allocation telemetry buffer\nexport class RingBuffer<T> {\n  private buffer: (T | undefined)[];\n  private head = 0;\n  private tail = 0;\n  private count = 0;\n\n  constructor(readonly capacity: number) {\n    this.buffer = new Array(capacity);\n  }\n\n  push(item: T): void {\n    this.buffer[this.head] = item;\n    this.head = (this.head + 1) % this.capacity;\n    if (this.count < this.capacity) this.count++;\n    else this.tail = (this.tail + 1) % this.capacity;\n  }\n\n  toArray(): T[] {\n    const result: T[] = [];\n    for (let i = 0; i < this.count; i++) {\n      result.push(this.buffer[(this.tail + i) % this.capacity]!);\n    }\n    return result;\n  }\n}\n```',
    },
    {
      id: 'virtual-scroll',
      label: 'Pure Virtual Scroller',
      desc: 'Zero-dependency windowing container for 100k items',
      text: 'Implement a zero-dependency windowed virtual list in TypeScript and React.',
      streamContent:
        '```typescript\n// Windowed Virtualization Hook\nexport function useVirtualWindow(itemCount: number, rowHeight: number, viewportHeight: number, scrollTop: number) {\n  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - 2);\n  const visibleCount = Math.ceil(viewportHeight / rowHeight) + 4;\n  const endIndex = Math.min(itemCount, startIndex + visibleCount);\n\n  return {\n    startIndex,\n    endIndex,\n    topOffset: startIndex * rowHeight,\n    totalHeight: itemCount * rowHeight,\n  };\n}\n```',
    },
    {
      id: 'audio-chime',
      label: 'WebAudio Chime',
      desc: 'Polyphonic FM harmonic chime synthesizer',
      text: 'Synthesize a high-precision dual-harmonic chime using Web Audio oscillator nodes.',
      streamContent:
        '```typescript\nexport function playHarmonicChime(ctx: AudioContext): void {\n  const now = ctx.currentTime;\n  const osc1 = ctx.createOscillator();\n  const osc2 = ctx.createOscillator();\n  const gain = ctx.createGain();\n\n  osc1.frequency.setValueAtTime(880, now);\n  osc2.frequency.setValueAtTime(1320, now);\n  gain.gain.setValueAtTime(0.08, now);\n  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);\n\n  osc1.connect(gain);\n  osc2.connect(gain);\n  gain.connect(ctx.destination);\n  osc1.start(now); osc2.start(now);\n  osc1.stop(now + 0.35); osc2.stop(now + 0.35);\n}\n```',
    },
  ],
  polish: [
    {
      id: 'wcag-contrast',
      label: 'WCAG AAA Audit',
      desc: 'Verify 7:1 foreground contrast on obsidian surfaces',
      text: 'Polish color token hierarchy for WCAG AAA 7:1 contrast on obsidian background.',
      streamContent:
        '# WCAG AAA Contrast Refactor\n\n| Element | Base Hex | Enhanced Hex | Contrast Ratio |\n| :--- | :--- | :--- | :--- |\n| Body Text | `#a1a1aa` | `#f4f4f5` | **14.2:1 (AAA)** |\n| Muted Meta | `#71717a` | `#a1a1aa` | **7.8:1 (AAA)** |\n| Brand Cyan | `#06b6d4` | `#22d3ee` | **8.1:1 (AAA)** |\n| Code Inline | `#e4e4e7` | `#ffffff` | **18.6:1 (AAA)** |\n\nResult: 100% compliant with WCAG 2.2 Level AAA contrast specifications.',
    },
    {
      id: 'layout-shift',
      label: 'Zero-CLS Containment',
      desc: 'Enforce aspect-ratio & contain: layout style containment',
      text: 'Add CSS layout containment to lock sibling card heights.',
      streamContent:
        '# Commutative CSS Layout Containment\n\n```css\n.commutative-card {\n  contain: layout style;\n  content-visibility: auto;\n  contain-intrinsic-size: 0 76px;\n  min-height: 76px;\n  max-height: 76px;\n  transform: translateZ(0);\n}\n```\n\nEliminates all micro-reflows during rapid token streaming.',
    },
    {
      id: 'audio-curve',
      label: 'Haptic Audio Curves',
      desc: 'Exponential release envelope for tactile clicks',
      text: 'Refine audio synthesizer envelope curves to prevent clipping pops.',
      streamContent:
        '# Exponential Release Envelope Calibration\n\n```typescript\ngainNode.gain.setValueAtTime(0.12, ctx.currentTime);\ngainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);\n```\n\nEliminates DC offset clicking across all major browser WebAudio engines.',
    },
    {
      id: 'svg-hairline',
      label: 'Hairline SVG Borders',
      desc: 'Sub-pixel vector rendering on high-DPI retina displays',
      text: 'Optimize SVG icons for sub-pixel alignment on Retina displays.',
      streamContent:
        '# Sub-Pixel Retina Vector Alignment\n\n- viewBox locked to exact integer bounds (`0 0 24 24`).\n- stroke-width set to `1.5px` with vector-effect: non-scaling-stroke.\n- Eliminates raster anti-aliasing blurring across 2x/3x Retina viewports.',
    },
  ],
};

export const INITIAL_SESSIONS: AmbientSession[] = [
  {
    id: 'sess-1',
    title: 'Compositor VSync & Commutative Layouts',
    createdAt: '10:15 AM',
    updatedAt: 'Just now',
    pinned: true,
    model: 'Gemini 2.5 Pro',
    persona: 'Architect',
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'How does the HK Universal Library eliminate visual stutter on high-refresh monitors?',
        timestamp: '10:15 AM',
      },
      {
        id: 'msg-2',
        role: 'assistant',
        model: 'Gemini 2.5 Pro',
        persona: 'Architect',
        content: `It achieves hardware compositor synchrony through three core engineering laws:

1. **Zero-Blur Turbo Compositor**: Eliminates multi-pass Gaussian raster kernels (\`backdrop-filter: blur\`) which drop integrated GPU frame rates from 60 Hz down to 34 Hz.
2. **CSS Custom Property Spotlights**: Mouse tracking uses pure CSS variables (\`--mouse-x\`, \`--mouse-y\`) updated directly on the DOM node with zero React re-renders.
3. **Hardware VSync Alignment**: Frame budgets are locked to display intervals (16.6ms at 60 Hz) with cumulative layout shift strictly maintained at 0.000.`,
        timestamp: '10:15 AM',
        tokenCount: 94,
        latencyMs: 14.8,
      },
    ],
  },
  {
    id: 'sess-2',
    title: 'TypeScript Zero-Dependency SVG Arsenal',
    createdAt: '09:40 AM',
    updatedAt: '25m ago',
    pinned: false,
    model: 'Claude 3.7 Sonnet',
    persona: 'Engineer',
    messages: [
      {
        id: 'msg-3',
        role: 'user',
        content: 'Why should an application avoid emojis for UI action icons?',
        timestamp: '09:40 AM',
      },
      {
        id: 'msg-4',
        role: 'assistant',
        model: 'Claude 3.7 Sonnet',
        persona: 'Engineer',
        content: `Emojis render unpredictably across OS platforms (Apple, Windows, Android, Linux) with differing line heights, colors, and font rendering baselines. Pure SVG components ensure 100% pixel-perfect rendering, seamless theme CSS coloring via \`stroke="currentColor"\`, and eliminate layout shifts.`,
        timestamp: '09:41 AM',
        tokenCount: 48,
        latencyMs: 16.2,
      },
    ],
  },
  {
    id: 'sess-3',
    title: 'Minimalist Speed Engine Manifesto',
    createdAt: 'Yesterday',
    updatedAt: 'Yesterday',
    pinned: false,
    model: 'GPT-4o',
    persona: 'Executive',
    messages: [
      {
        id: 'msg-5',
        role: 'user',
        content: 'Summarize the core premise of balanced minimalism.',
        timestamp: 'Yesterday',
      },
      {
        id: 'msg-6',
        role: 'assistant',
        model: 'GPT-4o',
        persona: 'Executive',
        content: `Minimalism is not about removing features — it is about removing friction. Every millisecond saved in compositor rendering and every pixel harmonized in contrast amplifies user focus and cognitive clarity.`,
        timestamp: 'Yesterday',
        tokenCount: 36,
        latencyMs: 12.4,
      },
    ],
  },
];

export const SUGGESTED_CHIPS = [
  'How does Web Audio synthesize clicks with 0 network bytes?',
  'Explain Cumulative Layout Shift (CLS = 0.000) verification.',
  'What is the difference between Obsidian and Ceramic Alabaster?',
  'Generate an architectural summary of 00-hk-starter.',
  'How do commutative layouts prevent card jitter?',
];

export const DEFAULT_SCRATCHPAD = `# Minimalist Super-Fast Scratchpad

Type your notes, ideas, or architectural thoughts here with sub-millisecond response. Every keystroke is instant.

### Core Principles
- Sub-millisecond keystroke dispatches
- Solid dark tactile surfaces (WCAG AAA contrast)
- Minimal layout shift (Commutative Layout Law enforced)`;

const SESSIONS_STORAGE_KEY = 'hk-minimal-sessions-v3';
const SCRATCHPAD_STORAGE_KEY = 'hk-minimal-scratchpad-v3';

export function loadStoredSessions(): AmbientSession[] {
  if (typeof window === 'undefined') return INITIAL_SESSIONS;
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!raw) return INITIAL_SESSIONS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_SESSIONS;
    const hasDefault = parsed.some((s: AmbientSession) => s.id === 'sess-1');
    if (!hasDefault) {
      return [INITIAL_SESSIONS[0], ...parsed];
    }
    return parsed;
  } catch {
    return INITIAL_SESSIONS;
  }
}

export function saveStoredSessions(sessions: AmbientSession[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // Ignore quota issues
  }
}

export function loadStoredScratchpad(): string {
  if (typeof window === 'undefined') return DEFAULT_SCRATCHPAD;
  try {
    return localStorage.getItem(SCRATCHPAD_STORAGE_KEY) || DEFAULT_SCRATCHPAD;
  } catch {
    return DEFAULT_SCRATCHPAD;
  }
}

export function saveStoredScratchpad(text: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SCRATCHPAD_STORAGE_KEY, text);
  } catch {
    // Ignore quota issues
  }
}
