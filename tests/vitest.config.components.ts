import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup/component-setup.ts'],
    include: ['tests/components/**/*.test.{ts,tsx}'],
    exclude: ['tests/unit/**', 'tests/integration/**', 'tests/e2e/**', 'tests/load/**'],
  },
  resolve: {
    alias: {
      '~': './app',
    },
  },
  esbuild: {
    jsx: 'automatic',
  },
  define: {
    global: 'globalThis',
  },
});