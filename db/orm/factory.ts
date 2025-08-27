import { config } from '@dotenvx/dotenvx';
import { createLocalClient, type LocalClient } from './clients/local';
import { createNeonClient, type NeonClient } from './clients/neon';
import { createSupabaseClient, type SupabaseClient } from './clients/supabase';

// Load environment variables
config({ path: '.env' });

/**
 * Supported database providers
 */
export type DatabaseProvider = 'neon' | 'supabase' | 'local';

/**
 * Union type of all possible database clients
 */
export type DatabaseClient = NeonClient | SupabaseClient | LocalClient;

/**
 * Database client configuration
 */
export interface DatabaseConfig {
  provider: DatabaseProvider;
  url?: string;
  maxConnections?: number;
  enableLogging?: boolean;
}

/**
 * Creates a database client for the specified provider
 *
 * @param provider - The database provider to use
 * @returns A configured database client
 * @throws Error if the provider is unknown or configuration is invalid
 */
export function createDatabaseClient(provider: DatabaseProvider = 'local'): DatabaseClient {
  switch (provider) {
    case 'neon':
      return createNeonClient();
    case 'supabase':
      return createSupabaseClient();
    case 'local':
      return createLocalClient();
    default:
      throw new Error(`Unknown database provider: ${provider}`);
  }
}

/**
 * Environment-based auto-selection of database client
 * Priority order:
 * 1. Explicit DB_PROVIDER environment variable
 * 2. Environment-based defaults (development/test = local)
 * 3. Available connection strings (Neon > Supabase > Local)
 *
 * @returns A configured database client based on environment
 */
export function createDefaultClient(): DatabaseClient {
  const env = process.env.NODE_ENV;
  const provider = process.env.DB_PROVIDER as DatabaseProvider;

  // Explicit provider specified
  if (provider && ['neon', 'supabase', 'local'].includes(provider)) {
    return createDatabaseClient(provider);
  }

  // Environment-based defaults
  if (env === 'development' || env === 'test') {
    // Check if local DB is available, otherwise fallback to remote
    if (process.env.LOCAL_DATABASE_URL) {
      return createDatabaseClient('local');
    }
  }

  // Production/staging environments - prioritize cloud providers
  if (process.env.NEON_DATABASE_URL) {
    return createDatabaseClient('neon');
  }

  if (process.env.SUPABASE_DATABASE_URL) {
    return createDatabaseClient('supabase');
  }

  // Final fallback to local
  return createDatabaseClient('local');
}

/**
 * Gets the current database provider from environment
 */
export function getCurrentProvider(): DatabaseProvider {
  const provider = process.env.DB_PROVIDER as DatabaseProvider;

  if (provider && ['neon', 'supabase', 'local'].includes(provider)) {
    return provider;
  }

  // Auto-detect based on available URLs
  if (process.env.NEON_DATABASE_URL) return 'neon';
  if (process.env.SUPABASE_DATABASE_URL) return 'supabase';
  return 'local';
}

/**
 * Validates that the required environment variables are set for the given provider
 */
export function validateProviderConfig(provider: DatabaseProvider): boolean {
  switch (provider) {
    case 'neon':
      return !!process.env.NEON_DATABASE_URL;
    case 'supabase':
      return !!process.env.SUPABASE_DATABASE_URL;
    case 'local':
      return true; // Local has fallback URL
    default:
      return false;
  }
}

/**
 * Database connection health check
 */
export async function healthCheck(client: DatabaseClient): Promise<boolean> {
  try {
    // Simple query to test connection
    const result = await client.execute('SELECT 1 as health');
    return Array.isArray(result) && result.length > 0;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Graceful database connection cleanup
 */
export async function closeConnection(client: DatabaseClient): Promise<void> {
  try {
    // Note: postgres-js and neon clients handle cleanup automatically
    // but we can add specific cleanup logic here if needed
    if ('end' in client && typeof client.end === 'function') {
      await client.end();
    }
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}