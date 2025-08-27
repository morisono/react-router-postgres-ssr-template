/**
 * Database seeding script for multi-provider setup
 *
 * This script populates the database with sample data for testing and development.
 * It supports all configured database providers (Neon, Supabase, Local).
 */

import { config } from '@dotenvx/dotenvx';
import { createDatabaseClient, createRepositories, getCurrentProvider } from './index';

// Load environment variables
config({ path: '.env' });

/**
 * Sample authors data
 */
const sampleAuthors = [
  {
    name: 'J.K. Rowling',
    bio: 'British author best known for the Harry Potter series.',
    birthYear: 1965,
    nationality: 'British',
    website: 'https://www.jkrowling.com/',
  },
  {
    name: 'George R.R. Martin',
    bio: 'American novelist and short story writer, best known for A Song of Ice and Fire.',
    birthYear: 1948,
    nationality: 'American',
    website: 'https://grrm.livejournal.com/',
  },
  {
    name: 'Agatha Christie',
    bio: 'English writer known for her detective novels.',
    birthYear: 1890,
    nationality: 'British',
  },
  {
    name: 'Stephen King',
    bio: 'American author of horror, supernatural fiction, suspense, and fantasy novels.',
    birthYear: 1947,
    nationality: 'American',
    website: 'https://stephenking.com/',
  },
  {
    name: 'Haruki Murakami',
    bio: 'Japanese writer whose work has been translated into 50 languages.',
    birthYear: 1949,
    nationality: 'Japanese',
  },
];

/**
 * Sample books data (will be linked to authors after creation)
 */
const sampleBooks = [
  {
    title: "Harry Potter and the Philosopher's Stone",
    authorName: 'J.K. Rowling',
    description: "A young wizard's journey begins at Hogwarts School of Witchcraft and Wizardry.",
    genre: 'Fantasy',
    isbn: '9780747532699',
    publishedYear: 1997,
    pageCount: 223,
    language: 'en',
    rating: 5,
    price: 1299, // $12.99 in cents
  },
  {
    title: 'A Game of Thrones',
    authorName: 'George R.R. Martin',
    description: 'The first book in the epic fantasy series A Song of Ice and Fire.',
    genre: 'Fantasy',
    isbn: '9780553103540',
    publishedYear: 1996,
    pageCount: 694,
    language: 'en',
    rating: 5,
    price: 1599,
  },
  {
    title: 'Murder on the Orient Express',
    authorName: 'Agatha Christie',
    description: 'Hercule Poirot investigates a murder aboard the famous train.',
    genre: 'Mystery',
    isbn: '9780062693662',
    publishedYear: 1934,
    pageCount: 256,
    language: 'en',
    rating: 4,
    price: 999,
  },
  {
    title: 'The Shining',
    authorName: 'Stephen King',
    description: 'A horror novel about a family isolated in a haunted hotel.',
    genre: 'Horror',
    isbn: '9780307743657',
    publishedYear: 1977,
    pageCount: 447,
    language: 'en',
    rating: 4,
    price: 1199,
  },
  {
    title: 'Norwegian Wood',
    authorName: 'Haruki Murakami',
    description: 'A nostalgic story of loss and burgeoning sexuality.',
    genre: 'Literary Fiction',
    isbn: '9780375704024',
    publishedYear: 1987,
    pageCount: 296,
    language: 'en',
    rating: 4,
    price: 1399,
  },
];

/**
 * Seeds the database with sample data
 */
async function seedDatabase(provider?: string) {
  const dbProvider = (provider as any) || getCurrentProvider();
  console.log(`🌱 Seeding database for provider: ${dbProvider}`);

  try {
    const db = createDatabaseClient(dbProvider);
    const repos = createRepositories(db);

    console.log('📚 Creating authors...');
    const createdAuthors = [];
    for (const authorData of sampleAuthors) {
      const author = await repos.authors.create(authorData);
      createdAuthors.push(author);
      console.log(`✅ Created author: ${author.name}`);
    }

    console.log('📖 Creating books...');
    const authorMap = new Map(createdAuthors.map(a => [a.name, a.id]));

    for (const bookData of sampleBooks) {
      const authorId = authorMap.get(bookData.authorName);
      if (authorId) {
        const { authorName, ...bookInfo } = bookData;
        const book = await repos.books.create({
          ...bookInfo,
          authorId,
        });
        console.log(`✅ Created book: ${book.title}`);
      } else {
        console.warn(`⚠️  Author not found for book: ${bookData.title}`);
      }
    }

    console.log('📊 Database statistics:');
    const [authorStats, bookStats] = await Promise.all([
      repos.authors.getStats(),
      repos.books.getStats(),
    ]);

    console.log(`   Authors: ${authorStats.total}`);
    console.log(`   Books: ${bookStats.total}`);
    console.log(`   Average book rating: ${bookStats.averageRating}`);

    console.log('🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

/**
 * Main execution
 */
async function main() {
  const provider = process.argv[2]; // Optional provider argument

  if (provider && !['neon', 'supabase', 'local'].includes(provider)) {
    console.error('❌ Invalid provider. Use: neon, supabase, or local');
    process.exit(1);
  }

  await seedDatabase(provider);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}