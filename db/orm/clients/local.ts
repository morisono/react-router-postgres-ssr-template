import { config } from '@dotenvx/dotenvx';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../schema';

// Load environment variables
config({ path: '.env' });

/**
 * Creates a local PostgreSQL database client using postgres-js driver
 * Configured for local development with relaxed settings
 */
export function createLocalClient() {
  const url = process.env.LOCAL_DATABASE_URL || "postgresql://myuser:mypassword@localhost:5432/mydatabase";

  // Create postgres connection with local development settings
  const sql = postgres(url, {
    max: 10, // Higher connection pool for local dev
    fetch_types: true, // Enable type fetching for better development experience
    ssl: false, // No SSL required for local development
    idle_timeout: 300, // Keep connections alive longer in development
    max_lifetime: 60 * 60, // 1 hour lifetime for development
    debug: process.env.NODE_ENV === 'development',
  });

  return drizzle(sql, {
    schema,
    logger: process.env.NODE_ENV === 'development',
  });
}

/**
 * Type definition for Local client
 */
export type LocalClient = ReturnType<typeof createLocalClient>;