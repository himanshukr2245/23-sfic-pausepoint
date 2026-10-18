// e2e/soft-nav.spec.ts — proves internal links navigate WITHOUT a full page reload (client-side routing, Top Loader, kept state).
// A marker stored on `window` survives a soft navigation and is wiped by a hard reload — so if it is gone, some link is a plain <a> or a reload.
import { test, expect } from '@playwright/test';

const FROM = '/';                                                  // a page with at least one internal link

test('soft navigation: an internal link keeps the page alive (no reload), and Back does too', async ({ page }) => {
  await page.goto(FROM);
  await page.evaluate(() => { (window as unknown as { __hkMarker?: string }).__hkMarker = 'still-here'; });
  const link = page.locator(`a[href^="/"]:not([href="${FROM}"]):not([target="_blank"]):not([download])`).first();
  await expect(link, 'need at least one internal link on FROM').toBeVisible();
  const href = await link.getAttribute('href');
  await link.click();
  await page.waitForURL((u) => u.pathname === new URL(href!, 'http://x').pathname);
  expect(await page.evaluate(() => (window as unknown as { __hkMarker?: string }).__hkMarker), 'the page reloaded — use next/link').toBe('still-here');
  await page.goBack();
  await page.waitForURL((u) => u.pathname === FROM);
  expect(await page.evaluate(() => (window as unknown as { __hkMarker?: string }).__hkMarker), 'Back reloaded the page').toBe('still-here');
});
