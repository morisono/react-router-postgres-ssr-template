import { config } from '@dotenvx/dotenvx';
import type { Config } from "drizzle-kit";

// Load environment variables
config({ path: '.env' });

export default {
  schema: "./db/orm/schema.ts",
  out: "./db/orm/migrations/supabase",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.SUPABASE_DATABASE_URL!,
  },
  migrations: {
    table: "supabase_migrations",
    schema: "public",
  },
  // Supabase-specific options
  breakpoints: true,
  strict: true,
} satisfies Config;