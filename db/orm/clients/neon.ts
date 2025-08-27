import { config } from '@dotenvx/dotenvx';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../schema';

// Load environment variables
config({ path: '.env' });

/**
 * Creates a Neon database client using the HTTP-based driver
 * Optimized for serverless environments with connection pooling
 */
export function createNeonClient() {
  if (!process.env.NEON_DATABASE_URL) {
    throw new Error('NEON_DATABASE_URL is not defined');
  }

  // Create Neon SQL client - specific to Neon serverless
  const sql = neon(process.env.NEON_DATABASE_URL);

  // Create Drizzle instance with neon-http adapter
  return drizzle(sql, {
    schema,
    logger: process.env.NODE_ENV === 'development',
  });
}

/**
 * Type definition for Neon client
 */
export type NeonClient = ReturnType<typeof createNeonClient>;