// app/api/health/route.ts — liveness + readiness for uptime monitors, check-live and the keep-awake ping (OPS-4).
//   GET/HEAD /api/health        → liveness: instant, touches nothing → 200 {status:'ok', release, environment, at}
//   GET /api/health?deep=1      → readiness: every CONFIGURED dependency is pinged (1.5 s timeout, cached 30 s per isolate);
//                                 unconfigured ones report "skipped". 503 {status:'degraded'} when one is down — never error details.
//                                 The database check reads the notes table through RLS (a stranger sees no rows): it fails when the
//                                 migrations were not run, and it is the activity that keeps a free Supabase project from pausing
//                                 (.github/workflows/keep-awake.yml pings it daily).
// Excluded from the middleware matcher, so monitors never pay for CSP work or an auth call.
export const dynamic = 'force-dynamic';

const RELEASE = process.env.NEXT_PUBLIC_RELEASE ?? 'local';
const ENVIRONMENT = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const NO_STORE = { 'Cache-Control': 'no-store' };
type Check = 'ok' | 'down' | 'skipped';
let cached: { supabase: Check; database: Check; at: number } | null = null;

const ping = async (url: string, key: string): Promise<Check> => {
  try { return (await fetch(url, { headers: { apikey: key }, signal: AbortSignal.timeout(1500), cache: 'no-store' })).ok ? 'ok' : 'down'; }
  catch { return 'down'; }                                         // timeout / DNS / TLS — the reason stays out of the response
};

async function dependencyChecks(): Promise<{ supabase: Check; database: Check }> {
  if (cached && Date.now() - cached.at < 30_000) return { supabase: cached.supabase, database: cached.database };
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, ''), key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  let supabase: Check = 'skipped', database: Check = 'skipped';
  if (url && key) {
    [supabase, database] = await Promise.all([ping(`${url}/auth/v1/health`, key), ping(`${url}/rest/v1/pausepoint_notes?select=id&limit=1`, key)]);
  }
  cached = { supabase, database, at: Date.now() };
  return { supabase, database };
}

export async function GET(request: Request) {
  const deep = new URL(request.url).searchParams.get('deep') === '1';
  const checks = deep ? await dependencyChecks() : undefined;
  const ok = !checks || Object.values(checks).every((c) => c !== 'down');
  return Response.json({ status: ok ? 'ok' : 'degraded', release: RELEASE, environment: ENVIRONMENT, at: new Date().toISOString(), ...(checks && { checks }) },
    { status: ok ? 200 : 503, headers: NO_STORE });
}

export function HEAD() {
  return new Response(null, { status: 200, headers: NO_STORE });
}
