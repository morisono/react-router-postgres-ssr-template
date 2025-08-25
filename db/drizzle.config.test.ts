import { defineConfig } from 'drizzle-kit';

// Note: Drizzle Kit resolves paths relative to the current working directory (project root)
// when running via CLI. Use root-relative paths to ensure CI/local consistency.
export default defineConfig({
  schema: './db/orm/schema.ts',
  dialect: 'postgresql',
  out: './db/orm/migrations',
  dbCredentials: {
    // Default to docker-compose credentials to reduce local/CI mismatch.
    // Override with DATABASE_URL when needed.
    url:
      process.env.DATABASE_URL ||
      'postgresql://myuser:mypassword@localhost:5432/mydatabase',
  },
  verbose: true,
  strict: true,
});