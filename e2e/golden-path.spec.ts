// e2e/golden-path.spec.ts — if this is red, the core journey is broken (docs/GOLDEN_PATH.md). Runs on a phone and a laptop viewport.
import { test, expect } from '@playwright/test';

test('golden path: land → learn how it works → submit a validated form → keep a note', async ({ page }) => {
  // Beat 1 — the promise is visible
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'HK Starter' })).toBeVisible();

  // Beat 2 — one tap to the explanation (soft navigation)
  await page.getByRole('link', { name: /explore work/i }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Architecture & Quality Gates' })).toBeVisible();

  // Beat 3 — the server validates and answers in plain words
  const name = page.getByLabel('Your name');
  await page.getByRole('button', { name: 'Say hello' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Please enter your name.' })).toBeVisible();
  await name.fill('Asha');
  await page.getByRole('button', { name: 'Say hello' }).click();
  await expect(page.getByText('Hello, Asha. Validated on the server.')).toBeVisible();

  // #if offline
  // Beat 4 — the demo feature keeps what you write (on this device)
  await page.getByRole('link', { name: 'Notes' }).click();
  await expect(page.getByText('No notes yet. Write your first one above.')).toBeVisible();
  await page.getByLabel('New note').fill('My first note');
  await page.getByRole('button', { name: 'Add note' }).click();
  await page.reload();
  await expect(page.getByRole('list', { name: 'Your notes' })).toContainText('My first note');
  // #endif
});

test('health: liveness and readiness answer for monitors', async ({ request }) => {
  const live = await request.get('/api/health');
  expect(live.status()).toBe(200);
  expect(await live.json()).toMatchObject({ status: 'ok' });
  const ready = await request.get('/api/health?deep=1');
  expect(ready.status()).toBe(200);                                // no Supabase configured → "skipped", never degraded
  expect((await ready.json()).checks).toBeDefined();
});
