/**
 * Test: Tags Service
 * Purpose: Verify API client methods for tag operations
 * Coverage: CRUD operations, error handling
 * 
 * Created by: TDD Agent
 * Date: 2025-01-27
 */

import { getTags, getTag, createTag, updateTag, deleteTag } from '../tags';
import * as api from '../api';

// Mock the API client
jest.mock('../api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  del: jest.fn(),
}));

describe('Tags Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTags', () => {
    it('should fetch list of tags successfully', async () => {
      const mockTags = {
        data: [
          { id: 1, name: 'python', created_at: '2025-01-27T10:00:00Z' },
          { id: 2, name: 'javascript', created_at: '2025-01-27T10:00:00Z' },
        ],
        status: 'success',
      };

      (api.get as jest.Mock).mockResolvedValue(mockTags);

      const result = await getTags();

      expect(api.get).toHaveBeenCalledWith('/api/tags/');
      expect(result).toEqual(mockTags);
    });
  });

  describe('getTag', () => {
    it('should fetch a single tag successfully', async () => {
      const mockTag = {
        data: {
          id: 1,
          name: 'python',
          created_at: '2025-01-27T10:00:00Z',
        },
        status: 'success',
      };

      (api.get as jest.Mock).mockResolvedValue(mockTag);

      const result = await getTag(1);

      expect(api.get).toHaveBeenCalledWith('/api/tags/1/');
      expect(result).toEqual(mockTag);
    });
  });

  describe('createTag', () => {
    it('should create a tag successfully', async () => {
      const tagData = { name: 'python' };

      const mockResponse = {
        data: {
          id: 1,
          name: 'python',
          created_at: '2025-01-27T10:00:00Z',
        },
        status: 'success',
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await createTag(tagData);

      expect(api.post).toHaveBeenCalledWith('/api/tags/', tagData);
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on duplicate name', async () => {
      const error = new Error('A tag with this name already exists');
      (error as any).status = 400;
      (api.post as jest.Mock).mockRejectedValue(error);

      await expect(createTag({ name: 'python' })).rejects.toThrow();
    });
  });

  describe('updateTag', () => {
    it('should update a tag successfully', async () => {
      const updateData = { name: 'python3' };

      const mockResponse = {
        data: {
          id: 1,
          name: 'python3',
          created_at: '2025-01-27T10:00:00Z',
        },
        status: 'success',
      };

      (api.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await updateTag(1, updateData);

      expect(api.put).toHaveBeenCalledWith('/api/tags/1/', updateData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteTag', () => {
    it('should delete a tag successfully', async () => {
      (api.del as jest.Mock).mockResolvedValue({});

      await deleteTag(1);

      expect(api.del).toHaveBeenCalledWith('/api/tags/1/');
    });
  });
});

