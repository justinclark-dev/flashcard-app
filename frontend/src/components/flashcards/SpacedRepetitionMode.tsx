/**
 * SpacedRepetitionMode Component
 * Spaced repetition study mode with quality rating (0-5)
 */

import React, { useState, useEffect } from 'react';
import { useStudySession } from '../../hooks/useStudySession';
import styles from './SpacedRepetitionMode.module.css';
import type { Flashcard } from '../../types/flashcards';

interface SpacedRepetitionModeProps {
  flashcardSetId: number;
  mode?: 'spaced';
  onComplete?: () => void;
}

const QUALITY_LABELS = {
  0: 'Complete Blackout',
  1: 'Incorrect',
  2: 'Incorrect (with difficulty)',
  3: 'Correct (with difficulty)',
  4: 'Correct (after hesitation)',
  5: 'Perfect'
};

export function SpacedRepetitionMode({ flashcardSetId, mode = 'spaced', onComplete }: SpacedRepetitionModeProps) {
  const { cards, currentIndex, session, loading, error, startSession, recordReview, endSession, getCurrentCard } =
    useStudySession(flashcardSetId);
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [lastReview, setLastReview] = useState<{ interval: number; next_review: string } | null>(null);

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

  const handleQuality = async (quality: number) => {
    const currentCard = getCurrentCard();
    if (!currentCard || !session) return;

    try {
      const result = await recordReview(currentCard.id, quality);
      setLastReview({
        interval: result.interval || 0,
        next_review: result.next_review || ''
      });
      setFlipped(false);
      // Clear last review after a delay
      setTimeout(() => setLastReview(null), 3000);
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
    return <div className={styles.emptyState}>No cards due for review. Great job!</div>;
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
    <div className={styles.spacedRepetitionMode}>
      <div className={styles.progress}>
        Card {currentIndex + 1} of {cards.length}
      </div>

      {lastReview && (
        <div className={styles.reviewFeedback}>
          <p>Next review in {lastReview.interval} {lastReview.interval === 1 ? 'day' : 'days'}</p>
        </div>
      )}

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
        <div className={styles.qualityButtons}>
          <p className={styles.qualityPrompt}>How well did you know this?</p>
          <div className={styles.qualityGrid}>
            {[0, 1, 2, 3, 4, 5].map((quality) => (
              <button
                key={quality}
                className={`${styles.qualityButton} ${styles[`quality${quality}`]}`}
                onClick={() => handleQuality(quality)}
              >
                <span className={styles.qualityNumber}>{quality}</span>
                <span className={styles.qualityLabel}>{QUALITY_LABELS[quality as keyof typeof QUALITY_LABELS]}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

