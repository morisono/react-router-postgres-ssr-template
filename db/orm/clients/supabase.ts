import { config } from '@dotenvx/dotenvx';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../schema';

// Load environment variables
config({ path: '.env' });

/**
 * Creates a Supabase database client using postgres-js driver
 * Configured with connection pooling and optimizations for Supabase
 */
export function createSupabaseClient() {
  if (!process.env.SUPABASE_DATABASE_URL) {
    throw new Error('SUPABASE_DATABASE_URL is not defined');
  }

  // Create postgres connection with Supabase-optimized settings
  const sql = postgres(process.env.SUPABASE_DATABASE_URL, {
    max: 5, // Connection pool size
    fetch_types: false, // Disable automatic type fetching for performance
    ssl: 'require', // Supabase requires SSL
    idle_timeout: 20, // Close idle connections after 20 seconds
    max_lifetime: 60 * 30, // Close connections after 30 minutes
  });

  return drizzle(sql, {
    schema,
    logger: process.env.NODE_ENV === 'development',
  });
}

/**
 * Type definition for Supabase client
 */
export type SupabaseClient = ReturnType<typeof createSupabaseClient>;