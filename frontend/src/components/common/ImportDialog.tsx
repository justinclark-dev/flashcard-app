/**
 * ImportDialog Component
 * Dialog for importing notes and flashcard sets
 */

import React, { useState, useRef } from 'react';
import { readFileAsText, validateFileType, parseMarkdownToNote, parseJSONToFlashcardSet } from '../../utils/import';
import type { NoteCreateData } from '../../services/notes';
import { ErrorMessage } from './ErrorMessage';
import styles from './ImportDialog.module.css';

interface ImportDialogProps {
  isOpen: boolean;
  type: 'note' | 'flashcard-set';
  onImport: (data: any) => Promise<void>;
  onClose: () => void;
}

export function ImportDialog({ isOpen, type, onImport, onClose }: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const fileContent = await readFileAsText(file);

      if (type === 'note') {
        // Validate markdown file
        if (!validateFileType(file, ['md', 'markdown', 'txt'])) {
          throw new Error('Please select a Markdown (.md) or text file');
        }

        const noteData = parseMarkdownToNote(fileContent);
        await onImport(noteData);
      } else if (type === 'flashcard-set') {
        // Validate JSON file
        if (!validateFileType(file, ['json'])) {
          throw new Error('Please select a JSON file');
        }

        const { set, flashcards } = parseJSONToFlashcardSet(fileContent);
        await onImport({ set, flashcards });
      }

      // Reset and close
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to import file');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Import {type === 'note' ? 'Note' : 'Flashcard Set'}</h2>
          <button onClick={handleClose} className={styles.closeButton} aria-label="Close">
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.fileInput}>
            <label htmlFor="import-file" className={styles.fileLabel}>
              Choose File
            </label>
            <input
              id="import-file"
              ref={fileInputRef}
              type="file"
              accept={type === 'note' ? '.md,.markdown,.txt' : '.json'}
              onChange={handleFileSelect}
              className={styles.fileInputElement}
            />
            {file && (
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileSize}>
                  {(file.size / 1024).toFixed(2)} KB
                </span>
              </div>
            )}
          </div>

          {error && (
            <ErrorMessage
              message={error}
              onDismiss={() => setError(null)}
            />
          )}

          <div className={styles.help}>
            <p>
              {type === 'note' ? (
                <>
                  Import a Markdown (.md) file. The file should contain a note title (H1) and content.
                  Metadata like category and tags will be extracted if present.
                </>
              ) : (
                <>
                  Import a JSON file containing a flashcard set. The file should match the export format.
                </>
              )}
            </p>
          </div>
        </div>

        <div className={styles.footer}>
          <button onClick={handleClose} className={styles.cancelButton}>
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className={styles.importButton}
          >
            {loading ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  );
}

