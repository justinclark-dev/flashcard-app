/**
 * StudyModeRoute Component
 * Wrapper component that extracts route params for StudyMode
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StudyMode } from './StudyMode';

export function StudyModeRoute() {
  const { setId } = useParams<{ setId?: string }>();
  const navigate = useNavigate();

  if (!setId) {
    return <div>Flashcard Set ID is required</div>;
  }

  return (
    <StudyMode
      flashcardSetId={parseInt(setId)}
      mode="simple"
      onComplete={() => navigate(`/flashcards/${setId}`)}
    />
  );
}

