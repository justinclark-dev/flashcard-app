/**
 * LoginForm Component
 * Handles user login with username and password.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './LoginForm.module.css';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'username':
        if (!value.trim()) return 'Username is required';
        break;
      case 'password':
        if (!value) return 'Password is required';
        break;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrors({});

    // Validate all fields
    const newErrors: Record<string, string> = {};
    const usernameError = validateField('username', username);
    const passwordError = validateField('password', password);
    
    if (usernameError) newErrors.username = usernameError;
    if (passwordError) newErrors.password = passwordError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      await login(username, password);
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: 'username' | 'password', value: string) => {
    if (error) setError(null);
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    if (field === 'username') {
      setUsername(value);
    } else {
      setPassword(value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Login</h2>
      
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.field}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => handleChange('username', e.target.value)}
          disabled={loading}
        />
        {errors.username && <span className={styles.fieldError}>{errors.username}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => handleChange('password', e.target.value)}
          disabled={loading}
        />
        {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
      </div>

      <button type="submit" disabled={loading} className={styles.submitButton}>
        {loading ? 'Logging in...' : 'Login'}
      </button>

      <p className={styles.link}>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </form>
  );
}

