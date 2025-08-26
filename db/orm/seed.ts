// src/seed.ts

import { config } from '@dotenvx/dotenvx';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import { books } from './schema';

config({ path: '.env' });

async function seed() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL!,
  });

  try {
    await client.connect();
    const db = drizzle(client);

    await db.insert(books).values([
      {
        title: 'The Brothers Karamazov',
        author: 'Fyodor Dostoevsky',
        description: 'A passionate philosophical novel set in 19th-century Russia, which explores ethical debates of God, free will, and morality.',
        imageUrl: '/images/books/brothers-karamazov.jpg',
        genre: 'Literary Fiction',
      },
      {
        title: 'East of Eden',
        author: 'John Steinbeck',
        description: 'A multigenerational family saga set in the Salinas Valley, California, exploring themes of good and evil through the intertwined stories of two families.',
        imageUrl: '/images/books/east-of-eden.jpg',
        genre: 'Literary Fiction',
      },
      {
        title: 'The Fifth Season',
        author: 'N.K. Jemisin',
        description: 'Set in a world where catastrophic climate change occurs regularly, this novel follows a woman searching for her daughter while navigating a society divided by powers.',
        imageUrl: '/images/books/fifth-season.jpg',
        genre: 'Science Fiction & Fantasy',
      },
      {
        title: 'Jane Eyre',
        author: 'Charlotte Brontë',
        description: 'A novel about a strong-willed orphan who becomes a governess, falls in love with her employer, and discovers his dark secret.',
        imageUrl: '/images/books/jane-eyre.jpg',
        genre: 'Literary Fiction',
      },
      {
        title: 'Anna Karenina',
        author: 'Leo Tolstoy',
        description: 'A complex novel of family life among the Russian aristocracy, focusing on an adulterous affair between Anna Karenina and Count Vronsky.',
        imageUrl: '/images/books/anna-karenina.jpg',
        genre: 'Literary Fiction',
      },
      {
        title: 'Giovanni\'s Room',
        author: 'James Baldwin',
        description: 'A groundbreaking novel that follows an American man living in Paris as he grapples with his sexual identity and relationships.',
        imageUrl: '/images/books/giovannis-room.jpg',
        genre: 'Historical Fiction',
      },
      {
        title: 'My Brilliant Friend',
        author: 'Elena Ferrante',
        description: 'The first novel in the Neapolitan quartet that traces the friendship between Elena and Lila, from their childhood in a poor Naples neighborhood through their diverging paths in life.',
        imageUrl: '/images/books/my-brilliant-friend.jpg',
        genre: 'Literary Fiction',
      },
      {
        title: 'The Remains of the Day',
        author: 'Kazuo Ishiguro',
        description: 'The story of an English butler reflecting on his life of service and missed opportunities as he takes a road trip through the countryside.',
        imageUrl: '/images/books/remains-of-the-day.jpg',
        genre: 'Historical Fiction',
      },
      {
        title: 'The Left Hand of Darkness',
        author: 'Ursula K. Le Guin',
        description: 'A science fiction novel that follows an envoy sent to convince the ambisexual people of the planet Gethen to join an interplanetary collective.',
        imageUrl: '/images/books/left-hand-of-darkness.jpg',
        genre: 'Science Fiction & Fantasy',
      },
    ]);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

async function main() {
  try {
    await seed();
    console.log('Seeding completed');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

main();