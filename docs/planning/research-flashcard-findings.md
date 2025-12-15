# Research Agent - Flashcard Feature Research Findings
**Date**: 2025-01-27
**Researcher**: Research Agent
**Status**: Research Complete

## Executive Summary

The Research Agent has conducted comprehensive research on spaced repetition algorithms, flashcard UI/UX patterns, and implementation best practices. Key findings and recommendations are documented below.

## SM-2 Spaced Repetition Algorithm Research

### Algorithm Overview

**SM-2 (SuperMemo 2)** is a proven spaced repetition algorithm that adjusts review intervals based on user performance.

### Core Algorithm Components

#### 1. Quality Scale (0-5)

```
0 - Complete blackout (total failure)
1 - Incorrect response (but remembered after seeing answer)
2 - Incorrect response (with difficulty)
3 - Correct response (with difficulty)
4 - Correct response (after hesitation)
5 - Perfect response (instant, confident)
```

#### 2. Ease Factor (EF)

- **Initial Value**: 2.5
- **Range**: 1.3 (minimum) to infinity
- **Adjustment Formula**:
  ```
  EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  ```
  Where `q` is the quality (0-5)

- **Simplified Adjustment**:
  - Quality 0-1: Decrease EF by 0.15-0.20
  - Quality 2: Decrease EF by 0.05-0.10
  - Quality 3: No change
  - Quality 4: Increase EF by 0.05
  - Quality 5: Increase EF by 0.10-0.15

#### 3. Interval Calculation

**First Review**:
- Interval = 1 day (regardless of quality)

**Second Review**:
- If quality >= 3: Interval = 6 days
- If quality < 3: Interval = 1 day

**Subsequent Reviews**:
- If quality >= 3: Interval = previous_interval * EF
- If quality < 3: Reset to 1 day, decrease EF

#### 4. Implementation Pattern

```python
def update_review(card, quality):
    """
    Update flashcard based on SM-2 algorithm
    
    Args:
        card: Flashcard instance
        quality: int (0-5) - User's performance rating
    
    Returns:
        dict: Updated values (interval, next_review, ease_factor)
    """
    from datetime import datetime, timedelta
    
    # Update ease factor
    if quality <= 1:
        card.ease_factor = max(1.3, card.ease_factor - 0.20)
    elif quality == 2:
        card.ease_factor = max(1.3, card.ease_factor - 0.10)
    elif quality == 3:
        # No change
        pass
    elif quality == 4:
        card.ease_factor += 0.05
    else:  # quality == 5
        card.ease_factor += 0.10
    
    # Calculate interval
    if card.review_count == 0:
        # First review
        interval = 1
    elif card.review_count == 1:
        # Second review
        interval = 6 if quality >= 3 else 1
    else:
        # Subsequent reviews
        if quality >= 3:
            # Calculate days since last review
            days_since = (datetime.now() - card.last_studied).days
            interval = int(days_since * card.ease_factor)
        else:
            interval = 1
    
    # Update card
    card.review_count += 1
    if quality >= 3:
        card.correct_count += 1
    
    card.last_studied = datetime.now()
    card.next_review = datetime.now() + timedelta(days=interval)
    
    return {
        'interval': interval,
        'next_review': card.next_review,
        'ease_factor': card.ease_factor
    }
```

### Best Practices

1. **Quality Interpretation**:
   - Provide clear guidance to users on quality scale
   - Use descriptive labels (e.g., "Perfect", "Good", "Hard", "Wrong")
   - Consider adding tooltips or help text

2. **Edge Cases**:
   - First review: Always 1 day interval
   - Failed reviews: Reset interval, decrease EF
   - Long gaps: Consider adjusting for forgotten cards
   - Minimum interval: 1 day (never less)

3. **Performance**:
   - Batch update ease factors
   - Use database indexes on `next_review` field
   - Cache "cards due" queries
   - Consider background jobs for interval updates

## Flashcard UI/UX Research

### Best Practices

#### 1. Card Flip Animation

**Recommendations**:
- Use CSS 3D transforms for smooth flip
- Duration: 300-500ms
- Easing: `ease-in-out`
- Provide visual feedback during flip

**Example Pattern**:
```css
.flashcard {
  perspective: 1000px;
  transition: transform 0.4s ease-in-out;
}

.flashcard.flipped {
  transform: rotateY(180deg);
}
```

#### 2. Study Mode Navigation

**Recommendations**:
- Clear "Show Answer" button
- Quality rating buttons (0-5) after viewing answer
- Progress indicator (X of Y cards)
- Keyboard shortcuts (Space to flip, 1-5 for quality)
- Exit confirmation if session incomplete

#### 3. Progress Indicators

**Recommendations**:
- Show cards studied / total cards
- Display accuracy percentage
- Show time spent
- Visual progress bar
- Estimated completion time

#### 4. Accessibility

**Recommendations**:
- ARIA labels for card states
- Keyboard navigation support
- Screen reader announcements
- High contrast mode support
- Focus management

## Performance Optimization Research

### Database Query Optimization

**Key Query**: "Get all cards due for review"

**Optimization Strategies**:
1. **Index on `next_review`**:
   ```python
   class Meta:
       indexes = [
           models.Index(fields=['flashcard_set', 'next_review']),
       ]
   ```

2. **Efficient Query**:
   ```python
   from django.utils import timezone
   
   due_cards = Flashcard.objects.filter(
       flashcard_set__user=user,
       next_review__lte=timezone.now()
   ).select_related('flashcard_set')
   ```

3. **Batch Updates**:
   - Update multiple cards in single transaction
   - Use `bulk_update()` for performance
   - Consider background tasks for heavy calculations

### Caching Strategy

**Recommendations**:
- Cache "cards due" count per user
- Cache study session statistics
- Invalidate on card updates
- Use Redis for production

## Study Session Management Patterns

### Session Lifecycle

1. **Start Session**:
   - Create StudySession record
   - Load cards due for review
   - Initialize session state

2. **During Session**:
   - Track each card reviewed
   - Update card statistics
   - Update session progress

3. **End Session**:
   - Calculate final statistics
   - Save session end time
   - Update user progress

### State Management

**Recommendations**:
- Use React Context for session state
- Persist session state (localStorage) for recovery
- Handle session interruption gracefully
- Auto-save progress periodically

## Code Patterns & Examples

### SM-2 Implementation Pattern

```python
# backend/flashcards/models.py
class Flashcard(models.Model):
    # ... fields ...
    
    def update_review(self, quality: int) -> dict:
        """
        Update card based on SM-2 algorithm
        
        Quality scale: 0-5
        0 = Complete failure
        5 = Perfect recall
        """
        from django.utils import timezone
        from datetime import timedelta
        
        # Update ease factor
        if quality <= 1:
            self.ease_factor = max(1.3, self.ease_factor - 0.20)
        elif quality == 2:
            self.ease_factor = max(1.3, self.ease_factor - 0.10)
        elif quality == 4:
            self.ease_factor += 0.05
        elif quality == 5:
            self.ease_factor += 0.10
        
        # Calculate interval
        if self.review_count == 0:
            interval = 1
        elif self.review_count == 1:
            interval = 6 if quality >= 3 else 1
        else:
            if quality >= 3:
                # Use previous interval * ease factor
                if self.last_studied:
                    days_since = (timezone.now() - self.last_studied).days
                    interval = max(1, int(days_since * self.ease_factor))
                else:
                    interval = 1
            else:
                interval = 1
        
        # Update card
        self.review_count += 1
        if quality >= 3:
            self.correct_count += 1
        
        self.last_studied = timezone.now()
        self.next_review = timezone.now() + timedelta(days=interval)
        self.save()
        
        return {
            'interval': interval,
            'next_review': self.next_review,
            'ease_factor': self.ease_factor
        }
    
    def is_due(self) -> bool:
        """Check if card is due for review"""
        from django.utils import timezone
        return self.next_review is None or self.next_review <= timezone.now()
    
    def get_interval(self) -> int:
        """Get days until next review"""
        if not self.next_review:
            return 0
        from django.utils import timezone
        delta = self.next_review - timezone.now()
        return max(0, delta.days)
```

### Frontend Study Mode Pattern

```typescript
// frontend/src/hooks/useStudySession.ts
interface StudyCard {
  id: number;
  front: string;
  back: string;
  isFlipped: boolean;
  quality?: number;
}

export function useStudySession(setId: number) {
  const [cards, setCards] = useState<StudyCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [session, setSession] = useState<StudySession | null>(null);
  
  const flipCard = () => {
    setCards(prev => prev.map((card, idx) => 
      idx === currentIndex ? { ...card, isFlipped: true } : card
    ));
  };
  
  const recordReview = async (quality: number) => {
    const card = cards[currentIndex];
    await flashcardService.reviewCard(card.id, quality);
    
    // Update local state
    setCards(prev => prev.map((c, idx) => 
      idx === currentIndex ? { ...c, quality } : c
    ));
    
    // Move to next card
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Session complete
      await endSession();
    }
  };
  
  // ... rest of implementation
}
```

## Recommendations Summary

### High Priority

1. **SM-2 Implementation**:
   - Use the provided algorithm pattern
   - Handle edge cases (first review, failures)
   - Test thoroughly with various quality inputs

2. **UI/UX**:
   - Implement smooth card flip animation
   - Provide clear quality rating interface
   - Show progress indicators
   - Support keyboard navigation

3. **Performance**:
   - Index `next_review` field
   - Use efficient queries for "cards due"
   - Batch update cards during session
   - Cache statistics

### Medium Priority

1. **Accessibility**:
   - ARIA labels
   - Keyboard shortcuts
   - Screen reader support

2. **User Experience**:
   - Session recovery
   - Exit confirmation
   - Statistics visualization
   - Study streaks

## Conclusion

The research findings provide comprehensive guidance for implementing the flashcard feature. The SM-2 algorithm pattern is well-documented, UI/UX best practices are identified, and performance optimization strategies are clear.

**Recommendation**: Proceed with implementation using these patterns and best practices.

---

**Status**: ✅ Research Complete - Ready for Implementation Planning

