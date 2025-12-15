/**
 * FlashcardEditorRoute Component
 * Wrapper component that extracts route params for FlashcardEditor
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FlashcardEditor } from './FlashcardEditor';

export function FlashcardEditorRoute() {
  const { setId, flashcardId } = useParams<{ setId?: string; flashcardId?: string }>();
  const navigate = useNavigate();

  if (!setId) {
    return <div>Flashcard Set ID is required</div>;
  }

  return (
    <FlashcardEditor
      flashcardSetId={parseInt(setId)}
      flashcardId={flashcardId ? parseInt(flashcardId) : undefined}
      onSave={() => navigate(`/flashcards/${setId}`)}
      onCancel={() => navigate(`/flashcards/${setId}`)}
    />
  );
}

