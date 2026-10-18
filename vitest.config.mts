// vitest.config.ts — unit tests for pure logic (lib/, features/*/logic.ts). Playwright specs stay out of Vitest.
import { defineConfig, configDefaults } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: { exclude: [...configDefaults.exclude, 'e2e/**', '.next/**', '.next-dev/**', '.open-next/**'] },
});
