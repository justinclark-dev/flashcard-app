from django.contrib import admin
from .models import FlashcardSet, Flashcard, StudySession


@admin.register(FlashcardSet)
class FlashcardSetAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'category', 'card_count', 'created_at', 'updated_at')
    search_fields = ('name', 'description')
    list_filter = ('user', 'category', 'created_at')
    raw_id_fields = ('user', 'category')


@admin.register(Flashcard)
class FlashcardAdmin(admin.ModelAdmin):
    list_display = ('front', 'flashcard_set', 'difficulty', 'review_count', 'ease_factor', 'next_review', 'created_at')
    search_fields = ('front', 'back')
    list_filter = ('difficulty', 'flashcard_set', 'created_at')
    raw_id_fields = ('flashcard_set',)
    readonly_fields = ('review_count', 'correct_count', 'ease_factor', 'last_studied', 'next_review')


@admin.register(StudySession)
class StudySessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'flashcard_set', 'mode', 'cards_studied', 'cards_correct', 'started_at', 'ended_at')
    list_filter = ('mode', 'user', 'started_at')
    raw_id_fields = ('user', 'flashcard_set')
    readonly_fields = ('started_at', 'ended_at')

