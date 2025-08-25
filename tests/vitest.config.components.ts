import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./setup/component-setup.ts'],
    include: ['components/**/*.test.{ts,tsx}'],
    exclude: ['unit/**', 'integration/**', 'e2e/**', 'load/**'],
  },
  resolve: {
    alias: {
      '~': './app',
    },
  },
});