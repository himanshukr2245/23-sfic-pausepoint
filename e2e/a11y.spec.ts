// e2e/a11y.spec.ts — automated WCAG 2.2 AA scan with axe (DEV-4). Fails on serious or critical violations.
// axe catches only part of real accessibility problems — still do a keyboard-only and TalkBack pass by hand before a release.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe.configure({ timeout: 60_000 });                      // axe scans the whole DOM — legitimately slower than other tests

// every top-level screen of the modules you kept, plus the 404
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
  for (const theme of ['light', 'dark'] as const) {
    test(`a11y: ${path} (${theme}) has no serious or critical axe violations`, async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem('hk:theme', t), theme);
      await page.goto(path);
      await expect(page.locator('[role="status"][aria-label^="Loading"]')).toHaveCount(0, { timeout: 15_000 });   // scan the real screen, not its skeleton
      const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      const bad = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(bad.map((v) => `${v.impact} ${v.id}: ${v.help} (${v.nodes.length}× e.g. ${v.nodes[0]?.target.join(' ')})`)).toEqual([]);
    });
  }
}
