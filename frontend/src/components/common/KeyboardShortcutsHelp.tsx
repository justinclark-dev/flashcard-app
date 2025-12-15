/**
 * KeyboardShortcutsHelp Component
 * Displays a modal with available keyboard shortcuts
 */

import React, { useEffect } from 'react';
import { useKeyboardShortcuts, APP_SHORTCUTS } from '../../hooks/useKeyboardShortcuts';
import styles from './KeyboardShortcutsHelp.module.css';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  customShortcuts?: Array<{ key: string; description: string }>;
}

export function KeyboardShortcutsHelp({
  isOpen,
  onClose,
  customShortcuts = [],
}: KeyboardShortcutsHelpProps) {
  useKeyboardShortcuts([
    {
      key: 'Escape',
      handler: onClose,
    },
  ]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatKey = (key: string, ctrl?: boolean, shift?: boolean, meta?: boolean) => {
    const parts: string[] = [];
    if (ctrl || meta) parts.push(meta ? '⌘' : 'Ctrl');
    if (shift) parts.push('Shift');
    parts.push(key.toUpperCase());
    return parts.join(' + ');
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Keyboard Shortcuts</h2>
          <button onClick={onClose} className={styles.closeButton} aria-label="Close">
            ×
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.section}>
            <h3>General</h3>
            <div className={styles.shortcutList}>
              <div className={styles.shortcutItem}>
                <kbd className={styles.key}>
                  {formatKey(APP_SHORTCUTS.NEW_NOTE.key, APP_SHORTCUTS.NEW_NOTE.ctrl)}
                </kbd>
                <span>{APP_SHORTCUTS.NEW_NOTE.description}</span>
              </div>
              <div className={styles.shortcutItem}>
                <kbd className={styles.key}>
                  {formatKey(APP_SHORTCUTS.SEARCH.key, APP_SHORTCUTS.SEARCH.ctrl)}
                </kbd>
                <span>{APP_SHORTCUTS.SEARCH.description}</span>
              </div>
              <div className={styles.shortcutItem}>
                <kbd className={styles.key}>
                  {formatKey(APP_SHORTCUTS.ESCAPE.key)}
                </kbd>
                <span>{APP_SHORTCUTS.ESCAPE.description}</span>
              </div>
              <div className={styles.shortcutItem}>
                <kbd className={styles.key}>
                  {formatKey(APP_SHORTCUTS.HELP.key, false, APP_SHORTCUTS.HELP.shift)}
                </kbd>
                <span>{APP_SHORTCUTS.HELP.description}</span>
              </div>
            </div>
          </div>
          {customShortcuts.length > 0 && (
            <div className={styles.section}>
              <h3>Page Specific</h3>
              <div className={styles.shortcutList}>
                {customShortcuts.map((shortcut, index) => (
                  <div key={index} className={styles.shortcutItem}>
                    <kbd className={styles.key}>{shortcut.key}</kbd>
                    <span>{shortcut.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className={styles.footer}>
          <button onClick={onClose} className={styles.closeButton}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

