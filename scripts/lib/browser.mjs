// scripts/lib/browser.mjs — a tiny Chrome DevTools Protocol client for the performance scripts (Chrome or Edge; no dependencies).
// Lessons kept from the Smriti originals:
//  - a CDP command that fails answers with `error`, not `result` — swallowing it is how a tool confidently measures about:blank (so send() rejects)
//  - `mobile: true` turns on page-scale emulation that caps window.scrollTo — width alone drives layout here
//  - Network.loadingFinished must be matched to its request BY ID; "the latest response" misattributes parallel loads
//  - the browser profile lives in the OS temp dir, never in the repo (Chrome writes ~100 MB of cache per profile)
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const env = process.env;
const WIN_DIRS = [...new Set([env.PROGRAMFILES, env['PROGRAMFILES(X86)'], env.LOCALAPPDATA, 'C:/Program Files', 'C:/Program Files (x86)'].filter(Boolean))];
export const CANDIDATES = [
  ...WIN_DIRS.map((d) => join(d, 'Google/Chrome/Application/chrome.exe')),
  ...WIN_DIRS.map((d) => join(d, 'Microsoft/Edge/Application/msedge.exe')),
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/snap/bin/chromium', '/usr/bin/microsoft-edge',
];

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** CHROME_PATH wins (and must exist); otherwise the first installed Chrome / Edge / Chromium. */
export function findBrowser() {
  if (env.CHROME_PATH) return existsSync(env.CHROME_PATH) ? env.CHROME_PATH : null;
  return CANDIDATES.find((p) => existsSync(p)) ?? null;
}

/** null when a browser is available, otherwise the reason — lets a script fail clearly before it starts a server. */
export function browserProblem() {
  if (findBrowser()) return null;
  return env.CHROME_PATH ? `CHROME_PATH points to a missing file: ${env.CHROME_PATH}` : 'No Chrome or Edge found — install one, or set CHROME_PATH to the browser executable';
}

export async function launch({ profile = 'cdp' } = {}) {
  const exe = findBrowser();
  if (!exe) throw new Error(browserProblem());
  const dir = join(tmpdir(), 'hk-kit-cdp', `${profile}-${process.pid}`);
  rmSync(dir, { recursive: true, force: true });
  // port 0 = the browser picks a free port and writes it to DevToolsActivePort (no clashes between parallel runs)
  const child = spawn(exe, ['--headless=new', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', '--disable-extensions',
    '--disable-sync', '--disable-background-networking', '--disable-component-update', '--mute-audio',
    '--remote-debugging-port=0', `--user-data-dir=${dir}`, 'about:blank'], { stdio: 'ignore' });
  let spawnError = null;
  child.on('error', (e) => { spawnError = e; });
  const exited = new Promise((r) => child.once('exit', r));

  let port = null;
  for (let i = 0; i < 120 && !port && !spawnError; i++) {
    try { port = Number(readFileSync(join(dir, 'DevToolsActivePort'), 'utf8').split('\n')[0]) || null; } catch { /* not written yet */ }
    if (!port) await sleep(125);
  }
  if (!port) { child.kill(); throw new Error(`browser did not start (${spawnError?.message ?? 'no DevToolsActivePort after 15 s'}): ${exe}`); }
  const tab = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();

  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  let nextId = 1;
  const pending = new Map(), listeners = new Set();
  ws.addEventListener('message', (event) => {
    const m = JSON.parse(event.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    for (const fn of listeners) fn(m);
  });
  await new Promise((ok, fail) => { ws.addEventListener('open', ok, { once: true }); ws.addEventListener('error', () => fail(new Error('CDP websocket failed')), { once: true }); });

  const send = (method, params = {}) => new Promise((ok, fail) => {
    const id = nextId++;
    const timer = setTimeout(() => { pending.delete(id); fail(new Error(`CDP ${method} timed out`)); }, 30_000);
    pending.set(id, (m) => { clearTimeout(timer); if (m.error) fail(new Error(`CDP ${method} failed: ${m.error.message}`)); else ok(m.result ?? {}); });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error('page threw: ' + (r.exceptionDetails.exception?.description ?? r.exceptionDetails.text));
    return r.result?.value;
  };
  const once = (method, ms) => new Promise((ok) => {
    const fn = (m) => { if (m.method === method) { listeners.delete(fn); clearTimeout(t); ok(m.params); } };
    const t = setTimeout(() => { listeners.delete(fn); ok(null); }, ms);
    listeners.add(fn);
  });
  await send('Page.enable');
  await send('Network.enable');

  return {
    send, evaluate,
    on: (fn) => listeners.add(fn),
    /** Width drives layout; mobile emulation is deliberately left off. */
    viewport: (width, height = 900, deviceScaleFactor = 1) => send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor, mobile: false }),
    /** Navigate, wait for load + a settle period, refuse empty pages. Returns the document's HTTP status. */
    async goto(url, settleMs = Number(env.HK_SETTLE_MS ?? 1500)) {
      let status = null;
      const doc = (m) => { if (m.method === 'Network.responseReceived' && m.params.type === 'Document' && status === null) status = m.params.response.status; };
      listeners.add(doc);
      try {
        const loaded = once('Page.loadEventFired', 20_000);
        const nav = await send('Page.navigate', { url });
        if (nav.errorText) throw new Error(`${url} failed to load: ${nav.errorText}`);
        await loaded;
        await sleep(settleMs);
      } finally { listeners.delete(doc); }
      if (!(await evaluate('document.body ? document.body.innerText.length : 0'))) throw new Error(`nothing rendered at ${url} — refusing to measure an empty page`);
      return status;
    },
    async close() {
      try { await Promise.race([send('Browser.close'), sleep(2000)]); } catch { /* already gone */ }
      ws.close();
      if (await Promise.race([exited.then(() => true), sleep(2000).then(() => false)]) === false) { child.kill(); await Promise.race([exited, sleep(3000)]); }
      try { rmSync(dir, { recursive: true, force: true }); } catch { /* Windows may hold the profile for a moment — it is in temp */ }
    },
  };
}
