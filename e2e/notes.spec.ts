// e2e/notes.spec.ts — the notes journey on a phone and a laptop: write, see it, edit, delete — and it is still there after a reload.
// Each Playwright test gets a fresh browser profile, so every test starts with an empty device database.
import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const list = (page: Page) => page.getByRole('list', { name: 'Your notes' });

async function openNotes(page: Page) {
  await page.goto('/notes');
  await expect(page.getByText('No notes yet. Write your first one above.')).toBeVisible();   // loaded (hydrated + database open)
}

async function addNote(page: Page, text: string) {
  await page.getByLabel('New note').fill(text);
  await page.getByRole('button', { name: 'Add note' }).click();
  await expect(list(page).getByRole('listitem').filter({ hasText: text })).toBeVisible();
}

test('notes: write, edit and delete a note — it survives a reload', async ({ page }) => {
  await openNotes(page);
  await expect(page.getByTestId('notes-where')).toHaveText(/this device/);

  // an empty note is explained, not saved
  await page.getByRole('button', { name: 'Add note' }).click();
  await expect(page.getByText('Write something first.')).toBeVisible();

  await addNote(page, 'Buy milk');
  await expect(page.getByLabel('New note')).toHaveValue('');
  await expect(page.getByLabel('New note')).toBeFocused();         // ready for the next note
  await expect(page.getByRole('heading', { name: 'Your notes (1)' })).toBeVisible();

  await page.reload();
  await expect(list(page)).toContainText('Buy milk');

  const item = list(page).getByRole('listitem').filter({ hasText: 'Buy milk' });
  await item.getByRole('button', { name: 'Edit' }).click();
  await expect(page.getByLabel('Edit note')).toBeFocused();
  await page.getByLabel('Edit note').fill('Buy oat milk');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(list(page)).toContainText('Buy oat milk');
  await expect(list(page)).toContainText('Edited');

  await list(page).getByRole('button', { name: 'Delete' }).click();
  await list(page).getByRole('button', { name: 'Keep it' }).click();    // changing your mind keeps the note
  await expect(list(page)).toContainText('Buy oat milk');
  await list(page).getByRole('button', { name: 'Delete' }).click();
  await list(page).getByRole('button', { name: 'Yes, delete' }).click();
  await expect(page.getByText('No notes yet. Write your first one above.')).toBeVisible();
  await page.reload();
  await expect(page.getByText('No notes yet. Write your first one above.')).toBeVisible();
});

test('notes: Escape cancels an edit and keeps the original text', async ({ page }) => {
  await openNotes(page);
  await addNote(page, 'Original words');
  await list(page).getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Edit note').fill('Half-typed change');
  await page.keyboard.press('Escape');
  await expect(list(page)).toContainText('Original words');
  await expect(list(page).getByRole('button', { name: 'Edit' })).toBeFocused();   // focus returns to where the person was
});

test('notes: a second tab shows a new note without reloading', async ({ page, context }) => {
  test.setTimeout(60_000);                                         // two full app loads, each installing the service worker
  await openNotes(page);
  const other = await context.newPage();
  await openNotes(other);
  await page.bringToFront();                                       // a background tab gets no animation frames — Playwright's 'stable' check would wait forever
  await addNote(page, 'Written in tab one');
  await other.bringToFront();                                      // the person looks at the other tab
  await expect(list(other)).toContainText('Written in tab one');
});

test('notes: the full screen (list, edit, confirm) has no serious accessibility problems', async ({ page }) => {
  test.setTimeout(60_000);                                         // three full axe scans — legitimately slower (as in a11y.spec.ts)
  await openNotes(page);
  await addNote(page, 'A note to scan');
  const scan = async () => {
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    return violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id}: ${v.nodes[0]?.target.join(' ')}`);
  };
  expect(await scan()).toEqual([]);
  await list(page).getByRole('button', { name: 'Delete' }).click();
  expect(await scan()).toEqual([]);
  await list(page).getByRole('button', { name: 'Keep it' }).click();
  await list(page).getByRole('button', { name: 'Edit' }).click();
  expect(await scan()).toEqual([]);
});
