import { beforeEach, describe, expect, it } from 'vitest';

describe('Books API Integration Tests', () => {
  beforeEach(async () => {
    // Clean and seed test data
    await global.integrationTestUtils.seedTestData();
  });

  describe('GET /api/books', () => {
    it('should return all books', async () => {
      const response = await fetch('http://localhost:3000/api/books');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it('should return books with correct structure', async () => {
      const response = await fetch('http://localhost:3000/api/books');
      const books = await response.json();

      const book = books[0];
      expect(book).toMatchObject({
        id: expect.any(Number),
        title: expect.any(String),
        author: expect.any(String),
        description: expect.any(String),
        genre: expect.any(String),
      });
    });

    it('should filter books by genre', async () => {
      const response = await fetch('http://localhost:3000/api/books?genre=Fiction');
      const books = await response.json();

      expect(response.status).toBe(200);
      books.forEach((book: any) => {
        expect(book.genre).toBe('Fiction');
      });
    });
  });

  describe('GET /api/books/:id', () => {
    it('should return a specific book', async () => {
      // Create a test book
      const testBook = await global.integrationTestUtils.createTestBook({
        title: 'Integration Test Book',
        author: 'Test Author',
      });

      const response = await fetch(`http://localhost:3000/api/books/${testBook.id}`);
      const book = await response.json();

      expect(response.status).toBe(200);
      expect(book.id).toBe(testBook.id);
      expect(book.title).toBe('Integration Test Book');
    });

    it('should return 404 for non-existent book', async () => {
      const response = await fetch('http://localhost:3000/api/books/99999');

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid book ID', async () => {
      const response = await fetch('http://localhost:3000/api/books/invalid');

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/books', () => {
    it('should create a new book', async () => {
      const newBook = {
        title: 'New Test Book',
        author: 'New Test Author',
        description: 'A new test book description',
        genre: 'Mystery',
      };

      const response = await fetch('http://localhost:3000/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBook),
      });

      const createdBook = await response.json();

      expect(response.status).toBe(201);
      expect(createdBook.title).toBe(newBook.title);
      expect(createdBook.author).toBe(newBook.author);
      expect(createdBook.id).toBeDefined();
    });

    it('should validate required fields', async () => {
      const invalidBook = {
        title: '',
        author: 'Test Author',
      };

      const response = await fetch('http://localhost:3000/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidBook),
      });

      expect(response.status).toBe(400);
    });

    it('should handle duplicate titles gracefully', async () => {
      const book = {
        title: 'Duplicate Test Book',
        author: 'Test Author',
        description: 'A test book',
        genre: 'Fiction',
      };

      // Create first book
      await fetch('http://localhost:3000/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book),
      });

      // Try to create duplicate
      const response = await fetch('http://localhost:3000/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(book),
      });

      // Should either succeed (allow duplicates) or return appropriate error
      expect([200, 201, 409]).toContain(response.status);
    });
  });

  describe('Database Connection', () => {
    it('should maintain database connection', async () => {
      const db = global.integrationTestUtils.db();
      const result = await db`SELECT 1 as test`;

      expect(result[0].test).toBe(1);
    });

    it('should handle database transactions', async () => {
      const db = global.integrationTestUtils.db();

      await db.begin(async (sql) => {
        await sql`INSERT INTO books (title, author, description, genre)
                  VALUES ('Transaction Test', 'Test Author', 'Test', 'Fiction')`;

        const books = await sql`SELECT * FROM books WHERE title = 'Transaction Test'`;
        expect(books.length).toBe(1);

        // Transaction will rollback since we don't commit
        throw new Error('Rollback transaction');
      }).catch(() => {
        // Expected to fail and rollback
      });

      // Book should not exist after rollback
      const books = await db`SELECT * FROM books WHERE title = 'Transaction Test'`;
      expect(books.length).toBe(0);
    });
  });
});