/**
 * API Client
 * Base HTTP client for making API requests to the Django backend.
 */

import { getApiBaseUrl } from '../utils/apiConfig';

// Get API base URL from environment or default
// In Vite: import.meta.env.VITE_API_BASE_URL
// In Jest tests: uses process.env.VITE_API_BASE_URL
const API_BASE_URL = getApiBaseUrl();

/**
 * Get CSRF token from cookie
 */
function getCsrfToken(): string | null {
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  return null;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

/**
 * Make an API request
 */
async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  // Get CSRF token for state-changing requests
  const csrfToken = getCsrfToken();
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add CSRF token for POST, PUT, PATCH, DELETE requests
  if (csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method || 'GET')) {
    requestHeaders['X-CSRFToken'] = csrfToken;
  }

  const config: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: 'include', // Include cookies for session auth
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Handle non-JSON responses
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return {} as T;
  }

  const data = await response.json();

  // Handle error responses
  if (!response.ok) {
    const errorMessage = data?.error || data?.message || `HTTP error! status: ${response.status}`;
    const error = new Error(errorMessage);
    (error as any).status = response.status;
    (error as any).data = data;
    throw error;
  }

  return data;
}

/**
 * GET request
 */
export async function get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
  let url = endpoint;
  if (params) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    const queryString = queryParams.toString();
    if (queryString) {
      url = `${endpoint}${endpoint.includes('?') ? '&' : '?'}${queryString}`;
    }
  }
  return request<T>(url, { method: 'GET' });
}

/**
 * POST request
 */
export async function post<T>(endpoint: string, body?: any): Promise<T> {
  return request<T>(endpoint, { method: 'POST', body });
}

/**
 * PUT request
 */
export async function put<T>(endpoint: string, body?: any): Promise<T> {
  return request<T>(endpoint, { method: 'PUT', body });
}

/**
 * PATCH request
 */
export async function patch<T>(endpoint: string, body?: any): Promise<T> {
  return request<T>(endpoint, { method: 'PATCH', body });
}

/**
 * DELETE request
 */
export async function del<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: 'DELETE' });
}

