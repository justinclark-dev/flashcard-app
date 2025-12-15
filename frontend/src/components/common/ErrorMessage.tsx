/**
 * ErrorMessage Component
 * Standardized error message display with recovery options
 */

import React from 'react';
import styles from './ErrorMessage.module.css';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  severity?: 'error' | 'warning' | 'info';
}

export function ErrorMessage({
  title,
  message,
  onRetry,
  onDismiss,
  severity = 'error',
}: ErrorMessageProps) {
  return (
    <div className={`${styles.container} ${styles[severity]}`} role="alert">
      <div className={styles.content}>
        <div className={styles.icon}>
          {severity === 'error' && '⚠️'}
          {severity === 'warning' && '⚠️'}
          {severity === 'info' && 'ℹ️'}
        </div>
        <div className={styles.text}>
          {title && <h3 className={styles.title}>{title}</h3>}
          <p className={styles.message}>{message}</p>
        </div>
      </div>
      <div className={styles.actions}>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className={styles.retryButton}
            aria-label="Retry"
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className={styles.dismissButton}
            aria-label="Dismiss"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}

