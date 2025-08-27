import { and, desc, eq, gte, like, lte, sql } from 'drizzle-orm';
import type { DatabaseClient } from '../factory';
import { authors, books } from '../schema';
import type { Book, BookSearchOptions, BookUpdate, BookWithAuthor, NewBook } from '../types';

/**
 * Book repository with common database operations
 */
export class BookRepository {
  constructor(private db: DatabaseClient) {}

  /**
   * Find a book by ID
   */
  async findById(id: number): Promise<Book | null> {
    const result = await this.db
      .select()
      .from(books)
      .where(eq(books.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Find a book by ID with author information
   */
  async findByIdWithAuthor(id: number): Promise<BookWithAuthor | null> {
    const result = await this.db
      .select({
        id: books.id,
        title: books.title,
        authorId: books.authorId,
        description: books.description,
        imageUrl: books.imageUrl,
        genre: books.genre,
        isbn: books.isbn,
        publishedYear: books.publishedYear,
        pageCount: books.pageCount,
        language: books.language,
        isAvailable: books.isAvailable,
        rating: books.rating,
        price: books.price,
        createdAt: books.createdAt,
        updatedAt: books.updatedAt,
        author: {
          id: authors.id,
          name: authors.name,
          bio: authors.bio,
          birthYear: authors.birthYear,
          nationality: authors.nationality,
          website: authors.website,
          createdAt: authors.createdAt,
          updatedAt: authors.updatedAt,
        }
      })
      .from(books)
      .innerJoin(authors, eq(books.authorId, authors.id))
      .where(eq(books.id, id))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Search books with filters and pagination
   */
  async search(options: BookSearchOptions = {}): Promise<BookWithAuthor[]> {
    const {
      title,
      author,
      genre,
      language,
      minRating,
      maxRating,
      publishedAfter,
      publishedBefore,
      available,
      limit = 20,
      offset = 0,
      orderBy = 'title',
      orderDirection = 'asc'
    } = options;

    let query = this.db
      .select({
        id: books.id,
        title: books.title,
        authorId: books.authorId,
        description: books.description,
        imageUrl: books.imageUrl,
        genre: books.genre,
        isbn: books.isbn,
        publishedYear: books.publishedYear,
        pageCount: books.pageCount,
        language: books.language,
        isAvailable: books.isAvailable,
        rating: books.rating,
        price: books.price,
        createdAt: books.createdAt,
        updatedAt: books.updatedAt,
        author: {
          id: authors.id,
          name: authors.name,
          bio: authors.bio,
          birthYear: authors.birthYear,
          nationality: authors.nationality,
          website: authors.website,
          createdAt: authors.createdAt,
          updatedAt: authors.updatedAt,
        }
      })
      .from(books)
      .innerJoin(authors, eq(books.authorId, authors.id));

    // Build where conditions
    const conditions = [];

    if (title) {
      conditions.push(like(books.title, `%${title}%`));
    }

    if (author) {
      conditions.push(like(authors.name, `%${author}%`));
    }

    if (genre) {
      conditions.push(eq(books.genre, genre));
    }

    if (language) {
      conditions.push(eq(books.language, language));
    }

    if (minRating !== undefined) {
      conditions.push(gte(books.rating, minRating));
    }

    if (maxRating !== undefined) {
      conditions.push(lte(books.rating, maxRating));
    }

    if (publishedAfter) {
      conditions.push(gte(books.publishedYear, publishedAfter));
    }

    if (publishedBefore) {
      conditions.push(lte(books.publishedYear, publishedBefore));
    }

    if (available !== undefined) {
      conditions.push(eq(books.isAvailable, available));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Add ordering
    const orderColumn = orderBy === 'author' ? authors.name : books[orderBy as keyof typeof books];
    if (orderColumn) {
      query = orderDirection === 'desc'
        ? query.orderBy(desc(orderColumn))
        : query.orderBy(orderColumn);
    }

    // Add pagination
    query = query.limit(limit).offset(offset);

    return await query;
  }

  /**
   * Get all books by a specific author
   */
  async findByAuthor(authorId: number): Promise<Book[]> {
    return await this.db
      .select()
      .from(books)
      .where(eq(books.authorId, authorId))
      .orderBy(books.title);
  }

  /**
   * Get books by genre
   */
  async findByGenre(genre: string, limit: number = 20): Promise<BookWithAuthor[]> {
    return await this.db
      .select({
        id: books.id,
        title: books.title,
        authorId: books.authorId,
        description: books.description,
        imageUrl: books.imageUrl,
        genre: books.genre,
        isbn: books.isbn,
        publishedYear: books.publishedYear,
        pageCount: books.pageCount,
        language: books.language,
        isAvailable: books.isAvailable,
        rating: books.rating,
        price: books.price,
        createdAt: books.createdAt,
        updatedAt: books.updatedAt,
        author: {
          id: authors.id,
          name: authors.name,
          bio: authors.bio,
          birthYear: authors.birthYear,
          nationality: authors.nationality,
          website: authors.website,
          createdAt: authors.createdAt,
          updatedAt: authors.updatedAt,
        }
      })
      .from(books)
      .innerJoin(authors, eq(books.authorId, authors.id))
      .where(eq(books.genre, genre))
      .orderBy(desc(books.rating))
      .limit(limit);
  }

  /**
   * Create a new book
   */
  async create(bookData: NewBook): Promise<Book> {
    const result = await this.db
      .insert(books)
      .values({
        ...bookData,
        updatedAt: new Date(),
      })
      .returning();

    return result[0];
  }

  /**
   * Update a book
   */
  async update(id: number, updates: BookUpdate): Promise<Book | null> {
    const result = await this.db
      .update(books)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(books.id, id))
      .returning();

    return result[0] || null;
  }

  /**
   * Delete a book
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .delete(books)
      .where(eq(books.id, id))
      .returning();

    return result.length > 0;
  }

  /**
   * Get book statistics
   */
  async getStats(): Promise<{
    total: number;
    byGenre: Record<string, number>;
    byLanguage: Record<string, number>;
    averageRating: number;
  }> {
    const [totalResult, genreResult, languageResult, ratingResult] = await Promise.all([
      // Total count
      this.db.select({ count: sql<number>`cast(count(*) as int)` }).from(books),

      // Count by genre
      this.db
        .select({
          genre: books.genre,
          count: sql<number>`cast(count(*) as int)`
        })
        .from(books)
        .groupBy(books.genre),

      // Count by language
      this.db
        .select({
          language: books.language,
          count: sql<number>`cast(count(*) as int)`
        })
        .from(books)
        .groupBy(books.language),

      // Average rating
      this.db
        .select({
          avgRating: sql<number>`cast(avg(${books.rating}) as decimal(3,2))`
        })
        .from(books)
        .where(gte(books.rating, 1))
    ]);

    const byGenre: Record<string, number> = {};
    genreResult.forEach(row => {
      byGenre[row.genre || 'Unknown'] = row.count;
    });

    const byLanguage: Record<string, number> = {};
    languageResult.forEach(row => {
      byLanguage[row.language] = row.count;
    });

    return {
      total: totalResult[0]?.count || 0,
      byGenre,
      byLanguage,
      averageRating: ratingResult[0]?.avgRating || 0,
    };
  }

  /**
   * Get popular books (highest rated)
   */
  async getPopular(limit: number = 10): Promise<BookWithAuthor[]> {
    return await this.db
      .select({
        id: books.id,
        title: books.title,
        authorId: books.authorId,
        description: books.description,
        imageUrl: books.imageUrl,
        genre: books.genre,
        isbn: books.isbn,
        publishedYear: books.publishedYear,
        pageCount: books.pageCount,
        language: books.language,
        isAvailable: books.isAvailable,
        rating: books.rating,
        price: books.price,
        createdAt: books.createdAt,
        updatedAt: books.updatedAt,
        author: {
          id: authors.id,
          name: authors.name,
          bio: authors.bio,
          birthYear: authors.birthYear,
          nationality: authors.nationality,
          website: authors.website,
          createdAt: authors.createdAt,
          updatedAt: authors.updatedAt,
        }
      })
      .from(books)
      .innerJoin(authors, eq(books.authorId, authors.id))
      .where(gte(books.rating, 4))
      .orderBy(desc(books.rating), desc(books.createdAt))
      .limit(limit);
  }

  /**
   * Get recently added books
   */
  async getRecent(limit: number = 10): Promise<BookWithAuthor[]> {
    return await this.db
      .select({
        id: books.id,
        title: books.title,
        authorId: books.authorId,
        description: books.description,
        imageUrl: books.imageUrl,
        genre: books.genre,
        isbn: books.isbn,
        publishedYear: books.publishedYear,
        pageCount: books.pageCount,
        language: books.language,
        isAvailable: books.isAvailable,
        rating: books.rating,
        price: books.price,
        createdAt: books.createdAt,
        updatedAt: books.updatedAt,
        author: {
          id: authors.id,
          name: authors.name,
          bio: authors.bio,
          birthYear: authors.birthYear,
          nationality: authors.nationality,
          website: authors.website,
          createdAt: authors.createdAt,
          updatedAt: authors.updatedAt,
        }
      })
      .from(books)
      .innerJoin(authors, eq(books.authorId, authors.id))
      .orderBy(desc(books.createdAt))
      .limit(limit);
  }
}