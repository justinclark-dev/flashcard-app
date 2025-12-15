/**
 * StudyMode Component
 * Simple study mode: flip cards and mark correct/incorrect
 */

import React, { useState, useEffect } from 'react';
import { useStudySession } from '../../hooks/useStudySession';
import styles from './StudyMode.module.css';
import type { Flashcard } from '../../types/flashcards';

interface StudyModeProps {
  flashcardSetId: number;
  mode?: 'simple';
  onComplete?: () => void;
}

export function StudyMode({ flashcardSetId, mode = 'simple', onComplete }: StudyModeProps) {
  const { cards, currentIndex, session, loading, error, startSession, recordReview, endSession, getCurrentCard } =
    useStudySession(flashcardSetId);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    startSession(flashcardSetId, mode);
  }, [flashcardSetId, mode, startSession]);

  useEffect(() => {
    if (currentIndex >= cards.length && cards.length > 0 && !completed) {
      handleComplete();
    }
  }, [currentIndex, cards.length, completed]);

  const handleComplete = async () => {
    if (session) {
      await endSession();
      setCompleted(true);
      onComplete?.();
    }
  };

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const handleAnswer = async (isCorrect: boolean) => {
    const currentCard = getCurrentCard();
    if (!currentCard || !session) return;

    const quality = isCorrect ? 5 : 0; // Simple mode: correct = 5, incorrect = 0
    try {
      await recordReview(currentCard.id, quality);
      setFlipped(false);
    } catch (err) {
      // Error handled by hook
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading flashcards...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  if (cards.length === 0) {
    return <div className={styles.emptyState}>No flashcards available in this set.</div>;
  }

  if (completed) {
    return (
      <div className={styles.completed}>
        <h2>Study Session Complete!</h2>
        {session && (
          <div className={styles.stats}>
            <p>Cards Studied: {session.cards_studied}</p>
            <p>Cards Correct: {session.cards_correct}</p>
            <p>Accuracy: {session.accuracy?.toFixed(1)}%</p>
          </div>
        )}
      </div>
    );
  }

  const currentCard = getCurrentCard();
  if (!currentCard) {
    return <div className={styles.loading}>Loading card...</div>;
  }

  return (
    <div className={styles.studyMode}>
      <div className={styles.progress}>
        Card {currentIndex + 1} of {cards.length}
      </div>

      <div className={`${styles.flashcard} ${flipped ? styles.flipped : ''}`} onClick={handleFlip}>
        <div className={styles.flashcardInner}>
          <div className={styles.cardFront}>
            <div className={styles.cardContent}>
              <h3>Question</h3>
              <p>{currentCard.front}</p>
              <div className={styles.flipHint}>Click to reveal answer</div>
            </div>
          </div>
          <div className={styles.cardBack}>
            <div className={styles.cardContent}>
              <h3>Answer</h3>
              <p>{currentCard.back}</p>
            </div>
          </div>
        </div>
      </div>

      {flipped && (
        <div className={styles.answerButtons}>
          <button className={styles.incorrectButton} onClick={() => handleAnswer(false)}>
            Incorrect
          </button>
          <button className={styles.correctButton} onClick={() => handleAnswer(true)}>
            Correct
          </button>
        </div>
      )}
    </div>
  );
}

