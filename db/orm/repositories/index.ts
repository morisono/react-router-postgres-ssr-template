/**
 * Repository exports
 *
 * Provides repository pattern implementations for database operations
 */

export { AuthorRepository } from './author.repository';
export { BookRepository } from './book.repository';

// Repository factory function
import type { DatabaseClient } from '../factory';
import { AuthorRepository } from './author.repository';
import { BookRepository } from './book.repository';

/**
 * Creates repository instances for a given database client
 */
export function createRepositories(db: DatabaseClient) {
  return {
    books: new BookRepository(db),
    authors: new AuthorRepository(db),
  };
}

/**
 * Repository collection type
 */
export type Repositories = ReturnType<typeof createRepositories>;