// e2e/perf.spec.ts — what a first visit downloads (PRF-1). supabase-js (~66 KB gzip) once loaded on every page through the header;
// it now loads on demand. With accounts OFF (this template's CI build) a page must never fetch it.
import { test, expect } from '@playwright/test';

test.skip(!!process.env.NEXT_PUBLIC_SUPABASE_URL, 'with accounts on, the header loads the library after the page is interactive');

for (const path of ['/', '/about', '/design']) {
  test(`perf: ${path} does not download the accounts library`, async ({ page }) => {
    const scripts: string[] = [];
    page.on('response', (r) => { if (r.request().resourceType() === 'script') scripts.push(r.url()); });
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    expect(scripts.length).toBeGreaterThan(0);
    for (const url of scripts) expect((await (await page.request.get(url)).text()).includes('GoTrueClient'), url).toBe(false);
  });
}
