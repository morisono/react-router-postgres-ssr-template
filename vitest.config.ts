import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    // CI-friendly configuration
    watch: false,
    reporter: process.env.CI ? ['junit', 'github-actions'] : ['verbose'],
    outputFile: process.env.CI ? 'test-results.xml' : undefined,
    // Disable file watching in CI
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: process.env.CI ? true : false,
      },
    },
    include: [
      'tests/unit/**/*.test.{ts,tsx}',
      'tests/components/**/*.test.{ts,tsx}',
      'app/**/*.test.{ts,tsx}'
    ],
    exclude: [
      'tests/integration/**',
      'tests/e2e/**',
      'tests/load/**',
      'tests/workers/**',
      'node_modules/**',
      'build/**',
      'coverage/**'
    ],
    setupFiles: ['./tests/setup/unit-setup.ts'],
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
  define: {
    global: 'globalThis',
  },
  esbuild: {
    jsx: 'automatic',
  },
});