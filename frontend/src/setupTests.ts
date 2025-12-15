/**
 * Jest setup file for React Testing Library
 */
import '@testing-library/jest-dom';

// Set global API base URL for Jest environment
// This is used by getApiBaseUrl() utility function
(globalThis as any).__VITE_API_BASE_URL__ = process.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Mock fetch globally for Jest
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: async () => ({}),
    headers: new Headers(),
    status: 200,
    statusText: 'OK',
  } as Response)
) as jest.Mock;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;
