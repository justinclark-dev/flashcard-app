/**
 * FlashcardSetDetail Component
 * Displays a flashcard set with its flashcards and actions
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as flashcardService from '../../services/flashcards';
import type { FlashcardSet, Flashcard } from '../../types/flashcards';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { ExportMenu } from '../common/ExportMenu';
import { ImportDialog } from '../common/ImportDialog';
import { parseJSONToFlashcardSet } from '../../utils/import';
import { useDebounce } from '../../hooks/useDebounce';
import styles from './FlashcardSetDetail.module.css';

export function FlashcardSetDetail() {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [filteredFlashcards, setFilteredFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [showImportDialog, setShowImportDialog] = useState(false);

  useEffect(() => {
    if (setId) {
      loadData();
    }
  }, [setId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [setResponse, cardsResponse] = await Promise.all([
        flashcardService.getFlashcardSet(parseInt(setId!)),
        flashcardService.getFlashcards(parseInt(setId!))
      ]);
      setFlashcardSet(setResponse.data);
      setFlashcards(cardsResponse.results);
      setFilteredFlashcards(cardsResponse.results);
    } catch (err: any) {
      setError(err.message || 'Failed to load flashcard set');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSet = async () => {
    if (!flashcardSet || !window.confirm(`Are you sure you want to delete "${flashcardSet.name}"? This will delete all flashcards in this set.`)) {
      return;
    }

    try {
      await flashcardService.deleteFlashcardSet(flashcardSet.id);
      navigate('/flashcards');
    } catch (err: any) {
      setError(err.message || 'Failed to delete flashcard set');
    }
  };

  const handleDeleteFlashcard = async (flashcardId: number) => {
    if (!window.confirm('Are you sure you want to delete this flashcard?')) {
      return;
    }

    try {
      await flashcardService.deleteFlashcard(parseInt(setId!), flashcardId);
      await loadData(); // Reload to refresh the list
    } catch (err: any) {
      setError(err.message || 'Failed to delete flashcard');
    }
  };

  const handleImportFlashcardSet = async (data: { set: any; flashcards: any[] }) => {
    try {
      // Create the flashcard set
      const setResponse = await flashcardService.createFlashcardSet({
        name: data.set.name,
        description: data.set.description,
        category_id: null, // Category import would require lookup
      });

      const newSetId = setResponse.data.id;

      // Create all flashcards
      for (const card of data.flashcards) {
        await flashcardService.createFlashcard(newSetId, {
          front: card.front,
          back: card.back,
          order: card.order || 0,
        });
      }

      // Navigate to the new set
      navigate(`/flashcards/${newSetId}`);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to import flashcard set');
    }
  };

  // Filter flashcards based on search query
  useEffect(() => {
    if (!debouncedSearchQuery.trim()) {
      setFilteredFlashcards(flashcards);
    } else {
      const query = debouncedSearchQuery.toLowerCase();
      setFilteredFlashcards(
        flashcards.filter(
          (card) =>
            card.front.toLowerCase().includes(query) ||
            card.back.toLowerCase().includes(query)
        )
      );
    }
  }, [debouncedSearchQuery, flashcards]);

  if (loading) {
    return <LoadingSpinner size="large" message="Loading flashcard set..." />;
  }

  if (error || !flashcardSet) {
    return (
      <ErrorMessage
        title="Failed to Load Flashcard Set"
        message={error || 'Flashcard set not found'}
        onRetry={loadData}
      />
    );
  }

  return (
    <div className={styles.flashcardSetDetail}>
      <div className={styles.header}>
        <Link to="/flashcards" className={styles.backLink}>← Back to Flashcard Sets</Link>
        <div className={styles.actions}>
          <button
            onClick={() => setShowImportDialog(true)}
            className={styles.importButton}
          >
            📥 Import
          </button>
          {flashcardSet && flashcards.length > 0 && (
            <ExportMenu type="flashcard-set" flashcardSet={flashcardSet} flashcards={flashcards} />
          )}
          <Link to={`/flashcards/${setId}/study`} className={styles.studyButton}>
            Study (Simple)
          </Link>
          <Link to={`/flashcards/${setId}/study/spaced`} className={styles.studyButton}>
            Study (Spaced Repetition)
          </Link>
          <Link to={`/flashcards/${setId}/edit`} className={styles.editButton}>
            Edit Set
          </Link>
          <button onClick={handleDeleteSet} className={styles.deleteButton}>
            Delete Set
          </button>
        </div>
      </div>

      <div className={styles.setInfo}>
        <div className={styles.setHeader}>
          <div>
            <div className={styles.setBadge}>Flashcard Set</div>
            <h1 className={styles.title}>{flashcardSet.name}</h1>
          </div>
        </div>
        {flashcardSet.description && (
          <p className={styles.description}>{flashcardSet.description}</p>
        )}
        {flashcardSet.category && (
          <span
            className={styles.category}
            style={{ backgroundColor: flashcardSet.category.color }}
          >
            {flashcardSet.category.name}
          </span>
        )}
        <div className={styles.stats}>
          <span>{flashcardSet.card_count} {flashcardSet.card_count === 1 ? 'flashcard' : 'flashcards'} in this set</span>
        </div>
      </div>

      <div className={styles.flashcardsSection}>
        <div className={styles.sectionHeader}>
          <h2>Flashcards in This Set</h2>
          <Link to={`/flashcards/${setId}/flashcards/new`} className={styles.addButton}>
            + Add Flashcard
          </Link>
        </div>

        {flashcards.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No flashcards yet. Create your first flashcard to get started!</p>
            <Link to={`/flashcards/${setId}/flashcards/new`} className={styles.addButton}>
              Create First Flashcard
            </Link>
          </div>
        ) : (
          <div className={styles.flashcardsGrid}>
            {filteredFlashcards.map((card) => (
              <div key={card.id} className={styles.flashcardCard}>
                <div className={styles.flashcardFront}>
                  <strong>Front:</strong>
                  <p>{card.front}</p>
                </div>
                <div className={styles.flashcardBack}>
                  <strong>Back:</strong>
                  <p>{card.back}</p>
                </div>
                <div className={styles.flashcardMeta}>
                  <span className={styles.difficulty}>Difficulty: {card.difficulty}</span>
                  <span className={styles.reviewCount}>Reviewed: {card.review_count} times</span>
                </div>
                <div className={styles.flashcardActions}>
                  <Link
                    to={`/flashcards/${setId}/flashcards/${card.id}/edit`}
                    className={styles.editButton}
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteFlashcard(card.id)}
                    className={styles.deleteButton}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ImportDialog
        isOpen={showImportDialog}
        type="flashcard-set"
        onImport={handleImportFlashcardSet}
        onClose={() => setShowImportDialog(false)}
      />
    </div>
  );
}

