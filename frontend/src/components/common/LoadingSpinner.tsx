/**
 * LoadingSpinner Component
 * Reusable loading spinner for async operations
 */

import React from 'react';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
}

export function LoadingSpinner({ size = 'medium', message }: LoadingSpinnerProps) {
  return (
    <div className={styles.container}>
      <div className={`${styles.spinner} ${styles[size]}`} role="status" aria-label="Loading">
        <span className={styles.visuallyHidden}>Loading...</span>
      </div>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}

