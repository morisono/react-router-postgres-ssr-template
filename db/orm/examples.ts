/**
 * Example usage of the multi-database ORM architecture
 *
 * This file demonstrates how to use the factory pattern, repositories,
 * and different database providers in various scenarios.
 */

import {
    createDatabaseClient,
    createDefaultClient,
    createRepositories,
    getCurrentProvider,
    healthCheck,
    validateProviderConfig
} from './index';

/**
 * Example 1: Basic usage with default client
 */
export async function basicUsageExample() {
  console.log('=== Basic Usage Example ===');

  // Create default client (auto-selects provider)
  const db = createDefaultClient();
  const repos = createRepositories(db);

  console.log(`Using provider: ${getCurrentProvider()}`);

  // Find all authors
  const authors = await repos.authors.findAll(5);
  console.log(`Found ${authors.length} authors`);

  // Search for fantasy books
  const fantasyBooks = await repos.books.search({
    genre: 'Fantasy',
    limit: 3
  });
  console.log(`Found ${fantasyBooks.length} fantasy books`);

  // Get statistics
  const stats = await repos.books.getStats();
  console.log('Book statistics:', stats);
}

/**
 * Example 2: Provider-specific clients
 */
export async function providerSpecificExample() {
  console.log('=== Provider-Specific Example ===');

  const providers = ['local', 'neon', 'supabase'] as const;

  for (const provider of providers) {
    if (validateProviderConfig(provider)) {
      console.log(`\n--- Using ${provider} provider ---`);

      const db = createDatabaseClient(provider);
      const isHealthy = await healthCheck(db);

      if (isHealthy) {
        const repos = createRepositories(db);
        const bookCount = await repos.books.getStats();
        console.log(`${provider}: ${bookCount.total} books available`);
      } else {
        console.log(`${provider}: Health check failed`);
      }
    } else {
      console.log(`${provider}: Not configured`);
    }
  }
}

/**
 * Example 3: Advanced book operations
 */
export async function advancedBookOperationsExample() {
  console.log('=== Advanced Book Operations Example ===');

  const db = createDefaultClient();
  const repos = createRepositories(db);

  // Create a new author
  const newAuthor = await repos.authors.create({
    name: 'Example Author',
    bio: 'A fictional author for demonstration purposes.',
    birthYear: 1980,
    nationality: 'International',
  });
  console.log(`Created author: ${newAuthor.name} (ID: ${newAuthor.id})`);

  // Create a new book by this author
  const newBook = await repos.books.create({
    title: 'Example Book',
    authorId: newAuthor.id,
    description: 'A demonstration book for the ORM architecture.',
    genre: 'Technical',
    isbn: '9780000000000',
    publishedYear: 2024,
    pageCount: 200,
    language: 'en',
    rating: 5,
    price: 2999, // $29.99
  });
  console.log(`Created book: ${newBook.title} (ID: ${newBook.id})`);

  // Find the book with author information
  const bookWithAuthor = await repos.books.findByIdWithAuthor(newBook.id);
  console.log('Book with author:', {
    title: bookWithAuthor?.title,
    author: bookWithAuthor?.author.name,
    genre: bookWithAuthor?.genre
  });

  // Search for books by this author
  const authorBooks = await repos.books.findByAuthor(newAuthor.id);
  console.log(`Author has ${authorBooks.length} book(s)`);

  // Update the book rating
  const updatedBook = await repos.books.update(newBook.id, { rating: 4 });
  console.log(`Updated book rating to: ${updatedBook?.rating}`);

  // Clean up - delete the book and author
  await repos.books.delete(newBook.id);
  const deleteResult = await repos.authors.delete(newAuthor.id);
  console.log(`Cleanup: ${deleteResult.message}`);
}

/**
 * Example 4: Complex search operations
 */
export async function complexSearchExample() {
  console.log('=== Complex Search Example ===');

  const db = createDefaultClient();
  const repos = createRepositories(db);

  // Multi-criteria book search
  const searchResults = await repos.books.search({
    minRating: 4,
    publishedAfter: 1990,
    language: 'en',
    available: true,
    limit: 5,
    orderBy: 'rating',
    orderDirection: 'desc'
  });

  console.log(`Found ${searchResults.length} highly rated books since 1990:`);
  searchResults.forEach(book => {
    console.log(`  - ${book.title} by ${book.author.name} (${book.rating}⭐, ${book.publishedYear})`);
  });

  // Author nationality statistics
  const authorStats = await repos.authors.getStats();
  console.log('\nAuthor distribution by nationality:');
  Object.entries(authorStats.byNationality).forEach(([nationality, count]) => {
    console.log(`  ${nationality}: ${count} authors`);
  });

  // Most productive authors
  console.log('\nMost productive authors:');
  authorStats.mostProductive.slice(0, 3).forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.author.name} (${item.bookCount} books)`);
  });
}

/**
 * Example 5: Error handling and validation
 */
export async function errorHandlingExample() {
  console.log('=== Error Handling Example ===');

  try {
    // Validate provider configurations
    const providers = ['local', 'neon', 'supabase'] as const;
    console.log('Provider validation:');

    providers.forEach(provider => {
      const isValid = validateProviderConfig(provider);
      console.log(`  ${provider}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    });

    // Attempt to use an invalid provider
    try {
      const invalidDb = createDatabaseClient('invalid' as any);
    } catch (error) {
      console.log(`Expected error for invalid provider: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Health check example
    const db = createDefaultClient();
    const isHealthy = await healthCheck(db);
    console.log(`Database health: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);

    // Try to find a non-existent book
    const repos = createRepositories(db);
    const nonExistentBook = await repos.books.findById(99999);
    console.log(`Non-existent book result: ${nonExistentBook ? 'Found' : 'null (expected)'}`);

  } catch (error) {
    console.error('Error in example:', error);
  }
}

/**
 * Main function to run all examples
 */
export async function runAllExamples() {
  console.log('🚀 Multi-Database ORM Architecture Examples\n');

  try {
    await basicUsageExample();
    console.log('\n');

    await providerSpecificExample();
    console.log('\n');

    await advancedBookOperationsExample();
    console.log('\n');

    await complexSearchExample();
    console.log('\n');

    await errorHandlingExample();
    console.log('\n');

    console.log('✅ All examples completed successfully!');

  } catch (error) {
    console.error('❌ Error running examples:', error);
  }
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples().catch(console.error);
}