/**
 * useStudySession Hook
 * Custom hook for managing study session state and interactions
 */

import { useState, useCallback } from 'react';
import * as studySessionService from '../services/studySessions';
import * as flashcardService from '../services/flashcards';
import type { StudySession, Flashcard } from '../types/flashcards';

interface UseStudySessionResult {
  cards: Flashcard[];
  currentIndex: number;
  session: StudySession | null;
  loading: boolean;
  error: string | null;
  startSession: (flashcardSetId: number, mode: 'simple' | 'spaced') => Promise<void>;
  recordReview: (flashcardId: number, quality: number) => Promise<void>;
  endSession: () => Promise<void>;
  nextCard: () => void;
  previousCard: () => void;
  getCurrentCard: () => Flashcard | null;
}

export function useStudySession(flashcardSetId: number): UseStudySessionResult {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [session, setSession] = useState<StudySession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSession = useCallback(
    async (setId: number, mode: 'simple' | 'spaced') => {
      setLoading(true);
      setError(null);
      try {
        // Create study session
        const sessionResponse = await studySessionService.createStudySession({
          flashcard_set_id: setId,
          mode
        });
        setSession(sessionResponse.data);

        // Load flashcards
        const params = mode === 'spaced' ? { due_only: true } : {};
        const flashcardsResponse = await flashcardService.getFlashcards(setId, params);
        setCards(flashcardsResponse.results);
        setCurrentIndex(0);
      } catch (err: any) {
        setError(err.message || 'Failed to start study session');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const recordReview = useCallback(
    async (flashcardId: number, quality: number) => {
      if (!session) return;

      try {
        // Record review using SM-2 algorithm
        await flashcardService.reviewFlashcard(flashcardId, quality);

        // Update session statistics
        const isCorrect = quality >= 3;
        const newCardsStudied = session.cards_studied + 1;
        const newCardsCorrect = session.cards_correct + (isCorrect ? 1 : 0);

        await studySessionService.updateStudySession(session.id, {
          cards_studied: newCardsStudied,
          cards_correct: newCardsCorrect
        });

        // Update local session state
        setSession((prev) =>
          prev
            ? {
                ...prev,
                cards_studied: newCardsStudied,
                cards_correct: newCardsCorrect
              }
            : null
        );

        // Move to next card
        if (currentIndex < cards.length - 1) {
          setCurrentIndex(currentIndex + 1);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to record review');
        throw err;
      }
    },
    [session, currentIndex, cards.length]
  );

  const endSession = useCallback(async () => {
    if (!session) return;

    try {
      await studySessionService.endStudySession(session.id);
      const updatedSession = await studySessionService.getStudySessionStats(session.id);
      setSession((prev) => (prev ? { ...prev, ...updatedSession.data } : null));
    } catch (err: any) {
      setError(err.message || 'Failed to end study session');
    }
  }, [session]);

  const nextCard = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, cards.length]);

  const previousCard = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const getCurrentCard = useCallback(() => {
    return cards[currentIndex] || null;
  }, [cards, currentIndex]);

  return {
    cards,
    currentIndex,
    session,
    loading,
    error,
    startSession,
    recordReview,
    endSession,
    nextCard,
    previousCard,
    getCurrentCard
  };
}

