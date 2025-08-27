# Multi-Database ORM Architecture

This project implements a comprehensive, production-ready multi-database ORM architecture that manages multiple PostgreSQL providers (Neon, Supabase, Local Postgres) through a unified factory pattern.

## 🏗️ Architecture Overview

The system is designed with the following principles:
- **Provider Agnostic**: Switch between database providers without code changes
- **Type Safe**: Full TypeScript support with proper type inference
- **Repository Pattern**: Clean separation of data access logic
- **Factory Pattern**: Centralized client creation and configuration
- **Migration Management**: Independent migration tracking per provider

## 📁 Directory Structure

```
db/orm/
├── clients/              # Database client implementations
│   ├── neon.ts          # Neon serverless client
│   ├── supabase.ts      # Supabase client
│   └── local.ts         # Local PostgreSQL client
├── configs/             # Drizzle configuration files
│   ├── neon.config.ts   # Neon-specific config
│   ├── supabase.config.ts # Supabase-specific config
│   └── local.config.ts  # Local development config
├── migrations/          # Provider-specific migration directories
│   ├── neon/           # Neon migrations
│   ├── supabase/       # Supabase migrations
│   └── local/          # Local migrations
├── repositories/        # Repository pattern implementations
│   ├── book.repository.ts
│   ├── author.repository.ts
│   └── index.ts
├── factory.ts          # Database client factory
├── migrations.ts       # Migration utilities
├── schema.ts          # Database schema definition
├── types.ts           # TypeScript type definitions
├── seed.ts            # Database seeding script
└── index.ts           # Main module exports
```

## 🚀 Quick Start

### 1. Environment Configuration

Create a `.env` file with your database URLs:

```bash
# Optional: Explicit provider selection
DB_PROVIDER=local  # neon | supabase | local

# Provider URLs (configure as needed)
NEON_DATABASE_URL=postgres://username:password@ep-xxx.region.aws.neon.tech/neondb
SUPABASE_DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
LOCAL_DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/mydatabase
```

### 2. Install Dependencies

The required dependencies are already included:
- `@neondatabase/serverless` - Neon serverless driver
- `postgres` - PostgreSQL client for Supabase and local
- `drizzle-orm` - Type-safe ORM
- `drizzle-kit` - Migration toolkit

### 3. Database Operations

```typescript
import { createDefaultClient, createRepositories } from './db/orm';

// Create database client (auto-selects provider)
const db = createDefaultClient();

// Create repository instances
const repos = createRepositories(db);

// Use repositories for database operations
const books = await repos.books.search({ genre: 'Fantasy' });
const author = await repos.authors.findById(1);
```

## 🔧 Provider-Specific Operations

### Generate Migrations

```bash
# Generate for specific provider
npm run db:generate:neon
npm run db:generate:supabase
npm run db:generate:local

# Generate for all providers
npm run db:generate:all
```

### Run Migrations

```bash
# Migrate specific provider
npm run db:migrate:neon
npm run db:migrate:supabase
npm run db:migrate:local

# Migrate all providers
npm run db:migrate:all
```

### Seed Database

```bash
# Seed with auto-detected provider
npm run db:seed

# Seed specific provider
npx tsx db/orm/seed.ts neon
npx tsx db/orm/seed.ts supabase
npx tsx db/orm/seed.ts local
```

### Check Migration Status

```bash
npm run db:status
```

## 📊 Database Schema

The schema includes the following tables with full relationships:

### Tables
- **users** - User information with metadata support
- **authors** - Author details with biographical information  
- **books** - Book catalog with ratings, pricing, and availability
- **user_books** - User reading status and book interactions

### Features
- Foreign key relationships
- Optimized indexes for common queries
- JSON metadata support
- Timestamp tracking (created/updated)
- Soft delete capability

## 🏭 Factory Pattern Usage

### Basic Usage

```typescript
import { createDatabaseClient, createDefaultClient } from './db/orm';

// Explicit provider selection
const neonDb = createDatabaseClient('neon');
const supabaseDb = createDatabaseClient('supabase');
const localDb = createDatabaseClient('local');

// Environment-based auto-selection
const db = createDefaultClient();
```

### Provider Selection Logic

The factory uses the following priority order:

1. **Explicit `DB_PROVIDER`** environment variable
2. **Environment-based defaults** (development/test → local)
3. **Available URLs** (Neon → Supabase → Local)
4. **Fallback** to local with default URL

## 📦 Repository Pattern

### Book Repository Example

```typescript
const repos = createRepositories(db);

// Search with filters
const fantasyBooks = await repos.books.search({
  genre: 'Fantasy',
  minRating: 4,
  limit: 10
});

// Get book with author
const bookWithAuthor = await repos.books.findByIdWithAuthor(1);

// Create new book
const newBook = await repos.books.create({
  title: 'New Fantasy Novel',
  authorId: 1,
  genre: 'Fantasy',
  // ... other fields
});

// Get statistics
const stats = await repos.books.getStats();
```

### Author Repository Example

```typescript
// Find author with all books
const authorWithBooks = await repos.authors.findByIdWithBooks(1);

// Search authors
const authors = await repos.authors.search('Tolkien');

// Get featured authors (highest rated books)
const featured = await repos.authors.getFeatured(5);

// Get statistics by nationality
const stats = await repos.authors.getStats();
```

## 🔄 Migration Management

### Provider-Specific Migrations

Each provider maintains its own migration history:

```typescript
import { getMigrationStatus, runMigrations } from './db/orm';

// Check status for specific provider
const neonStatus = await getMigrationStatus('neon');

// Run migrations for specific provider
await runMigrations('neon');

// Validate all providers
const allStatus = await validateMigrations();
```

### Migration Files

Migrations are stored in provider-specific directories:
- `migrations/neon/` - Neon-specific migrations
- `migrations/supabase/` - Supabase-specific migrations  
- `migrations/local/` - Local development migrations

## 🔧 Client Configurations

### Neon Client (Serverless Optimized)

```typescript
// Optimized for serverless environments
const sql = neon(process.env.NEON_DATABASE_URL);
const db = drizzle(sql, { schema });
```

### Supabase Client (Connection Pooled)

```typescript
// Configured with SSL and connection pooling
const sql = postgres(url, {
  max: 5,
  ssl: 'require',
  fetch_types: false
});
const db = drizzle(sql, { schema });
```

### Local Client (Development Friendly)

```typescript
// Relaxed settings for local development
const sql = postgres(url, {
  max: 10,
  ssl: false,
  debug: true
});
const db = drizzle(sql, { schema });
```

## 🛠️ Production Considerations

### Performance Optimizations

1. **Connection Pooling**: Each provider uses appropriate connection pool settings
2. **Indexes**: Strategic indexes on frequently queried columns
3. **Query Optimization**: Repository methods use efficient query patterns
4. **Type Safety**: Full TypeScript support prevents runtime errors

### Error Handling

```typescript
import { healthCheck, validateProviderConfig } from './db/orm';

// Check provider configuration
const isValid = validateProviderConfig('neon');

// Test database connection
const isHealthy = await healthCheck(db);
```

### Monitoring

```typescript
// Get current provider information
const provider = getCurrentProvider();

// Check migration status across all providers
const migrationStatus = await validateMigrations();
```

## 🧪 Testing

The architecture supports testing with different providers:

```typescript
// Test with local database
process.env.DB_PROVIDER = 'local';
const testDb = createDefaultClient();

// Test with specific provider
const testDb = createDatabaseClient('local');
```

## 📈 Scaling Considerations

### Horizontal Scaling
- **Read Replicas**: Use Neon read replicas for read-heavy workloads
- **Connection Pooling**: Built-in pooling for each provider
- **Caching Layer**: Repository pattern supports caching integration

### Vertical Scaling
- **Provider Migration**: Easy switching between providers for scaling
- **Resource Optimization**: Provider-specific optimizations
- **Performance Monitoring**: Built-in health checks and status monitoring

## 🔐 Security

### Connection Security
- **SSL/TLS**: Enforced for cloud providers (Neon, Supabase)
- **Environment Variables**: Sensitive data in environment configuration
- **Connection Validation**: Automatic validation of provider configurations

### Data Security
- **Type Safety**: Prevents SQL injection through typed queries
- **Repository Pattern**: Encapsulates data access logic
- **Input Validation**: Type-safe insert/update operations

## 🚀 Deployment

### Environment Variables

Set appropriate environment variables for your deployment:

```bash
# Production
DB_PROVIDER=neon
NEON_DATABASE_URL=postgres://...

# Staging  
DB_PROVIDER=supabase
SUPABASE_DATABASE_URL=postgresql://...

# Development
DB_PROVIDER=local
LOCAL_DATABASE_URL=postgresql://...
```

### Migration Deployment

```bash
# Deploy migrations to production
npm run db:migrate:neon

# Verify migration status
npm run db:status
```

This architecture provides a robust, scalable, and maintainable foundation for database operations across multiple PostgreSQL providers while maintaining type safety and clean separation of concerns.