/**
 * SpacedRepetitionModeRoute Component
 * Wrapper component that extracts route params for SpacedRepetitionMode
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SpacedRepetitionMode } from './SpacedRepetitionMode';

export function SpacedRepetitionModeRoute() {
  const { setId } = useParams<{ setId?: string }>();
  const navigate = useNavigate();

  if (!setId) {
    return <div>Flashcard Set ID is required</div>;
  }

  return (
    <SpacedRepetitionMode
      flashcardSetId={parseInt(setId)}
      onComplete={() => navigate(`/flashcards/${setId}`)}
    />
  );
}

