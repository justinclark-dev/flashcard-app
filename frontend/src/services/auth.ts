/**
 * Authentication Service
 * Handles user authentication API calls.
 */

import { post, get } from './api';
import type { User, RegisterData, AuthResponse } from '../types/auth';

/**
 * Login user
 */
export async function login(username: string, password: string): Promise<User> {
  const response = await post<AuthResponse>('/api/auth/login/', {
    username,
    password,
  });
  return response.data;
}

/**
 * Register new user
 */
export async function register(data: RegisterData): Promise<User> {
  const response = await post<AuthResponse>('/api/auth/register/', data);
  return response.data;
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  await post('/api/auth/logout/');
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User> {
  const response = await get<AuthResponse>('/api/auth/user/');
  return response.data;
}

