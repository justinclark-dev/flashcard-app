"""
Flashcard API Views
FlashcardSetViewSet, FlashcardViewSet, FlashcardReviewView, StudySessionViewSet

Created by: Backend Agent
Date: 2025-01-27
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import FlashcardSet, Flashcard, StudySession
from .serializers import (
    FlashcardSetSerializer,
    FlashcardSerializer,
    StudySessionSerializer
)


class FlashcardSetViewSet(viewsets.ModelViewSet):
    """
    ViewSet for FlashcardSet model.
    Users can only access their own flashcard sets.
    """
    serializer_class = FlashcardSetSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['name', 'created_at', 'updated_at']
    ordering = ['-updated_at']

    def get_queryset(self):
        """Return only flashcard sets belonging to the current user"""
        queryset = FlashcardSet.objects.filter(user=self.request.user)
        
        # Filter by category if provided
        category_id = self.request.query_params.get('category', None)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        # Prefetch related objects for performance
        queryset = queryset.select_related('category', 'user').prefetch_related('flashcards')
        
        return queryset

    def perform_create(self, serializer):
        """Set the user when creating a flashcard set"""
        serializer.save(user=self.request.user)

    def list(self, request, *args, **kwargs):
        """Override list to return paginated response with status"""
        response = super().list(request, *args, **kwargs)
        if hasattr(response, 'data') and isinstance(response.data, dict):
            return Response({
                'count': response.data.get('count', len(response.data.get('results', []))),
                'next': response.data.get('next'),
                'previous': response.data.get('previous'),
                'results': response.data.get('results', []),
                'status': 'success'
            })
        return Response({
            'count': len(response.data) if isinstance(response.data, list) else 0,
            'next': None,
            'previous': None,
            'results': response.data if isinstance(response.data, list) else [],
            'status': 'success'
        })

    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to return response with status"""
        response = super().retrieve(request, *args, **kwargs)
        return Response({
            'data': response.data,
            'status': 'success'
        })

    def create(self, request, *args, **kwargs):
        """Override create to return response with status"""
        response = super().create(request, *args, **kwargs)
        return Response({
            'data': response.data,
            'status': 'success'
        }, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Override update to return response with status"""
        response = super().update(request, *args, **kwargs)
        return Response({
            'data': response.data,
            'status': 'success'
        })

    def destroy(self, request, *args, **kwargs):
        """Override destroy to return 204 No Content"""
        super().destroy(request, *args, **kwargs)
        return Response(status=status.HTTP_204_NO_CONTENT)


class FlashcardViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Flashcard model.
    Flashcards are nested under FlashcardSets.
    Users can only access flashcards in their own sets.
    """
    serializer_class = FlashcardSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'next_review']
    ordering = ['created_at']

    def get_queryset(self):
        """Return flashcards for the specified flashcard set, filtered by user"""
        flashcard_set_id = self.kwargs.get('flashcard_set_pk')
        
        # Get the flashcard set and verify ownership
        flashcard_set = get_object_or_404(
            FlashcardSet.objects.filter(user=self.request.user),
            pk=flashcard_set_id
        )
        
        queryset = Flashcard.objects.filter(flashcard_set=flashcard_set)
        
        # Filter by due_only if provided
        due_only = self.request.query_params.get('due_only', 'false').lower() == 'true'
        if due_only:
            now = timezone.now()
            queryset = queryset.filter(
                next_review__lte=now
            ) | queryset.filter(next_review__isnull=True)
        
        return queryset

    def perform_create(self, serializer):
        """Set the flashcard_set when creating a flashcard"""
        flashcard_set_id = self.kwargs.get('flashcard_set_pk')
        if not flashcard_set_id:
            raise serializers.ValidationError("flashcard_set_pk is required")
        flashcard_set = get_object_or_404(
            FlashcardSet.objects.filter(user=self.request.user),
            pk=flashcard_set_id
        )
        serializer.save(flashcard_set=flashcard_set)

    def list(self, request, *args, **kwargs):
        """Override list to return paginated response with status"""
        response = super().list(request, *args, **kwargs)
        if hasattr(response, 'data') and isinstance(response.data, dict):
            return Response({
                'count': response.data.get('count', len(response.data.get('results', []))),
                'next': response.data.get('next'),
                'previous': response.data.get('previous'),
                'results': response.data.get('results', []),
                'status': 'success'
            })
        return Response({
            'count': len(response.data) if isinstance(response.data, list) else 0,
            'next': None,
            'previous': None,
            'results': response.data if isinstance(response.data, list) else [],
            'status': 'success'
        })

    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to return response with status"""
        response = super().retrieve(request, *args, **kwargs)
        return Response({
            'data': response.data,
            'status': 'success'
        })

    def create(self, request, *args, **kwargs):
        """Override create to return response with status"""
        response = super().create(request, *args, **kwargs)
        return Response({
            'data': response.data,
            'status': 'success'
        }, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Override update to return response with status"""
        response = super().update(request, *args, **kwargs)
        return Response({
            'data': response.data,
            'status': 'success'
        })

    def destroy(self, request, *args, **kwargs):
        """Override destroy to return 204 No Content"""
        super().destroy(request, *args, **kwargs)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], url_path='review')
    def review(self, request, pk=None, flashcard_set_pk=None):
        """
        Record a flashcard review using SM-2 algorithm.
        
        Request body: {'quality': 0-5}
        Quality scale:
        - 0-1: Complete failure / Incorrect
        - 2: Incorrect with difficulty
        - 3: Correct with difficulty
        - 4: Correct after hesitation
        - 5: Perfect response
        """
        # Get flashcard - handle both nested and direct access
        if flashcard_set_pk:
            # Nested access
            flashcard = get_object_or_404(
                Flashcard.objects.filter(
                    flashcard_set__user=request.user,
                    flashcard_set_id=flashcard_set_pk
                ),
                pk=pk
            )
        else:
            # Direct access (for review endpoint)
            flashcard = get_object_or_404(
                Flashcard.objects.filter(flashcard_set__user=request.user),
                pk=pk
            )
        
        # Verify flashcard belongs to user (already filtered above, but double-check)
        if flashcard.flashcard_set.user != request.user:
            return Response(
                {'error': 'Flashcard not found or does not belong to you.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        quality = request.data.get('quality')
        
        # Validate quality
        if quality is None:
            return Response(
                {'error': 'Quality is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            quality = int(quality)
        except (ValueError, TypeError):
            return Response(
                {'error': 'Quality must be an integer.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not (0 <= quality <= 5):
            return Response(
                {'error': 'Quality must be between 0 and 5.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update flashcard using SM-2 algorithm
        try:
            result = flashcard.update_review(quality)
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Serialize updated flashcard
        serializer = self.get_serializer(flashcard)
        
        return Response({
            'data': {
                **serializer.data,
                'interval': result['interval'],
                'next_review': result['next_review'].isoformat() if result['next_review'] else None
            },
            'status': 'success'
        })


class StudySessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for StudySession model.
    Users can only access their own study sessions.
    """
    serializer_class = StudySessionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['started_at', 'ended_at']
    ordering = ['-started_at']

    def get_queryset(self):
        """Return only study sessions belonging to the current user"""
        queryset = StudySession.objects.filter(user=self.request.user)
        
        # Filter by flashcard_set if provided
        flashcard_set_id = self.request.query_params.get('flashcard_set', None)
        if flashcard_set_id:
            queryset = queryset.filter(flashcard_set_id=flashcard_set_id)
        
        # Prefetch related objects for performance
        queryset = queryset.select_related('flashcard_set', 'user')
        
        return queryset

    def perform_create(self, serializer):
        """Set the user when creating a study session"""
        serializer.save(user=self.request.user)

    def list(self, request, *args, **kwargs):
        """Override list to return paginated response with status"""
        response = super().list(request, *args, **kwargs)
        if hasattr(response, 'data') and isinstance(response.data, dict):
            return Response({
                'count': response.data.get('count', len(response.data.get('results', []))),
                'next': response.data.get('next'),
                'previous': response.data.get('previous'),
                'results': response.data.get('results', []),
                'status': 'success'
            })
        return Response({
            'count': len(response.data) if isinstance(response.data, list) else 0,
            'next': None,
            'previous': None,
            'results': response.data if isinstance(response.data, list) else [],
            'status': 'success'
        })

    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to return response with status"""
        response = super().retrieve(request, *args, **kwargs)
        return Response({
            'data': response.data,
            'status': 'success'
        })

    def create(self, request, *args, **kwargs):
        """Override create to return response with status"""
        response = super().create(request, *args, **kwargs)
        return Response({
            'data': response.data,
            'status': 'success'
        }, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Override update to return response with status"""
        response = super().update(request, *args, **kwargs)
        return Response({
            'data': response.data,
            'status': 'success'
        })

    def destroy(self, request, *args, **kwargs):
        """Override destroy to return 204 No Content"""
        super().destroy(request, *args, **kwargs)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def end(self, request, pk=None):
        """End a study session"""
        session = self.get_object()
        
        # Verify session belongs to user
        if session.user != request.user:
            return Response(
                {'error': 'Study session not found or does not belong to you.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        session.end_session()
        serializer = self.get_serializer(session)
        
        return Response({
            'data': serializer.data,
            'status': 'success'
        })

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Get study session statistics"""
        session = self.get_object()
        
        # Verify session belongs to user
        if session.user != request.user:
            return Response(
                {'error': 'Study session not found or does not belong to you.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        return Response({
            'data': {
                'id': session.id,
                'cards_studied': session.cards_studied,
                'cards_correct': session.cards_correct,
                'accuracy': session.get_accuracy(),
                'duration': session.get_duration(),
                'started_at': session.started_at.isoformat(),
                'ended_at': session.ended_at.isoformat() if session.ended_at else None
            },
            'status': 'success'
        })

