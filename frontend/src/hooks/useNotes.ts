/**
 * useNotes Hook
 * Custom hook for managing notes state and operations
 */
import { useState, useEffect, useCallback } from 'react';
import * as notesService from '../services/notes';
import type { Note, NoteCreateData, NoteUpdateData, NotesQueryParams } from '../services/notes';

interface UseNotesReturn {
  notes: Note[];
  loading: boolean;
  error: string | null;
  createNote: (data: NoteCreateData) => Promise<void>;
  updateNote: (id: number, data: NoteUpdateData) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
  filterByCategory: (categoryId: number | null) => Promise<void>;
  searchNotes: (query: string) => Promise<void>;
  sortNotes: (ordering: string) => Promise<void>;
  refreshNotes: () => Promise<void>;
}

export function useNotes(initialParams?: NotesQueryParams): UseNotesReturn {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<NotesQueryParams | undefined>(initialParams);

  const loadNotes = useCallback(async (queryParams?: NotesQueryParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await notesService.getNotes(queryParams || params);
      setNotes(response.results);
    } catch (err: any) {
      setError(err.message || 'Failed to load notes');
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    loadNotes(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createNote = useCallback(async (data: NoteCreateData) => {
    try {
      setError(null);
      await notesService.createNote(data);
      await loadNotes();
    } catch (err: any) {
      setError(err.message || 'Failed to create note');
      throw err;
    }
  }, [loadNotes]);

  const updateNote = useCallback(async (id: number, data: NoteUpdateData) => {
    try {
      setError(null);
      await notesService.updateNote(id, data);
      await loadNotes();
    } catch (err: any) {
      setError(err.message || 'Failed to update note');
      throw err;
    }
  }, [loadNotes]);

  const deleteNote = useCallback(async (id: number) => {
    try {
      setError(null);
      await notesService.deleteNote(id);
      await loadNotes();
    } catch (err: any) {
      setError(err.message || 'Failed to delete note');
      throw err;
    }
  }, [loadNotes]);

  const filterByCategory = useCallback(async (categoryId: number | null) => {
    const newParams = { ...params, category: categoryId || undefined };
    setParams(newParams);
    await loadNotes(newParams);
  }, [params, loadNotes]);

  const searchNotes = useCallback(async (query: string) => {
    const newParams = { ...params, search: query || undefined };
    setParams(newParams);
    await loadNotes(newParams);
  }, [params, loadNotes]);

  const sortNotes = useCallback(async (ordering: string) => {
    const newParams = { ...params, ordering: ordering || undefined };
    setParams(newParams);
    await loadNotes(newParams);
  }, [params, loadNotes]);

  const refreshNotes = useCallback(async () => {
    await loadNotes();
  }, [loadNotes]);

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    filterByCategory,
    searchNotes,
    sortNotes,
    refreshNotes,
  };
}

