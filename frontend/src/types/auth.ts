/**
 * Authentication types
 */

export interface User {
  id: number;
  username: string;
  email: string;
  date_joined?: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  data: User;
  status: 'success';
}

export interface ErrorResponse {
  error: string;
  status: 'error';
  code: string;
  details?: Record<string, string[]>;
  message?: string;
  retry_after?: number;
}

