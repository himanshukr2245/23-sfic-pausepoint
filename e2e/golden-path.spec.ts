// e2e/golden-path.spec.ts — PausePoint Golden Hour core citizen journey (docs/GOLDEN_PATH.md).
import { test, expect } from '@playwright/test';

test('golden path: land → report fraud → verify repeat deposit brake → forensic studio', async ({ page }) => {
  // Beat 1 — Sovereign Citizen Firewall lands with clear title
  await page.goto('/');
  await expect(page.getByTestId('theme-toggle')).toHaveText(/Light|Dark|System/);
  await expect(page.getByRole('heading', { level: 1, name: 'PausePoint' })).toBeVisible();

  // Beat 2 — One tap to the Emergency Report Flow (/report)
  await page.locator('a[href="/report"]').first().click();
  await expect(page).toHaveURL(/\/report$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/1930/);

  // Beat 3 — One tap to Before You Pay Again (/verify) & Cognitive Deposit Brake
  await page.goto('/verify');
  await expect(page.getByText(/Before You Pay Again/i).first()).toBeVisible();
  await page.getByRole('button', { name: /Task Scam/i }).click();
  await expect(page.getByText(/STOP! DO NOT SEND MONEY/i).first()).toBeVisible();

  // Beat 4 — Forensic Studio (/studio) generates BSA 2023 certificate
  await page.goto('/studio');
  await expect(page.getByText(/Forensic Investigation Studio/i)).toBeVisible();
  await expect(page.getByText(/Emergency 1930 Call Script/i)).toBeVisible();
});

test('health: liveness and readiness answer for monitors', async ({ request }) => {
  const live = await request.get('/api/health');
  expect(live.status()).toBe(200);
  expect(await live.json()).toMatchObject({ status: 'ok' });
  const ready = await request.get('/api/health?deep=1');
  expect(ready.status()).toBe(200);
  expect((await ready.json()).checks).toBeDefined();
});
