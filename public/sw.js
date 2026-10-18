// public/sw.js — the offline shell (OFF-1, OFF-3). Hand-written on purpose: every line is readable, nothing is generated.
// Registered by src/modules/offline/pwa/ServiceWorkerRegistrar.tsx as /sw.js?v=<release> — a new release is a new script URL, so the
// browser installs the new worker, which waits until the person taps "Reload" (never a surprise reload mid-typing).
//
// What it does:
//  - install: saves the SHELL pages + each page's own scripts and styles, fetched WITHOUT cookies (an anonymous page — never one
//    person's page) and refusing redirects (a page that redirects, e.g. to a login, is not a shell)
//  - pages (navigations): network first; no network (or no answer in 4 s) → the saved copy of that page → the /offline page
//  - /_next/static/*: cache first — the file names carry a content hash, so a saved file can never be stale
//  - never touched: anything not GET, other origins, /api, /auth, image optimiser, and router (RSC) requests — offline, those fail,
//    and Next.js falls back to a full page load, which the navigation rule above answers from the cache
//
// Debug: a response that came from the cache carries `x-hk-offline: 1` (DevTools → Network → Headers).

const VERSION = new URL(self.location.href).searchParams.get('v') || 'dev';
const PREFIX = 'pausepoint-';                                      // hk:init writes your app's slug here
const CACHE = `${PREFIX}${VERSION}`;
const SHELL = ['/', '/report', '/verify', '/about', '/notes', '/offline'];                          // pages that must open with no network
const EXTRAS = ['/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/maskable-512.png'];
const NEVER = [/^\/api\//, /^\/auth(\/|$)/, /^\/_next\/image/];
const NAV_TIMEOUT_MS = 4000;                                       // a near-dead connection is worse than none: use the saved page

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const assets = new Set(EXTRAS);
    for (const path of SHELL) {
      const res = await fetch(path, { credentials: 'omit', redirect: 'manual', cache: 'no-store' });
      if (!res.ok || res.type === 'opaqueredirect') throw new Error(`sw: cannot save ${path} (${res.status || res.type})`);
      const html = await res.clone().text();
      for (const [, url] of html.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+)"/g)) assets.add(url.replaceAll('&amp;', '&'));
      await cache.put(path, res);
    }
    await cache.addAll([...assets]);
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith(PREFIX) && key !== CACHE) await caches.delete(key);
    await self.clients.claim();                                    // control the open page now: offline works from the first visit
  })());
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();           // sent only after the person tapped "Reload"
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (NEVER.some((re) => re.test(url.pathname))) return;
  if (req.headers.get('rsc') === '1' || url.searchParams.has('_rsc')) return;
  if (req.mode === 'navigate') event.respondWith(page(req, url));
  else if (url.pathname.startsWith('/_next/static/')) event.respondWith(hashed(req));
  else if (EXTRAS.includes(url.pathname)) event.respondWith(saved(req));
});

async function page(req, url) {
  try {
    return await fetchWithin(req, NAV_TIMEOUT_MS);
  } catch {
    const cache = await caches.open(CACHE);
    const hit = (await cache.match(url.pathname)) || (await cache.match('/offline'));
    return hit ? marked(hit) : new Response('You are offline.', { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }
}

async function hashed(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok && res.type === 'basic') await cache.put(req, res.clone());
  return res;
}

async function saved(req) {
  try { return await fetch(req); } catch { return (await caches.match(req)) || Response.error(); }
}

/** The network, or a rejection after `ms`. fetch(req) gets NO second argument: adding options to a navigation request turns it into a
 *  different (same-origin mode) request. */
function fetchWithin(req, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('sw: network too slow')), ms);
    fetch(req).then((res) => { clearTimeout(timer); resolve(res); }, (err) => { clearTimeout(timer); reject(err); });
  });
}

function marked(res) {
  const headers = new Headers(res.headers);
  headers.set('x-hk-offline', '1');
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}
