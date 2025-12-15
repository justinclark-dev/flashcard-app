"""
Authentication views for user registration, login, logout, and current user.
"""
from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from .serializers import UserRegistrationSerializer, UserSerializer

User = get_user_model()


@method_decorator(csrf_exempt, name='dispatch')
@method_decorator(ratelimit(key='ip', rate='5/m', method='POST'), name='create')
class RegisterView(generics.CreateAPIView):
    """
    User registration endpoint.
    POST /api/auth/register/
    Rate limited to 5 requests per minute per IP.
    """
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        """Create a new user and log them in."""
        # Check if rate limited
        if getattr(request, 'limited', False):
            return Response({
                'error': 'Rate limit exceeded',
                'message': 'Too many requests. Please try again later.',
                'retry_after': 60,
                'status': 'error',
                'code': 'RATE_LIMIT_EXCEEDED'
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Log the user in automatically after registration
        login(request, user)
        
        # Return user data
        user_serializer = UserSerializer(user)
        return Response({
            'data': user_serializer.data,
            'status': 'success'
        }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
@ratelimit(key='ip', rate='5/m', method='POST', block=True)
def login_view(request):
    """
    User login endpoint.
    POST /api/auth/login/
    Rate limited to 5 requests per minute per IP.
    """
    # Check if rate limited
    if getattr(request, 'limited', False):
        return Response({
            'error': 'Rate limit exceeded',
            'message': 'Too many requests. Please try again later.',
            'retry_after': 60,
            'status': 'error',
            'code': 'RATE_LIMIT_EXCEEDED'
        }, status=status.HTTP_429_TOO_MANY_REQUESTS)
    
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({
            'error': 'Username and password are required',
            'status': 'error',
            'code': 'VALIDATION_ERROR'
        }, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=username, password=password)
    
    if user is None:
        return Response({
            'error': 'Invalid credentials',
            'status': 'error',
            'code': 'AUTHENTICATION_REQUIRED'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    if not user.is_active:
        return Response({
            'error': 'User account is disabled',
            'status': 'error',
            'code': 'AUTHENTICATION_REQUIRED'
        }, status=status.HTTP_401_UNAUTHORIZED)

    login(request, user)
    
    serializer = UserSerializer(user)
    return Response({
        'data': serializer.data,
        'status': 'success'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    User logout endpoint.
    POST /api/auth/logout/
    """
    logout(request)
    return Response({
        'message': 'Logged out successfully',
        'status': 'success'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """
    Get current authenticated user.
    GET /api/auth/user/
    """
    serializer = UserSerializer(request.user)
    return Response({
        'data': serializer.data,
        'status': 'success'
    }, status=status.HTTP_200_OK)

