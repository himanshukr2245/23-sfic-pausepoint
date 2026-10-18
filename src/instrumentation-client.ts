// src/instrumentation-client.ts — starts the Top Loader for every App Router navigation (from HK_KIT lib/navigation). Next.js ≥ 15.3.
// Next calls onRouterTransitionStart when ANY App Router navigation starts: <Link> clicks, router.push/replace and Back/Forward.
// It is the reliable start signal for the Top Loader — a document click listener cannot see <Link> clicks properly (Link calls
// preventDefault()) and never sees router.push or Back. This file runs before hydration on every page: keep it this small.
// No filtering here: on Back/Forward the browser has ALREADY changed window.location, so only TopLoader (which remembers the page it
// last rendered) can tell a real page change from a #hash jump.
import { NAV_START_EVENT } from '@/lib/navigation/progress';   // the pure module only — nothing React-sized loads here

export function onRouterTransitionStart(url: string, navigationType: 'push' | 'replace' | 'traverse') {
  window.dispatchEvent(new CustomEvent(NAV_START_EVENT, { detail: { url, navigationType } }));
}
