import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // zod only through src/lib/zod.ts: zod/mini keeps browser bundles small, and jitless keeps zod from tripping the strict CSP (SEC-6).
    rules: { "no-restricted-imports": ["error", { paths: [{ name: "zod", message: "import * as z from '@/lib/zod' — zod/mini (6 KB, not 93 KB in the browser) configured for the strict CSP." }], patterns: [{ group: ["zod/*"], message: "import * as z from '@/lib/zod'." }] }] },
  },
  { files: ["src/lib/zod.ts"], rules: { "no-restricted-imports": "off" } },
  {
    // Design law (AGENTS.md → Design system): pages build with the primitives, so every app made from this template keeps one look,
    // one focus ring, one sound and one set of accessible field wiring. Components may use raw elements — that is where primitives live.
    files: ["src/app/**/*.tsx"],
    ignores: ["src/app/global-error.tsx"],
    rules: {
      "no-restricted-syntax": ["error",
        { selector: "JSXOpeningElement[name.name='button']", message: "Use <Button> (or <ButtonLink> to navigate) from '@/components/ui/Button'." },
        { selector: "JSXOpeningElement[name.name='input']", message: "Use <Input> (and <Field> for label + error) from '@/components/ui/Input'." },
        { selector: "JSXOpeningElement[name.name='textarea']", message: "Use <TextArea> from '@/components/ui/Input'." },
        { selector: "JSXOpeningElement[name.name='select']", message: "Add a Select primitive to src/components/ui first, then use it." },
        { selector: "JSXOpeningElement[name.name='dialog']", message: "Use <Modal> from '@/components/ui/Modal'." },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // generated output — never lint it (a local OpenNext build writes thousands of bundled lines into .open-next)
    ".open-next/**",
    ".wrangler/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
