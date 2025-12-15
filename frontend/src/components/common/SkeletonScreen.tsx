/**
 * SkeletonScreen Component
 * Loading skeleton for data-heavy pages
 */

import React from 'react';
import styles from './SkeletonScreen.module.css';

interface SkeletonScreenProps {
  lines?: number;
  showAvatar?: boolean;
  showImage?: boolean;
}

export function SkeletonScreen({ lines = 3, showAvatar = false, showImage = false }: SkeletonScreenProps) {
  return (
    <div className={styles.container}>
      {showAvatar && <div className={styles.avatar} />}
      {showImage && <div className={styles.image} />}
      <div className={styles.content}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${styles.line} ${i === lines - 1 ? styles.lastLine : ''}`}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle} />
        <div className={styles.cardBadge} />
      </div>
      <div className={styles.cardContent}>
        <div className={styles.cardLine} />
        <div className={styles.cardLine} />
        <div className={`${styles.cardLine} ${styles.short}`} />
      </div>
      <div className={styles.cardFooter}>
        <div className={styles.cardMeta} />
        <div className={styles.cardActions} />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

