/**
 * Test: useNotes Hook
 * Purpose: Verify notes hook functionality, state management, and API integration
 * Coverage: Loading states, error handling, CRUD operations, filtering, search
 * 
 * Created by: TDD Agent
 * Date: 2025-01-27
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider } from '../../contexts/AuthContext';
import { useNotes } from '../useNotes';
import * as notesService from '../../services/notes';

// Mock the notes service
jest.mock('../../services/notes', () => ({
  getNotes: jest.fn(),
  getNote: jest.fn(),
  createNote: jest.fn(),
  updateNote: jest.fn(),
  deleteNote: jest.fn(),
}));

// Wrapper component for tests
const wrapper = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(AuthProvider, null, children);
};

describe('useNotes Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty notes and loading state', () => {
    (notesService.getNotes as jest.Mock).mockResolvedValue({
      count: 0,
      results: [],
      status: 'success',
    });

    const { result } = renderHook(() => useNotes(), { wrapper });

    expect(result.current.notes).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should load notes on mount', async () => {
    const mockNotes = {
      count: 2,
      results: [
        { id: 1, title: 'Note 1', content: 'Content 1' },
        { id: 2, title: 'Note 2', content: 'Content 2' },
      ],
      status: 'success',
    };

    (notesService.getNotes as jest.Mock).mockResolvedValue(mockNotes);

    const { result } = renderHook(() => useNotes(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.notes).toEqual(mockNotes.results);
    expect(notesService.getNotes).toHaveBeenCalled();
  });

  it('should handle error when loading notes fails', async () => {
    const error = new Error('Failed to load notes');
    (notesService.getNotes as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useNotes(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to load notes');
    expect(result.current.notes).toEqual([]);
  });

  it('should create a note successfully', async () => {
    const mockNote = {
      data: {
        id: 1,
        title: 'New Note',
        content: 'Content',
      },
      status: 'success',
    };

    (notesService.getNotes as jest.Mock).mockResolvedValue({
      count: 0,
      results: [],
      status: 'success',
    });
    (notesService.createNote as jest.Mock).mockResolvedValue(mockNote);

    const { result } = renderHook(() => useNotes(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.createNote({
        title: 'New Note',
        content: 'Content',
      });
    });

    expect(notesService.createNote).toHaveBeenCalledWith({
      title: 'New Note',
      content: 'Content',
    });
  });

  it('should update a note successfully', async () => {
    const mockNote = {
      data: {
        id: 1,
        title: 'Updated Note',
        content: 'Updated content',
      },
      status: 'success',
    };

    (notesService.getNotes as jest.Mock).mockResolvedValue({
      count: 1,
      results: [{ id: 1, title: 'Original Note', content: 'Content' }],
      status: 'success',
    });
    (notesService.updateNote as jest.Mock).mockResolvedValue(mockNote);

    const { result } = renderHook(() => useNotes(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateNote(1, {
        title: 'Updated Note',
        content: 'Updated content',
      });
    });

    expect(notesService.updateNote).toHaveBeenCalledWith(1, {
      title: 'Updated Note',
      content: 'Updated content',
    });
  });

  it('should delete a note successfully', async () => {
    (notesService.getNotes as jest.Mock).mockResolvedValue({
      count: 1,
      results: [{ id: 1, title: 'Note to Delete', content: 'Content' }],
      status: 'success',
    });
    (notesService.deleteNote as jest.Mock).mockResolvedValue({});

    const { result } = renderHook(() => useNotes(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteNote(1);
    });

    expect(notesService.deleteNote).toHaveBeenCalledWith(1);
  });

  it('should filter notes by category', async () => {
    (notesService.getNotes as jest.Mock).mockResolvedValue({
      count: 1,
      results: [{ id: 1, title: 'Note', content: 'Content', category: { id: 1, name: 'Python' } }],
      status: 'success',
    });

    const { result } = renderHook(() => useNotes(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.filterByCategory(1);
    });

    expect(notesService.getNotes).toHaveBeenCalledWith({ category: 1 });
  });

  it('should search notes', async () => {
    (notesService.getNotes as jest.Mock).mockResolvedValue({
      count: 1,
      results: [{ id: 1, title: 'Python Note', content: 'Content' }],
      status: 'success',
    });

    const { result } = renderHook(() => useNotes(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.searchNotes('Python');
    });

    expect(notesService.getNotes).toHaveBeenCalledWith({ search: 'Python' });
  });

  it('should refresh notes list', async () => {
    (notesService.getNotes as jest.Mock).mockResolvedValue({
      count: 0,
      results: [],
      status: 'success',
    });

    const { result } = renderHook(() => useNotes(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const initialCallCount = (notesService.getNotes as jest.Mock).mock.calls.length;

    await act(async () => {
      await result.current.refreshNotes();
    });

    expect(notesService.getNotes).toHaveBeenCalledTimes(initialCallCount + 1);
  });
});

