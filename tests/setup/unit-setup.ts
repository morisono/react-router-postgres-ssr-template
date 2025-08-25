import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test case (e.g., clearing jsdom)
afterEach(() => {
  cleanup();
});

// Mock environment variables for testing
process.env.NODE_ENV = 'test';

// Global test utilities
global.testUtils = {
  createMockRequest: (url: string, options: RequestInit = {}) => {
    return new Request(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
  },

  createMockEnv: () => ({
    HYPERDRIVE: 'test_hyperdrive_connection',
    NODE_ENV: 'test',
    __STATIC_CONTENT_MANIFEST: JSON.stringify({}),
  }),
};

// Mock console warnings/errors in tests unless explicitly testing them
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is deprecated')
  ) {
    return;
  }
  originalConsoleError.call(console, ...args);
};