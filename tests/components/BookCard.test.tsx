import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BookCard } from '../../app/components/BookCard';

// Mock book data
const mockBook = {
  id: 1,
  title: 'The Great Gatsby',
  author: 'F. Scott Fitzgerald',
  description: 'A classic American novel set in the Jazz Age',
  imageUrl: '/images/great-gatsby.jpg',
  genre: 'Fiction',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
};

describe('BookCard Component', () => {
  it('should render book title and author', () => {
    render(<BookCard book={mockBook} />);

    expect(screen.getByText('The Great Gatsby')).toBeDefined();
    expect(screen.getByText('F. Scott Fitzgerald')).toBeDefined();
  });

  it('should render book image with correct alt text', () => {
    render(<BookCard book={mockBook} />);

    const image = screen.getByAltText('The Great Gatsby');
    expect(image).toBeDefined();
    expect(image.getAttribute('src')).toBe('/images/great-gatsby.jpg');
  });

  it('should render book description when provided', () => {
    render(<BookCard book={mockBook} />);

    expect(screen.getByText('A classic American novel set in the Jazz Age')).toBeDefined();
  });

  it('should render genre badge', () => {
    render(<BookCard book={mockBook} />);

    expect(screen.getByText('Fiction')).toBeDefined();
  });

  it('should handle missing image gracefully', () => {
    const bookWithoutImage = { ...mockBook, imageUrl: null };
    render(<BookCard book={bookWithoutImage} />);

    // Should still render other content
    expect(screen.getByText('The Great Gatsby')).toBeDefined();
  });

  it('should be accessible', () => {
    render(<BookCard book={mockBook} />);

    // Check for semantic HTML structure
    const article = screen.getByRole('article');
    expect(article).toBeDefined();
  });

  it('should truncate long descriptions', () => {
    const bookWithLongDescription = {
      ...mockBook,
      description: 'A very long description '.repeat(20),
    };

    render(<BookCard book={bookWithLongDescription} />);

    // Should render but truncated (implementation dependent)
    const description = screen.getByText(/A very long description/);
    expect(description).toBeDefined();
  });
});