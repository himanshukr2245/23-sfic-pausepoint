// e2e/offline.spec.ts — the offline promise, proven in a real browser (OFF-4). An offline claim without this test passing is an
// ASSUMPTION, not a fact. The reload must come from the service worker's cache (`x-hk-offline: 1`) — not from a network that the
// test forgot to switch off.
import { test, expect, type Page } from '@playwright/test';

test.describe.configure({ timeout: 60_000 });                      // installs a service worker and reloads several times

const list = (page: Page) => page.getByRole('list', { name: 'Your notes' });
const banner = (page: Page) => page.getByRole('status').filter({ hasText: 'You are offline.' });

/** From the moment a worker controls the page, the shell is saved: install (which saves it) finishes before activation. */
async function waitForServiceWorker(page: Page) {
  await page.waitForFunction(() => !!navigator.serviceWorker?.controller, null, { timeout: 30_000 });
}

test('offline: notes open, save and survive a reload with no network; unsaved pages get the offline page', async ({ page, context }) => {
  await page.goto('/notes');
  await expect(page.getByText('No notes yet. Write your first one above.')).toBeVisible();
  await waitForServiceWorker(page);

  await context.setOffline(true);
  await expect(banner(page)).toBeVisible();                        // OFF-1: an honest notice the moment the network goes

  // Playwright switches the PAGE offline at once but its service worker a moment later (seen in a trace: the page's own requests
  // failed while the worker's fetch still reached the server). Retry until the answer comes from the cache — that is the claim.
  await expect(async () => {
    const reload = await page.reload();
    expect(reload?.headers()['x-hk-offline'], 'the reloaded page must come from the service worker cache').toBe('1');
  }).toPass({ timeout: 20_000, intervals: [500, 1_000, 2_000] });
  await expect(page.getByText('No notes yet. Write your first one above.')).toBeVisible();

  await page.getByLabel('New note').fill('Written with no signal');
  await page.getByRole('button', { name: 'Add note' }).click();
  await expect(list(page)).toContainText('Written with no signal');
  await page.reload();
  await expect(list(page)).toContainText('Written with no signal');

  // a soft link while offline: the router cannot fetch, Next.js falls back to a full page load, the cache answers it
  await page.getByRole('navigation', { name: 'Main Navigation Bar' }).getByRole('link', { name: 'Home' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'HK Starter' })).toBeVisible();

  // a page that was never saved → the calm offline page, with a way back to what works
  await page.goto('/a-page-this-device-never-saved');
  await expect(page.getByRole('heading', { level: 1, name: 'You are offline' })).toBeVisible();
  await page.getByRole('link', { name: 'Open your notes' }).click();
  await expect(list(page)).toContainText('Written with no signal');

  await context.setOffline(false);
  await expect(banner(page)).toBeHidden();
});

test('offline: the app is installable — manifest, icons and a service worker', async ({ page, request }) => {
  await page.goto('/');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(href).toBeTruthy();
  const manifest = await (await request.get(href!)).json();
  expect(manifest).toMatchObject({ display: 'standalone', start_url: '/' });
  for (const icon of manifest.icons as { src: string }[]) expect((await request.get(icon.src)).status(), icon.src).toBe(200);
  expect(manifest.icons.some((i: { purpose?: string }) => i.purpose === 'maskable')).toBe(true);
  await waitForServiceWorker(page);
  const sw = await request.get('/sw.js');
  expect(sw.status()).toBe(200);
});
