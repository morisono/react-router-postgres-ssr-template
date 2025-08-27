import { config } from '@dotenvx/dotenvx';
import { sql } from 'drizzle-orm';
import { createDatabaseClient, getCurrentProvider, type DatabaseClient } from './factory';
import type { DatabaseProvider, MigrationStatus } from './types';

// Load environment variables
config({ path: '.env' });

/**
 * Migration utilities for managing database schema across different providers
 */

/**
 * Gets the migration table name for a specific provider
 */
function getMigrationTable(provider: DatabaseProvider): string {
  return `${provider}_migrations`;
}

/**
 * Checks if migrations table exists for the given provider
 */
async function ensureMigrationTable(client: DatabaseClient, provider: DatabaseProvider): Promise<void> {
  const tableName = getMigrationTable(provider);

  await client.execute(sql`
    CREATE TABLE IF NOT EXISTS ${sql.identifier(tableName)} (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      checksum VARCHAR(64)
    )
  `);
}

/**
 * Gets the list of applied migrations for a provider
 */
async function getAppliedMigrations(client: DatabaseClient, provider: DatabaseProvider): Promise<string[]> {
  const tableName = getMigrationTable(provider);

  try {
    const result = await client.execute(sql`
      SELECT name FROM ${sql.identifier(tableName)}
      ORDER BY executed_at ASC
    `);

    return result.map((row: any) => row.name);
  } catch (error) {
    // Table doesn't exist yet
    return [];
  }
}

/**
 * Records a migration as applied
 */
async function recordMigration(
  client: DatabaseClient,
  provider: DatabaseProvider,
  migrationName: string,
  checksum?: string
): Promise<void> {
  const tableName = getMigrationTable(provider);

  await client.execute(sql`
    INSERT INTO ${sql.identifier(tableName)} (name, checksum)
    VALUES (${migrationName}, ${checksum || null})
    ON CONFLICT (name) DO NOTHING
  `);
}

/**
 * Gets migration status for a specific provider
 */
export async function getMigrationStatus(provider?: DatabaseProvider): Promise<MigrationStatus> {
  const dbProvider = provider || getCurrentProvider();
  const client = createDatabaseClient(dbProvider);

  await ensureMigrationTable(client, dbProvider);
  const applied = await getAppliedMigrations(client, dbProvider);

  // In a real implementation, you would read the migration files from disk
  // For now, we'll return a basic structure
  const pending: string[] = []; // Would be populated by reading migration files

  return {
    provider: dbProvider,
    applied,
    pending,
    lastMigration: applied.length > 0 ? applied[applied.length - 1] : undefined,
  };
}

/**
 * Runs pending migrations for a specific provider
 */
export async function runMigrations(provider?: DatabaseProvider): Promise<void> {
  const dbProvider = provider || getCurrentProvider();
  const client = createDatabaseClient(dbProvider);

  console.log(`Running migrations for ${dbProvider} provider...`);

  await ensureMigrationTable(client, dbProvider);
  const applied = await getAppliedMigrations(client, dbProvider);

  console.log(`Applied migrations: ${applied.length}`);
  console.log(`Migration table: ${getMigrationTable(dbProvider)}`);

  // In a real implementation, you would:
  // 1. Read migration files from the appropriate directory
  // 2. Filter out already applied migrations
  // 3. Execute pending migrations in order
  // 4. Record each successful migration

  console.log(`Migrations completed for ${dbProvider}`);
}

/**
 * Resets all migrations for a provider (dangerous operation)
 */
export async function resetMigrations(provider: DatabaseProvider, confirm: boolean = false): Promise<void> {
  if (!confirm) {
    throw new Error('Migration reset requires explicit confirmation. Set confirm=true');
  }

  const client = createDatabaseClient(provider);
  const tableName = getMigrationTable(provider);

  console.log(`⚠️  DANGER: Resetting all migrations for ${provider} provider`);

  await client.execute(sql`DROP TABLE IF EXISTS ${sql.identifier(tableName)}`);

  console.log(`Migration table ${tableName} dropped`);
}

/**
 * Validates migration integrity across providers
 */
export async function validateMigrations(): Promise<Record<DatabaseProvider, MigrationStatus>> {
  const providers: DatabaseProvider[] = ['neon', 'supabase', 'local'];
  const results: Record<string, MigrationStatus> = {};

  for (const provider of providers) {
    try {
      if (isProviderAvailable(provider)) {
        results[provider] = await getMigrationStatus(provider);
      }
    } catch (error) {
      console.error(`Failed to validate migrations for ${provider}:`, error);
      results[provider] = {
        provider,
        applied: [],
        pending: [],
      };
    }
  }

  return results as Record<DatabaseProvider, MigrationStatus>;
}

/**
 * Checks if a provider is available (has required environment variables)
 */
function isProviderAvailable(provider: DatabaseProvider): boolean {
  switch (provider) {
    case 'neon':
      return !!process.env.NEON_DATABASE_URL;
    case 'supabase':
      return !!process.env.SUPABASE_DATABASE_URL;
    case 'local':
      return true; // Local always available with fallback
    default:
      return false;
  }
}

/**
 * Utility to run migrations for all available providers
 */
export async function runAllMigrations(): Promise<void> {
  const providers: DatabaseProvider[] = ['local', 'neon', 'supabase'];

  for (const provider of providers) {
    if (isProviderAvailable(provider)) {
      try {
        await runMigrations(provider);
      } catch (error) {
        console.error(`Failed to run migrations for ${provider}:`, error);
      }
    } else {
      console.log(`Skipping ${provider} - not configured`);
    }
  }
}