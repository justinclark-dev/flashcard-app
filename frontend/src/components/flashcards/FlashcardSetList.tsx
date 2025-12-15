/**
 * FlashcardSetList Component
 * Displays a list of flashcard sets with filtering options
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFlashcards } from '../../hooks/useFlashcards';
import { useDebounce } from '../../hooks/useDebounce';
import * as categoriesService from '../../services/categories';
import { SkeletonList } from '../common/SkeletonScreen';
import { ErrorMessage } from '../common/ErrorMessage';
import { BulkActionsBar } from '../common/BulkActionsBar';
import styles from './FlashcardSetList.module.css';
import type { FlashcardSet } from '../../types/flashcards';

interface FlashcardSetListProps {
  onSetSelect?: (set: FlashcardSet) => void;
  onEditSet?: (set: FlashcardSet) => void;
  onDeleteSet?: (set: FlashcardSet) => void;
}

export function FlashcardSetList({ onSetSelect, onEditSet, onDeleteSet }: FlashcardSetListProps) {
  const navigate = useNavigate();
  const { flashcardSets, loading, error, filterByCategory, deleteFlashcardSet } = useFlashcards();
  const [categories, setCategories] = useState<Array<{ id: number; name: string; color: string }>>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [filteredSets, setFilteredSets] = useState<FlashcardSet[]>([]);
  const [selectedSets, setSelectedSets] = useState<Set<number>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  const handleSetClick = (set: FlashcardSet) => {
    if (onSetSelect) {
      onSetSelect(set);
    } else {
      navigate(`/flashcards/${set.id}`);
    }
  };

  const handleSetEdit = (set: FlashcardSet) => {
    if (onEditSet) {
      onEditSet(set);
    } else {
      navigate(`/flashcards/${set.id}/edit`);
    }
  };

  useEffect(() => {
    // Load categories
    categoriesService
      .getCategories()
      .then((response) => {
        setCategories(response.data || []);
      })
      .catch(() => {
        // Ignore errors, categories are optional
      });
  }, []);

  const handleCategoryFilter = (categoryId: string) => {
    const id = categoryId ? Number(categoryId) : null;
    setSelectedCategory(id);
    filterByCategory(id);
  };

  // Filter sets based on search query
  useEffect(() => {
    if (!debouncedSearchQuery.trim()) {
      setFilteredSets(flashcardSets);
    } else {
      const query = debouncedSearchQuery.toLowerCase();
      setFilteredSets(
        flashcardSets.filter(
          (set) =>
            set.name.toLowerCase().includes(query) ||
            set.description?.toLowerCase().includes(query) ||
            set.category?.name.toLowerCase().includes(query)
        )
      );
    }
  }, [debouncedSearchQuery, flashcardSets]);

  const handleDelete = async (set: FlashcardSet) => {
    if (window.confirm(`Are you sure you want to delete "${set.name}"? This will delete all flashcards in this set.`)) {
      await deleteFlashcardSet(set.id);
      onDeleteSet?.(set);
    }
  };

  const handleToggleBulkMode = () => {
    setBulkMode(!bulkMode);
    setSelectedSets(new Set());
  };

  const handleToggleSetSelection = (setId: number) => {
    const newSelected = new Set(selectedSets);
    if (newSelected.has(setId)) {
      newSelected.delete(setId);
    } else {
      newSelected.add(setId);
    }
    setSelectedSets(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedSets.size === filteredSets.length) {
      setSelectedSets(new Set());
    } else {
      setSelectedSets(new Set(filteredSets.map(s => s.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSets.size === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedSets.size} flashcard set(s)? This will delete all flashcards in these sets.`)) {
      return;
    }

    try {
      const deletePromises = Array.from(selectedSets).map(id => 
        deleteFlashcardSet(id).catch(err => {
          console.error(`Failed to delete set ${id}:`, err);
          return null;
        })
      );
      await Promise.all(deletePromises);
      setSelectedSets(new Set());
      setBulkMode(false);
    } catch (err) {
      console.error('Bulk delete failed:', err);
    }
  };

  const handleClearSelection = () => {
    setSelectedSets(new Set());
  };

  if (loading) {
    return (
      <div className={styles.flashcardSetList}>
        <div className={styles.header}>
          <h1 className={styles.title}>Flashcard Sets</h1>
          <Link to="/flashcards/new" className={styles.createButton}>
            + Create New Set
          </Link>
        </div>
        <SkeletonList count={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.flashcardSetList}>
        <div className={styles.header}>
          <h1 className={styles.title}>Flashcard Sets</h1>
          <Link to="/flashcards/new" className={styles.createButton}>
            + Create New Set
          </Link>
        </div>
        <ErrorMessage
          title="Failed to Load Flashcard Sets"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className={styles.flashcardSetList}>
      <div className={styles.header}>
        <h1 className={styles.title}>Flashcard Sets</h1>
        <Link to="/flashcards/new" className={styles.createButton}>
          + Create New Set
        </Link>
      </div>

      <div className={styles.controls}>
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
              {selectedSets.size === filteredSets.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>
        <div className={styles.controlsRight}>
          <input
            type="text"
            placeholder="Search flashcard sets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <select
            className={styles.categoryFilter}
            value={selectedCategory || ''}
            onChange={(e) => handleCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {bulkMode && (
        <BulkActionsBar
          selectedCount={selectedSets.size}
          onDelete={handleBulkDelete}
          onClearSelection={handleClearSelection}
        />
      )}

      {filteredSets.length === 0 && searchQuery ? (
        <div className={styles.emptyState}>
          <p>No flashcard sets found matching "{searchQuery}"</p>
          <button onClick={() => setSearchQuery('')} className={styles.clearSearchButton}>
            Clear Search
          </button>
        </div>
      ) : filteredSets.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No flashcard sets found. Create one to get started!</p>
          <Link to="/flashcards/new" className={styles.createButton}>
            + Create Your First Set
          </Link>
        </div>
      ) : (
        <div className={styles.setGrid}>
          {filteredSets.map((set) => (
            <div key={set.id} className={styles.setCardWrapper}>
              {bulkMode && (
                <input
                  type="checkbox"
                  checked={selectedSets.has(set.id)}
                  onChange={() => handleToggleSetSelection(set.id)}
                  className={styles.checkbox}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              <div className={styles.setCard} onClick={() => !bulkMode && handleSetClick(set)}>
              <div className={styles.setBadge}>Flashcard Set</div>
              <h3 className={styles.setName}>{set.name}</h3>
              {set.description && <p className={styles.setDescription}>{set.description}</p>}
              {set.category && (
                <span className={styles.categoryBadge} style={{ backgroundColor: set.category.color }}>
                  {set.category.name}
                </span>
              )}
              <div className={styles.setStats}>
                <span>{set.card_count} {set.card_count === 1 ? 'flashcard' : 'flashcards'}</span>
              </div>
              <div className={styles.setActions}>
                <button
                  className={styles.editButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetEdit(set);
                  }}
                >
                  Edit Set
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(set);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

