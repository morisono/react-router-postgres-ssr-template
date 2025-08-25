import { describe, expect, it } from 'vitest';

// Example utility functions to test
function formatBookTitle(title: string): string {
  return title.trim().replace(/\s+/g, ' ');
}

function validateBookData(book: any): boolean {
  return !!(book?.title && book?.author && book?.title.length > 0 && book?.author.length > 0);
}

function generateBookSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

describe('Book Utilities', () => {
  describe('formatBookTitle', () => {
    it('should trim whitespace from title', () => {
      expect(formatBookTitle('  The Great Gatsby  ')).toBe('The Great Gatsby');
    });

    it('should normalize multiple spaces', () => {
      expect(formatBookTitle('The    Great     Gatsby')).toBe('The Great Gatsby');
    });

    it('should handle empty string', () => {
      expect(formatBookTitle('')).toBe('');
    });

    it('should handle single character', () => {
      expect(formatBookTitle('A')).toBe('A');
    });
  });

  describe('validateBookData', () => {
    it('should validate complete book data', () => {
      const validBook = {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        description: 'A classic novel',
      };
      expect(validateBookData(validBook)).toBe(true);
    });

    it('should reject book without title', () => {
      const invalidBook = {
        author: 'F. Scott Fitzgerald',
        description: 'A classic novel',
      };
      expect(validateBookData(invalidBook)).toBe(false);
    });

    it('should reject book without author', () => {
      const invalidBook = {
        title: 'The Great Gatsby',
        description: 'A classic novel',
      };
      expect(validateBookData(invalidBook)).toBe(false);
    });

    it('should reject book with empty title', () => {
      const invalidBook = {
        title: '',
        author: 'F. Scott Fitzgerald',
      };
      expect(validateBookData(invalidBook)).toBe(false);
    });

    it('should reject null book', () => {
      expect(validateBookData(null)).toBe(false);
    });
  });

  describe('generateBookSlug', () => {
    it('should generate slug from title', () => {
      expect(generateBookSlug('The Great Gatsby')).toBe('the-great-gatsby');
    });

    it('should handle special characters', () => {
      expect(generateBookSlug("Jane Eyre: A Novel")).toBe('jane-eyre-a-novel');
    });

    it('should handle multiple spaces', () => {
      expect(generateBookSlug('The    Brothers   Karamazov')).toBe('the-brothers-karamazov');
    });

    it('should handle numbers', () => {
      expect(generateBookSlug('2001: A Space Odyssey')).toBe('2001-a-space-odyssey');
    });

    it('should handle empty string', () => {
      expect(generateBookSlug('')).toBe('');
    });
  });
});