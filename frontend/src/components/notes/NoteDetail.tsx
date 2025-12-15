/**
 * NoteDetail Component
 * Displays a single note in detail view
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as notesService from '../../services/notes';
import type { Note } from '../../services/notes';
import { ExportMenu } from '../common/ExportMenu';
import styles from './NoteDetail.module.css';

export function NoteDetail() {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (noteId) {
      loadNote();
    }
  }, [noteId]);

  const loadNote = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await notesService.getNote(parseInt(noteId!));
      setNote(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load note');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!note || !window.confirm(`Are you sure you want to delete "${note.title}"?`)) {
      return;
    }

    try {
      await notesService.deleteNote(note.id);
      navigate('/notes');
    } catch (err: any) {
      setError(err.message || 'Failed to delete note');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className={styles.loading}>Loading note...</div>;
  }

  if (error || !note) {
    return (
      <div className={styles.error}>
        {error || 'Note not found'}
        <Link to="/notes" className={styles.backLink}>Back to Notes</Link>
      </div>
    );
  }

  return (
    <div className={styles.noteDetail}>
      <div className={styles.header}>
        <Link to="/notes" className={styles.backLink}>← Back to Notes</Link>
        <div className={styles.actions}>
          <Link to={`/notes/${note.id}/edit`} className={styles.editButton}>
            Edit
          </Link>
          <button onClick={handleDelete} className={styles.deleteButton}>
            Delete
          </button>
        </div>
      </div>

      <article className={styles.content}>
        <h1 className={styles.title}>{note.title}</h1>

        <div className={styles.meta}>
          {note.category && (
            <span
              className={styles.category}
              style={{ backgroundColor: note.category.color }}
            >
              {note.category.name}
            </span>
          )}
          <span className={styles.date}>Created: {formatDate(note.created_at)}</span>
          {note.updated_at !== note.created_at && (
            <span className={styles.date}>Updated: {formatDate(note.updated_at)}</span>
          )}
        </div>

        {note.tags && note.tags.length > 0 && (
          <div className={styles.tags}>
            {note.tags.map(tag => (
              <span key={tag.id} className={styles.tag}>
                {tag.name}
              </span>
            ))}
          </div>
        )}

        <div className={styles.body}>
          <pre className={styles.textContent}>{note.content}</pre>
        </div>

        {note.source_url && (
          <div className={styles.source}>
            <strong>Source:</strong>{' '}
            <a href={note.source_url} target="_blank" rel="noopener noreferrer">
              {note.source_url}
            </a>
          </div>
        )}
      </article>
    </div>
  );
}

