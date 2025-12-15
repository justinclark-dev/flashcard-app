# Database Schema Clarifications
**Date**: 2025-01-27
**Created By**: Architect Agent
**Status**: Final
**Reviewed By**: Senior Developer Agent

## Overview

This document provides clarifications and additional specifications for the database schema design.

## Cascade Delete Behavior

### Verified Cascade Delete Strategy

**User Deletion**:
- **CASCADE** to: Category, Note, Tag, FlashcardSet, StudySession
- **Rationale**: When a user deletes their account, all their data should be deleted
- **GDPR Compliance**: User data is completely removed upon account deletion
- **Implementation**: Django's `on_delete=models.CASCADE`

**Category Deletion**:
- **SET_NULL** for: Note.category, FlashcardSet.category
- **Rationale**: Notes and sets should remain even if category is deleted
- **Implementation**: Django's `on_delete=models.SET_NULL, null=True`

**FlashcardSet Deletion**:
- **CASCADE** to: Flashcard
- **Rationale**: Cards belong to a set; if set is deleted, cards are deleted
- **Implementation**: Django's `on_delete=models.CASCADE`

**FlashcardSet Deletion (from User)**:
- **SET_NULL** for: StudySession.flashcard_set
- **Rationale**: Study sessions should remain for statistics even if set is deleted
- **Implementation**: Django's `on_delete=models.SET_NULL, null=True`

### Cascade Delete Summary

```
User (DELETE)
  ├── Category (CASCADE) ✓
  ├── Note (CASCADE) ✓
  ├── Tag (CASCADE) ✓
  ├── FlashcardSet (CASCADE) ✓
  └── StudySession (CASCADE) ✓

Category (DELETE)
  ├── Note.category (SET_NULL) ✓
  └── FlashcardSet.category (SET_NULL) ✓

FlashcardSet (DELETE)
  ├── Flashcard (CASCADE) ✓
  └── StudySession.flashcard_set (SET_NULL) ✓
```

## Soft Deletes

### Decision: Not Implemented in MVP

**Rationale**:
- MVP focuses on core functionality
- Hard deletes are simpler to implement
- GDPR compliance handled by complete data deletion
- Can be added later if needed

**Future Consideration**:
- Add `deleted_at` field to models if soft deletes needed
- Add `is_deleted` boolean flag
- Filter deleted records in querysets

## Data Types Verification

### Field Type Choices

**CharField vs TextField**:
- **CharField**: Used for short, bounded text (title, name, username)
- **TextField**: Used for long, unbounded text (content, description)
- **Verification**: All field type choices are appropriate

**DateTime Fields**:
- **Timezone-Aware**: All DateTime fields use `timezone-aware` datetimes
- **Django Setting**: `USE_TZ = True` (default in Django 4.2+)
- **Storage**: Stored in UTC, converted to user timezone in frontend

**Integer Fields**:
- **review_count**: Positive integer, no max (unlikely to exceed 2^31)
- **correct_count**: Positive integer, no max
- **cards_studied**: Positive integer, no max
- **cards_correct**: Positive integer, no max
- **Verification**: Integer fields are appropriate (no need for BigInteger)

### Field Length Verification

**CharField Max Lengths**:
- Username: 150 (Django AbstractUser default) ✓
- Email: 254 (RFC 5321 maximum) ✓
- Category name: 100 ✓
- Tag name: 50 ✓
- Note title: 200 ✓
- FlashcardSet name: 200 ✓
- Flashcard difficulty: 10 (choices: 'easy', 'medium', 'hard') ✓

**TextField**:
- Note content: Unlimited (TextField) ✓
- Flashcard front/back: Unlimited (TextField) ✓
- FlashcardSet description: Unlimited (TextField) ✓

## Indexes Enhancement

### Additional Indexes

**Composite Indexes** (already specified):
- `user + -updated_at` on Note ✓
- `user + category` on Note ✓
- `flashcard_set + next_review` on Flashcard ✓
- `user + -started_at` on StudySession ✓

**Partial Indexes** (recommended additions):

1. **Flashcard - Cards Due for Review**:
```python
# Partial index for cards due for review
class Meta:
    indexes = [
        models.Index(
            fields=['flashcard_set', 'next_review'],
            condition=Q(next_review__isnull=False),
            name='flashcard_due_review_idx'
        ),
    ]
```

2. **Note - Active Notes** (if soft deletes added later):
```python
# Future: Partial index for non-deleted notes
# Not needed in MVP
```

### Index Performance

**Query Patterns Optimized**:
- User's notes sorted by date: `user + -updated_at` ✓
- User's notes by category: `user + category` ✓
- Cards due for review: `flashcard_set + next_review` ✓
- User's recent sessions: `user + -started_at` ✓

## Timezone Handling

### Timezone Strategy

**Backend (Django)**:
- All DateTime fields stored in UTC
- Django setting: `USE_TZ = True`
- Timezone-aware datetimes throughout

**Frontend**:
- Receive datetimes in UTC (ISO 8601 format)
- Convert to user's local timezone for display
- Use `date-fns` or native `Intl.DateTimeFormat` for formatting

**Implementation**:
```python
# Backend - Django automatically uses timezone-aware datetimes
from django.utils import timezone

note.created_at = timezone.now()  # UTC
```

```typescript
// Frontend - Convert UTC to local time
const formatDate = (utcString: string) => {
  const date = new Date(utcString);
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};
```

## Data Retention Policy

### Current Policy (MVP)

**User Data**:
- Retained until user account deletion
- No automatic expiration
- User can delete account at any time

**Session Data**:
- Automatically cleaned by Django (expired sessions)
- No manual cleanup required

**Study Session History**:
- Retained indefinitely
- User can delete individual sessions
- Statistics calculated from all sessions

### Future Considerations

**Data Retention Options**:
- Auto-delete sessions older than X months
- Archive old notes instead of deleting
- Export data before deletion

## Database Constraints

### Check Constraints

**Flashcard Model**:
```python
class Flashcard(models.Model):
    ease_factor = models.FloatField(default=2.5)
    review_count = models.IntegerField(default=0)
    correct_count = models.IntegerField(default=0)
    
    class Meta:
        constraints = [
            models.CheckConstraint(
                check=Q(ease_factor__gte=1.3),
                name='ease_factor_min'
            ),
            models.CheckConstraint(
                check=Q(review_count__gte=0),
                name='review_count_non_negative'
            ),
            models.CheckConstraint(
                check=Q(correct_count__gte=0),
                name='correct_count_non_negative'
            ),
            models.CheckConstraint(
                check=Q(correct_count__lte=F('review_count')),
                name='correct_count_lte_review_count'
            ),
        ]
```

**StudySession Model**:
```python
class StudySession(models.Model):
    cards_studied = models.IntegerField(default=0)
    cards_correct = models.IntegerField(default=0)
    
    class Meta:
        constraints = [
            models.CheckConstraint(
                check=Q(cards_studied__gte=0),
                name='cards_studied_non_negative'
            ),
            models.CheckConstraint(
                check=Q(cards_correct__gte=0),
                name='cards_correct_non_negative'
            ),
            models.CheckConstraint(
                check=Q(cards_correct__lte=F('cards_studied')),
                name='cards_correct_lte_studied'
            ),
        ]
```

## Unique Constraints

### Verified Unique Constraints

**Category**:
- `(user, name)` - Unique together ✓
- Prevents duplicate category names per user

**Tag**:
- `(user, name)` - Unique together ✓
- Prevents duplicate tag names per user

**User** (from AbstractUser):
- `username` - Unique ✓
- `email` - Unique ✓

## Migration Strategy

### Initial Migration

**Steps**:
1. Create all models with indexes
2. Create all constraints
3. Set up initial data (if any)

**Rollback Strategy**:
- Migrations are reversible
- Test migrations in development first
- Backup database before production migrations

### Future Migrations

**Adding Indexes**:
- Add indexes via migrations
- Monitor query performance
- Add indexes as needed based on usage

**Schema Changes**:
- Always use migrations (never manual SQL)
- Test migrations on development data
- Consider data migrations for complex changes

## Data Integrity

### Referential Integrity

**Enforced By**:
- Foreign key constraints
- Django ORM
- Database-level constraints

**Verification**:
- All foreign keys have appropriate `on_delete` behavior ✓
- All relationships are properly defined ✓

### Domain Integrity

**Enforced By**:
- Field constraints (CharField max_length, etc.)
- Model validators
- Serializer validators
- Database check constraints

**Verification**:
- All field constraints are appropriate ✓
- Check constraints defined for business rules ✓

### User Isolation

**Enforced By**:
- Query filtering: `Model.objects.filter(user=request.user)`
- Permission classes
- Serializer validation

**Verification**:
- All queries filter by user ✓
- No cross-user data access possible ✓

---

**Status**: Database clarifications complete. Ready for Database Agent to create models and migrations.

