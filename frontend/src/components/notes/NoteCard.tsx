/**
 * NoteCard Component
 * Displays a single note in card format
 */
import React from 'react';
import type { Note } from '../../services/notes';
import styles from './NoteCard.module.css';

interface NoteCardProps {
  note: Note;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function NoteCard({ note, onClick, onEdit, onDelete }: NoteCardProps) {
  const excerpt = note.content.length > 100 
    ? note.content.substring(0, 100) + '...'
    : note.content;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.header}>
        <h3 className={styles.title}>{note.title}</h3>
        {note.category && (
          <span 
            className={styles.category}
            style={{ backgroundColor: note.category.color }}
          >
            {note.category.name}
          </span>
        )}
      </div>
      
      <p className={styles.excerpt}>{excerpt}</p>
      
      {note.tags && note.tags.length > 0 && (
        <div className={styles.tags}>
          {note.tags.map(tag => (
            <span key={tag.id} className={styles.tag}>
              {tag.name}
            </span>
          ))}
        </div>
      )}
      
      <div className={styles.footer}>
        <span className={styles.date}>{formatDate(note.created_at)}</span>
        <div className={styles.actions}>
          {onEdit && (
            <button 
              className={styles.editButton}
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button 
              className={styles.deleteButton}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

