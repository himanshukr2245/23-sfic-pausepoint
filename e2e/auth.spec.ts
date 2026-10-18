// e2e/auth.spec.ts — the auth module's screens.
//  - Accounts off (no NEXT_PUBLIC_SUPABASE_* at build time — local `npm run check` and CI): every screen degrades calmly to guest
//    mode, and nothing pretends notes are synced.
//  - Real accounts: set TEST_AUTH_EMAIL / TEST_AUTH_PASSWORD (a throwaway account on the app's own Supabase project) and build with
//    the project's NEXT_PUBLIC_SUPABASE_* values: sign in → a note syncs → a second browser sees it → sign out.
import { test, expect, type Page } from '@playwright/test';

const accountsOn = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
const EMAIL = process.env.TEST_AUTH_EMAIL ?? '';
const PASSWORD = process.env.TEST_AUTH_PASSWORD ?? '';

test.describe('accounts off (guest mode)', () => {
  test.skip(accountsOn, 'this build has Supabase configured');

  test('sign-in explains that accounts are off; /account leads there; the header offers no sign-in; notes promise no sync', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { level: 1, name: 'Accounts are not switched on' })).toBeVisible();
    await page.goto('/account');
    await expect(page).toHaveURL(/\/login\?next=(\/|%2F)account$/);
    await expect(page.getByRole('link', { name: 'Sign in' })).toHaveCount(0);
    await page.goto('/notes');
    await expect(page.getByTestId('notes-where')).toHaveText('Saved in this browser on this device. Nothing is sent anywhere.');
    await expect(page.getByTestId('sync-badge')).toHaveCount(0);
  });

  test('a broken email link and an expired reset link explain themselves and offer the way forward', async ({ page }) => {
    await page.goto('/auth/confirm?type=email');
    await expect(page.getByRole('heading', { level: 1, name: 'This link is incomplete' })).toBeVisible();
    await page.goto('/auth/confirm?token_hash=%3Cscript%3E&type=email');
    await expect(page.getByRole('heading', { level: 1, name: 'This link is incomplete' })).toBeVisible();
    await page.goto('/auth/reset');
    await expect(page.getByRole('heading', { level: 1, name: 'This reset link has expired' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Send me a new link' })).toHaveAttribute('href', '/login?mode=forgot');
  });
});

async function signIn(page: Page) {
  await page.goto('/login?next=/notes');
  await page.getByLabel('Email').fill(EMAIL);
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/notes$/);
  await expect(page.getByTestId('sync-badge')).toBeVisible();
}

test.describe('real accounts', () => {
  test.skip(!accountsOn || !EMAIL || !PASSWORD, 'needs TEST_AUTH_EMAIL / TEST_AUTH_PASSWORD and a build with Supabase configured');
  test.describe.configure({ timeout: 90_000 });

  test('sign in → a note syncs to the account → another browser sees it → it is deleted everywhere → sign out', async ({ page, browser }) => {
    const text = `e2e note ${Date.now()}`;
    await signIn(page);
    await page.getByLabel('New note').fill(text);
    await page.getByRole('button', { name: 'Add note' }).click();
    await expect(page.getByTestId('sync-badge')).toHaveText('All changes synced.', { timeout: 30_000 });

    const other = await (await browser.newContext()).newPage();   // a different device: nothing in its storage
    await signIn(other);
    await expect(other.getByRole('list', { name: 'Your notes' })).toContainText(text, { timeout: 30_000 });

    const item = page.getByRole('list', { name: 'Your notes' }).getByRole('listitem').filter({ hasText: text });
    await item.getByRole('button', { name: 'Delete' }).click();
    await item.getByRole('button', { name: 'Yes, delete' }).click();
    await expect(page.getByTestId('sync-badge')).toHaveText('All changes synced.', { timeout: 30_000 });
    await other.reload();
    await expect(other.getByRole('list', { name: 'Your notes' }).filter({ hasText: text })).toHaveCount(0, { timeout: 30_000 });

    await page.goto('/account');
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
  });
});
