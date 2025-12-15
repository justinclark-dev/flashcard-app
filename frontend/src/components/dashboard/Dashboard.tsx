/**
 * Dashboard Component
 * Main dashboard page showing overview and quick access to features.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const { user } = useAuth();

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>Welcome{user ? `, ${user.username}` : ''}!</h1>
        <p className={styles.subtitle}>Your Study Notes & Flashcard App</p>
      </header>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2>Quick Actions</h2>
          <div className={styles.actionGrid}>
            <Link to="/notes/new" className={styles.actionCard}>
              <h3>📝 Create Note</h3>
              <p>Create a new study note</p>
            </Link>
            <Link to="/flashcards/new" className={styles.actionCard}>
              <h3>🎴 Create Flashcard Set</h3>
              <p>Create a new flashcard set</p>
            </Link>
            <Link to="/notes" className={styles.actionCard}>
              <h3>📚 View Notes</h3>
              <p>Browse all your notes</p>
            </Link>
            <Link to="/flashcards" className={styles.actionCard}>
              <h3>🎯 View Flashcards</h3>
              <p>Browse all your flashcard sets</p>
            </Link>
            <Link to="/statistics" className={styles.actionCard}>
              <h3>📊 Study Statistics</h3>
              <p>View your learning progress</p>
            </Link>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Features</h2>
          <div className={styles.featuresList}>
            <div className={styles.feature}>
              <h3>📝 Notes</h3>
              <p>Create, organize, and search through your study notes. Use categories and tags to keep everything organized.</p>
            </div>
            <div className={styles.feature}>
              <h3>🎴 Flashcards</h3>
              <p>Create flashcard sets from your notes or manually. Study with simple flip mode or spaced repetition.</p>
            </div>
            <div className={styles.feature}>
              <h3>🧠 Spaced Repetition</h3>
              <p>Use the SM-2 algorithm to optimize your learning. Cards you struggle with appear more frequently.</p>
            </div>
            <div className={styles.feature}>
              <h3>📊 Study Statistics</h3>
              <p>Track your progress and see how well you're doing with detailed statistics.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

