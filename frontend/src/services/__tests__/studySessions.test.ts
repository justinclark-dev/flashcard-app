/**
 * Study Session Service Tests
 * Tests for study session service methods
 */

import {
  createStudySession,
  updateStudySession,
  endStudySession,
  getStudySessions,
  getStudySessionStats
} from '../studySessions';
import * as api from '../api';

jest.mock('../api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
}));

describe('Study Session Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createStudySession', () => {
    it('should create a study session successfully', async () => {
      const mockResponse = {
        data: {
          id: 1,
          flashcard_set_id: 1,
          mode: 'spaced',
          started_at: '2025-01-27T10:00:00Z'
        },
        status: 'success'
      };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await createStudySession({
        flashcard_set_id: 1,
        mode: 'spaced'
      });

      expect(api.post).toHaveBeenCalledWith('/api/study-sessions/', {
        flashcard_set_id: 1,
        mode: 'spaced'
      });
      expect(result).toEqual(mockResponse);
    });

    it('should use default mode if not provided', async () => {
      const mockResponse = {
        data: { id: 1, mode: 'simple' },
        status: 'success'
      };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      await createStudySession({ flashcard_set_id: 1 });

      expect(api.post).toHaveBeenCalledWith('/api/study-sessions/', {
        flashcard_set_id: 1,
        mode: 'simple'
      });
    });
  });

  describe('updateStudySession', () => {
    it('should update a study session successfully', async () => {
      const mockResponse = {
        data: {
          id: 1,
          cards_studied: 10,
          cards_correct: 8
        },
        status: 'success'
      };
      (api.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await updateStudySession(1, {
        cards_studied: 10,
        cards_correct: 8
      });

      expect(api.patch).toHaveBeenCalledWith('/api/study-sessions/1/', {
        cards_studied: 10,
        cards_correct: 8
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('endStudySession', () => {
    it('should end a study session successfully', async () => {
      const mockResponse = {
        data: {
          id: 1,
          ended_at: '2025-01-27T11:00:00Z'
        },
        status: 'success'
      };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await endStudySession(1);

      expect(api.post).toHaveBeenCalledWith('/api/study-sessions/1/end/');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getStudySessions', () => {
    it('should fetch list of study sessions successfully', async () => {
      const mockResponse = {
        count: 2,
        results: [
          { id: 1, mode: 'simple', cards_studied: 10 },
          { id: 2, mode: 'spaced', cards_studied: 5 }
        ],
        status: 'success'
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getStudySessions();

      expect(api.get).toHaveBeenCalledWith('/api/study-sessions/', undefined);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getStudySessionStats', () => {
    it('should fetch study session statistics successfully', async () => {
      const mockResponse = {
        data: {
          id: 1,
          cards_studied: 10,
          cards_correct: 8,
          accuracy: 80.0,
          duration: 15
        },
        status: 'success'
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getStudySessionStats(1);

      expect(api.get).toHaveBeenCalledWith('/api/study-sessions/1/stats/');
      expect(result).toEqual(mockResponse);
    });
  });
});

