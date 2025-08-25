import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './orm/schema.ts',
  dialect: 'postgresql',
  out: './orm/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://test_user:test_password@localhost:5432/test_db',
  },
  verbose: true,
  strict: true,
});