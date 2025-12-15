/**
 * API Configuration Utility
 * Provides a consistent way to get the API base URL in both browser and Jest environments
 */

// Declare global type for Jest environment
declare global {
  var __VITE_API_BASE_URL__: string | undefined;
}

export function getApiBaseUrl(): string {
  // In Jest/test environment - use global variable set in setupTests.ts
  if (typeof globalThis !== 'undefined' && (globalThis as any).__VITE_API_BASE_URL__) {
    return (globalThis as any).__VITE_API_BASE_URL__;
  }
  
  // In browser/Vite environment - use import.meta.env
  // Vite replaces import.meta.env at build time
  try {
    // @ts-ignore - import.meta is available in Vite
    if (import.meta?.env?.VITE_API_BASE_URL) {
      // @ts-ignore
      return import.meta.env.VITE_API_BASE_URL;
    }
  } catch (e) {
    // import.meta not available (e.g., in some test environments)
    // Fall through to default
  }
  
  // Fallback to default
  return 'http://localhost:8000';
}

