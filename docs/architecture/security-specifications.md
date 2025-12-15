# Security Specifications
**Date**: 2025-01-27
**Created By**: Architect Agent
**Status**: Final
**Reviewed By**: Senior Developer Agent

## Overview

This document specifies security requirements, implementations, and best practices for the Study Notes & Flashcard App.

## Authentication & Session Security

### Password Requirements

**Minimum Requirements**:
- Minimum length: 8 characters
- Maximum length: 128 characters
- Must contain at least one letter and one number
- Special characters allowed but not required
- Case-sensitive

**Implementation**:
- Use Django's `AUTH_PASSWORD_VALIDATORS` with:
  - `django.contrib.auth.password_validation.UserAttributeSimilarityValidator`
  - `django.contrib.auth.password_validation.MinimumLengthValidator` (min_length=8)
  - `django.contrib.auth.password_validation.CommonPasswordValidator`
  - `django.contrib.auth.password_validation.NumericPasswordValidator`

**Password Hashing**:
- Algorithm: PBKDF2 (Django default)
- Iterations: 260,000 (Django 4.2+ default)
- Salt: Automatically generated per password
- No need to change unless security requirements increase

### Session Security

**Session Configuration**:
```python
# settings.py
SESSION_COOKIE_SECURE = True  # HTTPS only in production
SESSION_COOKIE_HTTPONLY = True  # Prevent JavaScript access
SESSION_COOKIE_SAMESITE = 'Lax'  # CSRF protection
SESSION_COOKIE_AGE = 86400  # 24 hours (seconds)
SESSION_SAVE_EVERY_REQUEST = False  # Only save on modification
SESSION_EXPIRE_AT_BROWSER_CLOSE = True  # Expire on browser close
```

**Session Storage**:
- **Development**: Database-backed sessions (Django default)
- **Production**: Database-backed sessions (can migrate to Redis if needed)
- Session data stored in `django_session` table

**Session Timeout**:
- Default: 24 hours of inactivity
- Expires on browser close
- Can be extended by user activity

## Rate Limiting

### Implementation

**Package**: `django-ratelimit` (recommended) or Django's built-in throttling

**Rate Limits**:

1. **Authentication Endpoints** (`/api/auth/login/`, `/api/auth/register/`):
   - Limit: 5 requests per minute per IP address
   - Purpose: Prevent brute force attacks
   - Response: `429 Too Many Requests` with `Retry-After` header

2. **Scraping Endpoints** (`/api/scrape/`):
   - Limit: 10 requests per minute per user
   - Purpose: Prevent abuse and server overload
   - Response: `429 Too Many Requests`

3. **All Other Endpoints**:
   - Limit: 100 requests per minute per user
   - Purpose: Prevent abuse while allowing normal usage
   - Response: `429 Too Many Requests`

**Rate Limit Response Format**:
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "retry_after": 60,
  "status": "error"
}
```

**Implementation Example**:
```python
from django_ratelimit.decorators import ratelimit
from django_ratelimit.exceptions import Ratelimited

@ratelimit(key='ip', rate='5/m', method='POST')
@api_view(['POST'])
def login_view(request):
    if getattr(request, 'limited', False):
        raise Ratelimited()
    # ... login logic
```

## Input Validation & Sanitization

### Backend Validation

**Field Length Limits** (enforced at database and serializer level):
- Username: 1-150 characters
- Email: Max 254 characters (RFC 5321)
- Note title: 1-200 characters
- Note content: Unlimited (TextField), but recommend max 1MB
- Flashcard front/back: Unlimited (TextField), but recommend max 10KB each
- Category name: 1-100 characters
- Tag name: 1-50 characters
- FlashcardSet name: 1-200 characters
- FlashcardSet description: Unlimited (TextField)

**Input Sanitization**:
- **HTML Content**: Strip HTML tags from user input (use `bleach` library if needed)
- **Markdown**: Allow markdown in notes, sanitize on display
- **URLs**: Validate URL format, check against allowed domains for scraping
- **SQL Injection**: Prevented by Django ORM (parameterized queries)

**Validation Strategy**:
1. Frontend: Client-side validation for UX (can be bypassed)
2. Backend Serializers: Primary validation layer
3. Database Constraints: Final validation layer

### Frontend Validation

**Library**: `react-hook-form` with `yup` for schema validation

**Validation Rules**:
- Match backend validation rules exactly
- Real-time validation on blur
- Submit-time validation before API call
- Display clear error messages

**Example**:
```typescript
const schema = yup.object({
  username: yup.string()
    .min(1, 'Username is required')
    .max(150, 'Username must be 150 characters or less')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-zA-Z]/, 'Password must contain at least one letter')
    .matches(/[0-9]/, 'Password must contain at least one number'),
});
```

## Authorization

### User Data Isolation

**Principle**: Users can only access their own data

**Implementation**:
- All ViewSets filter queryset by `request.user`
- Custom permission classes verify ownership
- No information leakage in error messages

**Permission Classes**:
```python
class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user
```

**Error Messages**:
- 404 for non-existent resources (don't reveal existence)
- 403 for unauthorized access (don't reveal ownership)
- Generic error messages (no sensitive information)

### API Endpoint Authorization

**All endpoints except**:
- `/api/auth/register/` - Public
- `/api/auth/login/` - Public
- `/api/auth/logout/` - Requires authentication

**All other endpoints require**:
- Valid session (authenticated user)
- Proper ownership (user can only access their data)

## CSRF Protection

### Configuration

**CSRF Settings**:
```python
CSRF_COOKIE_SECURE = True  # HTTPS only in production
CSRF_COOKIE_HTTPONLY = False  # JavaScript needs access
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:3000',  # Development
    'https://your-domain.com',  # Production
]
```

**Frontend Implementation**:
- Get CSRF token from cookie: `document.cookie.match(/csrftoken=([^;]+)/)`
- Include in header: `X-CSRFToken: <token>`
- Required for all POST, PUT, PATCH, DELETE requests

## Security Logging

### Events to Log

1. **Failed Login Attempts**:
   - Username (if exists)
   - IP address
   - Timestamp
   - User agent

2. **Rate Limit Exceeded**:
   - Endpoint
   - IP address / User
   - Timestamp

3. **Unauthorized Access Attempts**:
   - Endpoint
   - User (if authenticated)
   - IP address
   - Timestamp

4. **Suspicious Activity**:
   - Multiple failed logins from same IP
   - Access attempts to non-existent resources
   - Unusual request patterns

**Logging Implementation**:
```python
import logging

security_logger = logging.getLogger('security')

def log_security_event(event_type: str, user: User = None, details: dict = None):
    security_logger.warning(
        f"{event_type}: User={user.username if user else 'Anonymous'}, "
        f"IP={details.get('ip')}, Details={details}"
    )
```

## Data Protection

### Sensitive Data

**Never Log or Expose**:
- Passwords (even hashed)
- Session keys
- CSRF tokens (except in secure cookies)
- User email addresses (unless necessary)

### Data Retention

**User Data**:
- Retained until user account deletion
- Soft deletes: Not implemented initially (can be added)
- GDPR compliance: Users can request data deletion

**Session Data**:
- Automatically cleaned by Django (expired sessions)
- No manual cleanup required

## HTTPS Requirements

**Production**:
- All traffic must use HTTPS
- HTTP redirects to HTTPS
- Secure cookies only
- HSTS header recommended

**Development**:
- HTTP acceptable for local development
- Secure cookies disabled in development

## Security Headers

**Recommended Headers** (via middleware or Nginx):
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000` (HTTPS only)

## Security Testing

**Requirements**:
- All security features must be tested
- Test rate limiting
- Test authentication/authorization
- Test input validation
- Test CSRF protection
- Security tests written by TDD Agent

---

**Status**: Security specifications complete. Ready for implementation by Backend Agent.

