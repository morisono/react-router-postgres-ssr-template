import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock React Router components for testing
vi.mock('react-router', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/', search: '', hash: '' }),
  useParams: () => ({}),
  Link: ({ children, to, ...props }: any) => {
    const React = require('react');
    return React.createElement('a', { href: to, ...props }, children);
  },
}));

// Mock Cloudflare Workers APIs
global.fetch = vi.fn();

// Component test utilities
global.componentTestUtils = {
  mockProps: {
    book: {
      id: 1,
      title: 'Test Book',
      author: 'Test Author',
      description: 'Test Description',
      imageUrl: '/test-image.jpg',
      genre: 'Fiction',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
  },
};