/**
 * RegisterForm Component
 * Handles user registration with validation.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { RegisterData } from '../../types/auth';
import styles from './RegisterForm.module.css';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'username':
        if (!value.trim()) return 'Username is required';
        break;
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address';
        }
        break;
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/[a-zA-Z]/.test(value)) return 'Password must contain at least one letter';
        if (!/\d/.test(value)) return 'Password must contain at least one number';
        break;
      case 'password_confirm':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords must match';
        break;
    }
    return null;
  };

  const handleChange = (field: keyof RegisterData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    if (error) setError(null);
  };

  const handleBlur = (field: keyof RegisterData) => {
    const fieldError = validateField(field, formData[field]);
    if (fieldError) {
      setErrors((prev) => ({ ...prev, [field]: fieldError }));
    }
  };

  const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    if (password.length < 8) return 'weak';
    if (password.length < 12) return 'medium';
    return 'strong';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrors({});

    // Validate all fields
    const newErrors: Record<string, string> = {};
    (Object.keys(formData) as Array<keyof RegisterData>).forEach((field) => {
      const fieldError = validateField(field, formData[field]);
      if (fieldError) {
        newErrors[field] = fieldError;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Register</h2>
      
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.field}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={formData.username}
          onChange={(e) => handleChange('username', e.target.value)}
          onBlur={() => handleBlur('username')}
          disabled={loading}
        />
        {errors.username && <span className={styles.fieldError}>{errors.username}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          disabled={loading}
        />
        {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          onBlur={() => handleBlur('password')}
          disabled={loading}
        />
        {formData.password && (
          <div className={styles.passwordStrength}>
            Strength: <span className={styles[getPasswordStrength(formData.password)]}>
              {getPasswordStrength(formData.password)}
            </span>
          </div>
        )}
        {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="password_confirm">Confirm Password</label>
        <input
          id="password_confirm"
          type="password"
          value={formData.password_confirm}
          onChange={(e) => handleChange('password_confirm', e.target.value)}
          onBlur={() => handleBlur('password_confirm')}
          disabled={loading}
        />
        {errors.password_confirm && (
          <span className={styles.fieldError}>{errors.password_confirm}</span>
        )}
      </div>

      <button type="submit" disabled={loading} className={styles.submitButton}>
        {loading ? 'Registering...' : 'Register'}
      </button>

      <p className={styles.link}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </form>
  );
}

