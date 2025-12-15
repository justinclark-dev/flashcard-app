/**
 * NoteEditor Component
 * Form for creating and editing notes
 */
import React, { useState, useEffect } from 'react';
import * as notesService from '../../services/notes';
import * as categoriesService from '../../services/categories';
import * as tagsService from '../../services/tags';
import type { Category, Tag } from '../../services/notes';
import styles from './NoteEditor.module.css';

interface NoteEditorProps {
  noteId?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

export function NoteEditor({ noteId, onSave, onCancel }: NoteEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [sourceUrl, setSourceUrl] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagName, setSelectedTagName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCategories();
    loadTags();
    if (noteId) {
      loadNote();
    }
  }, [noteId]);

  const loadCategories = async () => {
    try {
      const response = await categoriesService.getCategories();
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadTags = async () => {
    try {
      const response = await tagsService.getTags();
      setTags(response.data);
    } catch (err) {
      console.error('Failed to load tags:', err);
    }
  };

  const loadNote = async () => {
    try {
      const response = await notesService.getNote(parseInt(noteId!));
      const note = response.data;
      setTitle(note.title);
      setContent(note.content);
      setCategoryId(note.category?.id || null);
      setTagIds(note.tags?.map(t => t.id) || []);
      setSourceUrl(note.source_url || '');
    } catch (err: any) {
      setError(err.message || 'Failed to load note');
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!content.trim()) {
      errors.content = 'Content is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validate()) {
      return;
    }

    setSaving(true);
    try {
      const data = {
        title: title.trim(),
        content: content.trim(),
        category_id: categoryId,
        tag_ids: tagIds,
        source_url: sourceUrl || undefined,
      };

      if (noteId) {
        await notesService.updateNote(parseInt(noteId), data);
      } else {
        await notesService.createNote(data);
      }

      if (onSave) {
        onSave();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && selectedTagName.trim()) {
      e.preventDefault();
      const tag = tags.find(t => t.name.toLowerCase() === selectedTagName.trim().toLowerCase());
      if (tag && !tagIds.includes(tag.id)) {
        setTagIds([...tagIds, tag.id]);
      }
      setSelectedTagName('');
    }
  };

  const handleTagRemove = (tagId: number) => {
    setTagIds(tagIds.filter(id => id !== tagId));
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}
      
      <div className={styles.field}>
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={validationErrors.title ? styles.inputError : ''}
        />
        {validationErrors.title && (
          <span className={styles.fieldError}>{validationErrors.title}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="content">Content *</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className={validationErrors.content ? styles.inputError : ''}
        />
        {validationErrors.content && (
          <span className={styles.fieldError}>{validationErrors.content}</span>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={categoryId || ''}
          onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : null)}
        >
          <option value="">No Category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="tags">Tags</label>
        <input
          id="tags"
          type="text"
          placeholder="Type tag name and press Enter"
          value={selectedTagName}
          onChange={(e) => setSelectedTagName(e.target.value)}
          onKeyDown={handleTagAdd}
        />
        {tagIds.length > 0 && (
          <div className={styles.selectedTags}>
            {tagIds.map(tagId => {
              const tag = tags.find(t => t.id === tagId);
              return tag ? (
                <span key={tagId} className={styles.tag}>
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tagId)}
                    className={styles.tagRemove}
                  >
                    ×
                  </button>
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="sourceUrl">Source URL</label>
        <input
          id="sourceUrl"
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      <div className={styles.actions}>
        <button type="submit" disabled={saving} className={styles.saveButton}>
          {saving ? 'Saving...' : 'Save'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={styles.cancelButton}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

