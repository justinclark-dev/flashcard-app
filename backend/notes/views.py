"""
API views for Notes, Categories, and Tags.
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from .models import Note, Category, Tag
from .serializers import NoteSerializer, CategorySerializer, TagSerializer


class NoPagination(PageNumberPagination):
    """Custom pagination class that disables pagination"""
    def paginate_queryset(self, queryset, request, view=None):
        return None


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Category model.
    Users can only access their own categories.
    """
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    pagination_class = NoPagination  # Disable pagination for categories
    
    def get_queryset(self):
        """Return only categories belonging to the current user"""
        return Category.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Set the user when creating a category"""
        serializer.save(user=self.request.user)
    
    def list(self, request, *args, **kwargs):
        """Override list to return response with status"""
        queryset = self.filter_queryset(self.get_queryset())
        # With NoPagination, paginate_queryset should return None
        page = self.paginate_queryset(queryset)
        if page is not None:
            # Handle paginated response (shouldn't happen with NoPagination)
            serializer = self.get_serializer(page, many=True)
            paginated_response = self.get_paginated_response(serializer.data)
            # Extract data from paginated response
            paginated_data = paginated_response.data if hasattr(paginated_response, 'data') else {}
            if isinstance(paginated_data, dict) and 'results' in paginated_data:
                return Response({
                    'data': paginated_data['results'],
                    'status': 'success'
                })
        # No pagination - serialize directly
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'data': serializer.data,
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


class TagViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Tag model.
    Users can only access their own tags.
    """
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    pagination_class = NoPagination  # Disable pagination for tags
    
    def get_queryset(self):
        """Return only tags belonging to the current user"""
        return Tag.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Set the user when creating a tag"""
        serializer.save(user=self.request.user)
    
    def list(self, request, *args, **kwargs):
        """Override list to return response with status"""
        queryset = self.filter_queryset(self.get_queryset())
        # With NoPagination, paginate_queryset should return None
        page = self.paginate_queryset(queryset)
        if page is not None:
            # Handle paginated response (shouldn't happen with NoPagination)
            serializer = self.get_serializer(page, many=True)
            paginated_response = self.get_paginated_response(serializer.data)
            # Extract data from paginated response
            paginated_data = paginated_response.data if hasattr(paginated_response, 'data') else {}
            if isinstance(paginated_data, dict) and 'results' in paginated_data:
                return Response({
                    'data': paginated_data['results'],
                    'status': 'success'
                })
        # No pagination - serialize directly
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'data': serializer.data,
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


class NoteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Note model.
    Users can only access their own notes.
    Supports filtering, searching, and pagination.
    """
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'updated_at', 'title']
    ordering = ['-updated_at']
    
    def get_queryset(self):
        """Return only notes belonging to the current user"""
        queryset = Note.objects.filter(user=self.request.user)
        
        # Filter by category if provided
        category_id = self.request.query_params.get('category', None)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        # Search in title and content
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) | Q(content__icontains=search_query)
            )
        
        # Prefetch related objects for performance
        queryset = queryset.select_related('category', 'user').prefetch_related('tags')
        
        return queryset
    
    def perform_create(self, serializer):
        """Set the user when creating a note"""
        serializer.save(user=self.request.user)
    
    def list(self, request, *args, **kwargs):
        """Override list to return paginated response with status"""
        response = super().list(request, *args, **kwargs)
        # DRF pagination returns data directly, not nested
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

