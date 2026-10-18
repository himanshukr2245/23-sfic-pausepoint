// tokens-ok-file: editorial quote cards and parchment themes use tailored terracotta and amber literary palette
// src/components/editorial/editorial-store.ts — Master Editorial Studio Workspace State Store (HK Universal Library v3)

export type TypefaceFamily = 'serif' | 'georgia' | 'mono';

export type ReadingScale = 'sm' | 'md' | 'lg';

export type ReadingMeasure = 'narrow' | 'balanced' | 'wide';

export type LineHeightRatio = 'compact' | 'relaxed' | 'spacious';

export type QuoteCardStyle = 'terracotta' | 'obsidian' | 'parchment' | 'cyber';
export type EditorialThemeId = QuoteCardStyle;

export interface EditorialThemeConfig {
  id: EditorialThemeId;
  label: string;
  badge: string;
  atelierBg: string;
  atelierText: string;
  atelierMuted: string;
  surfaceBg: string;
  surfaceBorder: string;
  accentText: string;
  accentBg: string;
  accentBorder: string;
  dropCapText: string;
  quoteBlockBg: string;
  quoteBlockBorder: string;
  previewCardClasses: string;
}

export const EDITORIAL_THEMES: Record<EditorialThemeId, EditorialThemeConfig> = {
  terracotta: {
    id: 'terracotta',
    label: 'Terracotta',
    badge: 'VENETIAN FLAME',
    atelierBg: 'bg-[#121110]',
    atelierText: 'text-[#ede8e1]',
    atelierMuted: 'text-[#a8a29e]',
    surfaceBg: 'bg-[#1c1a17]',
    surfaceBorder: 'border-[#38332c]',
    accentText: 'text-[#c25e40]',
    accentBg: 'bg-[#c25e40]/15',
    accentBorder: 'border-[#c25e40]/40',
    dropCapText: 'text-[#c25e40]',
    quoteBlockBg: 'bg-[#1e1a17]',
    quoteBlockBorder: 'border-[#c25e40]/40',
    previewCardClasses:
      'border-[#c25e40]/80 bg-gradient-to-b from-[#241c19] to-[#1a1412] text-[#ede8e1] shadow-lg ring-1 ring-[#c25e40]/30',
  },
  obsidian: {
    id: 'obsidian',
    label: 'Obsidian',
    badge: 'CHAMPAGNE GOLD',
    atelierBg: 'bg-[#09090b]',
    atelierText: 'text-[#f4f4f5]',
    atelierMuted: 'text-[#9ca3af]',
    surfaceBg: 'bg-[#141417]',
    surfaceBorder: 'border-[#27272a]',
    accentText: 'text-[#d4af37]',
    accentBg: 'bg-[#d4af37]/15',
    accentBorder: 'border-[#d4af37]/40',
    dropCapText: 'text-[#d4af37]',
    quoteBlockBg: 'bg-[#131317]',
    quoteBlockBorder: 'border-[#d4af37]/40',
    previewCardClasses:
      'border-[#d4af37]/80 bg-gradient-to-b from-[#18181c] to-[#0d0d10] text-[#f4f4f5] shadow-lg ring-1 ring-[#d4af37]/30',
  },
  parchment: {
    id: 'parchment',
    label: 'Parchment',
    badge: 'VELLUM & INK',
    atelierBg: 'bg-[#fbf8f1]',
    atelierText: 'text-[#1c1917]',
    atelierMuted: 'text-[#6b625b]',
    surfaceBg: 'bg-[#f3ede1]',
    surfaceBorder: 'border-[#dfd5c3]',
    accentText: 'text-[#9e472a]',
    accentBg: 'bg-[#9e472a]/15',
    accentBorder: 'border-[#9e472a]/40',
    dropCapText: 'text-[#9e472a]',
    quoteBlockBg: 'bg-[#ffffff]',
    quoteBlockBorder: 'border-[#9e472a]/40',
    previewCardClasses:
      'border-[#9e472a]/70 bg-[#ffffff] text-[#1c1917] shadow-lg ring-1 ring-[#9e472a]/20',
  },
  cyber: {
    id: 'cyber',
    label: 'Cyber',
    badge: 'NEON CYAN MATRIX',
    atelierBg: 'bg-[#05080e]',
    atelierText: 'text-[#e0f4ff]',
    atelierMuted: 'text-[#7095ad]',
    surfaceBg: 'bg-[#0c1420]',
    surfaceBorder: 'border-cyan-900/60',
    accentText: 'text-[#00f5ff]',
    accentBg: 'bg-[#00f5ff]/15',
    accentBorder: 'border-[#00f5ff]/40',
    dropCapText: 'text-[#00f5ff]',
    quoteBlockBg: 'bg-[#0a121c]',
    quoteBlockBorder: 'border-[#00f5ff]/60',
    previewCardClasses:
      'border-[#00f5ff]/90 bg-gradient-to-b from-[#0b1624] to-[#050b13] text-[#e0f4ff] shadow-[0_0_20px_rgba(0,245,255,0.25)] ring-1 ring-[#00f5ff]/50 font-mono',
  },
};

export interface EditorialPullQuote {
  id: string;
  text: string;
  author: string;
  work: string;
  category: string;
}

export interface EditorialEssay {
  id: string;
  issueNo: string;
  title: string;
  subtitle: string;
  author: string;
  readTimeMin: number;
  wordCount: number;
  dropCapLetter: string;
  leadParagraph: string;
  bodyParagraphs: string[];
  pullQuote: EditorialPullQuote;
  conclusionParagraph: string;
  tags: string[];
}

export interface MarginaliaNote {
  id: string;
  essayId: string;
  text: string;
  quoteSnippet: string;
  timestamp: string;
}

export interface TypographicSettings {
  typeface: TypefaceFamily;
  scale: ReadingScale;
  measure: ReadingMeasure;
  lineHeight: LineHeightRatio;
  dropCap: boolean;
  selectedQuoteStyle: QuoteCardStyle;
}

export const INITIAL_TYPOGRAPHIC_SETTINGS: TypographicSettings = {
  typeface: 'serif',
  scale: 'md',
  measure: 'balanced',
  lineHeight: 'relaxed',
  dropCap: true,
  selectedQuoteStyle: 'terracotta',
};

export const EDITORIAL_ESSAYS: EditorialEssay[] = [
  {
    id: 'essay-1',
    issueNo: 'Treatise No. 01',
    title: 'The Architecture of Stillness',
    subtitle: 'On the elimination of compositor friction, tactile restraint, and digital dignity.',
    author: 'Himanshu Kumar',
    readTimeMin: 5,
    wordCount: 1240,
    dropCapLetter: 'W',
    leadParagraph:
      'hen an interface yields to the reader’s eye without the visual friction of stuttering shaders, a rare psychological stillness takes place. We have long accepted the premise that modern computing requires endless visual ornamentation — glowing gradients, heavy Gaussian blur filters, and continuous canvas redraws that exhaust integrated graphics processors. Yet, the finest artifacts of human typography — from the vellum folios of Venice to the crisp pages of the mid-century typographers — achieved perfection through restraint.',
    bodyParagraphs: [
      'In high-frequency web development, visual noise is often mistakenly conflated with richness. Every extra transparent layer, every uncontained CSS blur, and every jittery auto-scroll cycle robs the reader of cognitive focus. When an engine operates under strict hardware compositor synchrony, the physical computer recedes into the background.',
      'The human mind processes typographical rhythm in measured saccades. A line length spanning approximately sixty-five characters provides the optimal optical baseline, preventing ocular fatigue during prolonged analytical sessions. By pairing deliberate proportional font scaling with solid contrast surfaces, we re-establish the sanctity of digital reading.',
    ],
    pullQuote: {
      id: 'quote-1',
      text: '“Speed in digital architecture is not merely an engineering metric; it is a moral courtesy extended to the reader’s irreplaceable attention.”',
      author: 'Himanshu Kumar',
      work: 'Universal Library v3.0 Treatises',
      category: 'Digital Philosophy',
    },
    conclusionParagraph:
      'The true mark of sovereign software is not how much it shows, but how completely it steps out of the way. When layout reflows are brought to absolute zero and frame times remain comfortably within display refresh budgets, the screen ceases to feel like a mechanical partition between human thought and digital reality.',
    tags: ['Compositor Synchrony', 'Optical Restraint', 'Digital Dignity'],
  },
  {
    id: 'essay-2',
    issueNo: 'Treatise No. 02',
    title: 'Typography as Sovereign Courtesy',
    subtitle: 'Why optical kerning, proportional scale, and 65ch measure elevate human literacy.',
    author: 'Himanshu Kumar',
    readTimeMin: 4,
    wordCount: 980,
    dropCapLetter: 'T',
    leadParagraph:
      'o present a paragraph of text to a human being is an act of civic hospitality. The typographer’s task is fundamentally an ethical one: to translate abstract thought into physical or digital glyphs that the mind can absorb with minimum kinetic resistance. When line-height is cramped, the eye stumbles backward; when measure is too broad, the journey from line-end to line-start becomes an exhausting optical trek.',
    bodyParagraphs: [
      'The classical proportion of 1.75 line-height on balanced measures creates what Beatrice Warde termed "The Crystal Goblet" — a vessel so lucid, so free of self-indulgent distortions, that the vintage within is tasted in its pure essence.',
      'Modern web frameworks frequently forget this truth in their rush to construct multi-nested dashboard cockpits. Yet when we strip away the synthetic clutter and anchor our canvases to honest, high-contrast typography, reading becomes restorative rather than fatiguing.',
    ],
    pullQuote: {
      id: 'quote-2',
      text: '“A great piece of typography does not demand to be looked at; it demands to be inhabited.”',
      author: 'Himanshu Kumar',
      work: 'The Typographic Doctrine',
      category: 'Typographic Craft',
    },
    conclusionParagraph:
      'In an age of hyperactive notifications and algorithmic feed rot, deliberate typography is an act of intellectual sanctuary. We design not to overwhelm, but to grant the reader room to breathe, consider, and understand.',
    tags: ['Reading Measure', 'Crystal Goblet', 'Typographic Ethics'],
  },
  {
    id: 'essay-3',
    issueNo: 'Treatise No. 03',
    title: 'The Commutative Geometry Doctrine',
    subtitle: 'Spatial invariance, sibling card stability, and the elimination of cumulative layout shift.',
    author: 'Himanshu Kumar',
    readTimeMin: 6,
    wordCount: 1420,
    dropCapLetter: 'S',
    leadParagraph:
      'patial instability in software is the digital equivalent of an earthquake under the reader’s desk. When a card shifts two pixels downward upon receiving new data, or when a button jumps horizontally because adjacent text formatted differently, the user’s subconscious sense of orientation is violated. Sibling modules within any desktop layout must preserve strictly identical spatial bounds across all states.',
    bodyParagraphs: [
      'The Commutative Layout Law asserts that visual hierarchy must remain invariant under asynchronous state dispatches. A card must never expand word-by-word like an accordion during a streaming operation; rather, it must possess firm layout containment that welcomes incoming content without shaking its outer geometry.',
      'By locking height and width boundaries through CSS containment (`contain: layout style`), rendering engines are relieved of the burden of recalculating global document reflows. The browser GPU operates in stillness, and the user’s eyes rest upon an immovable architectural foundation.',
    ],
    pullQuote: {
      id: 'quote-3',
      text: '“A ragged baseline is a failure of structural discipline. True speed begins with geometrical certainty.”',
      author: 'Himanshu Kumar',
      work: 'The Commutative Manifesto',
      category: 'Software Architecture',
    },
    conclusionParagraph:
      'When geometry is held sacred, performance ceases to be an elusive target and becomes the inevitable natural consequence of structural discipline.',
    tags: ['Commutative Layout', 'Zero CLS', 'Spatial Invariance'],
  },
  {
    id: 'essay-4',
    issueNo: 'Treatise No. 04',
    title: 'Acoustic Ergonomics in Silicon',
    subtitle: 'Synthesizing micro-haptic auditory resonance directly via native Web Audio oscillators.',
    author: 'Himanshu Kumar',
    readTimeMin: 4,
    wordCount: 860,
    dropCapLetter: 'I',
    leadParagraph:
      'n the physical world, every interaction produces acoustic confirmation. A key depressed on a mechanical typewriter yields a precise click; a page turned in a heavy hardcover book generates a whisper of fiber against fiber. In the early digital era, interfaces stripped away this sensory layer entirely, leaving interactions feeling cold and detached.',
    bodyParagraphs: [
      'Yet downloading audio asset files over HTTP introduces network lag, latency penalties, and asset loading stutter. The modern solution lies in native algorithmic synthesis: firing instantaneous 1ms sine wave impulses directly into the browser’s hardware AudioContext.',
      'Sub-millisecond audio clicks provide physical haptic assurance without costing a single byte of network traffic. The user hears the action the exact microsecond their finger touches the key, confirming state with tactile precision.',
    ],
    pullQuote: {
      id: 'quote-4',
      text: '“Acoustic haptics transform a glass screen from a passive mirror into an active, responsive instrument.”',
      author: 'Himanshu Kumar',
      work: 'Acoustic Ergonomics',
      category: 'Sensory Design',
    },
    conclusionParagraph:
      'Sound in an interface must never be intrusive or loud; it must be an organic extension of touch — felt almost as much as it is heard.',
    tags: ['Web Audio API', 'Acoustic Haptics', 'Zero Network Bytes'],
  },
];

export const INITIAL_MARGINALIA: MarginaliaNote[] = [
  {
    id: 'note-1',
    essayId: 'essay-1',
    text: 'Essential for QuoteMaker: eliminating backdrop blur allows export pipelines to run at native 60fps.',
    quoteSnippet: 'When an interface yields to the reader’s eye without the visual friction of stuttering shaders...',
    timestamp: 'Yesterday',
  },
  {
    id: 'note-2',
    essayId: 'essay-2',
    text: 'Remember 65ch measure rule for quote cards: text reads best when bounded.',
    quoteSnippet: 'A line length spanning approximately sixty-five characters provides the optimal optical baseline...',
    timestamp: '2 hours ago',
  },
];

const SETTINGS_KEY = 'hk-editorial-settings-v3';
const MARGINALIA_KEY = 'hk-editorial-marginalia-v3';

export function loadStoredTypographicSettings(): TypographicSettings {
  if (typeof window === 'undefined') return INITIAL_TYPOGRAPHIC_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return INITIAL_TYPOGRAPHIC_SETTINGS;
    return { ...INITIAL_TYPOGRAPHIC_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return INITIAL_TYPOGRAPHIC_SETTINGS;
  }
}

export function saveStoredTypographicSettings(settings: TypographicSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Ignore quota issues
  }
}

export function loadStoredMarginalia(): MarginaliaNote[] {
  if (typeof window === 'undefined') return INITIAL_MARGINALIA;
  try {
    const raw = localStorage.getItem(MARGINALIA_KEY);
    if (!raw) return INITIAL_MARGINALIA;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_MARGINALIA;
  } catch {
    return INITIAL_MARGINALIA;
  }
}

export function saveStoredMarginalia(notes: MarginaliaNote[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MARGINALIA_KEY, JSON.stringify(notes));
  } catch {
    // Ignore quota issues
  }
}

// ── SYNC EXTERNAL STORE FOR TYPOGRAPHIC SETTINGS (React 19 / Zero SSR Hydration Mismatch) ──
let currentSettings = INITIAL_TYPOGRAPHIC_SETTINGS;
const settingsListeners = new Set<() => void>();
const emitSettings = () => settingsListeners.forEach((l) => l());

export function subscribeTypographicSettings(listener: () => void) {
  settingsListeners.add(listener);
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', listener);
  }
  return () => {
    settingsListeners.delete(listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', listener);
    }
  };
}

export function getTypographicSettingsSnapshot(): TypographicSettings {
  if (typeof window !== 'undefined' && currentSettings === INITIAL_TYPOGRAPHIC_SETTINGS) {
    currentSettings = loadStoredTypographicSettings();
    if (typeof document !== 'undefined' && currentSettings.selectedQuoteStyle) {
      document.documentElement.setAttribute('data-editorial-theme', currentSettings.selectedQuoteStyle);
    }
  }
  return currentSettings;
}

export function getTypographicSettingsServerSnapshot(): TypographicSettings {
  return INITIAL_TYPOGRAPHIC_SETTINGS;
}

export function updateTypographicSettings(
  updater: (prev: TypographicSettings) => TypographicSettings
): void {
  currentSettings = updater(currentSettings);
  saveStoredTypographicSettings(currentSettings);
  if (typeof document !== 'undefined' && currentSettings.selectedQuoteStyle) {
    document.documentElement.setAttribute('data-editorial-theme', currentSettings.selectedQuoteStyle);
  }
  emitSettings();
}

// ── SYNC EXTERNAL STORE FOR MARGINALIA ──
let currentMarginalia = INITIAL_MARGINALIA;
const marginaliaListeners = new Set<() => void>();
const emitMarginalia = () => marginaliaListeners.forEach((l) => l());

export function subscribeMarginalia(listener: () => void) {
  marginaliaListeners.add(listener);
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', listener);
  }
  return () => {
    marginaliaListeners.delete(listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', listener);
    }
  };
}

export function getMarginaliaSnapshot(): MarginaliaNote[] {
  if (typeof window !== 'undefined' && currentMarginalia === INITIAL_MARGINALIA) {
    currentMarginalia = loadStoredMarginalia();
  }
  return currentMarginalia;
}

export function getMarginaliaServerSnapshot(): MarginaliaNote[] {
  return INITIAL_MARGINALIA;
}

export function addMarginaliaNote(text: string, quoteSnippet: string, essayId: string): void {
  const newNote: MarginaliaNote = {
    id: `note-${Date.now()}`,
    essayId,
    text,
    quoteSnippet: quoteSnippet.slice(0, 100) + '...',
    timestamp: 'Just now',
  };
  currentMarginalia = [newNote, ...currentMarginalia];
  saveStoredMarginalia(currentMarginalia);
  emitMarginalia();
}

export function deleteMarginaliaNote(id: string): void {
  currentMarginalia = currentMarginalia.filter((n) => n.id !== id);
  saveStoredMarginalia(currentMarginalia);
  emitMarginalia();
}
