# Frontend Implementation Details
**Date**: 2025-01-27
**Created By**: Architect Agent
**Status**: Final
**Reviewed By**: Senior Developer Agent

## Overview

This document specifies implementation details for the React frontend, including error handling, form validation, accessibility, loading states, and state management patterns.

## Error Handling Strategy

### Global Error Boundary

**Implementation**:
```typescript
// components/common/ErrorBoundary.tsx
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

**Usage**:
```typescript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### API Error Handling

**Error Types**:
- Network errors (no connection, timeout)
- HTTP errors (400, 401, 403, 404, 500)
- Validation errors (field-level)
- Rate limit errors

**Error Handling Pattern**:
```typescript
// services/api.ts
async function handleApiError(response: Response) {
  if (!response.ok) {
    const error = await response.json();
    
    switch (response.status) {
      case 400:
        throw new ValidationError(error.details);
      case 401:
        throw new AuthenticationError(error.error);
      case 403:
        throw new AuthorizationError(error.error);
      case 404:
        throw new NotFoundError(error.error);
      case 429:
        throw new RateLimitError(error.error, error.retry_after);
      default:
        throw new ApiError(error.error || 'An error occurred');
    }
  }
}
```

### User-Friendly Error Messages

**Error Message Mapping**:
```typescript
const errorMessages = {
  'VALIDATION_ERROR': 'Please check your input and try again.',
  'AUTHENTICATION_REQUIRED': 'Please log in to continue.',
  'PERMISSION_DENIED': 'You do not have permission to perform this action.',
  'NOT_FOUND': 'The requested resource was not found.',
  'RATE_LIMIT_EXCEEDED': 'Too many requests. Please wait a moment and try again.',
  'SERVER_ERROR': 'Something went wrong. Please try again later.',
  'NETWORK_ERROR': 'Unable to connect to the server. Please check your connection.',
};
```

**Error Display Component**:
```typescript
// components/common/ErrorMessage.tsx
interface ErrorMessageProps {
  error: Error;
  onDismiss?: () => void;
}

export function ErrorMessage({ error, onDismiss }: ErrorMessageProps) {
  const message = errorMessages[error.name] || error.message;
  return (
    <div role="alert" className={styles.errorMessage}>
      <p>{message}</p>
      {onDismiss && <button onClick={onDismiss}>Dismiss</button>}
    </div>
  );
}
```

### Error Logging

**Strategy**:
- Log errors to console in development
- Send errors to logging service in production (future)
- Include user context (if available)
- Include error stack trace

## Form Validation

### Validation Library

**Choice**: `react-hook-form` with `yup` for schema validation

**Rationale**:
- Performance (minimal re-renders)
- Easy integration with TypeScript
- Good validation library ecosystem
- Consistent with backend validation

### Validation Implementation

**Schema Definition**:
```typescript
// validation/schemas.ts
import * as yup from 'yup';

export const loginSchema = yup.object({
  username: yup.string()
    .required('Username is required')
    .min(1, 'Username is required')
    .max(150, 'Username must be 150 characters or less'),
  password: yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = yup.object({
  username: yup.string()
    .required('Username is required')
    .min(1, 'Username is required')
    .max(150, 'Username must be 150 characters or less')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: yup.string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email must be 254 characters or less'),
  password: yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-zA-Z]/, 'Password must contain at least one letter')
    .matches(/[0-9]/, 'Password must contain at least one number'),
  password_confirm: yup.string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});
```

**Form Component Pattern**:
```typescript
// components/auth/LoginForm.tsx
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    try {
      await authService.login(data.username, data.password);
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('username')} />
      {errors.username && <span>{errors.username.message}</span>}
      {/* ... */}
    </form>
  );
}
```

### Validation Timing

**Real-Time Validation**:
- Validate on blur (after user leaves field)
- Show errors immediately after blur
- Clear errors when user starts typing again

**Submit-Time Validation**:
- Validate entire form on submit
- Prevent submission if validation fails
- Show all errors at once

## Accessibility Requirements

### ARIA Labels

**Requirements**:
- All interactive elements have accessible names
- Form inputs have associated labels
- Buttons have descriptive text or aria-label
- Icons have aria-label or aria-hidden

**Examples**:
```typescript
// Good
<button aria-label="Close dialog">×</button>
<input aria-label="Search notes" />
<nav aria-label="Main navigation">

// Form labels
<label htmlFor="username">Username</label>
<input id="username" {...register('username')} />
```

### Keyboard Navigation

**Requirements**:
- All interactive elements keyboard accessible
- Tab order is logical
- Focus indicators visible
- Keyboard shortcuts documented

**Implementation**:
- Use semantic HTML (buttons, links, form elements)
- Avoid `tabIndex` > 0 (except for custom components)
- Implement keyboard shortcuts for common actions
- Manage focus in modals and dropdowns

**Keyboard Shortcuts**:
- `Enter`: Submit forms, activate buttons
- `Escape`: Close modals, cancel actions
- `Tab`: Navigate between elements
- `Arrow keys`: Navigate lists, cards
- `Space`: Toggle checkboxes, flip cards

### Screen Reader Support

**Requirements**:
- Semantic HTML structure
- ARIA roles where needed
- Live regions for dynamic content
- Alt text for images

**Implementation**:
```typescript
// Live region for notifications
<div role="status" aria-live="polite" aria-atomic="true">
  {notificationMessage}
</div>

// Loading state
<div role="status" aria-busy="true">
  Loading...
</div>
```

### Focus Management

**Requirements**:
- Focus trap in modals
- Return focus after closing modals
- Focus visible indicators
- Skip links for main content

**Implementation**:
```typescript
// Focus trap in modal
useEffect(() => {
  const firstFocusable = modalRef.current?.querySelector(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  firstFocusable?.focus();
}, []);
```

## Loading State Management

### Loading Indicator Component

**Component**:
```typescript
// components/common/LoadingSpinner.tsx
export function LoadingSpinner({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  return (
    <div className={styles.spinner} role="status" aria-label="Loading">
      <div className={styles[size]} />
    </div>
  );
}
```

### Loading State Strategy

**When to Show Loading**:
- Initial data fetch
- Form submission
- Navigation between routes
- Background data updates

**Loading Patterns**:
1. **Full Page Loading**: Initial app load, route changes
2. **Inline Loading**: Data fetching in components
3. **Button Loading**: Form submissions
4. **Skeleton Screens**: For list views (better UX)

### Skeleton Screens

**Implementation**:
```typescript
// components/common/SkeletonCard.tsx
export function SkeletonCard() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonTitle} />
      <div className={styles.skeletonContent} />
    </div>
  );
}

// Usage
{loading ? (
  <>{[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}</>
) : (
  <NoteList notes={notes} />
)}
```

### Loading State in Hooks

**Pattern**:
```typescript
// hooks/useNotes.ts
export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    notesService.getNotes()
      .then(setNotes)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { notes, loading, error };
}
```

## State Management Patterns

### Context vs Local State

**Use Context For**:
- Authentication state (user, isAuthenticated)
- Theme state (light/dark mode)
- Global UI state (modals, notifications)

**Use Local State For**:
- Form state
- Component-specific UI state
- Temporary data

### Cache Invalidation

**Strategy**:
- Invalidate cache on mutations (create, update, delete)
- Refresh data after successful mutations
- Use optimistic updates where appropriate

**Pattern**:
```typescript
const { notes, refreshNotes } = useNotes();

const handleDelete = async (id: string) => {
  try {
    await notesService.deleteNote(id);
    refreshNotes(); // Invalidate and refresh
  } catch (error) {
    // Handle error
  }
};
```

### Optimistic Updates

**When to Use**:
- Fast operations (toggle, like, etc.)
- Operations with low failure rate
- Better UX for immediate feedback

**Pattern**:
```typescript
const handleToggle = async (id: string) => {
  // Optimistic update
  setNotes(notes.map(n => n.id === id ? { ...n, completed: !n.completed } : n));
  
  try {
    await notesService.updateNote(id, { completed: !note.completed });
  } catch (error) {
    // Rollback on error
    setNotes(notes);
    showError('Failed to update note');
  }
};
```

## Component Patterns

### Component Structure

**Standard Component Structure**:
```typescript
// 1. Imports
import React from 'react';
import styles from './Component.module.css';

// 2. Types/Interfaces
interface ComponentProps {
  // ...
}

// 3. Component
export function Component({ ... }: ComponentProps) {
  // 4. Hooks
  const [state, setState] = useState();
  
  // 5. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 6. Handlers
  const handleClick = () => {
    // ...
  };
  
  // 7. Render
  return (
    <div className={styles.component}>
      {/* ... */}
    </div>
  );
}
```

### Error Boundaries Per Route

**Implementation**:
```typescript
<Routes>
  <Route path="/notes" element={
    <ErrorBoundary>
      <NoteList />
    </ErrorBoundary>
  } />
</Routes>
```

---

**Status**: Frontend implementation details complete. Ready for Frontend Agent implementation.

