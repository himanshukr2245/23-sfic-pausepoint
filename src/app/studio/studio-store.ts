// src/app/studio/studio-store.ts — Local-First Kinetic Studio Workspace State Engine
// HK Universal Library v3.0: 100% Client-Side, zero network roundtrips, instant LocalStorage sync.

export type StudioBlockType = 'quote' | 'spec' | 'speed' | 'note';
export type StudioColorAccent = 'cyan' | 'indigo' | 'rose' | 'emerald' | 'amber' | 'violet';
export type CanvasGridStyle = 'dots' | 'grid' | 'clean';
export type CanvasDensity = 'compact' | 'comfortable';

export interface QuoteBlockData {
  itemName: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  currency: string;
}

export interface SpecBlockData {
  module: string;
  interfaceContract: string;
  latencySla: string;
  status: 'Draft' | 'Active' | 'Production';
}

export interface SpeedBlockData {
  targetFps: number;
  renderBudgetMs: number;
  clsScore: number;
  reflowGuarded: boolean;
}

export interface NoteBlockData {
  markdown: string;
  tags: string[];
}

export interface StudioBlock {
  id: string;
  type: StudioBlockType;
  title: string;
  category: string;
  colorAccent: StudioColorAccent;
  pinned?: boolean;
  createdAt: string;
  updatedAt: string;
  // Specific data payloads
  quoteData?: QuoteBlockData;
  specData?: SpecBlockData;
  speedData?: SpeedBlockData;
  noteData?: NoteBlockData;
}

export interface StudioDoc {
  id: string;
  title: string;
  blocks: StudioBlock[];
  updatedAt: string;
}

export const INITIAL_STUDIO_BLOCKS: StudioBlock[] = [
  {
    id: 'block-quote-1',
    type: 'quote',
    title: 'Enterprise Architecture License',
    category: 'Commercial',
    colorAccent: 'cyan',
    pinned: true,
    createdAt: '10:00 AM',
    updatedAt: '10:00 AM',
    quoteData: {
      itemName: 'HK Universal Multi-Tenant Starter License',
      quantity: 2,
      unitPrice: 1250,
      taxPercent: 18,
      currency: 'USD',
    },
  },
  {
    id: 'block-speed-2',
    type: 'speed',
    title: 'The Sub-Millisecond Speed Law',
    category: 'Performance',
    colorAccent: 'emerald',
    pinned: true,
    createdAt: '10:15 AM',
    updatedAt: '10:15 AM',
    speedData: {
      targetFps: 60,
      renderBudgetMs: 16.6,
      clsScore: 0.0,
      reflowGuarded: true,
    },
  },
  {
    id: 'block-spec-3',
    type: 'spec',
    title: 'Local-First Synchronized Storage',
    category: 'Architecture',
    colorAccent: 'indigo',
    createdAt: '10:30 AM',
    updatedAt: '10:30 AM',
    specData: {
      module: 'studio-store.ts',
      interfaceContract: 'IDB / LocalStorage Reactive Emitter',
      latencySla: '< 0.5ms SSD',
      status: 'Production',
    },
  },
  {
    id: 'block-note-4',
    type: 'note',
    title: 'Balanced-Minimalist Manifesto',
    category: 'Creative',
    colorAccent: 'rose',
    createdAt: '10:45 AM',
    updatedAt: '10:45 AM',
    noteData: {
      markdown:
        'Aesthetics and speed are not contradictory. Extreme minimalist layout geometry amplifies cognitive clarity while maintaining 60fps responsiveness.',
      tags: ['Minimalism', 'Speed', 'HK-v4'],
    },
  },
];

export const INITIAL_STUDIO_DOC: StudioDoc = {
  id: 'doc-main',
  title: 'Studio Creative Canvas',
  blocks: INITIAL_STUDIO_BLOCKS,
  updatedAt: '2026-01-01T00:00:00.000Z',
};

export const STORAGE_KEY = 'hk-kinetic-studio-doc-v4.1';

/** Helper to calculate Quote Block monetary totals */
export function calculateQuoteTotal(data?: QuoteBlockData): {
  subtotal: number;
  tax: number;
  total: number;
} {
  if (!data) return { subtotal: 0, tax: 0, total: 0 };
  const subtotal = data.quantity * data.unitPrice;
  const tax = subtotal * (data.taxPercent / 100);
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

let currentDoc: StudioDoc = INITIAL_STUDIO_DOC;
let initialized = false;
const studioListeners = new Set<() => void>();

function initClientDoc(): void {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StudioDoc;
      if (parsed && Array.isArray(parsed.blocks)) {
        currentDoc = parsed;
      }
    }
  } catch {
    // fallback
  }
}

export function subscribeStudioDoc(listener: () => void): () => void {
  studioListeners.add(listener);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue) as StudioDoc;
        if (parsed && Array.isArray(parsed.blocks)) {
          currentDoc = parsed;
          listener();
        }
      } catch {
        // ignore
      }
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }
  return () => {
    studioListeners.delete(listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
}

export function getStudioDocSnapshot(): StudioDoc {
  initClientDoc();
  return currentDoc;
}

export function getStudioDocServerSnapshot(): StudioDoc {
  return INITIAL_STUDIO_DOC;
}

/** Load initial doc safely from localStorage or return defaults */
export function loadStudioDoc(): StudioDoc {
  initClientDoc();
  return currentDoc;
}

/** Save doc to localStorage safely and notify reactive listeners */
export function saveStudioDoc(doc: StudioDoc): void {
  currentDoc = doc;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...doc,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch {
      // quota exceeded or disabled
    }
  }
  studioListeners.forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore
    }
  });
}
