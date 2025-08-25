import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup/unit-setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}', 'app/**/*.test.{ts,tsx}'],
    exclude: ['tests/integration/**', 'tests/e2e/**', 'tests/load/**'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'build/',
        'coverage/',
        '*.config.*',
        'public/',
        'assets/'
      ],
      thresholds: {
        global: { branches: 70, functions: 80, lines: 80, statements: 80 }
      }
    }
  },
  resolve: {
    alias: {
      '~': './app',
    }
  },
  esbuild: {
    jsx: 'automatic',
  },
  define: {
    global: 'globalThis',
  },
});
