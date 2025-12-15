/**
 * Test: Notes Service
 * Purpose: Verify API client methods for notes operations
 * Coverage: CRUD operations, error handling, search, filtering
 * 
 * Created by: TDD Agent
 * Date: 2025-01-27
 */

import { getNotes, getNote, createNote, updateNote, deleteNote } from '../notes';
import * as api from '../api';

// Mock the API client
jest.mock('../api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  del: jest.fn(),
}));

describe('Notes Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNotes', () => {
    it('should fetch list of notes successfully', async () => {
      const mockNotes = {
        count: 2,
        next: null,
        previous: null,
        results: [
          {
            id: 1,
            title: 'Note 1',
            content: 'Content 1',
            category: { id: 1, name: 'Python', color: '#3776ab' },
            tags: [{ id: 1, name: 'basics' }],
            created_at: '2025-01-27T10:00:00Z',
            updated_at: '2025-01-27T10:00:00Z',
          },
          {
            id: 2,
            title: 'Note 2',
            content: 'Content 2',
            category: null,
            tags: [],
            created_at: '2025-01-27T10:00:00Z',
            updated_at: '2025-01-27T10:00:00Z',
          },
        ],
        status: 'success',
      };

      (api.get as jest.Mock).mockResolvedValue(mockNotes);

      const result = await getNotes();

      expect(api.get).toHaveBeenCalledWith('/api/notes/');
      expect(result).toEqual(mockNotes);
    });

    it('should fetch notes with query parameters', async () => {
      const mockNotes = {
        count: 1,
        results: [{ id: 1, title: 'Python Note', content: 'Content' }],
        status: 'success',
      };

      (api.get as jest.Mock).mockResolvedValue(mockNotes);

      await getNotes({ category: 1, search: 'Python', page: 1, page_size: 20 });

      expect(api.get).toHaveBeenCalledWith('/api/notes/?category=1&search=Python&page=1&page_size=20');
    });

    it('should throw error on network failure', async () => {
      const error = new Error('Network error');
      (api.get as jest.Mock).mockRejectedValue(error);

      await expect(getNotes()).rejects.toThrow('Network error');
    });

    it('should throw error if not authenticated', async () => {
      const error = new Error('Authentication required');
      (error as any).status = 401;
      (api.get as jest.Mock).mockRejectedValue(error);

      await expect(getNotes()).rejects.toThrow('Authentication required');
    });
  });

  describe('getNote', () => {
    it('should fetch a single note successfully', async () => {
      const mockNote = {
        data: {
          id: 1,
          title: 'Test Note',
          content: 'Content here',
          category: { id: 1, name: 'Python', color: '#3776ab' },
          tags: [{ id: 1, name: 'basics' }],
          created_at: '2025-01-27T10:00:00Z',
          updated_at: '2025-01-27T10:00:00Z',
        },
        status: 'success',
      };

      (api.get as jest.Mock).mockResolvedValue(mockNote);

      const result = await getNote(1);

      expect(api.get).toHaveBeenCalledWith('/api/notes/1/');
      expect(result).toEqual(mockNote);
    });

    it('should throw error if note not found', async () => {
      const error = new Error('Note not found');
      (error as any).status = 404;
      (api.get as jest.Mock).mockRejectedValue(error);

      await expect(getNote(999)).rejects.toThrow('Note not found');
    });
  });

  describe('createNote', () => {
    it('should create a note successfully', async () => {
      const noteData = {
        title: 'New Note',
        content: 'Note content here...',
        category_id: 1,
        tag_ids: [1, 2],
        source_url: 'https://example.com',
      };

      const mockResponse = {
        data: {
          id: 2,
          title: 'New Note',
          content: 'Note content here...',
          category: { id: 1, name: 'Python', color: '#3776ab' },
          tags: [{ id: 1, name: 'basics' }, { id: 2, name: 'python' }],
          created_at: '2025-01-27T10:00:00Z',
          updated_at: '2025-01-27T10:00:00Z',
        },
        status: 'success',
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await createNote(noteData);

      expect(api.post).toHaveBeenCalledWith('/api/notes/', noteData);
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on validation failure', async () => {
      const error = new Error('Validation failed');
      (error as any).status = 400;
      (error as any).data = {
        error: 'Validation failed',
        details: { title: ['This field is required.'] },
      };
      (api.post as jest.Mock).mockRejectedValue(error);

      await expect(createNote({ title: '', content: 'Content' })).rejects.toThrow('Validation failed');
    });
  });

  describe('updateNote', () => {
    it('should update a note successfully', async () => {
      const updateData = {
        title: 'Updated Note',
        content: 'Updated content',
      };

      const mockResponse = {
        data: {
          id: 1,
          title: 'Updated Note',
          content: 'Updated content',
          category: null,
          tags: [],
          created_at: '2025-01-27T10:00:00Z',
          updated_at: '2025-01-27T11:00:00Z',
        },
        status: 'success',
      };

      (api.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await updateNote(1, updateData);

      expect(api.put).toHaveBeenCalledWith('/api/notes/1/', updateData);
      expect(result).toEqual(mockResponse);
    });

    it('should perform partial update', async () => {
      const mockResponse = {
        data: {
          id: 1,
          title: 'Updated Title',
          content: 'Original content',
        },
        status: 'success',
      };

      (api.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await updateNote(1, { title: 'Updated Title' }, true);

      expect(api.patch).toHaveBeenCalledWith('/api/notes/1/', { title: 'Updated Title' });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error if note not found', async () => {
      const error = new Error('Note not found');
      (error as any).status = 404;
      (api.put as jest.Mock).mockRejectedValue(error);

      await expect(updateNote(999, { title: 'Title' })).rejects.toThrow('Note not found');
    });
  });

  describe('deleteNote', () => {
    it('should delete a note successfully', async () => {
      (api.del as jest.Mock).mockResolvedValue({});

      await deleteNote(1);

      expect(api.del).toHaveBeenCalledWith('/api/notes/1/');
    });

    it('should throw error if note not found', async () => {
      const error = new Error('Note not found');
      (error as any).status = 404;
      (api.del as jest.Mock).mockRejectedValue(error);

      await expect(deleteNote(999)).rejects.toThrow('Note not found');
    });
  });
});

