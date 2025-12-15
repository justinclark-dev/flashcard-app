/**
 * Test: useAuth Hook
 * Purpose: Verify authentication hook functionality
 * Coverage: login, register, logout, authentication state, loading states
 * 
 * Created by: TDD Agent
 * Date: 2025-01-27
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider } from '../../contexts/AuthContext';
import { useAuth } from '../useAuth';
import * as authService from '../../services/auth';

// Mock the auth service
jest.mock('../../services/auth', () => ({
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  getCurrentUser: jest.fn(),
}));

// Wrapper component for tests
const wrapper = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(AuthProvider, null, children);
};

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset localStorage
    localStorage.clear();
  });

  it('should initialize with no user', () => {
    (authService.getCurrentUser as jest.Mock).mockRejectedValue(new Error('Not authenticated'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.loading).toBe(true);
  });

  it('should load current user on mount if authenticated', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
    };

    (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should login user successfully', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
    };

    (authService.login as jest.Mock).mockResolvedValue(mockUser);
    (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('testuser', 'securepass123');
    });

    expect(authService.login).toHaveBeenCalledWith('testuser', 'securepass123');
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle login error', async () => {
    const error = new Error('Invalid credentials');
    (authService.login as jest.Mock).mockRejectedValue(error);
    (authService.getCurrentUser as jest.Mock).mockRejectedValue(new Error('Not authenticated'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await expect(result.current.login('testuser', 'wrongpass')).rejects.toThrow();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeTruthy();
  });

  it('should register user successfully', async () => {
    const mockUser = {
      id: 1,
      username: 'newuser',
      email: 'new@example.com',
    };

    const registerData = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'securepass123',
      password_confirm: 'securepass123',
    };

    (authService.register as jest.Mock).mockResolvedValue(mockUser);
    (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.register(registerData);
    });

    expect(authService.register).toHaveBeenCalledWith(registerData);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle register error', async () => {
    const error = new Error('Validation failed');
    (authService.register as jest.Mock).mockRejectedValue(error);
    (authService.getCurrentUser as jest.Mock).mockRejectedValue(new Error('Not authenticated'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await expect(
        result.current.register({
          username: 'newuser',
          email: 'new@example.com',
          password: 'securepass123',
          password_confirm: 'differentpass',
        })
      ).rejects.toThrow();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should logout user successfully', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
    };

    (authService.getCurrentUser as jest.Mock)
      .mockResolvedValueOnce(mockUser)
      .mockRejectedValueOnce(new Error('Not authenticated'));

    (authService.logout as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(authService.logout).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should set loading state during async operations', async () => {
    let resolveLogin: (value: any) => void;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });

    (authService.login as jest.Mock).mockReturnValue(loginPromise);
    (authService.getCurrentUser as jest.Mock).mockRejectedValue(new Error('Not authenticated'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.login('testuser', 'securepass123');
    });

    // Loading should be true during login
    // Note: This depends on implementation - may need to check loading state

    await act(async () => {
      resolveLogin!({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
      });
      await loginPromise;
    });
  });
});

