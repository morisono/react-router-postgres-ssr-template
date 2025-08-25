/// <reference types="@types/node" />
import type { Config } from "drizzle-kit";

export default {
  schema: "./db/orm/schema.ts",
  out: "./db/orm/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/database",
  },
} satisfies Config;
