import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup/integration-setup.ts'],
    include: ['tests/integration/**/*.test.{ts,js}'],
    exclude: ['tests/unit/**', 'tests/components/**', 'tests/e2e/**', 'tests/load/**'],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});