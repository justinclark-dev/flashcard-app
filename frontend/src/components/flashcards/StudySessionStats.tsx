/**
 * StudySessionStats Component
 * Displays study session statistics
 */

import React, { useState, useEffect } from 'react';
import * as studySessionService from '../../services/studySessions';
import styles from './StudySessionStats.module.css';

interface StudySessionStatsProps {
  sessionId: number;
}

export function StudySessionStats({ sessionId }: StudySessionStatsProps) {
  const [stats, setStats] = useState<{
    cards_studied: number;
    cards_correct: number;
    accuracy: number;
    duration: number;
    started_at: string;
    ended_at: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    studySessionService
      .getStudySessionStats(sessionId)
      .then((response) => {
        setStats(response.data);
      })
      .catch((err: any) => {
        setError(err.message || 'Failed to load statistics');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sessionId]);

  if (loading) {
    return <div className={styles.loading}>Loading statistics...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  if (!stats) {
    return <div className={styles.emptyState}>No statistics available</div>;
  }

  return (
    <div className={styles.statsContainer}>
      <h2>Study Session Statistics</h2>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.cards_studied}</div>
          <div className={styles.statLabel}>Cards Studied</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.cards_correct}</div>
          <div className={styles.statLabel}>Cards Correct</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.accuracy.toFixed(1)}%</div>
          <div className={styles.statLabel}>Accuracy</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{Math.round(stats.duration)}</div>
          <div className={styles.statLabel}>Minutes</div>
        </div>
      </div>
    </div>
  );
}

