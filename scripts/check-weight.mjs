// scripts/check-weight.mjs — [PRF-1] fails if any route downloads more than weight.budgetKB with an empty cache (390 px wide).
//   node scripts/check-weight.mjs                          → after `next build`: starts `next start -p <weight.port>`, weighs every route, stops it
//   node scripts/check-weight.mjs --url http://127.0.0.1:3000   → weighs a server that is already running (preview, staging)
// Routes come from the app dir (static ones) + weight.routes in hk.config.json (concrete URLs for [dynamic] pages).
// Why: on a slow phone connection a heavy route is not a style problem, it is a blank screen — Smriti's /companion reached 3.4 MB, 81% of it unmeasured art.
// Needs Chrome or Edge (set CHROME_PATH if it is somewhere unusual).
import { spawn, spawnSync } from 'node:child_process';
import { loadConfig } from './lib/config.mjs';
import { allRoutes } from './lib/routes.mjs';
import { launch, sleep, browserProblem } from './lib/browser.mjs';
import { report } from './lib/walk.mjs';

const cfg = loadConfig();
const { budgetKB, port } = cfg.weight;
const argUrl = process.argv.includes('--url') ? process.argv[process.argv.indexOf('--url') + 1] : null;
const problems = [], warnings = [];
let server = null, browser = null;

const stop = () => {
  if (!server || server.exitCode !== null) return;
  // shell:true on Windows means server.pid is cmd.exe — kill the whole tree or `next start` keeps running
  if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' });
  else server.kill();
};

async function main() {
  const noBrowser = browserProblem();
  if (noBrowser) { problems.push(noBrowser); return; }
  if (argUrl && !/^https?:\/\//.test(argUrl)) { problems.push(`--url must be http(s)://…, got ${JSON.stringify(argUrl)}`); return; }
  if (!argUrl && !(Number.isInteger(port) && port >= 1024 && port <= 65535)) { problems.push(`weight.port must be an integer 1024–65535 (got ${JSON.stringify(port)})`); return; }
  const base = (argUrl ?? `http://127.0.0.1:${port}`).replace(/\/+$/, '');
  const routes = allRoutes(cfg);
  if (!routes.length) { problems.push(`no routes found in ${cfg.paths.app} or weight.routes`); return; }

  if (!argUrl) {
    // fixed arguments only (port is a validated integer); npx.cmd needs a shell on Windows
    server = process.platform === 'win32'
      ? spawn(`npx next start -p ${port}`, { stdio: 'ignore', shell: true })   // one fixed string: never args + shell (DEP0190)
      : spawn('npx', ['next', 'start', '-p', String(port)], { stdio: 'ignore' });
    server.on('error', () => { /* reported below as "could not start" */ });
    let up = false;
    for (let i = 0; i < 120 && !up && server.exitCode === null; i++) {
      try { up = (await fetch(base + '/')).status < 500; } catch { /* not listening yet */ }
      if (!up) await sleep(500);
    }
    if (!up) { problems.push(`could not start \`next start\` on :${port} — run \`next build\` first (or pass --url)`); return; }
  }

  browser = await launch({ profile: 'weight' });
  const bytes = new Map();
  browser.on((m) => {
    if (m.method === 'Network.responseReceived') bytes.set(m.params.requestId, 0);
    if (m.method === 'Network.loadingFinished' && bytes.has(m.params.requestId)) bytes.set(m.params.requestId, m.params.encodedDataLength);
  });
  await browser.viewport(390);
  await browser.send('Network.setCacheDisabled', { cacheDisabled: true });
  await browser.send('Network.setBypassServiceWorker', { bypass: true });   // a service worker cache would hide the real first-visit weight

  const results = [];
  for (const route of routes) {
    await browser.send('Network.clearBrowserCache');
    bytes.clear();
    let status;
    try { status = await browser.goto(base + route); } catch (e) { warnings.push(`${route} not weighed — ${e.message}`); continue; }
    if (status >= 400) { warnings.push(`${route} answered ${status} — not weighed (list a concrete URL in weight.routes)`); continue; }
    results.push({ route, kb: [...bytes.values()].reduce((a, b) => a + b, 0) / 1024 });
  }
  results.sort((a, b) => b.kb - a.kb);
  console.log(`⚖️  check-weight: ${results.length} route(s) at 390 px, empty cache, budget ${budgetKB} KB`);
  for (const r of results.slice(0, 10)) console.log(`  ${r.kb > budgetKB ? 'OVER ' : '     '}${r.kb.toFixed(0).padStart(6)} KB  ${r.route}`);
  if (results.length > 10) console.log(`  … ${results.length - 10} lighter route(s)`);
  for (const r of results.filter((x) => x.kb > budgetKB)) problems.push(`${r.route} downloads ${r.kb.toFixed(0)} KB — budget ${budgetKB} KB (new art? run measure-art-sizes + optimise-art)`);
  if (!results.length) problems.push('no route could be weighed');
}

try { await main(); }
catch (e) { problems.push(e.message); }
finally { if (browser) await browser.close(); stop(); }
report('check-weight', 'PRF-1', problems, warnings);
