import postgres from 'postgres';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';

// Database setup for integration tests
let testDb: postgres.Sql;

beforeAll(async () => {
  // Set up test database connection
  const connectionString = process.env.DATABASE_URL || 'postgresql://test_user:test_password@localhost:5432/test_db';

  testDb = postgres(connectionString, {
    max: 1, // Single connection for tests
    onnotice: () => {}, // Silence notices
  });

  // Create test schema if needed
  await testDb`CREATE SCHEMA IF NOT EXISTS test`;

  console.log('Integration test database connected');
});

afterAll(async () => {
  if (testDb) {
    await testDb.end();
    console.log('Integration test database disconnected');
  }
});

beforeEach(async () => {
  // Clean up data before each test
  await testDb`TRUNCATE books, users RESTART IDENTITY CASCADE`;
});

afterEach(async () => {
  // Additional cleanup if needed
});

// Test utilities for integration tests
global.integrationTestUtils = {
  db: () => testDb,

  seedTestData: async () => {
    await testDb`
      INSERT INTO books (title, author, description, genre) VALUES
      ('Test Book 1', 'Test Author 1', 'Test Description 1', 'Fiction'),
      ('Test Book 2', 'Test Author 2', 'Test Description 2', 'Non-Fiction')
    `;
  },

  createTestUser: async (name: string = 'Test User') => {
    const [user] = await testDb`
      INSERT INTO users (name) VALUES (${name})
      RETURNING *
    `;
    return user;
  },

  createTestBook: async (data: Partial<any> = {}) => {
    const bookData = {
      title: 'Test Book',
      author: 'Test Author',
      description: 'Test Description',
      genre: 'Fiction',
      ...data,
    };

    const [book] = await testDb`
      INSERT INTO books (title, author, description, genre)
      VALUES (${bookData.title}, ${bookData.author}, ${bookData.description}, ${bookData.genre})
      RETURNING *
    `;
    return book;
  },
};