// playwright.config.ts — the golden path, soft navigation, accessibility and offline journeys on a phone-sized and a laptop-sized viewport.
//   npm run check            → builds, then this starts `next start` on PORT and runs e2e/
//   BASE_URL=https://… npx playwright test   → runs the same specs against a deployed preview instead
import { cpus } from 'node:os';
import { defineConfig } from '@playwright/test';

const PORT = 3100;
const BASE_URL = process.env.BASE_URL ?? `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  // Workers from the machine, not a fixed number: each browser running axe needs about 4 logical cores beside the one-process
  // `next start`. Playwright's default (half the cores) overloaded an 8-thread laptop until a 5 s step timed out at random (F-64).
  // A remote BASE_URL is slower per request (real network): 2 workers and a longer timeout, so a slow link is not a "broken site".
  workers: process.env.CI || process.env.BASE_URL ? 2 : Math.max(1, Math.min(4, Math.floor(cpus().length / 4))),
  timeout: process.env.BASE_URL ? 60_000 : 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  // channel 'chromium' = full Chromium in new headless mode: closer to real Chrome, and no separate headless-shell download
  // (CI: npx playwright install --with-deps --no-shell chromium)
  use: { baseURL: BASE_URL, trace: 'retain-on-failure', channel: 'chromium' },
  projects: [
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, hasTouch: true } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
  ],
  webServer: process.env.BASE_URL ? undefined : { command: `npx next start -p ${PORT}`, url: BASE_URL, reuseExistingServer: !process.env.CI, timeout: 120_000 },
});
