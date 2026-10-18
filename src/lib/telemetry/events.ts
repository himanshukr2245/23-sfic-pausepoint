// lib/telemetry/events.ts — privacy-safe technical telemetry. Zero dependencies; runs in the browser, on Workers and in Node.
// Observe technical behaviour, never people. Two layers:
//  1. an ALLOW-LIST schema — toTelemetryEvent() keeps only the fields below, with checked types and lengths; anything else is dropped, not "redacted"
//  2. a value scrubber — scrubString()/scrub() remove emails, phone numbers, tokens and secrets that slip into strings anyway
// Never redact by field-name substrings (/name/, /key/): that wipes event names and idempotency keys and still misses PII inside values.

export const EVENT_NAMES = [
  'app_started', 'route_changed', 'sync_queued', 'sync_started', 'sync_succeeded', 'sync_failed', 'sync_conflict',
  'offline_entered', 'online_restored', 'client_error', 'unhandled_rejection', 'health_degraded', 'web_vital',
] as const;
export type EventName = (typeof EVENT_NAMES)[number];

/** Stable technical codes — grep-able across releases. Apps may add their own UPPER_SNAKE codes. */
export const ERROR_CODES = {
  APP_INIT_FAILED: 'APP_INIT_FAILED',
  CLIENT_JS_EXCEPTION: 'CLIENT_JS_EXCEPTION',
  UNHANDLED_REJECTION: 'UNHANDLED_REJECTION',
  NETWORK_OFFLINE_EXPECTED: 'NETWORK_OFFLINE_EXPECTED',
  SYNC_TIMEOUT: 'SYNC_TIMEOUT',
  SYNC_NETWORK_UNAVAILABLE: 'SYNC_NETWORK_UNAVAILABLE',
  SYNC_REJECTED: 'SYNC_REJECTED',
  SYNC_CONFLICT: 'SYNC_CONFLICT',
  IDB_OPEN_FAILED: 'IDB_OPEN_FAILED',
  IDB_WRITE_FAILED: 'IDB_WRITE_FAILED',
  STORAGE_QUOTA_EXCEEDED: 'STORAGE_QUOTA_EXCEEDED',
  API_ERROR: 'API_ERROR',
  HEALTH_DEGRADED: 'HEALTH_DEGRADED',
} as const;
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES] | (string & {});

export const ALLOWED_FIELDS = ['event', 'code', 'release', 'environment', 'route', 'platform', 'correlationId', 'durationMs', 'status', 'queueDepth', 'retryCount', 'metric', 'value', 'rating', 'at'] as const;
/** Core Web Vitals from real visits (PRF-1): the name, the number, Google's rating — never the page content or the person. */
const METRICS = ['LCP', 'CLS', 'INP', 'FCP', 'TTFB'] as const;
const RATINGS = ['good', 'needs-improvement', 'poor'] as const;
const ENVIRONMENTS = ['production', 'preview', 'development', 'test'] as const;
const PLATFORMS = ['web', 'pwa', 'android', 'ios'] as const;

export interface TelemetryEvent {
  event: EventName; at: number;
  code?: ErrorCode; release?: string; environment?: (typeof ENVIRONMENTS)[number]; route?: string; platform?: (typeof PLATFORMS)[number];
  correlationId?: string; durationMs?: number; status?: number; queueDepth?: number; retryCount?: number;
  metric?: (typeof METRICS)[number]; value?: number; rating?: (typeof RATINGS)[number];
}

// ── value scrubber ────────────────────────────────────────────────────────────
const RULES: [RegExp, string][] = [
  [/\beyJ[\w-]{5,}\.[\w-]{5,}\.[\w-]{5,}/g, '[jwt]'],                                                     // JWTs (access / service tokens)
  [/([?&;](?:(?:access_|refresh_|id_)?token|(?:api_?)?key|apikey|secret|password|passwd|pwd|sig|signature|code)=)[^&#\s]*/gi, '$1[redacted]'],
  [/[\w.%+-]+@[\w-]+(?:\.[\w-]+)+/g, '[email]'],                                                            // emails
  [/(?<![\w+])\+\d{1,3}(?:[\s-]?\d){7,14}(?!\d)/g, '[phone]'],                                              // international, +CC …
  [/(?<![\w+])(?:0|91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}(?!\d)/g, '[phone]'],                                    // Indian mobiles: 98640 12345, 0…, 91…
  [/\b[a-f0-9]{32,}\b/gi, '[secret]'],                                                                      // long hex (keys, hashes used as tokens)
  [/(?<![\w-])(?=[\w+-]*\d)(?=[\w+-]*[A-Z])(?=[\w+-]*[a-z])[\w+-]{32,}={0,2}(?![\w-])/g, '[secret]'],      // long mixed-case base64/base64url
];
const MAX_STRING = 1000, MAX_DEPTH = 6, MAX_ITEMS = 100;

export function scrubString(s: string): string {
  let out = String(s).slice(0, MAX_STRING);
  for (const [re, to] of RULES) out = out.replace(re, to);
  return out;
}

/** Recursive scrub of any value: strings scrubbed, arrays and objects walked (keys kept), depth-capped; functions/symbols dropped. */
export function scrub(value: unknown, depth = 0): unknown {
  if (depth > MAX_DEPTH) return '[depth]';
  if (typeof value === 'string') return scrubString(value);
  if (value === null || typeof value === 'number' || typeof value === 'boolean') return value;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.slice(0, MAX_ITEMS).map((v) => scrub(v, depth + 1));
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>).slice(0, MAX_ITEMS)) { const s = scrub(v, depth + 1); if (s !== undefined) out[k] = s; }
    return out;
  }
  return undefined;
}

// ── allow-list schema ─────────────────────────────────────────────────────────
const int = (v: unknown, min: number, max: number) => (typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max ? v : undefined);
const oneOf = <T extends string>(v: unknown, list: readonly T[]) => (typeof v === 'string' && (list as readonly string[]).includes(v) ? (v as T) : undefined);
const pattern = (v: unknown, re: RegExp) => (typeof v === 'string' && re.test(v) ? v : undefined);

/** Route without query or hash, ids replaced by :id, scrubbed — "/patients/3f2a…?tab=x#y" → "/patients/:id". */
export function cleanRoute(v: unknown): string | undefined {
  if (typeof v !== 'string' || !v.startsWith('/')) return undefined;
  const path = v.split(/[?#]/)[0].slice(0, 200)
    .split('/').map((seg) => (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(seg) || /^\d{4,}$/.test(seg) ? ':id' : seg)).join('/');
  return scrubString(path);
}

/** Validated event or null. Unknown fields are dropped; a field with the wrong type or size is dropped; an unknown event name → null. */
export function toTelemetryEvent(raw: unknown, now: number = Date.now()): TelemetryEvent | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  const event = oneOf(r.event, EVENT_NAMES);
  if (!event) return null;
  const at = typeof r.at === 'number' && Number.isFinite(r.at) && r.at > 0 ? Math.round(r.at) : now;
  const e: TelemetryEvent = { event, at };
  const set = <K extends keyof TelemetryEvent>(k: K, v: TelemetryEvent[K] | undefined) => { if (v !== undefined) e[k] = v; };
  set('code', pattern(r.code, /^[A-Z][A-Z0-9_]{1,63}$/));
  set('release', pattern(r.release, /^[\w.+-]{1,64}$/));
  set('environment', oneOf(r.environment, ENVIRONMENTS));
  set('route', cleanRoute(r.route));
  set('platform', oneOf(r.platform, PLATFORMS));
  set('correlationId', pattern(r.correlationId, /^[\w-]{8,64}$/));
  set('durationMs', typeof r.durationMs === 'number' && Number.isFinite(r.durationMs) && r.durationMs >= 0 && r.durationMs <= 86_400_000 ? Math.round(r.durationMs) : undefined);
  set('status', int(r.status, 0, 599));
  set('queueDepth', int(r.queueDepth, 0, 1_000_000));
  set('retryCount', int(r.retryCount, 0, 1000));
  set('metric', oneOf(r.metric, METRICS));
  set('value', typeof r.value === 'number' && Number.isFinite(r.value) && r.value >= 0 && r.value <= 600_000 ? Math.round(r.value * 1000) / 1000 : undefined);
  set('rating', oneOf(r.rating, RATINGS));
  return e;
}

/** Keeps the last `capacity` items (oldest dropped first) — e.g. recent events to attach to a bug report, or to flush when back online. */
export class RingBuffer<T> {
  readonly capacity: number;
  private items: T[] = [];
  constructor(capacity = 100) {
    if (!Number.isInteger(capacity) || capacity < 1) throw new Error('RingBuffer capacity must be a positive integer');
    this.capacity = capacity;
  }
  push(item: T) { this.items.push(item); if (this.items.length > this.capacity) this.items.shift(); }
  toArray(): T[] { return [...this.items]; }
  drain(): T[] { const out = this.items; this.items = []; return out; }
  get size() { return this.items.length; }
}
