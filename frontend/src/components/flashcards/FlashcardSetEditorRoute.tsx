/**
 * FlashcardSetEditorRoute Component
 * Wrapper component that handles routing for FlashcardSetEditor
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FlashcardSetEditor } from './FlashcardSetEditor';

export function FlashcardSetEditorRoute() {
  const { setId } = useParams<{ setId?: string }>();
  const navigate = useNavigate();

  const handleSave = () => {
    // After creating/updating, navigate to the flashcard sets list
    navigate('/flashcards');
  };

  const handleCancel = () => {
    navigate('/flashcards');
  };

  return (
    <FlashcardSetEditor
      flashcardSetId={setId ? parseInt(setId) : undefined}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}

