/**
 * Study Session Service
 * API client for study sessions
 */

import { get, post, patch } from './api';
import type {
  StudySession,
  StudySessionFormData,
  PaginatedResponse
} from '../types/flashcards';

export async function createStudySession(data: StudySessionFormData): Promise<{ data: StudySession; status: 'success' }> {
  const response = await post<{ data: StudySession; status: 'success' }>('/api/study-sessions/', {
    flashcard_set_id: data.flashcard_set_id,
    mode: data.mode || 'simple'
  });
  return response;
}

export async function updateStudySession(
  id: number,
  data: Partial<Pick<StudySession, 'cards_studied' | 'cards_correct'>>
): Promise<{ data: StudySession; status: 'success' }> {
  const response = await patch<{ data: StudySession; status: 'success' }>(`/api/study-sessions/${id}/`, data);
  return response;
}

export async function endStudySession(id: number): Promise<{ data: StudySession; status: 'success' }> {
  const response = await post<{ data: StudySession; status: 'success' }>(`/api/study-sessions/${id}/end/`);
  return response;
}

export async function getStudySessions(params?: Record<string, any>): Promise<PaginatedResponse<StudySession>> {
  const response = await get<PaginatedResponse<StudySession>>('/api/study-sessions/', params);
  return response;
}

export async function getStudySessionStats(id: number): Promise<{
  data: {
    id: number;
    cards_studied: number;
    cards_correct: number;
    accuracy: number;
    duration: number;
    started_at: string;
    ended_at: string | null;
  };
  status: 'success';
}> {
  const response = await get<{
    data: {
      id: number;
      cards_studied: number;
      cards_correct: number;
      accuracy: number;
      duration: number;
      started_at: string;
      ended_at: string | null;
    };
    status: 'success';
  }>(`/api/study-sessions/${id}/stats/`);
  return response;
}

