import { config } from '@dotenvx/dotenvx';
import type { Config } from "drizzle-kit";

// Load environment variables
config({ path: '.env' });

export default {
  schema: "./db/orm/schema.ts",
  out: "./db/orm/migrations/local",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.LOCAL_DATABASE_URL || "postgresql://myuser:mypassword@localhost:5432/mydatabase",
  },
  migrations: {
    table: "local_migrations",
    schema: "public",
  },
  // Local development options
  breakpoints: true,
  strict: true,
} satisfies Config;