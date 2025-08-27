/**
 * Database ORM Module
 *
 * This module provides a comprehensive multi-database ORM architecture
 * supporting Neon, Supabase, and Local PostgreSQL providers through
 * a unified factory pattern.
 */

// Re-export schema and types
export * from './schema';
export * from './types';

// Re-export factory functions and client types
export {
    closeConnection, createDatabaseClient,
    createDefaultClient,
    getCurrentProvider, healthCheck, validateProviderConfig, type DatabaseClient,
    type DatabaseProvider
} from './factory';

// Re-export individual client creators
export { createLocalClient, type LocalClient } from './clients/local';
export { createNeonClient, type NeonClient } from './clients/neon';
export { createSupabaseClient, type SupabaseClient } from './clients/supabase';

// Re-export migration utilities
export {
    getMigrationStatus, resetMigrations, runAllMigrations, runMigrations, validateMigrations
} from './migrations';

// Re-export repositories
export {
    AuthorRepository, BookRepository, createRepositories,
    type Repositories
} from './repositories';

// Import for default instance
import { createDefaultClient } from './factory';
import { createRepositories } from './repositories';

// Default database instance for convenience
export const db = createDefaultClient();

// Default repository instances
export const repositories = createRepositories(db);