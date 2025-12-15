/**
 * Navbar Component
 * Main navigation bar for the application.
 */

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import styles from './Navbar.module.css';

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  if (!user) {
    return null; // Don't show navbar on login/register pages
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          📚 Study App
        </Link>
        
        <div className={styles.navLinks}>
          <Link 
            to="/" 
            className={`${styles.navLink} ${isActive('/') && location.pathname === '/' ? styles.active : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/notes" 
            className={`${styles.navLink} ${isActive('/notes') ? styles.active : ''}`}
          >
            Notes
          </Link>
          <Link 
            to="/flashcards" 
            className={`${styles.navLink} ${isActive('/flashcards') ? styles.active : ''}`}
          >
            Flashcards
          </Link>
          <Link 
            to="/statistics" 
            className={`${styles.navLink} ${isActive('/statistics') ? styles.active : ''}`}
          >
            Statistics
          </Link>
        </div>

        <div className={styles.userSection}>
          <span className={styles.username}>{user.username}</span>
          <button
            onClick={toggleTheme}
            className={styles.themeToggle}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

