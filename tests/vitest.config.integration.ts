import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./setup/integration-setup.ts'],
    include: ['integration/**/*.test.{ts,js}'],
    exclude: ['unit/**', 'components/**', 'e2e/**', 'load/**'],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});