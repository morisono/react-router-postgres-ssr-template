import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    include: ['tests/workers/**/*.test.{ts,js}'],
    exclude: ['unit/**', 'integration/**', 'e2e/**'],
    poolOptions: {
      workers: {
        wrangler: {
          configPath: '../wrangler.jsonc',
          environment: 'test',
        },
      },
    },
  },
});