// app/api/log/route.ts — receives navigator.sendBeacon batches from lib/telemetry/client.ts and writes one JSON line per event,
// which lands in Cloudflare Workers Logs (OPS-2). The server re-runs the allow-list: whatever a client sends, only known fields survive.
// Abuse: the real limit is a Cloudflare WAF rate-limiting rule on /api/log (STK-7); the per-isolate cap below is only a soft brake.
import { toTelemetryEvent } from '@/lib/telemetry/events';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 8 * 1024;
const MAX_EVENTS = 20;
const WINDOW_MS = 60_000, MAX_PER_WINDOW = 120;
let windowStart = 0, inWindow = 0;

export async function POST(request: Request) {
  const now = Date.now();
  if (now - windowStart > WINDOW_MS) { windowStart = now; inWindow = 0; }
  if (++inWindow > MAX_PER_WINDOW) return new Response(null, { status: 429 });

  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > MAX_BYTES) return new Response(null, { status: 413 });
  const text = await request.text();
  if (text.length > MAX_BYTES) return new Response(null, { status: 413 });

  let body: unknown;
  try { body = JSON.parse(text); } catch { return new Response(null, { status: 400 }); }
  const items = (Array.isArray(body) ? body : [body]).slice(0, MAX_EVENTS);
  for (const item of items) {
    const event = toTelemetryEvent(item, now);
    if (event) console.log(JSON.stringify({ type: 'telemetry', ...event }));
  }
  return new Response(null, { status: 204 });                     // the same answer for every accepted batch — nothing to probe
}
