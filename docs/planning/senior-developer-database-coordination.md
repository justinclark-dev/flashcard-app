# Senior Developer - Database Agent Coordination
**Date**: 2025-01-27
**Coordinator**: Senior Developer Agent
**Status**: ✅ Coordination Complete

## Coordination Summary

The Senior Developer Agent has coordinated with the Database Agent to begin creating the Flashcard feature models. All specifications, test requirements, and SM-2 algorithm details are ready for model implementation.

## Instructions to Database Agent

### Task: Create Flashcard Models

Following the approved architecture and test specifications, create the following Django models:

1. **FlashcardSet Model**
2. **Flashcard Model** (with SM-2 algorithm methods)
3. **StudySession Model**

### Key Requirements

#### FlashcardSet Model
- Fields: `name`, `description`, `user`, `category`, `created_at`, `updated_at`
- Relationships: ForeignKey to User (CASCADE), ForeignKey to Category (SET_NULL)
- Indexes: `user` + `-updated_at`, `user` + `category`
- Constraints: `name` required, unique per user (via Meta)

#### Flashcard Model
- Fields: `flashcard_set`, `front`, `back`, `difficulty`, `last_studied`, `next_review`, `review_count`, `correct_count`, `ease_factor`, `created_at`, `updated_at`
- Relationships: ForeignKey to FlashcardSet (CASCADE)
- SM-2 Algorithm Fields:
  - `ease_factor`: FloatField, default=2.5, must be >= 1.3
  - `review_count`: IntegerField, default=0
  - `correct_count`: IntegerField, default=0
  - `last_studied`: DateTimeField, null=True
  - `next_review`: DateTimeField, null=True
- Methods to implement:
  - `update_review(quality: int)`: SM-2 algorithm implementation
  - `is_due()`: Returns True if card is due for review
  - `get_interval()`: Returns days until next review
- Constraints: `ease_factor >= 1.3` (database check constraint)

#### StudySession Model
- Fields: `user`, `flashcard_set`, `started_at`, `ended_at`, `cards_studied`, `cards_correct`, `mode`
- Relationships: ForeignKey to User (CASCADE), ForeignKey to FlashcardSet (SET_NULL)
- Constraints: `cards_correct <= cards_studied` (database check constraint)
- Methods to implement:
  - `end_session()`: Sets `ended_at` timestamp
  - `get_duration()`: Returns session duration in minutes
  - `get_accuracy()`: Returns percentage of correct answers

### SM-2 Algorithm Implementation

The `Flashcard.update_review(quality)` method must implement the SM-2 algorithm as documented in `docs/planning/research-flashcard-findings.md`:

**Quality Scale**: 0-5
- 0-1: Decrease ease_factor by 0.20
- 2: Decrease ease_factor by 0.10
- 3: No change
- 4: Increase ease_factor by 0.05
- 5: Increase ease_factor by 0.10

**Interval Calculation**:
- First review (review_count == 0): Interval = 1 day
- Second review (review_count == 1): Interval = 6 days if quality >= 3, else 1 day
- Subsequent reviews: Interval = previous_interval * ease_factor if quality >= 3, else reset to 1 day

**Ease Factor Constraints**:
- Minimum: 1.3
- Adjustments must respect minimum

### Reference Documents

- `docs/architecture/database-schema.md` - Detailed model specifications
- `docs/planning/research-flashcard-findings.md` - SM-2 algorithm implementation details
- `backend/flashcards/tests/test_models.py` - Test requirements
- `backend/notes/models.py` - Reference implementation pattern

### Deliverables

1. `backend/flashcards/models.py` - All three models with methods
2. `backend/flashcards/migrations/0001_initial.py` - Initial migration
3. Apply migrations to database
4. Verify models work with existing test structure

### Next Steps After Completion

Once models are created:
1. Backend Agent will implement serializers and views
2. Frontend Agent will implement components
3. TDD Agent will verify all tests pass

---

**Status**: ✅ Database Agent assigned to create models
**Next Action**: Database Agent begins creating FlashcardSet, Flashcard, and StudySession models

