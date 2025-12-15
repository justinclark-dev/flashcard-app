# API Design Specification
**Date**: 2025-01-27
**Created By**: Architect Agent
**Status**: Final

## Overview

The API follows RESTful principles with Django Session Authentication. All endpoints (except authentication) require an authenticated session. Responses use standard HTTP status codes and JSON format.

## Base URL

- **Development**: `http://localhost:8000/api/`
- **Production**: `https://your-domain.com/api/`

## Authentication

All authenticated endpoints require:
- Valid Django session cookie (set via `/api/auth/login/`)
- CSRF token in header: `X-CSRFToken` (obtained from cookie `csrftoken`)

## Response Format

**Note**: All response formats are standardized. See `docs/architecture/api-standards.md` for complete specifications.

### Success Response (Single Object)
```json
{
  "data": { ... },
  "status": "success"
}
```

### Success Response (List with Pagination)
```json
{
  "count": 100,
  "next": "http://api/notes/?page=2",
  "previous": null,
  "results": [ ... ],
  "status": "success"
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": {
    "field_name": ["Error message for field"]
  },
  "status": "error",
  "code": "ERROR_CODE"
}
```

**See `docs/architecture/api-standards.md` for complete error response specifications.**

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/register/`
Register a new user.

**Request Body**:
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "securepass123",
  "password_confirm": "securepass123"
}
```

**Response** (201 Created):
```json
{
  "data": {
    "id": 1,
    "username": "newuser",
    "email": "user@example.com"
  },
  "status": "success"
}
```

**Errors**:
- 400: Validation errors (username taken, passwords don't match, etc.)

---

#### POST `/api/auth/login/`
Login user and create session.

**Request Body**:
```json
{
  "username": "newuser",
  "password": "securepass123"
}
```

**Response** (200 OK):
```json
{
  "data": {
    "id": 1,
    "username": "newuser",
    "email": "user@example.com"
  },
  "status": "success"
}
```

**Errors**:
- 401: Invalid credentials

---

#### POST `/api/auth/logout/`
Logout user and destroy session.

**Request**: No body required

**Response** (200 OK):
```json
{
  "message": "Logged out successfully",
  "status": "success"
}
```

---

#### GET `/api/auth/user/`
Get current authenticated user.

**Response** (200 OK):
```json
{
  "data": {
    "id": 1,
    "username": "newuser",
    "email": "user@example.com",
    "date_joined": "2025-01-27T10:00:00Z"
  },
  "status": "success"
}
```

**Errors**:
- 401: Not authenticated

---

### Notes Endpoints

#### GET `/api/notes/`
List user's notes with optional filtering and pagination.

**Query Parameters**:
- `page` (int): Page number (default: 1)
- `page_size` (int): Items per page (default: 20, max: 100)
- `category` (int): Filter by category ID
- `search` (string): Search in title and content
- `ordering` (string): Order by field (`created_at`, `-created_at`, `title`, `-title`)

**Response** (200 OK):
```json
{
  "count": 50,
  "next": "http://api/notes/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Python Basics",
      "content": "Python is a programming language...",
      "category": {
        "id": 1,
        "name": "Python",
        "color": "#3776ab"
      },
      "tags": [
        {"id": 1, "name": "basics"},
        {"id": 2, "name": "python"}
      ],
      "source_url": "https://docs.python.org",
      "created_at": "2025-01-27T10:00:00Z",
      "updated_at": "2025-01-27T10:00:00Z"
    }
  ],
  "status": "success"
}
```

---

#### POST `/api/notes/`
Create a new note.

**Request Body**:
```json
{
  "title": "New Note",
  "content": "Note content here...",
  "category_id": 1,
  "tag_ids": [1, 2, 3],
  "source_url": "https://example.com"
}
```

**Response** (201 Created):
```json
{
  "data": {
    "id": 2,
    "title": "New Note",
    "content": "Note content here...",
    "category": {...},
    "tags": [...],
    "created_at": "2025-01-27T10:00:00Z",
    "updated_at": "2025-01-27T10:00:00Z"
  },
  "status": "success"
}
```

**Errors**:
- 400: Validation errors
- 401: Not authenticated

---

#### GET `/api/notes/{id}/`
Get a specific note by ID.

**Response** (200 OK):
```json
{
  "data": {
    "id": 1,
    "title": "Python Basics",
    "content": "...",
    "category": {...},
    "tags": [...],
    "created_at": "2025-01-27T10:00:00Z",
    "updated_at": "2025-01-27T10:00:00Z"
  },
  "status": "success"
}
```

**Errors**:
- 404: Note not found
- 403: Note belongs to another user

---

#### PUT `/api/notes/{id}/`
Update a note (full update).

**Request Body**: Same as POST

**Response** (200 OK): Same as GET

**Errors**:
- 400: Validation errors
- 404: Note not found
- 403: Note belongs to another user

---

#### PATCH `/api/notes/{id}/`
Partial update of a note.

**Request Body**: Any subset of note fields

**Response** (200 OK): Same as GET

---

#### DELETE `/api/notes/{id}/`
Delete a note.

**Response** (204 No Content)

**Errors**:
- 404: Note not found
- 403: Note belongs to another user

---

### Categories Endpoints

#### GET `/api/categories/`
List user's categories.

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": 1,
      "name": "Python",
      "color": "#3776ab",
      "created_at": "2025-01-27T10:00:00Z"
    }
  ],
  "status": "success"
}
```

---

#### POST `/api/categories/`
Create a new category.

**Request Body**:
```json
{
  "name": "JavaScript",
  "color": "#f7df1e"
}
```

**Response** (201 Created):
```json
{
  "data": {
    "id": 2,
    "name": "JavaScript",
    "color": "#f7df1e",
    "created_at": "2025-01-27T10:00:00Z"
  },
  "status": "success"
}
```

**Errors**:
- 400: Validation errors (duplicate name, invalid color format)

---

#### PUT `/api/categories/{id}/`
Update a category.

**Request Body**: Same as POST

**Response** (200 OK): Same as GET

---

#### DELETE `/api/categories/{id}/`
Delete a category. Notes with this category will have category set to null.

**Response** (204 No Content)

---

### Flashcard Sets Endpoints

#### GET `/api/flashcard-sets/`
List user's flashcard sets.

**Query Parameters**:
- `category` (int): Filter by category ID
- `page`, `page_size`, `ordering`: Pagination and ordering

**Response** (200 OK):
```json
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "name": "Python Basics",
      "description": "Basic Python concepts",
      "category": {...},
      "card_count": 25,
      "created_at": "2025-01-27T10:00:00Z",
      "updated_at": "2025-01-27T10:00:00Z"
    }
  ],
  "status": "success"
}
```

---

#### POST `/api/flashcard-sets/`
Create a new flashcard set.

**Request Body**:
```json
{
  "name": "React Hooks",
  "description": "Common React hooks",
  "category_id": 1
}
```

**Response** (201 Created):
```json
{
  "data": {
    "id": 2,
    "name": "React Hooks",
    "description": "Common React hooks",
    "category": {...},
    "card_count": 0,
    "created_at": "2025-01-27T10:00:00Z",
    "updated_at": "2025-01-27T10:00:00Z"
  },
  "status": "success"
}
```

---

#### GET `/api/flashcard-sets/{id}/`
Get flashcard set details.

**Response** (200 OK): Same as POST response

---

#### PUT `/api/flashcard-sets/{id}/`
Update flashcard set.

**Request Body**: Same as POST

**Response** (200 OK): Same as GET

---

#### DELETE `/api/flashcard-sets/{id}/`
Delete flashcard set and all its cards.

**Response** (204 No Content)

---

#### POST `/api/flashcard-sets/{id}/generate-from-note/`
Generate flashcards from a note.

**Request Body**:
```json
{
  "note_id": 1,
  "num_cards": 10
}
```

**Response** (201 Created):
```json
{
  "data": {
    "message": "Generated 10 flashcards",
    "cards_created": 10
  },
  "status": "success"
}
```

---

### Flashcards Endpoints

#### GET `/api/flashcard-sets/{set_id}/cards/`
List cards in a flashcard set.

**Query Parameters**:
- `due_only` (bool): Only return cards due for review
- `page`, `page_size`: Pagination

**Response** (200 OK):
```json
{
  "count": 25,
  "results": [
    {
      "id": 1,
      "front": "What is React?",
      "back": "A JavaScript library for building user interfaces",
      "difficulty": "medium",
      "last_studied": null,
      "next_review": null,
      "review_count": 0,
      "correct_count": 0,
      "ease_factor": 2.5,
      "created_at": "2025-01-27T10:00:00Z"
    }
  ],
  "status": "success"
}
```

---

#### POST `/api/flashcard-sets/{set_id}/cards/`
Create a new flashcard in a set.

**Request Body**:
```json
{
  "front": "What is useState?",
  "back": "A React Hook for managing state",
  "difficulty": "easy"
}
```

**Response** (201 Created):
```json
{
  "data": {
    "id": 2,
    "front": "What is useState?",
    "back": "A React Hook for managing state",
    "difficulty": "easy",
    "review_count": 0,
    "correct_count": 0,
    "ease_factor": 2.5,
    "created_at": "2025-01-27T10:00:00Z"
  },
  "status": "success"
}
```

---

#### PUT `/api/cards/{id}/`
Update a flashcard.

**Request Body**:
```json
{
  "front": "Updated question",
  "back": "Updated answer",
  "difficulty": "hard"
}
```

**Response** (200 OK): Same as POST

---

#### DELETE `/api/cards/{id}/`
Delete a flashcard.

**Response** (204 No Content)

---

#### POST `/api/cards/{id}/review/`
Record a card review for spaced repetition.

**Request Body**:
```json
{
  "quality": 5
}
```

**Quality Scale**: 0-5
- 0: Complete blackout
- 1: Incorrect response
- 2: Incorrect response with correct one remembered
- 3: Correct response with difficulty
- 4: Correct response after hesitation
- 5: Perfect response

**Response** (200 OK):
```json
{
  "data": {
    "id": 1,
    "next_review": "2025-01-28T10:00:00Z",
    "interval": 1,
    "ease_factor": 2.6,
    "review_count": 1,
    "correct_count": 1
  },
  "status": "success"
}
```

---

### Study Sessions Endpoints

#### POST `/api/study-sessions/`
Start a new study session.

**Request Body**:
```json
{
  "flashcard_set_id": 1,
  "mode": "spaced"
}
```

**Mode Options**: `"simple"` or `"spaced"`

**Response** (201 Created):
```json
{
  "data": {
    "id": 1,
    "flashcard_set": {...},
    "started_at": "2025-01-27T10:00:00Z",
    "mode": "spaced",
    "cards_studied": 0,
    "cards_correct": 0
  },
  "status": "success"
}
```

---

#### PUT `/api/study-sessions/{id}/`
End a study session.

**Request Body**: No body required (or optional stats)

**Response** (200 OK):
```json
{
  "data": {
    "id": 1,
    "started_at": "2025-01-27T10:00:00Z",
    "ended_at": "2025-01-27T10:30:00Z",
    "duration_minutes": 30,
    "cards_studied": 25,
    "cards_correct": 20,
    "accuracy": 80.0
  },
  "status": "success"
}
```

---

#### GET `/api/study-sessions/`
List user's study sessions.

**Query Parameters**:
- `flashcard_set` (int): Filter by set ID
- `page`, `page_size`: Pagination

**Response** (200 OK):
```json
{
  "count": 50,
  "results": [
    {
      "id": 1,
      "flashcard_set": {...},
      "started_at": "2025-01-27T10:00:00Z",
      "ended_at": "2025-01-27T10:30:00Z",
      "cards_studied": 25,
      "cards_correct": 20,
      "mode": "spaced"
    }
  ],
  "status": "success"
}
```

---

#### GET `/api/study-sessions/stats/`
Get study statistics for user.

**Response** (200 OK):
```json
{
  "data": {
    "total_sessions": 50,
    "total_cards_studied": 1250,
    "total_cards_correct": 1000,
    "overall_accuracy": 80.0,
    "streak_days": 7,
    "cards_due": 15
  },
  "status": "success"
}
```

---

### Scraping Endpoints

#### POST `/api/scrape/`
Scrape content from a URL.

**Request Body**:
```json
{
  "url": "https://react.dev/learn/state-a-components-memory"
}
```

**Response** (200 OK):
```json
{
  "data": {
    "title": "State: A Component's Memory",
    "content": "Scraped content here...",
    "source_url": "https://react.dev/learn/state-a-components-memory"
  },
  "status": "success"
}
```

**Errors**:
- 400: Invalid URL or scraping failed
- 403: URL not from allowed domains

---

#### POST `/api/scrape/generate-cards/`
Generate flashcards from scraped content.

**Request Body**:
```json
{
  "url": "https://react.dev/learn/state-a-components-memory",
  "flashcard_set_id": 1,
  "num_cards": 10
}
```

**Response** (201 Created):
```json
{
  "data": {
    "message": "Generated 10 flashcards",
    "cards_created": 10,
    "flashcard_set_id": 1
  },
  "status": "success"
}
```

---

## HTTP Status Codes

- **200 OK**: Successful GET, PUT, PATCH
- **201 Created**: Successful POST
- **204 No Content**: Successful DELETE
- **400 Bad Request**: Validation errors
- **401 Unauthorized**: Not authenticated
- **403 Forbidden**: Authenticated but not authorized (e.g., accessing another user's data)
- **404 Not Found**: Resource doesn't exist
- **500 Internal Server Error**: Server error

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute per IP
- **Other endpoints**: 100 requests per minute per user
- **Scraping endpoints**: 10 requests per minute per user

## CORS Configuration

- **Allowed Origins**: Configured in Django settings
- **Credentials**: Enabled for session cookies
- **Methods**: GET, POST, PUT, PATCH, DELETE, OPTIONS
- **Headers**: Content-Type, X-CSRFToken

---

**Status**: API design complete. Ready for Backend Agent implementation and TDD Agent test creation.

