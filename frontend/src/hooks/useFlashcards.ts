/**
 * useFlashcards Hook
 * Custom hook for managing flashcard sets and flashcards
 */

import { useState, useEffect, useCallback } from 'react';
import * as flashcardService from '../services/flashcards';
import * as categoriesService from '../services/categories';
import type { FlashcardSet, Flashcard, FlashcardFormData, FlashcardSetFormData } from '../types/flashcards';

interface UseFlashcardsResult {
  flashcardSets: FlashcardSet[];
  loading: boolean;
  error: string | null;
  fetchFlashcardSets: (params?: Record<string, any>) => Promise<void>;
  getFlashcardSet: (id: number) => Promise<FlashcardSet | null>;
  createFlashcardSet: (data: FlashcardSetFormData) => Promise<FlashcardSet | null>;
  updateFlashcardSet: (id: number, data: Partial<FlashcardSetFormData>) => Promise<FlashcardSet | null>;
  deleteFlashcardSet: (id: number) => Promise<void>;
  getFlashcards: (flashcardSetId: number, params?: Record<string, any>) => Promise<Flashcard[]>;
  createFlashcard: (flashcardSetId: number, data: FlashcardFormData) => Promise<Flashcard | null>;
  updateFlashcard: (flashcardSetId: number, id: number, data: Partial<FlashcardFormData>) => Promise<Flashcard | null>;
  deleteFlashcard: (flashcardSetId: number, id: number) => Promise<void>;
  reviewFlashcard: (id: number, quality: number) => Promise<any>;
  filterByCategory: (categoryId: number | null) => Promise<void>;
}

export function useFlashcards(): UseFlashcardsResult {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCategoryFilter, setCurrentCategoryFilter] = useState<number | null>(null);

  const fetchFlashcardSets = useCallback(async (params?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await flashcardService.getFlashcardSets(params);
      setFlashcardSets(response.results);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch flashcard sets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlashcardSets();
  }, [fetchFlashcardSets]);

  const getFlashcardSet = useCallback(async (id: number) => {
    try {
      const response = await flashcardService.getFlashcardSet(id);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch flashcard set');
      return null;
    }
  }, []);

  const createFlashcardSet = useCallback(async (data: FlashcardSetFormData) => {
    try {
      const response = await flashcardService.createFlashcardSet(data);
      setFlashcardSets((prev) => [response.data, ...prev]);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to create flashcard set');
      return null;
    }
  }, []);

  const updateFlashcardSet = useCallback(async (id: number, data: Partial<FlashcardSetFormData>) => {
    try {
      const response = await flashcardService.updateFlashcardSet(id, data);
      setFlashcardSets((prev) => prev.map((set) => (set.id === response.data.id ? response.data : set)));
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to update flashcard set');
      return null;
    }
  }, []);

  const deleteFlashcardSet = useCallback(async (id: number) => {
    try {
      await flashcardService.deleteFlashcardSet(id);
      setFlashcardSets((prev) => prev.filter((set) => set.id !== id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete flashcard set');
    }
  }, []);

  const getFlashcards = useCallback(async (flashcardSetId: number, params?: Record<string, any>) => {
    try {
      const response = await flashcardService.getFlashcards(flashcardSetId, params);
      return response.results;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch flashcards');
      return [];
    }
  }, []);

  const createFlashcard = useCallback(async (flashcardSetId: number, data: FlashcardFormData) => {
    try {
      const response = await flashcardService.createFlashcard(flashcardSetId, data);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to create flashcard');
      return null;
    }
  }, []);

  const updateFlashcard = useCallback(
    async (flashcardSetId: number, id: number, data: Partial<FlashcardFormData>) => {
      try {
        const response = await flashcardService.updateFlashcard(flashcardSetId, id, data);
        return response.data;
      } catch (err: any) {
        setError(err.message || 'Failed to update flashcard');
        return null;
      }
    },
    []
  );

  const deleteFlashcard = useCallback(async (flashcardSetId: number, id: number) => {
    try {
      await flashcardService.deleteFlashcard(flashcardSetId, id);
    } catch (err: any) {
      setError(err.message || 'Failed to delete flashcard');
    }
  }, []);

  const reviewFlashcard = useCallback(async (id: number, quality: number) => {
    try {
      const response = await flashcardService.reviewFlashcard(id, quality);
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Failed to review flashcard');
      throw err;
    }
  }, []);

  const filterByCategory = useCallback(
    async (categoryId: number | null) => {
      setCurrentCategoryFilter(categoryId);
      const params = categoryId ? { category: categoryId } : {};
      await fetchFlashcardSets(params);
    },
    [fetchFlashcardSets]
  );

  return {
    flashcardSets,
    loading,
    error,
    fetchFlashcardSets,
    getFlashcardSet,
    createFlashcardSet,
    updateFlashcardSet,
    deleteFlashcardSet,
    getFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    reviewFlashcard,
    filterByCategory
  };
}

