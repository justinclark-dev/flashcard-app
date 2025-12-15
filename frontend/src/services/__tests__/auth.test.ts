/**
 * Test: Authentication Service
 * Purpose: Verify API client methods for authentication
 * Coverage: login, register, logout, getCurrentUser, error handling
 * 
 * Created by: TDD Agent
 * Date: 2025-01-27
 */

import { login, register, logout, getCurrentUser } from '../auth';
import * as api from '../api';

// Mock the API client
jest.mock('../api', () => ({
  post: jest.fn(),
  get: jest.fn(),
}));

describe('Authentication Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
      };

      (api.post as jest.Mock).mockResolvedValue({
        data: mockUser,
        status: 'success',
      });

      const result = await login('testuser', 'securepass123');

      expect(api.post).toHaveBeenCalledWith('/api/auth/login/', {
        username: 'testuser',
        password: 'securepass123',
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw error on invalid credentials', async () => {
      const error = new Error('Invalid credentials');
      (error as any).status = 401;
      (error as any).data = {
        error: 'Invalid credentials',
        status: 'error',
        code: 'AUTHENTICATION_REQUIRED',
      };
      (api.post as jest.Mock).mockRejectedValue(error);

      await expect(login('testuser', 'wrongpass')).rejects.toThrow('Invalid credentials');
    });

    it('should throw error on network failure', async () => {
      (api.post as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(login('testuser', 'securepass123')).rejects.toThrow('Network error');
    });
  });

  describe('register', () => {
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

      (api.post as jest.Mock).mockResolvedValue({
        data: mockUser,
        status: 'success',
      });

      const result = await register(registerData);

      expect(api.post).toHaveBeenCalledWith('/api/auth/register/', registerData);
      expect(result).toEqual(mockUser);
    });

    it('should throw error on validation failure', async () => {
      const error = new Error('Validation failed');
      (error as any).status = 400;
      (error as any).data = {
        error: 'Validation failed',
        status: 'error',
        code: 'VALIDATION_ERROR',
        details: {
          password_confirm: ['Passwords do not match'],
        },
      };
      (api.post as jest.Mock).mockRejectedValue(error);

      await expect(
        register({
          username: 'newuser',
          email: 'new@example.com',
          password: 'securepass123',
          password_confirm: 'differentpass',
        })
      ).rejects.toThrow('Validation failed');
    });

    it('should throw error on duplicate username', async () => {
      const error = new Error('Validation failed');
      (error as any).status = 400;
      (error as any).data = {
        error: 'Validation failed',
        status: 'error',
        code: 'VALIDATION_ERROR',
        details: {
          username: ['A user with that username already exists.'],
        },
      };
      (api.post as jest.Mock).mockRejectedValue(error);

      await expect(
        register({
          username: 'existinguser',
          email: 'new@example.com',
          password: 'securepass123',
          password_confirm: 'securepass123',
        })
      ).rejects.toThrow('Validation failed');
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      (api.post as jest.Mock).mockResolvedValue({
        message: 'Logged out successfully',
        status: 'success',
      });

      await logout();

      expect(api.post).toHaveBeenCalledWith('/api/auth/logout/');
    });

    it('should throw error if not authenticated', async () => {
      const error = new Error('Authentication required');
      (error as any).status = 401;
      (error as any).data = {
        error: 'Authentication required',
        status: 'error',
        code: 'AUTHENTICATION_REQUIRED',
      };
      (api.post as jest.Mock).mockRejectedValue(error);

      await expect(logout()).rejects.toThrow('Authentication required');
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        date_joined: '2025-01-27T10:00:00Z',
      };

      (api.get as jest.Mock).mockResolvedValue({
        data: mockUser,
        status: 'success',
      });

      const result = await getCurrentUser();

      expect(api.get).toHaveBeenCalledWith('/api/auth/user/');
      expect(result).toEqual(mockUser);
    });

    it('should throw error if not authenticated', async () => {
      const error = new Error('Authentication required');
      (error as any).status = 401;
      (error as any).data = {
        error: 'Authentication required',
        status: 'error',
        code: 'AUTHENTICATION_REQUIRED',
      };
      (api.get as jest.Mock).mockRejectedValue(error);

      await expect(getCurrentUser()).rejects.toThrow('Authentication required');
    });
  });
});

