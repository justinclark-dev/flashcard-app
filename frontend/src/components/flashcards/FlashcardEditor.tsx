/**
 * FlashcardEditor Component
 * Form for creating and editing flashcards
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useFlashcards } from '../../hooks/useFlashcards';
import styles from './FlashcardEditor.module.css';
import type { FlashcardFormData } from '../../types/flashcards';

const schema = yup.object().shape({
  front: yup.string().required('Front is required').min(1, 'Front cannot be empty'),
  back: yup.string().required('Back is required').min(1, 'Back cannot be empty'),
  difficulty: yup.string().oneOf(['easy', 'medium', 'hard'], 'Invalid difficulty').notRequired()
});

interface FlashcardEditorProps {
  flashcardSetId: number;
  flashcardId?: number;
  onSave?: () => void;
  onCancel?: () => void;
}

export function FlashcardEditor({ flashcardSetId, flashcardId, onSave, onCancel }: FlashcardEditorProps) {
  const { getFlashcards, createFlashcard, updateFlashcard } = useFlashcards();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<FlashcardFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      front: '',
      back: '',
      difficulty: 'medium'
    }
  });

  useEffect(() => {
    if (flashcardId) {
      // Load existing flashcard
      getFlashcards(flashcardSetId)
        .then((flashcards) => {
          const flashcard = flashcards.find((f) => f.id === flashcardId);
          if (flashcard) {
            setValue('front', flashcard.front);
            setValue('back', flashcard.back);
            setValue('difficulty', flashcard.difficulty);
          } else {
            setError('Flashcard not found');
          }
        })
        .catch((err) => {
          setError(err.message || 'Failed to load flashcard');
        });
    }
  }, [flashcardId, flashcardSetId, getFlashcards, setValue]);

  const onSubmit = async (data: FlashcardFormData) => {
    setLoading(true);
    setError(null);
    try {
      if (flashcardId) {
        await updateFlashcard(flashcardSetId, flashcardId, data);
      } else {
        await createFlashcard(flashcardSetId, data);
      }
      onSave?.();
    } catch (err: any) {
      setError(err.message || 'Failed to save flashcard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.flashcardEditor}>
      <h2>{flashcardId ? 'Edit Flashcard' : 'Create New Flashcard'}</h2>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.formGroup}>
        <label htmlFor="front">Front (Question)</label>
        <textarea id="front" {...register('front')} className={styles.textarea} rows={4} />
        {errors.front && <p className={styles.errorText}>{errors.front.message}</p>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="back">Back (Answer)</label>
        <textarea id="back" {...register('back')} className={styles.textarea} rows={4} />
        {errors.back && <p className={styles.errorText}>{errors.back.message}</p>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="difficulty">Difficulty</label>
        <select id="difficulty" {...register('difficulty')} className={styles.select}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        {errors.difficulty && <p className={styles.errorText}>{errors.difficulty.message}</p>}
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.saveButton} disabled={loading}>
          {loading ? 'Saving...' : flashcardId ? 'Update Flashcard' : 'Create Flashcard'}
        </button>
        <button type="button" onClick={onCancel} className={styles.cancelButton} disabled={loading}>
          Cancel
        </button>
      </div>
    </form>
  );
}

