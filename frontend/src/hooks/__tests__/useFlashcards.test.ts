/**
 * useFlashcards Hook Tests
 * Tests for the useFlashcards custom hook
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider } from '../../contexts/AuthContext';
import { useFlashcards } from '../useFlashcards';
import * as flashcardService from '../../services/flashcards';

jest.mock('../../services/flashcards', () => ({
  getFlashcardSets: jest.fn(),
  getFlashcardSet: jest.fn(),
  createFlashcardSet: jest.fn(),
  updateFlashcardSet: jest.fn(),
  deleteFlashcardSet: jest.fn(),
  getFlashcards: jest.fn(),
  createFlashcard: jest.fn(),
  updateFlashcard: jest.fn(),
  deleteFlashcard: jest.fn(),
  reviewFlashcard: jest.fn(),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(AuthProvider, null, children);
};

describe('useFlashcards Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty flashcard sets and loading state', () => {
    const { result } = renderHook(() => useFlashcards(), { wrapper });

    expect(result.current.flashcardSets).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should load flashcard sets on mount', async () => {
    const mockSets = [
      { id: 1, name: 'Set 1', card_count: 10 },
      { id: 2, name: 'Set 2', card_count: 5 }
    ];
    (flashcardService.getFlashcardSets as jest.Mock).mockResolvedValue({
      results: mockSets,
      status: 'success'
    });

    const { result } = renderHook(() => useFlashcards(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.flashcardSets).toEqual(mockSets);
  });

  it('should handle error when loading flashcard sets fails', async () => {
    (flashcardService.getFlashcardSets as jest.Mock).mockRejectedValue(
      new Error('Failed to load')
    );

    const { result } = renderHook(() => useFlashcards(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load');
    expect(result.current.flashcardSets).toEqual([]);
  });

  it('should create a flashcard set successfully', async () => {
    const mockSet = { id: 1, name: 'New Set', card_count: 0 };
    (flashcardService.createFlashcardSet as jest.Mock).mockResolvedValue({
      data: mockSet,
      status: 'success'
    });
    (flashcardService.getFlashcardSets as jest.Mock).mockResolvedValue({
      results: [mockSet],
      status: 'success'
    });

    const { result } = renderHook(() => useFlashcards(), { wrapper });

    await act(async () => {
      await result.current.createFlashcardSet({
        name: 'New Set',
        description: 'Description'
      });
    });

    expect(flashcardService.createFlashcardSet).toHaveBeenCalled();
  });

  it('should delete a flashcard set successfully', async () => {
    (flashcardService.deleteFlashcardSet as jest.Mock).mockResolvedValue({});
    (flashcardService.getFlashcardSets as jest.Mock).mockResolvedValue({
      results: [],
      status: 'success'
    });

    const { result } = renderHook(() => useFlashcards(), { wrapper });

    await act(async () => {
      await result.current.deleteFlashcardSet(1);
    });

    expect(flashcardService.deleteFlashcardSet).toHaveBeenCalledWith(1);
  });

  it('should filter flashcard sets by category', async () => {
    const mockSets = [{ id: 1, name: 'Set 1', category: { id: 1 } }];
    (flashcardService.getFlashcardSets as jest.Mock).mockResolvedValue({
      results: mockSets,
      status: 'success'
    });

    const { result } = renderHook(() => useFlashcards(), { wrapper });

    await act(async () => {
      await result.current.filterByCategory(1);
    });

    expect(flashcardService.getFlashcardSets).toHaveBeenCalledWith(
      expect.objectContaining({ category: 1 })
    );
  });
});

