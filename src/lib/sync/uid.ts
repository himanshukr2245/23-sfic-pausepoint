// lib/sync/uid.ts — client-generated row ids (RFC 4122 v4). Rows created offline need an id before the server ever sees them.
// crypto.randomUUID exists only in secure contexts (https, localhost) — a phone opening http://192.168.x.x:3000 has crypto but no randomUUID.
// crypto.getRandomValues works on plain HTTP too, so it is the fallback. Never Math.random: predictable ids collide and can be guessed.
export type CryptoLike = { randomUUID?: () => string; getRandomValues?: <T extends Uint8Array>(array: T) => T };

export function uid(c: CryptoLike | null = (globalThis as { crypto?: CryptoLike }).crypto ?? null): string {
  if (typeof c?.randomUUID === 'function') {
    try { return c.randomUUID(); } catch { /* some embedded webviews expose it but throw — use the fallback */ }
  }
  if (typeof c?.getRandomValues === 'function') {
    const b = c.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 0x0f) | 0x40;                                    // version 4
    b[8] = (b[8] & 0x3f) | 0x80;                                    // RFC 4122 variant (10xx)
    const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  }
  throw new Error('uid(): no Web Crypto in this environment — refusing to fall back to Math.random');
}
