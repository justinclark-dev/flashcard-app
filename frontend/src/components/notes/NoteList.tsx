/**
 * NoteList Component
 * Displays a list of notes with filtering, search, and sorting
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotes } from '../../hooks/useNotes';
import { useDebounce } from '../../hooks/useDebounce';
import * as categoriesService from '../../services/categories';
import type { Category } from '../../services/notes';
import { NoteCard } from './NoteCard';
import { SkeletonList } from '../common/SkeletonScreen';
import { ErrorMessage } from '../common/ErrorMessage';
import { BulkActionsBar } from '../common/BulkActionsBar';
import { ExportMenu } from '../common/ExportMenu';
import { ImportDialog } from '../common/ImportDialog';
import { parseMarkdownToNote } from '../../utils/import';
import * as notesService from '../../services/notes';
import styles from './NoteList.module.css';

interface NoteListProps {
  onNoteSelect?: (note: any) => void;
}

export function NoteList({ onNoteSelect }: NoteListProps) {
  const navigate = useNavigate();
  const defaultSort = '-updated_at';
  const { notes, loading, error, filterByCategory, searchNotes, sortNotes, deleteNote } = useNotes({ ordering: defaultSort });
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [sortBy, setSortBy] = useState<string>(defaultSort);
  const [selectedNotes, setSelectedNotes] = useState<Set<number>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  const handleNoteClick = (note: any) => {
    if (onNoteSelect) {
      onNoteSelect(note);
    } else {
      navigate(`/notes/${note.id}`);
    }
  };

  const handleNoteEdit = (note: any) => {
    navigate(`/notes/${note.id}/edit`);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoriesService.getCategories();
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value ? parseInt(e.target.value) : null;
    setSelectedCategory(categoryId);
    await filterByCategory(categoryId);
  };

  // Auto-search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      searchNotes(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await searchNotes(searchQuery);
  };

  const handleSortChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ordering = e.target.value;
    setSortBy(ordering);
    await sortNotes(ordering);
  };

  const handleToggleBulkMode = () => {
    setBulkMode(!bulkMode);
    setSelectedNotes(new Set());
  };

  const handleToggleNoteSelection = (noteId: number) => {
    const newSelected = new Set(selectedNotes);
    if (newSelected.has(noteId)) {
      newSelected.delete(noteId);
    } else {
      newSelected.add(noteId);
    }
    setSelectedNotes(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedNotes.size === notes.length) {
      setSelectedNotes(new Set());
    } else {
      setSelectedNotes(new Set(notes.map(n => n.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotes.size === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedNotes.size} note(s)?`)) {
      return;
    }

    try {
      const deletePromises = Array.from(selectedNotes).map(id => 
        deleteNote(id).catch(err => {
          console.error(`Failed to delete note ${id}:`, err);
          return null;
        })
      );
      await Promise.all(deletePromises);
      setSelectedNotes(new Set());
      setBulkMode(false);
    } catch (err) {
      console.error('Bulk delete failed:', err);
    }
  };

  const handleClearSelection = () => {
    setSelectedNotes(new Set());
  };

  const handleImportNote = async (noteData: any) => {
    try {
      await notesService.createNote(noteData as any);
      // Reload notes
      window.location.reload();
    } catch (err: any) {
      throw new Error(err.message || 'Failed to import note');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Notes</h1>
          <Link to="/notes/new" className={styles.createButton}>
            + Create New Note
          </Link>
        </div>
        <SkeletonList count={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Notes</h1>
          <Link to="/notes/new" className={styles.createButton}>
            + Create New Note
          </Link>
        </div>
        <ErrorMessage
          title="Failed to Load Notes"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Notes</h1>
          <Link to="/notes/new" className={styles.createButton}>
            + Create New Note
          </Link>
        </div>
        <div className={styles.empty}>
          <p>No notes found. Create your first note to get started!</p>
          <Link to="/notes/new" className={styles.createButton}>
            + Create Your First Note
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Notes</h1>
        <div className={styles.headerActions}>
          <button
            onClick={() => setShowImportDialog(true)}
            className={styles.importButton}
          >
            📥 Import
          </button>
          {notes.length > 0 && (
            <ExportMenu type="notes" notes={notes} />
          )}
          <Link to="/notes/new" className={styles.createButton}>
            + Create New Note
          </Link>
        </div>
      </div>
      <div className={styles.filters}>
        <div className={styles.controlsLeft}>
          <button
            onClick={handleToggleBulkMode}
            className={`${styles.bulkModeButton} ${bulkMode ? styles.active : ''}`}
          >
            {bulkMode ? 'Exit Bulk Mode' : 'Bulk Actions'}
          </button>
          {bulkMode && (
            <button
              onClick={handleSelectAll}
              className={styles.selectAllButton}
            >
              {selectedNotes.size === notes.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>
            Search
          </button>
        </form>

        <div className={styles.filterGroup}>
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            value={selectedCategory || ''}
            onChange={handleCategoryChange}
            className={styles.select}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="sort">Sort by:</label>
          <select
            id="sort"
            value={sortBy}
            onChange={handleSortChange}
            className={styles.select}
          >
            <option value="created_at">Date Created (Oldest)</option>
            <option value="-created_at">Date Created (Newest)</option>
            <option value="updated_at">Date Updated (Oldest)</option>
            <option value="-updated_at">Date Updated (Newest)</option>
            <option value="title">Title (A-Z)</option>
            <option value="-title">Title (Z-A)</option>
          </select>
        </div>
      </div>

      {bulkMode && (
        <BulkActionsBar
          selectedCount={selectedNotes.size}
          onDelete={handleBulkDelete}
          onClearSelection={handleClearSelection}
        />
      )}

      <div className={styles.notesGrid}>
        {notes.map(note => (
          <div key={note.id} className={styles.noteWrapper}>
            {bulkMode && (
              <input
                type="checkbox"
                checked={selectedNotes.has(note.id)}
                onChange={() => handleToggleNoteSelection(note.id)}
                className={styles.checkbox}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <NoteCard
              note={note}
              onClick={() => !bulkMode && handleNoteClick(note)}
              onEdit={() => !bulkMode && handleNoteEdit(note)}
            />
          </div>
        ))}
      </div>

      <ImportDialog
        isOpen={showImportDialog}
        type="note"
        onImport={handleImportNote}
        onClose={() => setShowImportDialog(false)}
      />
    </div>
  );
}

