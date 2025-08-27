import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import type { authors, books, userBooks, users } from './schema';

/**
 * Database table types - for SELECT operations
 */
export type User = InferSelectModel<typeof users>;
export type Author = InferSelectModel<typeof authors>;
export type Book = InferSelectModel<typeof books>;
export type UserBook = InferSelectModel<typeof userBooks>;

/**
 * Database insert types - for INSERT operations
 */
export type NewUser = InferInsertModel<typeof users>;
export type NewAuthor = InferInsertModel<typeof authors>;
export type NewBook = InferInsertModel<typeof books>;
export type NewUserBook = InferInsertModel<typeof userBooks>;

/**
 * Partial update types - for UPDATE operations
 */
export type UserUpdate = Partial<Omit<NewUser, 'id' | 'createdAt'>>;
export type AuthorUpdate = Partial<Omit<NewAuthor, 'id' | 'createdAt'>>;
export type BookUpdate = Partial<Omit<NewBook, 'id' | 'createdAt'>>;
export type UserBookUpdate = Partial<Omit<NewUserBook, 'id' | 'createdAt'>>;

/**
 * Extended types with relations
 */
export type BookWithAuthor = Book & {
  author: Author;
};

export type UserWithBooks = User & {
  userBooks: (UserBook & {
    book: BookWithAuthor;
  })[];
};

export type AuthorWithBooks = Author & {
  books: Book[];
};

/**
 * Reading status enum
 */
export type ReadingStatus = 'want_to_read' | 'reading' | 'read';

/**
 * Database provider types
 */
export type DatabaseProvider = 'neon' | 'supabase' | 'local';

/**
 * Environment types
 */
export type Environment = 'development' | 'test' | 'staging' | 'production';

/**
 * Database configuration interface
 */
export interface DatabaseConfig {
  provider: DatabaseProvider;
  url: string;
  maxConnections?: number;
  enableLogging?: boolean;
  ssl?: boolean;
  idleTimeout?: number;
  maxLifetime?: number;
}

/**
 * Migration status
 */
export interface MigrationStatus {
  provider: DatabaseProvider;
  applied: string[];
  pending: string[];
  lastMigration?: string;
}

/**
 * Database health check result
 */
export interface HealthCheckResult {
  healthy: boolean;
  provider: DatabaseProvider;
  latency?: number;
  error?: string;
}

/**
 * Query options
 */
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

/**
 * Book search options
 */
export interface BookSearchOptions extends QueryOptions {
  title?: string;
  author?: string;
  genre?: string;
  language?: string;
  minRating?: number;
  maxRating?: number;
  publishedAfter?: number;
  publishedBefore?: number;
  available?: boolean;
}

/**
 * User book filters
 */
export interface UserBookFilters extends QueryOptions {
  status?: ReadingStatus;
  favorite?: boolean;
  rating?: number;
  author?: string;
  genre?: string;
}