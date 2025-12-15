/**
 * ExportMenu Component
 * Dropdown menu for exporting notes and flashcard sets
 */

import React, { useState, useRef, useEffect } from 'react';
import { downloadNoteAsMarkdown, downloadNotesAsMarkdown, exportNoteAsPDF } from '../../utils/export';
import type { Note } from '../../services/notes';
import type { FlashcardSet, Flashcard } from '../../types/flashcards';
import { downloadFlashcardSetAsJSON } from '../../utils/export';
import styles from './ExportMenu.module.css';

interface ExportMenuProps {
  type: 'note' | 'notes' | 'flashcard-set';
  note?: Note;
  notes?: Note[];
  flashcardSet?: FlashcardSet;
  flashcards?: Flashcard[];
  onClose?: () => void;
}

export function ExportMenu({
  type,
  note,
  notes,
  flashcardSet,
  flashcards,
  onClose,
}: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleExportMarkdown = () => {
    if (type === 'note' && note) {
      downloadNoteAsMarkdown(note);
    } else if (type === 'notes' && notes) {
      downloadNotesAsMarkdown(notes);
    }
    setIsOpen(false);
    onClose?.();
  };

  const handleExportPDF = () => {
    if (type === 'note' && note) {
      exportNoteAsPDF(note);
    }
    setIsOpen(false);
    onClose?.();
  };

  const handleExportJSON = () => {
    if (type === 'flashcard-set' && flashcardSet && flashcards) {
      downloadFlashcardSetAsJSON(flashcardSet, flashcards);
    }
    setIsOpen(false);
    onClose?.();
  };

  return (
    <div className={styles.exportMenu} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.exportButton}
        aria-label="Export"
        title="Export"
      >
        📥 Export
      </button>
      {isOpen && (
        <div className={styles.menu}>
          {type === 'note' && (
            <>
              <button onClick={handleExportMarkdown} className={styles.menuItem}>
                Export as Markdown (.md)
              </button>
              <button onClick={handleExportPDF} className={styles.menuItem}>
                Export as PDF
              </button>
            </>
          )}
          {type === 'notes' && (
            <button onClick={handleExportMarkdown} className={styles.menuItem}>
              Export All as Markdown (.md)
            </button>
          )}
          {type === 'flashcard-set' && (
            <button onClick={handleExportJSON} className={styles.menuItem}>
              Export as JSON (.json)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

