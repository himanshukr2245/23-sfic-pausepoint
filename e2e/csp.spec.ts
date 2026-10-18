// e2e/csp.spec.ts — the nonce CSP really works (SEC-6): no page triggers a CSP violation, and the app hydrates
// (the theme toggle reacts — that only happens if Next's scripts carried the request nonce and were allowed to run).
import { test, expect } from '@playwright/test';

declare global { interface Window { __cspViolations?: string[] } }

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {                                 // injected by the browser driver, so the CSP does not apply to it
    window.__cspViolations = [];
    document.addEventListener('securitypolicyviolation', (e) => window.__cspViolations!.push(`${e.violatedDirective} ${e.blockedURI}`));
  });
});

const PAGES = [
  '/', '/about', '/design',
  // #if auth || offline
  '/notes',
  // #endif
  // #if auth
  '/login', '/auth/confirm',
  // #endif
  // #if offline
  '/offline',
  // #endif
  '/this-page-does-not-exist',
];

for (const path of PAGES) {
  test(`csp: ${path} loads with zero CSP violations`, async ({ page }) => {
    const response = await page.goto(path);
    const csp = response?.headers()['content-security-policy'] ?? '';
    expect(csp).toMatch(/'nonce-[^']+'/);
    await page.waitForLoadState('networkidle');
    expect(await page.evaluate(() => window.__cspViolations)).toEqual([]);
  });
}

test('csp: the app hydrates — the theme toggle changes the theme', async ({ page }) => {
  await page.goto('/');
  const lightBtn = page.getByRole('button', { name: /light/i }).first();
  const darkBtn = page.getByRole('button', { name: /dark/i }).first();
  await lightBtn.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await darkBtn.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await page.evaluate(() => window.__cspViolations)).toEqual([]);
});
