/**
 * Flashcard Service Tests
 * Tests for flashcard set and flashcard service methods
 */

import { 
  getFlashcardSets, 
  getFlashcardSet, 
  createFlashcardSet, 
  updateFlashcardSet, 
  deleteFlashcardSet,
  getFlashcards,
  getFlashcard,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  reviewFlashcard
} from '../flashcards';
import * as api from '../api';

jest.mock('../api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  del: jest.fn(),
}));

describe('Flashcard Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Flashcard Sets', () => {
    describe('getFlashcardSets', () => {
      it('should fetch list of flashcard sets successfully', async () => {
        const mockResponse = {
          count: 2,
          results: [
            { id: 1, name: 'Python Basics', card_count: 10 },
            { id: 2, name: 'React Hooks', card_count: 5 }
          ],
          status: 'success'
        };
        (api.get as jest.Mock).mockResolvedValue(mockResponse);

        const result = await getFlashcardSets();

        expect(api.get).toHaveBeenCalledWith('/api/flashcard-sets/', undefined);
        expect(result).toEqual(mockResponse);
      });

      it('should fetch flashcard sets with query parameters', async () => {
        const mockResponse = { count: 1, results: [], status: 'success' };
        (api.get as jest.Mock).mockResolvedValue(mockResponse);

        await getFlashcardSets({ category: 1, page: 2 });

        expect(api.get).toHaveBeenCalledWith('/api/flashcard-sets/', { category: 1, page: 2 });
      });

      it('should throw error on network failure', async () => {
        (api.get as jest.Mock).mockRejectedValue(new Error('Network error'));

        await expect(getFlashcardSets()).rejects.toThrow('Network error');
      });
    });

    describe('getFlashcardSet', () => {
      it('should fetch a single flashcard set successfully', async () => {
        const mockResponse = {
          data: { id: 1, name: 'Python Basics', card_count: 10 },
          status: 'success'
        };
        (api.get as jest.Mock).mockResolvedValue(mockResponse);

        const result = await getFlashcardSet(1);

        expect(api.get).toHaveBeenCalledWith('/api/flashcard-sets/1/');
        expect(result).toEqual(mockResponse);
      });

      it('should throw error if flashcard set not found', async () => {
        const error = new Error('Not found');
        (error as any).status = 404;
        (api.get as jest.Mock).mockRejectedValue(error);

        await expect(getFlashcardSet(999)).rejects.toThrow();
      });
    });

    describe('createFlashcardSet', () => {
      it('should create a flashcard set successfully', async () => {
        const mockResponse = {
          data: { id: 1, name: 'New Set', card_count: 0 },
          status: 'success'
        };
        (api.post as jest.Mock).mockResolvedValue(mockResponse);

        const result = await createFlashcardSet({
          name: 'New Set',
          description: 'Description'
        });

        expect(api.post).toHaveBeenCalledWith('/api/flashcard-sets/', {
          name: 'New Set',
          description: 'Description'
        });
        expect(result).toEqual(mockResponse);
      });

      it('should throw error on validation failure', async () => {
        const error = new Error('Validation error');
        (error as any).status = 400;
        (api.post as jest.Mock).mockRejectedValue(error);

        await expect(createFlashcardSet({ name: '' })).rejects.toThrow();
      });
    });

    describe('updateFlashcardSet', () => {
      it('should update a flashcard set successfully', async () => {
        const mockResponse = {
          data: { id: 1, name: 'Updated Set' },
          status: 'success'
        };
        (api.put as jest.Mock).mockResolvedValue(mockResponse);

        const result = await updateFlashcardSet(1, { name: 'Updated Set' });

        expect(api.put).toHaveBeenCalledWith('/api/flashcard-sets/1/', {
          name: 'Updated Set'
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('deleteFlashcardSet', () => {
      it('should delete a flashcard set successfully', async () => {
        (api.del as jest.Mock).mockResolvedValue({});

        await deleteFlashcardSet(1);

        expect(api.del).toHaveBeenCalledWith('/api/flashcard-sets/1/');
      });
    });
  });

  describe('Flashcards', () => {
    describe('getFlashcards', () => {
      it('should fetch list of flashcards successfully', async () => {
        const mockResponse = {
          count: 2,
          results: [
            { id: 1, front: 'Question 1', back: 'Answer 1' },
            { id: 2, front: 'Question 2', back: 'Answer 2' }
          ],
          status: 'success'
        };
        (api.get as jest.Mock).mockResolvedValue(mockResponse);

        const result = await getFlashcards(1);

        expect(api.get).toHaveBeenCalledWith('/api/flashcard-sets/1/flashcards/', undefined);
        expect(result).toEqual(mockResponse);
      });

      it('should fetch flashcards with due_only filter', async () => {
        const mockResponse = { count: 1, results: [], status: 'success' };
        (api.get as jest.Mock).mockResolvedValue(mockResponse);

        await getFlashcards(1, { due_only: true });

        expect(api.get).toHaveBeenCalledWith('/api/flashcard-sets/1/flashcards/', { due_only: true });
      });
    });

    describe('createFlashcard', () => {
      it('should create a flashcard successfully', async () => {
        const mockResponse = {
          data: { id: 1, front: 'Question', back: 'Answer' },
          status: 'success'
        };
        (api.post as jest.Mock).mockResolvedValue(mockResponse);

        const result = await createFlashcard(1, {
          front: 'Question',
          back: 'Answer'
        });

        expect(api.post).toHaveBeenCalledWith('/api/flashcard-sets/1/flashcards/', {
          front: 'Question',
          back: 'Answer'
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('reviewFlashcard', () => {
      it('should record a flashcard review successfully', async () => {
        const mockResponse = {
          data: {
            id: 1,
            next_review: '2025-01-28T10:00:00Z',
            ease_factor: 2.6,
            review_count: 1
          },
          status: 'success'
        };
        (api.post as jest.Mock).mockResolvedValue(mockResponse);

        const result = await reviewFlashcard(1, 5);

        expect(api.post).toHaveBeenCalledWith('/api/flashcards/1/review/', {
          quality: 5
        });
        expect(result).toEqual(mockResponse);
      });

      it('should throw error if quality is invalid', async () => {
        const error = new Error('Invalid quality');
        (error as any).status = 400;
        (api.post as jest.Mock).mockRejectedValue(error);

        await expect(reviewFlashcard(1, 6)).rejects.toThrow();
      });
    });
  });
});

