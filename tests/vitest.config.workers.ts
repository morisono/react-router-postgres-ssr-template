import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineWorkersConfig({
  test: {
    include: ['tests/workers/**/*.test.{ts,js}'],
    exclude: ['tests/unit/**', 'tests/integration/**', 'tests/e2e/**'],
    // Add timeout for workers tests as they can be slower
    testTimeout: 30000,
    hookTimeout: 30000,
    // Disable coverage for workers tests as it's not compatible with Cloudflare Workers runtime
    coverage: {
      enabled: false,
    },
    poolOptions: {
      workers: {
        wrangler: {
          configPath: resolve(__dirname, '../wrangler.jsonc'),
          environment: 'test',
        },
      },
    },
  },
});
