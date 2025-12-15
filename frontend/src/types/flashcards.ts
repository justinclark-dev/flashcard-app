/**
 * Type definitions for Flashcard feature
 */

export interface FlashcardSet {
  id: number;
  name: string;
  description?: string;
  category?: {
    id: number;
    name: string;
    color: string;
  } | null;
  card_count: number;
  created_at: string;
  updated_at: string;
}

export interface Flashcard {
  id: number;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  ease_factor: number;
  review_count: number;
  correct_count: number;
  last_studied: string | null;
  next_review: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudySession {
  id: number;
  user: number;
  flashcard_set?: {
    id: number;
    name: string;
  } | null;
  mode: 'simple' | 'spaced';
  started_at: string;
  ended_at: string | null;
  cards_studied: number;
  cards_correct: number;
  duration?: number;
  accuracy?: number;
}

export interface FlashcardFormData {
  front: string;
  back: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface FlashcardSetFormData {
  name: string;
  description?: string;
  category_id?: number | null;
}

export interface StudySessionFormData {
  flashcard_set_id: number;
  mode?: 'simple' | 'spaced';
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
  status: 'success';
}

export interface ReviewResponse {
  id: number;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  ease_factor: number;
  review_count: number;
  correct_count: number;
  last_studied: string | null;
  next_review: string | null;
  interval: number;
  created_at: string;
  updated_at: string;
}

