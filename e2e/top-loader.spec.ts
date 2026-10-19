// e2e/top-loader.spec.ts — PRF-2 / LAW-10: a click that navigates must show visible feedback (the Top Loader), even when the page is instant.
// The bar of an instant navigation is on screen for only ~0.5 s. On a busy machine the next `expect` can start after it has gone
// (HK ledger F-63), so never poll for it afterwards: watchBar() records it INSIDE the page, from before the action.
import { test, expect, type Page } from '@playwright/test';

const bar = '.hk-toploader';

/** Start watching for the bar; returns a function that reads whether it ever appeared. The watcher lives in the current document,
 *  so it also proves the navigation was soft — a full reload would wipe it and read as "never appeared". */
async function watchBar(page: Page) {
  await page.evaluate((sel) => {
    const w = window as unknown as { __hkBarSeen?: boolean };
    w.__hkBarSeen = false;
    new MutationObserver((_, obs) => { if (document.querySelector(sel)) { w.__hkBarSeen = true; obs.disconnect(); } })
      .observe(document.documentElement, { childList: true, subtree: true });
  }, bar);
  return () => page.evaluate(() => (window as unknown as { __hkBarSeen?: boolean }).__hkBarSeen === true);
}

async function openHydrated(page: Page, path: string) {
  await page.goto(path);
  await expect(page.getByTestId('theme-toggle')).toHaveText(/Light|Dark|System/);   // hydrated: a click before this is a full page load
}

test('top loader: clicking a <Link> shows the bar, and it goes away when the page has changed', async ({ page }) => {
  await openHydrated(page, '/');
  const seen = await watchBar(page);
  await page.getByRole('link', { name: /explore work|specs/i }).click();
  await expect.poll(seen, { message: 'no visible feedback after the click' }).toBe(true);
  await expect(page).toHaveURL(/\/about$/, { timeout: 10_000 });
  await expect(page.locator(bar)).toBeHidden({ timeout: 10_000 });
});

test('top loader: browser Back shows the bar too', async ({ page }) => {
  await openHydrated(page, '/');
  await page.getByRole('link', { name: /explore work|specs/i }).click();
  await expect(page).toHaveURL(/\/about$/, { timeout: 10_000 });
  await expect(page.locator(bar)).toBeHidden({ timeout: 10_000 });
  const seen = await watchBar(page);
  await page.goBack();
  await expect.poll(seen, { message: 'no visible feedback on Back' }).toBe(true);
  await expect(page).toHaveURL(/\/$/, { timeout: 10_000 });
});

test('top loader: a link to the page you are already on shows nothing', async ({ page }) => {
  await openHydrated(page, '/');
  const seen = await watchBar(page);
  await page.getByRole('navigation', { name: 'Main Navigation Bar' }).getByRole('link', { name: 'Home' }).click();
  await page.waitForTimeout(600);                                     // longer than the 300 ms minimum + 250 ms fade
  expect(await seen(), 'the bar appeared for a link to the current page').toBe(false);
});
