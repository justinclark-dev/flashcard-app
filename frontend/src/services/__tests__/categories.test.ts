/**
 * Test: Categories Service
 * Purpose: Verify API client methods for category operations
 * Coverage: CRUD operations, error handling
 * 
 * Created by: TDD Agent
 * Date: 2025-01-27
 */

import { getCategories, getCategory, createCategory, updateCategory, deleteCategory } from '../categories';
import * as api from '../api';

// Mock the API client
jest.mock('../api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  del: jest.fn(),
}));

describe('Categories Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCategories', () => {
    it('should fetch list of categories successfully', async () => {
      const mockCategories = {
        data: [
          { id: 1, name: 'Python', color: '#3776ab', created_at: '2025-01-27T10:00:00Z' },
          { id: 2, name: 'JavaScript', color: '#f7df1e', created_at: '2025-01-27T10:00:00Z' },
        ],
        status: 'success',
      };

      (api.get as jest.Mock).mockResolvedValue(mockCategories);

      const result = await getCategories();

      expect(api.get).toHaveBeenCalledWith('/api/categories/');
      expect(result).toEqual(mockCategories);
    });

    it('should throw error if not authenticated', async () => {
      const error = new Error('Authentication required');
      (error as any).status = 401;
      (api.get as jest.Mock).mockRejectedValue(error);

      await expect(getCategories()).rejects.toThrow('Authentication required');
    });
  });

  describe('getCategory', () => {
    it('should fetch a single category successfully', async () => {
      const mockCategory = {
        data: {
          id: 1,
          name: 'Python',
          color: '#3776ab',
          created_at: '2025-01-27T10:00:00Z',
        },
        status: 'success',
      };

      (api.get as jest.Mock).mockResolvedValue(mockCategory);

      const result = await getCategory(1);

      expect(api.get).toHaveBeenCalledWith('/api/categories/1/');
      expect(result).toEqual(mockCategory);
    });
  });

  describe('createCategory', () => {
    it('should create a category successfully', async () => {
      const categoryData = {
        name: 'Python',
        color: '#3776ab',
      };

      const mockResponse = {
        data: {
          id: 1,
          name: 'Python',
          color: '#3776ab',
          created_at: '2025-01-27T10:00:00Z',
        },
        status: 'success',
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await createCategory(categoryData);

      expect(api.post).toHaveBeenCalledWith('/api/categories/', categoryData);
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on duplicate name', async () => {
      const error = new Error('A category with this name already exists');
      (error as any).status = 400;
      (api.post as jest.Mock).mockRejectedValue(error);

      await expect(createCategory({ name: 'Python' })).rejects.toThrow();
    });
  });

  describe('updateCategory', () => {
    it('should update a category successfully', async () => {
      const updateData = {
        name: 'Python 3',
        color: '#3776ab',
      };

      const mockResponse = {
        data: {
          id: 1,
          name: 'Python 3',
          color: '#3776ab',
          created_at: '2025-01-27T10:00:00Z',
        },
        status: 'success',
      };

      (api.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await updateCategory(1, updateData);

      expect(api.put).toHaveBeenCalledWith('/api/categories/1/', updateData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category successfully', async () => {
      (api.del as jest.Mock).mockResolvedValue({});

      await deleteCategory(1);

      expect(api.del).toHaveBeenCalledWith('/api/categories/1/');
    });
  });
});

