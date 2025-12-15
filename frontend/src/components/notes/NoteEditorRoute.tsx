/**
 * NoteEditorRoute Component
 * Wrapper component that extracts route params for NoteEditor
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { NoteEditor } from './NoteEditor';

export function NoteEditorRoute() {
  const { noteId } = useParams<{ noteId?: string }>();
  const navigate = useNavigate();

  return (
    <NoteEditor
      noteId={noteId}
      onSave={() => navigate('/notes')}
      onCancel={() => navigate('/notes')}
    />
  );
}

