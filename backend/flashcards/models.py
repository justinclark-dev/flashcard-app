"""
Flashcard Models
FlashcardSet, Flashcard (with SM-2 algorithm), StudySession

Created by: Database Agent
Date: 2025-01-27
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from django.db.models import CheckConstraint, Q
from django.utils import timezone
from datetime import timedelta
from notes.models import Category

User = get_user_model()


class FlashcardSet(models.Model):
    """
    A collection of flashcards grouped together.
    Users can organize flashcards into sets for different topics.
    """
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='flashcard_sets')
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='flashcard_sets'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', '-updated_at']),
            models.Index(fields=['user', 'category']),
        ]
        ordering = ['-updated_at']

    def __str__(self):
        return self.name

    @property
    def card_count(self):
        """Return the number of flashcards in this set"""
        return self.flashcards.count()


class Flashcard(models.Model):
    """
    Individual flashcard with spaced repetition data.
    Implements SM-2 algorithm for spaced repetition learning.
    """
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]

    flashcard_set = models.ForeignKey(
        FlashcardSet,
        on_delete=models.CASCADE,
        related_name='flashcards'
    )
    front = models.TextField()  # Question side
    back = models.TextField()  # Answer side
    difficulty = models.CharField(
        max_length=10,
        choices=DIFFICULTY_CHOICES,
        default='medium'
    )
    
    # SM-2 Algorithm Fields
    ease_factor = models.FloatField(
        default=2.5,
        validators=[MinValueValidator(1.3)]
    )
    review_count = models.IntegerField(default=0)
    correct_count = models.IntegerField(default=0)
    last_studied = models.DateTimeField(null=True, blank=True)
    next_review = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['flashcard_set', 'next_review']),
            models.Index(fields=['flashcard_set']),
            models.Index(fields=['next_review']),
        ]
        ordering = ['created_at']
        constraints = [
            CheckConstraint(
                check=Q(ease_factor__gte=1.3),
                name='ease_factor_minimum'
            ),
        ]

    def __str__(self):
        return self.front[:50]  # First 50 characters of front

    def update_review(self, quality):
        """
        Update flashcard based on SM-2 spaced repetition algorithm.
        
        Args:
            quality (int): User's performance rating (0-5)
                - 0-1: Complete failure / Incorrect
                - 2: Incorrect with difficulty
                - 3: Correct with difficulty
                - 4: Correct after hesitation
                - 5: Perfect response
        
        Returns:
            dict: Updated values including interval, next_review, ease_factor
        """
        if not (0 <= quality <= 5):
            raise ValueError("Quality must be between 0 and 5")
        
        now = timezone.now()
        
        # Update ease factor based on quality
        if quality <= 1:
            # Quality 0-1: Decrease by 0.20
            self.ease_factor = max(1.3, self.ease_factor - 0.20)
        elif quality == 2:
            # Quality 2: Decrease by 0.10
            self.ease_factor = max(1.3, self.ease_factor - 0.10)
        elif quality == 3:
            # Quality 3: No change
            pass
        elif quality == 4:
            # Quality 4: Increase by 0.05
            self.ease_factor += 0.05
        else:  # quality == 5
            # Quality 5: Increase by 0.10
            self.ease_factor += 0.10
        
        # Calculate interval based on review count
        if self.review_count == 0:
            # First review: always 1 day
            interval = 1
        elif self.review_count == 1:
            # Second review: 6 days if quality >= 3, else 1 day
            interval = 6 if quality >= 3 else 1
        else:
            # Subsequent reviews
            if quality >= 3:
                # Calculate days since last review
                if self.last_studied:
                    days_since = (now - self.last_studied).days
                    # Use previous interval (approximate from days_since) or calculate new
                    previous_interval = max(1, days_since)
                    interval = int(previous_interval * self.ease_factor)
                else:
                    interval = int(6 * self.ease_factor)  # Fallback
            else:
                # Failed review: reset to 1 day
                interval = 1
        
        # Update card statistics
        self.review_count += 1
        if quality >= 3:
            self.correct_count += 1
        
        # Update timestamps
        self.last_studied = now
        self.next_review = now + timedelta(days=interval)
        
        # Save the changes
        self.save()
        
        return {
            'interval': interval,
            'next_review': self.next_review,
            'ease_factor': self.ease_factor,
            'review_count': self.review_count,
            'correct_count': self.correct_count
        }

    def is_due(self):
        """
        Check if flashcard is due for review.
        
        Returns:
            bool: True if card is due (no next_review or next_review is in the past)
        """
        if self.next_review is None:
            return True
        return timezone.now() >= self.next_review

    def get_interval(self):
        """
        Get the number of days until next review.
        
        Returns:
            int: Days until next review (0 if due or no next_review set)
        """
        if self.next_review is None:
            return 0
        
        now = timezone.now()
        if now >= self.next_review:
            return 0
        
        delta = self.next_review - now
        return delta.days


class StudySession(models.Model):
    """
    Track study sessions for statistics and progress tracking.
    """
    MODE_CHOICES = [
        ('simple', 'Simple'),
        ('spaced', 'Spaced Repetition'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='study_sessions')
    flashcard_set = models.ForeignKey(
        FlashcardSet,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='study_sessions'
    )
    mode = models.CharField(
        max_length=10,
        choices=MODE_CHOICES,
        default='simple'
    )
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    cards_studied = models.IntegerField(default=0)
    cards_correct = models.IntegerField(default=0)

    class Meta:
        indexes = [
            models.Index(fields=['user', '-started_at']),
            models.Index(fields=['user', 'flashcard_set']),
        ]
        ordering = ['-started_at']
        constraints = [
            CheckConstraint(
                check=Q(cards_correct__lte=models.F('cards_studied')),
                name='cards_correct_le_cards_studied'
            ),
            CheckConstraint(
                check=Q(cards_studied__gte=0),
                name='cards_studied_non_negative'
            ),
            CheckConstraint(
                check=Q(cards_correct__gte=0),
                name='cards_correct_non_negative'
            ),
        ]

    def __str__(self):
        return f"Study Session {self.id} - {self.user.username} ({self.mode})"

    def end_session(self):
        """Mark the session as ended by setting ended_at timestamp"""
        if self.ended_at is None:
            self.ended_at = timezone.now()
            self.save()

    def get_duration(self):
        """
        Get the duration of the study session in minutes.
        
        Returns:
            float: Duration in minutes (0 if not ended)
        """
        if self.ended_at is None:
            return 0.0
        
        delta = self.ended_at - self.started_at
        return delta.total_seconds() / 60.0

    def get_accuracy(self):
        """
        Get the accuracy percentage of the study session.
        
        Returns:
            float: Accuracy percentage (0-100), or 0.0 if no cards studied
        """
        if self.cards_studied == 0:
            return 0.0
        
        return (self.cards_correct / self.cards_studied) * 100.0

