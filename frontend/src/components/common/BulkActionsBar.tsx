/**
 * BulkActionsBar Component
 * Displays bulk action controls when items are selected
 */

import React from 'react';
import styles from './BulkActionsBar.module.css';

interface BulkActionsBarProps {
  selectedCount: number;
  onDelete?: () => void;
  onClearSelection?: () => void;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
}

export function BulkActionsBar({
  selectedCount,
  onDelete,
  onClearSelection,
  actions = [],
}: BulkActionsBarProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className={styles.bulkActionsBar}>
      <div className={styles.selectedInfo}>
        <strong>{selectedCount}</strong> item{selectedCount !== 1 ? 's' : ''} selected
      </div>
      <div className={styles.actions}>
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`${styles.actionButton} ${styles[action.variant || 'secondary']}`}
          >
            {action.label}
          </button>
        ))}
        {onDelete && (
          <button
            onClick={onDelete}
            className={`${styles.actionButton} ${styles.danger}`}
          >
            Delete Selected
          </button>
        )}
        {onClearSelection && (
          <button
            onClick={onClearSelection}
            className={`${styles.actionButton} ${styles.secondary}`}
          >
            Clear Selection
          </button>
        )}
      </div>
    </div>
  );
}

