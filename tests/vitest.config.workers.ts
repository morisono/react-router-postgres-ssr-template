import path from 'path';
import { fileURLToPath } from 'url';
import defineWorkersConfig from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    include: ['tests/workers/**/*.test.{ts,js}'],
    exclude: ['unit/**', 'integration/**', 'e2e/**'],
    poolOptions: {
      workers: {
        wrangler: {
          configPath: path.resolve(fileURLToPath(import.meta.url), '../../wrangler.jsonc'),
          environment: 'test',
        },
      },
    },
  },
});
