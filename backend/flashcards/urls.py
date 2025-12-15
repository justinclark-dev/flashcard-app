"""
Flashcard URL Configuration

Created by: Backend Agent
Date: 2025-01-27
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FlashcardSetViewSet,
    FlashcardViewSet,
    StudySessionViewSet
)

app_name = 'flashcards'

router = DefaultRouter()
router.register(r'flashcard-sets', FlashcardSetViewSet, basename='flashcardset')
router.register(r'study-sessions', StudySessionViewSet, basename='studysession')

# Nested router for flashcards under flashcard sets
flashcard_router = DefaultRouter()
flashcard_router.register(
    r'flashcards',
    FlashcardViewSet,
    basename='flashcard'
)

urlpatterns = [
    path('', include(router.urls)),
    path('flashcard-sets/<int:flashcard_set_pk>/', include(flashcard_router.urls)),
    # Direct flashcard review endpoint (using pk from URL)
    path('flashcards/<int:pk>/review/', FlashcardViewSet.as_view({'post': 'review'}), name='flashcard-review'),
]

