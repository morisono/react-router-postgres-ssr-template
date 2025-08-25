import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineWorkersConfig({
  test: {
    include: ['tests/workers/**/*.test.{ts,js}'],
    exclude: ['unit/**', 'integration/**', 'e2e/**'],
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
