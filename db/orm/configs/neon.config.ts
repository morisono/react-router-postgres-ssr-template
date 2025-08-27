import { config } from '@dotenvx/dotenvx';
import type { Config } from "drizzle-kit";

// Load environment variables
config({ path: '.env' });

export default {
  schema: "./db/orm/schema.ts",
  out: "./db/orm/migrations/neon",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.NEON_DATABASE_URL!,
  },
  migrations: {
    table: "neon_migrations",
    schema: "public",
  },
  // Neon-specific options
  breakpoints: true,
  strict: true,
} satisfies Config;