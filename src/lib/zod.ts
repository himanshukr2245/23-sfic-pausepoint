// lib/zod.ts — `import * as z from '@/lib/zod'`, never from 'zod' directly (ESLint enforces it). Three reasons, all measured:
//  1. Size: schemas run in the browser too. `import { z } from 'zod'` ships ALL of zod 4 — every locale, JSON-Schema export —
//     93 KB gzip; zod/mini ships only what you use: 6 KB for the same schemas. A 95 KB notes chunk once took 10 s to arrive.
//  2. CSP: zod probes `new Function('')` to decide whether it may compile fast parsers. The probe is caught, but under the strict
//     CSP (no 'unsafe-eval') the browser still reports a securitypolicyviolation — noise that hides real CSP problems. jitless skips it.
//  3. Tree-shaking needs plain re-exports: `export * from` here and `import * as z from '@/lib/zod'` in your code. Re-exporting the
//     namespace as one value (`export { z }`) makes the bundler keep ALL of zod/mini — 88 KB gzip instead of a few KB (measured).
// zod/mini style: z.string().check(z.trim(), z.minLength(1, 'msg')) · z.strictObject({...}) · schema.safeParse(value).
import { config } from 'zod/mini';

config({ jitless: true });

export * from 'zod/mini';
