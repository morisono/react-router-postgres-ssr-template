import { desc, eq, like, sql } from 'drizzle-orm';
import type { DatabaseClient } from '../factory';
import { authors, books } from '../schema';
import type { Author, AuthorUpdate, AuthorWithBooks, NewAuthor } from '../types';

/**
 * Author repository with common database operations
 */
export class AuthorRepository {
  constructor(private db: DatabaseClient) {}

  /**
   * Find an author by ID
   */
  async findById(id: number): Promise<Author | null> {
    const result = await this.db
      .select()
      .from(authors)
      .where(eq(authors.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find an author by ID with their books
   */
  async findByIdWithBooks(id: number): Promise<AuthorWithBooks | null> {
    const [author, authorBooks] = await Promise.all([
      this.findById(id),
      this.db
        .select()
        .from(books)
        .where(eq(books.authorId, id))
        .orderBy(books.title)
    ]);

    if (!author) return null;

    return {
      ...author,
      books: authorBooks,
    };
  }

  /**
   * Search authors by name
   */
  async search(nameQuery: string, limit: number = 20): Promise<Author[]> {
    return await this.db
      .select()
      .from(authors)
      .where(like(authors.name, `%${nameQuery}%`))
      .orderBy(authors.name)
      .limit(limit);
  }

  /**
   * Get all authors with pagination
   */
  async findAll(limit: number = 50, offset: number = 0): Promise<Author[]> {
    return await this.db
      .select()
      .from(authors)
      .orderBy(authors.name)
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get authors by nationality
   */
  async findByNationality(nationality: string): Promise<Author[]> {
    return await this.db
      .select()
      .from(authors)
      .where(eq(authors.nationality, nationality))
      .orderBy(authors.name);
  }

  /**
   * Create a new author
   */
  async create(authorData: NewAuthor): Promise<Author> {
    const result = await this.db
      .insert(authors)
      .values({
        ...authorData,
        updatedAt: new Date(),
      })
      .returning();

    return result[0];
  }

  /**
   * Update an author
   */
  async update(id: number, updates: AuthorUpdate): Promise<Author | null> {
    const result = await this.db
      .update(authors)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(authors.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Delete an author (only if they have no books)
   */
  async delete(id: number): Promise<{ success: boolean; message: string }> {
    // Check if author has books
    const authorBooks = await this.db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(books)
      .where(eq(books.authorId, id));

    const bookCount = authorBooks[0]?.count || 0;

    if (bookCount > 0) {
      return {
        success: false,
        message: `Cannot delete author with ${bookCount} book(s). Delete books first.`
      };
    }

    const result = await this.db
      .delete(authors)
      .where(eq(authors.id, id))
      .returning();

    return {
      success: result.length > 0,
      message: result.length > 0 ? 'Author deleted successfully' : 'Author not found'
    };
  }

  /**
   * Get author statistics
   */
  async getStats(): Promise<{
    total: number;
    byNationality: Record<string, number>;
    byDecade: Record<string, number>;
    mostProductive: { author: Author; bookCount: number }[];
  }> {
    const [totalResult, nationalityResult, decadeResult, productiveResult] = await Promise.all([
      // Total count
      this.db.select({ count: sql<number>`cast(count(*) as int)` }).from(authors),

      // Count by nationality
      this.db
        .select({
          nationality: authors.nationality,
          count: sql<number>`cast(count(*) as int)`
        })
        .from(authors)
        .where(eq(authors.nationality, sql`${authors.nationality} IS NOT NULL`))
        .groupBy(authors.nationality),

      // Count by birth decade
      this.db
        .select({
          decade: sql<string>`cast(floor(${authors.birthYear} / 10) * 10 as text)`,
          count: sql<number>`cast(count(*) as int)`
        })
        .from(authors)
        .where(eq(authors.birthYear, sql`${authors.birthYear} IS NOT NULL`))
        .groupBy(sql`floor(${authors.birthYear} / 10) * 10`),

      // Most productive authors
      this.db
        .select({
          author: {
            id: authors.id,
            name: authors.name,
            bio: authors.bio,
            birthYear: authors.birthYear,
            nationality: authors.nationality,
            website: authors.website,
            createdAt: authors.createdAt,
            updatedAt: authors.updatedAt,
          },
          bookCount: sql<number>`cast(count(${books.id}) as int)`
        })
        .from(authors)
        .leftJoin(books, eq(authors.id, books.authorId))
        .groupBy(authors.id)
        .orderBy(desc(sql`count(${books.id})`))
        .limit(10)
    ]);

    const byNationality: Record<string, number> = {};
    nationalityResult.forEach((row: any) => {
      if (row.nationality) {
        byNationality[row.nationality] = row.count;
      }
    });

    const byDecade: Record<string, number> = {};
    decadeResult.forEach((row: any) => {
      if (row.decade) {
        byDecade[`${row.decade}s`] = row.count;
      }
    });

    const mostProductive = productiveResult.map((row: any) => ({
      author: row.author,
      bookCount: row.bookCount,
    }));

    return {
      total: totalResult[0]?.count || 0,
      byNationality,
      byDecade,
      mostProductive,
    };
  }

  /**
   * Find authors born in a specific year range
   */
  async findByBirthYearRange(startYear: number, endYear: number): Promise<Author[]> {
    return await this.db
      .select()
      .from(authors)
      .where(
        sql`${authors.birthYear} >= ${startYear} AND ${authors.birthYear} <= ${endYear}`
      )
      .orderBy(authors.birthYear, authors.name);
  }

  /**
   * Get featured authors (those with highest rated books)
   */
  async getFeatured(limit: number = 5): Promise<AuthorWithBooks[]> {
    const authorIds = await this.db
      .select({
        authorId: books.authorId,
        avgRating: sql<number>`cast(avg(${books.rating}) as decimal(3,2))`
      })
      .from(books)
      .groupBy(books.authorId)
      .orderBy(desc(sql`avg(${books.rating})`))
      .limit(limit);

    const result: AuthorWithBooks[] = [];

    for (const { authorId } of authorIds) {
      const authorWithBooks = await this.findByIdWithBooks(authorId);
      if (authorWithBooks) {
        result.push(authorWithBooks);
      }
    }

    return result;
  }
}