# Database Schema Design
**Date**: 2025-01-27
**Created By**: Architect Agent
**Status**: Final

## Overview

The database schema is designed to support user authentication, note management, flashcard creation and study, with support for categories, tags, and study statistics. All tables include proper relationships, indexes, and constraints for data integrity and performance.

## Entity Relationship Diagram

```
User (extends Django AbstractUser)
│
├─── Category (1:N)
│    └─── Note (N:1)
│         └─── Tag (M:N via Note.tags)
│
├─── Note (1:N)
│    └─── FlashcardSet (1:N, optional - generated from note)
│         └─── Flashcard (1:N)
│              └─── StudySession (N:1, optional)
│
└─── StudySession (1:N)
```

## Detailed Schema

### User Model
**Extends**: Django's `AbstractUser`

**Fields** (inherited from AbstractUser):
- `id` (Primary Key, Auto-increment)
- `username` (Unique, Required)
- `email` (Unique, Optional)
- `password` (Hashed, Required)
- `first_name` (Optional)
- `last_name` (Optional)
- `is_active` (Boolean, Default: True)
- `is_staff` (Boolean, Default: False)
- `is_superuser` (Boolean, Default: False)
- `date_joined` (DateTime, Auto-set)
- `last_login` (DateTime, Optional)

**Relationships**:
- One-to-Many with Category
- One-to-Many with Note
- One-to-Many with Tag
- One-to-Many with FlashcardSet
- One-to-Many with StudySession

**Indexes**:
- `username` (unique index)
- `email` (unique index)

---

### Category Model

**Purpose**: Organize notes and flashcard sets by topic

**Fields**:
- `id` (Primary Key, Auto-increment)
- `name` (CharField, Max Length: 100, Required)
- `user` (ForeignKey → User, Required, CASCADE on delete)
- `color` (CharField, Max Length: 7, Default: "#4a9eff") - Hex color for UI
- `created_at` (DateTime, Auto-set on create)
- `updated_at` (DateTime, Auto-update)

**Constraints**:
- Unique together: (`user`, `name`) - Users can't have duplicate category names
- `name` cannot be empty

**Indexes**:
- `user` + `name` (composite index for lookups)
- `user` (for filtering user's categories)

**Example**:
```python
Category.objects.create(
    name="Python",
    user=user,
    color="#3776ab"
)
```

---

### Tag Model

**Purpose**: Flexible tagging system for notes

**Fields**:
- `id` (Primary Key, Auto-increment)
- `name` (CharField, Max Length: 50, Required)
- `user` (ForeignKey → User, Required, CASCADE on delete)
- `created_at` (DateTime, Auto-set on create)

**Constraints**:
- Unique together: (`user`, `name`) - Users can't have duplicate tag names
- `name` cannot be empty

**Indexes**:
- `user` + `name` (composite index)
- `user` (for filtering user's tags)

**Relationships**:
- Many-to-Many with Note (via `Note.tags`)

---

### Note Model

**Purpose**: Store user's study notes with content, metadata, and organization

**Fields**:
- `id` (Primary Key, Auto-increment)
- `title` (CharField, Max Length: 200, Required)
- `content` (TextField, Required) - Supports markdown
- `user` (ForeignKey → User, Required, CASCADE on delete)
- `category` (ForeignKey → Category, Optional, SET_NULL on delete)
- `tags` (ManyToManyField → Tag, Optional)
- `source_url` (URLField, Optional) - For scraped content
- `created_at` (DateTime, Auto-set on create)
- `updated_at` (DateTime, Auto-update)

**Constraints**:
- `title` cannot be empty
- `content` cannot be empty
- `user` is required

**Indexes**:
- `user` + `-updated_at` (composite index for user's notes sorted by date)
- `user` + `category` (for filtering by category)
- `title` (for search)
- `created_at` (for sorting)

**Methods** (to be implemented by Backend Agent):
- `__str__()`: Returns title
- `get_excerpt()`: Returns first 100 characters of content

---

### FlashcardSet Model

**Purpose**: Group related flashcards together

**Fields**:
- `id` (Primary Key, Auto-increment)
- `name` (CharField, Max Length: 200, Required)
- `description` (TextField, Optional)
- `user` (ForeignKey → User, Required, CASCADE on delete)
- `category` (ForeignKey → Category, Optional, SET_NULL on delete)
- `created_at` (DateTime, Auto-set on create)
- `updated_at` (DateTime, Auto-update)

**Constraints**:
- `name` cannot be empty
- `user` is required

**Indexes**:
- `user` + `-updated_at` (composite index)
- `user` + `category` (for filtering)

**Relationships**:
- One-to-Many with Flashcard

---

### Flashcard Model

**Purpose**: Individual flashcard with spaced repetition data

**Fields**:
- `id` (Primary Key, Auto-increment)
- `flashcard_set` (ForeignKey → FlashcardSet, Required, CASCADE on delete)
- `front` (TextField, Required) - Question side
- `back` (TextField, Required) - Answer side
- `difficulty` (CharField, Choices: ['easy', 'medium', 'hard'], Default: 'medium')
- `last_studied` (DateTime, Optional)
- `next_review` (DateTime, Optional) - Calculated by SM-2 algorithm
- `review_count` (Integer, Default: 0)
- `correct_count` (Integer, Default: 0)
- `ease_factor` (Float, Default: 2.5) - For SM-2 algorithm
- `created_at` (DateTime, Auto-set on create)
- `updated_at` (DateTime, Auto-update)

**Constraints**:
- `front` cannot be empty
- `back` cannot be empty
- `ease_factor` must be >= 1.3 (SM-2 constraint)
- `review_count` >= 0
- `correct_count` >= 0

**Indexes**:
- `flashcard_set` + `next_review` (for finding cards due for review)
- `flashcard_set` (for listing cards in a set)
- `next_review` (for querying cards due)

**Methods** (to be implemented by Backend Agent):
- `update_review(quality: int)`: Updates card based on SM-2 algorithm
- `is_due()`: Returns True if card is due for review
- `get_interval()`: Returns days until next review

**Spaced Repetition Algorithm (SM-2)**:
- Quality scale: 0-5 (0=wrong, 5=perfect)
- Ease factor adjusts based on performance
- Interval increases with successful reviews
- Failed reviews reset interval to 1 day

---

### StudySession Model

**Purpose**: Track study sessions for statistics

**Fields**:
- `id` (Primary Key, Auto-increment)
- `user` (ForeignKey → User, Required, CASCADE on delete)
- `flashcard_set` (ForeignKey → FlashcardSet, Optional, SET_NULL on delete)
- `started_at` (DateTime, Auto-set on create)
- `ended_at` (DateTime, Optional)
- `cards_studied` (Integer, Default: 0)
- `cards_correct` (Integer, Default: 0)
- `mode` (CharField, Choices: ['simple', 'spaced'], Default: 'simple')

**Constraints**:
- `cards_studied` >= 0
- `cards_correct` >= 0
- `cards_correct` <= `cards_studied`

**Indexes**:
- `user` + `-started_at` (for user's recent sessions)
- `user` + `flashcard_set` (for set-specific statistics)

**Methods** (to be implemented by Backend Agent):
- `end_session()`: Sets ended_at and calculates final statistics
- `get_duration()`: Returns session duration in minutes
- `get_accuracy()`: Returns percentage of correct answers

---

## Database Constraints Summary

### Foreign Key Constraints
- All foreign keys use appropriate `on_delete` behavior:
  - `CASCADE`: Delete related records when parent is deleted (User → Notes, etc.)
  - `SET_NULL`: Set to NULL when parent is deleted (Category → Notes, optional relationships)

### Unique Constraints
- `(user, name)` for Category - prevents duplicate category names per user
- `(user, name)` for Tag - prevents duplicate tag names per user

### Check Constraints
- `ease_factor >= 1.3` for Flashcard (SM-2 algorithm requirement)
- `cards_correct <= cards_studied` for StudySession

## Indexes for Performance

### High-Traffic Queries
1. **User's notes sorted by date**: `user + -updated_at` on Note
2. **Cards due for review**: `flashcard_set + next_review` on Flashcard
3. **User's categories**: `user` on Category
4. **User's tags**: `user` on Tag
5. **Recent study sessions**: `user + -started_at` on StudySession

## Migration Strategy

1. **Initial Migration**: Create all tables with indexes
2. **Future Migrations**: Add indexes as needed based on query patterns
3. **Data Migration**: None required for initial setup

## Data Integrity

1. **Referential Integrity**: Enforced by foreign key constraints
2. **Domain Integrity**: Enforced by field constraints and validators
3. **User Isolation**: All queries filtered by user to ensure data privacy
4. **Soft Deletes**: Not implemented initially (can be added later if needed)

---

**Status**: Database schema design complete. Ready for Database Agent to create Django models and migrations.

