/**
 * Flashcard Service
 * API client for flashcard sets and flashcards
 */

import { get, post, put, patch, del } from './api';
import type {
  FlashcardSet,
  Flashcard,
  FlashcardFormData,
  FlashcardSetFormData,
  PaginatedResponse,
  ReviewResponse
} from '../types/flashcards';

export async function getFlashcardSets(params?: Record<string, any>): Promise<PaginatedResponse<FlashcardSet>> {
  const response = await get<PaginatedResponse<FlashcardSet>>('/api/flashcard-sets/', params);
  return response;
}

export async function getFlashcardSet(id: number): Promise<{ data: FlashcardSet; status: 'success' }> {
  const response = await get<{ data: FlashcardSet; status: 'success' }>('/api/flashcard-sets/' + id + '/');
  return response;
}

export async function createFlashcardSet(data: FlashcardSetFormData): Promise<{ data: FlashcardSet; status: 'success' }> {
  const response = await post<{ data: FlashcardSet; status: 'success' }>('/api/flashcard-sets/', data);
  return response;
}

export async function updateFlashcardSet(
  id: number,
  data: Partial<FlashcardSetFormData>
): Promise<{ data: FlashcardSet; status: 'success' }> {
  const response = await put<{ data: FlashcardSet; status: 'success' }>('/api/flashcard-sets/' + id + '/', data);
  return response;
}

export async function deleteFlashcardSet(id: number): Promise<void> {
  await del('/api/flashcard-sets/' + id + '/');
}

export async function getFlashcards(
  flashcardSetId: number,
  params?: Record<string, any>
): Promise<PaginatedResponse<Flashcard>> {
  const response = await get<PaginatedResponse<Flashcard>>(
    `/api/flashcard-sets/${flashcardSetId}/flashcards/`,
    params
  );
  return response;
}

export async function getFlashcard(flashcardSetId: number, id: number): Promise<{ data: Flashcard; status: 'success' }> {
  const response = await get<{ data: Flashcard; status: 'success' }>(
    `/api/flashcard-sets/${flashcardSetId}/flashcards/${id}/`
  );
  return response;
}

export async function createFlashcard(
  flashcardSetId: number,
  data: FlashcardFormData
): Promise<{ data: Flashcard; status: 'success' }> {
  const response = await post<{ data: Flashcard; status: 'success' }>(
    `/api/flashcard-sets/${flashcardSetId}/flashcards/`,
    data
  );
  return response;
}

export async function updateFlashcard(
  flashcardSetId: number,
  id: number,
  data: Partial<FlashcardFormData>
): Promise<{ data: Flashcard; status: 'success' }> {
  const response = await put<{ data: Flashcard; status: 'success' }>(
    `/api/flashcard-sets/${flashcardSetId}/flashcards/${id}/`,
    data
  );
  return response;
}

export async function deleteFlashcard(flashcardSetId: number, id: number): Promise<void> {
  await del(`/api/flashcard-sets/${flashcardSetId}/flashcards/${id}/`);
}

export async function reviewFlashcard(id: number, quality: number): Promise<{ data: ReviewResponse; status: 'success' }> {
  const response = await post<{ data: ReviewResponse; status: 'success' }>(`/api/flashcards/${id}/review/`, {
    quality
  });
  return response;
}

