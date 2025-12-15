/**
 * useStudySession Hook Tests
 * Tests for the useStudySession custom hook
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider } from '../../contexts/AuthContext';
import { useStudySession } from '../useStudySession';
import * as studySessionService from '../../services/studySessions';
import * as flashcardService from '../../services/flashcards';

jest.mock('../../services/studySessions', () => ({
  createStudySession: jest.fn(),
  updateStudySession: jest.fn(),
  endStudySession: jest.fn(),
  getStudySessionStats: jest.fn(),
}));

jest.mock('../../services/flashcards', () => ({
  getFlashcards: jest.fn(),
  reviewFlashcard: jest.fn(),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(AuthProvider, null, children);
};

describe('useStudySession Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useStudySession(1), { wrapper });

    expect(result.current.cards).toEqual([]);
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.session).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should start a study session', async () => {
    const mockSession = {
      id: 1,
      flashcard_set_id: 1,
      mode: 'simple',
      started_at: '2025-01-27T10:00:00Z'
    };
    (studySessionService.createStudySession as jest.Mock).mockResolvedValue({
      data: mockSession,
      status: 'success'
    });
    (flashcardService.getFlashcards as jest.Mock).mockResolvedValue({
      results: [
        { id: 1, front: 'Q1', back: 'A1' },
        { id: 2, front: 'Q2', back: 'A2' }
      ],
      status: 'success'
    });

    const { result } = renderHook(() => useStudySession(1), { wrapper });

    await act(async () => {
      await result.current.startSession('simple');
    });

    await waitFor(() => {
      expect(result.current.session).not.toBeNull();
    });

    expect(result.current.cards.length).toBeGreaterThan(0);
  });

  it('should record a card review', async () => {
    const mockCards = [
      { id: 1, front: 'Q1', back: 'A1' },
      { id: 2, front: 'Q2', back: 'A2' }
    ];
    (flashcardService.getFlashcards as jest.Mock).mockResolvedValue({
      results: mockCards,
      status: 'success'
    });
    (flashcardService.reviewFlashcard as jest.Mock).mockResolvedValue({
      data: { id: 1, next_review: '2025-01-28T10:00:00Z' },
      status: 'success'
    });
    (studySessionService.updateStudySession as jest.Mock).mockResolvedValue({
      data: { id: 1, cards_studied: 1, cards_correct: 1 },
      status: 'success'
    });

    const { result } = renderHook(() => useStudySession(1), { wrapper });

    await act(async () => {
      await result.current.startSession(1, 'simple');
    });

    await act(async () => {
      await result.current.recordReview(1, 5);
    });

    expect(flashcardService.reviewFlashcard).toHaveBeenCalledWith(1, 5);
  });

  it('should end a study session', async () => {
    const mockSession = {
      id: 1,
      flashcard_set_id: 1,
      mode: 'simple',
      started_at: '2025-01-27T10:00:00Z',
      cards_studied: 0,
      cards_correct: 0,
    };
    (studySessionService.endStudySession as jest.Mock).mockResolvedValue({
      data: { ...mockSession, ended_at: '2025-01-27T11:00:00Z' },
      status: 'success'
    });
    (studySessionService.getStudySessionStats as jest.Mock).mockResolvedValue({
      data: {
        id: 1,
        cards_studied: 0,
        cards_correct: 0,
        accuracy: 0,
        duration: 60,
        started_at: '2025-01-27T10:00:00Z',
        ended_at: '2025-01-27T11:00:00Z',
      },
      status: 'success'
    });

    const { result } = renderHook(() => useStudySession(1), { wrapper });

    // First start a session
    (studySessionService.createStudySession as jest.Mock).mockResolvedValue({
      data: mockSession,
      status: 'success'
    });
    (flashcardService.getFlashcards as jest.Mock).mockResolvedValue({
      results: [],
      status: 'success'
    });

    await act(async () => {
      await result.current.startSession(1, 'simple');
    });

    await waitFor(() => {
      expect(result.current.session).not.toBeNull();
    });

    // Now end the session
    await act(async () => {
      await result.current.endSession();
    });

    expect(studySessionService.endStudySession).toHaveBeenCalled();
  });
});

