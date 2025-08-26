// src/migrate.ts

import { config } from '@dotenvx/dotenvx';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';

config({ path: '.env' });

const main = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL!,
  });

  try {
    await client.connect();
    const db = drizzle(client);

    await migrate(db, { migrationsFolder: './db/orm/migrations' });
    console.log('Migration completed');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
};

main();