import { relations } from "drizzle-orm";
import { boolean, foreignKey, index, integer, jsonb, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * Users table - stores user information
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  activeIdx: index("users_active_idx").on(table.isActive),
}));

/**
 * Authors table - stores author information
 */
export const authors = pgTable("authors", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  bio: text("bio"),
  birthYear: integer("birth_year"),
  nationality: varchar("nationality", { length: 100 }),
  website: varchar("website", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  nameIdx: index("authors_name_idx").on(table.name),
}));

/**
 * Books table - stores book information
 */
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  authorId: integer("author_id").notNull(),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 255 }),
  genre: varchar("genre", { length: 50 }).default("Unknown").notNull(),
  isbn: varchar("isbn", { length: 20 }).unique(),
  publishedYear: integer("published_year"),
  pageCount: integer("page_count"),
  language: varchar("language", { length: 10 }).default("en").notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  rating: integer("rating").default(0),
  price: integer("price"), // Price in cents
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  titleIdx: index("books_title_idx").on(table.title),
  authorIdx: index("books_author_idx").on(table.authorId),
  genreIdx: index("books_genre_idx").on(table.genre),
  availableIdx: index("books_available_idx").on(table.isAvailable),
  isbnIdx: index("books_isbn_idx").on(table.isbn),
  authorFk: foreignKey({
    columns: [table.authorId],
    foreignColumns: [authors.id],
    name: "books_author_fk"
  }),
}));

/**
 * User book interactions - tracks reading status, favorites, etc.
 */
export const userBooks = pgTable("user_books", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  bookId: integer("book_id").notNull(),
  status: varchar("status", { length: 20 }).default("want_to_read").notNull(), // want_to_read, reading, read
  rating: integer("rating"), // 1-5 stars
  review: text("review"),
  isFavorite: boolean("is_favorite").default(false).notNull(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_books_user_idx").on(table.userId),
  bookIdx: index("user_books_book_idx").on(table.bookId),
  statusIdx: index("user_books_status_idx").on(table.status),
  favoriteIdx: index("user_books_favorite_idx").on(table.isFavorite),
  userFk: foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: "user_books_user_fk"
  }),
  bookFk: foreignKey({
    columns: [table.bookId],
    foreignColumns: [books.id],
    name: "user_books_book_fk"
  }),
}));

/**
 * Database relations
 */
export const usersRelations = relations(users, ({ many }) => ({
  userBooks: many(userBooks),
}));

export const authorsRelations = relations(authors, ({ many }) => ({
  books: many(books),
}));

export const booksRelations = relations(books, ({ one, many }) => ({
  author: one(authors, {
    fields: [books.authorId],
    references: [authors.id],
  }),
  userBooks: many(userBooks),
}));

export const userBooksRelations = relations(userBooks, ({ one }) => ({
  user: one(users, {
    fields: [userBooks.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [userBooks.bookId],
    references: [books.id],
  }),
}));
