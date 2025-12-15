/**
 * StudyStatistics Component
 * Displays overall study statistics and progress
 */
import React, { useState, useEffect } from 'react';
import * as studySessionService from '../../services/studySessions';
import type { StudySession } from '../../types/flashcards';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import styles from './StudyStatistics.module.css';

export function StudyStatistics() {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overallStats, setOverallStats] = useState<{
    totalSessions: number;
    totalCardsStudied: number;
    totalCardsCorrect: number;
    overallAccuracy: number;
    totalStudyTime: number;
  } | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [accuracyChartData, setAccuracyChartData] = useState<any[]>([]);
  const [perSetStats, setPerSetStats] = useState<any[]>([]);
  const [displayedSessions, setDisplayedSessions] = useState<StudySession[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load all study sessions
      const response = await studySessionService.getStudySessions({ page_size: 100 });
      const allSessions = response.results;
      setSessions(allSessions);

      // Calculate overall statistics
      const totalSessions = allSessions.length;
      const totalCardsStudied = allSessions.reduce((sum, s) => sum + (s.cards_studied || 0), 0);
      const totalCardsCorrect = allSessions.reduce((sum, s) => sum + (s.cards_correct || 0), 0);
      const overallAccuracy = totalCardsStudied > 0 
        ? (totalCardsCorrect / totalCardsStudied) * 100 
        : 0;
      
      // Calculate total study time (sum of durations)
      const totalStudyTime = allSessions.reduce((sum, s) => {
        if (s.duration !== undefined && s.duration !== null) {
          return sum + s.duration;
        }
        // If duration not available, estimate from started_at and ended_at
        if (s.started_at && s.ended_at) {
          const start = new Date(s.started_at);
          const end = new Date(s.ended_at);
          return sum + (end.getTime() - start.getTime()) / (1000 * 60); // minutes
        }
        return sum;
      }, 0);

      setOverallStats({
        totalSessions,
        totalCardsStudied,
        totalCardsCorrect,
        overallAccuracy,
        totalStudyTime
      });
      
      // Prepare chart data
      prepareChartData(allSessions);
      
      // Set initial displayed sessions
      setDisplayedSessions(allSessions.slice(0, pageSize));
    } catch (err: any) {
      setError(err.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  // Update displayed sessions when page changes
  useEffect(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setDisplayedSessions(sessions.slice(startIndex, endIndex));
  }, [page, sessions]);

  const totalPages = Math.ceil(sessions.length / pageSize);

  // Prepare data for charts
  const prepareChartData = (allSessions: StudySession[]) => {
    // Group sessions by date
    const sessionsByDate = new Map<string, { cards: number; correct: number; time: number }>();
    
    allSessions.forEach(session => {
      const date = new Date(session.started_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      
      const existing = sessionsByDate.get(date) || { cards: 0, correct: 0, time: 0 };
      existing.cards += session.cards_studied || 0;
      existing.correct += session.cards_correct || 0;
      existing.time += session.duration || 0;
      sessionsByDate.set(date, existing);
    });

    // Convert to chart data format
    const dailyData = Array.from(sessionsByDate.entries())
      .map(([date, data]) => ({
        date,
        cards: data.cards,
        correct: data.correct,
        accuracy: data.cards > 0 ? (data.correct / data.cards) * 100 : 0,
        time: Math.round(data.time),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14); // Last 14 days

    setChartData(dailyData);
    setAccuracyChartData(dailyData);

    // Per-set statistics
    const setStatsMap = new Map<number, { name: string; sessions: number; cards: number; correct: number }>();
    
    allSessions.forEach(session => {
      if (session.flashcard_set_id) {
        const existing = setStatsMap.get(session.flashcard_set_id) || {
          name: session.flashcard_set?.name || 'Unknown',
          sessions: 0,
          cards: 0,
          correct: 0,
        };
        existing.sessions += 1;
        existing.cards += session.cards_studied || 0;
        existing.correct += session.cards_correct || 0;
        setStatsMap.set(session.flashcard_set_id, existing);
      }
    });

    const perSetData = Array.from(setStatsMap.values())
      .map(set => ({
        name: set.name,
        sessions: set.sessions,
        cards: set.cards,
        accuracy: set.cards > 0 ? (set.correct / set.cards) * 100 : 0,
      }))
      .sort((a, b) => b.cards - a.cards)
      .slice(0, 10); // Top 10 sets

    setPerSetStats(perSetData);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return <LoadingSpinner size="large" message="Loading study statistics..." />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Failed to Load Statistics"
        message={error}
        onRetry={loadStatistics}
      />
    );
  }

  return (
    <div className={styles.statistics}>
      <header className={styles.header}>
        <h1>Study Statistics</h1>
        <p className={styles.subtitle}>Track your learning progress and performance</p>
      </header>

      {overallStats && (
        <section className={styles.overallStats}>
          <h2>Overall Statistics</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{overallStats.totalSessions}</div>
              <div className={styles.statLabel}>Study Sessions</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{overallStats.totalCardsStudied}</div>
              <div className={styles.statLabel}>Cards Studied</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{overallStats.totalCardsCorrect}</div>
              <div className={styles.statLabel}>Cards Correct</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{overallStats.overallAccuracy.toFixed(1)}%</div>
              <div className={styles.statLabel}>Overall Accuracy</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{formatDuration(overallStats.totalStudyTime)}</div>
              <div className={styles.statLabel}>Total Study Time</div>
            </div>
          </div>
        </section>
      )}

      <section className={styles.recentSessions}>
        <h2>Recent Study Sessions</h2>
        {sessions.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No study sessions yet. Start studying a flashcard set to see your statistics!</p>
          </div>
        ) : (
          <>
            <div className={styles.sessionsList}>
              {displayedSessions.map((session) => (
                <div key={session.id} className={styles.sessionCard}>
                  <div className={styles.sessionHeader}>
                    <div>
                      <h3 className={styles.sessionTitle}>
                        {session.flashcard_set?.name || 'Unknown Set'}
                      </h3>
                      <span className={styles.sessionMode}>
                        {session.mode === 'spaced' ? 'Spaced Repetition' : 'Simple Study'}
                      </span>
                    </div>
                    <div className={styles.sessionDate}>
                      {formatDate(session.started_at)}
                    </div>
                  </div>
                  <div className={styles.sessionStats}>
                    <div className={styles.sessionStat}>
                      <span className={styles.sessionStatLabel}>Cards Studied:</span>
                      <span className={styles.sessionStatValue}>{session.cards_studied}</span>
                    </div>
                    <div className={styles.sessionStat}>
                      <span className={styles.sessionStatLabel}>Cards Correct:</span>
                      <span className={styles.sessionStatValue}>{session.cards_correct}</span>
                    </div>
                    {session.accuracy !== undefined && (
                      <div className={styles.sessionStat}>
                        <span className={styles.sessionStatLabel}>Accuracy:</span>
                        <span className={styles.sessionStatValue}>
                          {session.accuracy.toFixed(1)}%
                        </span>
                      </div>
                    )}
                    {session.duration !== undefined && (
                      <div className={styles.sessionStat}>
                        <span className={styles.sessionStatLabel}>Duration:</span>
                        <span className={styles.sessionStatValue}>
                          {formatDuration(session.duration)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={styles.paginationButton}
                >
                  Previous
                </button>
                <span className={styles.paginationInfo}>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={styles.paginationButton}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

