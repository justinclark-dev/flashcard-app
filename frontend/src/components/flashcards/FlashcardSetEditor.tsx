/**
 * FlashcardSetEditor Component
 * Form for creating and editing flashcard sets
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useFlashcards } from '../../hooks/useFlashcards';
import * as categoriesService from '../../services/categories';
import styles from './FlashcardSetEditor.module.css';
import type { FlashcardSetFormData } from '../../types/flashcards';
import type { Category } from '../../services/notes';

const schema = yup.object().shape({
  name: yup.string().required('Name is required').min(1, 'Name cannot be empty'),
  description: yup.string().notRequired(),
  category_id: yup
    .number()
    .nullable()
    .transform((value, originalValue) => {
      // Convert empty string to null
      return originalValue === '' || originalValue === null || isNaN(originalValue) ? null : value;
    })
    .notRequired()
});

interface FlashcardSetEditorProps {
  flashcardSetId?: number;
  onSave?: () => void;
  onCancel?: () => void;
}

export function FlashcardSetEditor({ flashcardSetId, onSave, onCancel }: FlashcardSetEditorProps) {
  const { getFlashcardSet, createFlashcardSet, updateFlashcardSet } = useFlashcards();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<FlashcardSetFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      category_id: null
    }
  });

  useEffect(() => {
    // Load categories
    categoriesService
      .getCategories()
      .then((response) => {
        setCategories(response.data || []);
      })
      .catch((err) => {
        console.error('Failed to load categories:', err);
        // Categories are optional, so we continue without them
      });

    // Load existing flashcard set if editing
    if (flashcardSetId) {
      getFlashcardSet(flashcardSetId)
        .then((set) => {
          if (set) {
            setValue('name', set.name);
            setValue('description', set.description || '');
            setValue('category_id', set.category?.id || null);
          } else {
            setError('Flashcard set not found');
          }
        })
        .catch((err) => {
          setError(err.message || 'Failed to load flashcard set');
        });
    }
  }, [flashcardSetId, getFlashcardSet, setValue]);

  const onSubmit = async (data: FlashcardSetFormData) => {
    setLoading(true);
    setError(null);
    try {
      // Ensure category_id is null (not NaN) if empty
      const submitData = {
        ...data,
        category_id: data.category_id === null || (typeof data.category_id === 'number' && isNaN(data.category_id)) ? null : data.category_id
      };
      
      if (flashcardSetId) {
        await updateFlashcardSet(flashcardSetId, submitData);
      } else {
        await createFlashcardSet(submitData);
      }
      onSave?.();
    } catch (err: any) {
      setError(err.message || 'Failed to save flashcard set');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.flashcardSetEditor}>
      <h2>{flashcardSetId ? 'Edit Flashcard Set' : 'Create New Flashcard Set'}</h2>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.formGroup}>
        <label htmlFor="name">Name *</label>
        <input id="name" {...register('name')} className={styles.input} />
        {errors.name && <p className={styles.errorText}>{errors.name.message}</p>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          {...register('description')}
          className={styles.textarea}
          rows={4}
        />
        {errors.description && <p className={styles.errorText}>{errors.description.message}</p>}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="category">Category</label>
        <select
          id="category"
          {...register('category_id', {
            setValueAs: (value) => {
              // Convert empty string to null, otherwise parse as number
              return value === '' || value === null ? null : Number(value);
            }
          })}
          className={styles.select}
        >
          <option value="">No Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.category_id && <p className={styles.errorText}>{errors.category_id.message}</p>}
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.saveButton} disabled={loading}>
          {loading ? 'Saving...' : flashcardSetId ? 'Update Flashcard Set' : 'Create Flashcard Set'}
        </button>
        <button type="button" onClick={onCancel} className={styles.cancelButton} disabled={loading}>
          Cancel
        </button>
      </div>
    </form>
  );
}

