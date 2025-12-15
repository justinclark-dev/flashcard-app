"""
Notes models for the Study Notes & Flashcard App.
Defines Note, Category, and Tag models.
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import RegexValidator

User = get_user_model()


class Category(models.Model):
    """
    Category model for organizing notes and flashcard sets by topic.
    Each user can have their own categories with unique names.
    """
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories')
    color = models.CharField(
        max_length=7,
        default='#4a9eff',
        validators=[RegexValidator(
            regex='^#[0-9A-Fa-f]{6}$',
            message='Color must be a valid hex color code (e.g., #3776ab)'
        )]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'notes_category'
        unique_together = [['user', 'name']]
        indexes = [
            models.Index(fields=['user', 'name']),
            models.Index(fields=['user']),
        ]
        ordering = ['name']

    def __str__(self):
        return self.name


class Tag(models.Model):
    """
    Tag model for flexible tagging of notes.
    Each user can have their own tags with unique names.
    """
    name = models.CharField(max_length=50)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tags')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notes_tag'
        unique_together = [['user', 'name']]
        indexes = [
            models.Index(fields=['user', 'name']),
            models.Index(fields=['user']),
        ]
        ordering = ['name']

    def __str__(self):
        return self.name


class Note(models.Model):
    """
    Note model for storing user's study notes with content, metadata, and organization.
    """
    title = models.CharField(max_length=200)
    content = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notes')
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notes'
    )
    tags = models.ManyToManyField(Tag, related_name='notes', blank=True)
    source_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'notes_note'
        indexes = [
            models.Index(fields=['user', '-updated_at']),
            models.Index(fields=['user', 'category']),
            models.Index(fields=['title']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-updated_at']

    def __str__(self):
        return self.title

    def get_excerpt(self, length=100):
        """
        Returns the first 'length' characters of the content.
        If content is shorter, returns the full content.
        """
        if len(self.content) <= length:
            return self.content
        return self.content[:length] + '...'

