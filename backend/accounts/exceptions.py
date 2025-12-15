"""
Custom exception handler for DRF to match API standards.
"""
from rest_framework.views import exception_handler
from rest_framework import status
from django.http import Http404
from django.core.exceptions import PermissionDenied


def custom_exception_handler(exc, context):
    """
    Custom exception handler that returns responses matching API standards.
    """
    response = exception_handler(exc, context)

    if response is not None:
        # Get the standard error response structure
        custom_response_data = {
            'status': 'error',
            'error': str(exc),
        }

        # Handle different exception types
        if isinstance(exc, Http404):
            custom_response_data['code'] = 'NOT_FOUND'
            custom_response_data['error'] = 'Resource not found'
        elif isinstance(exc, PermissionDenied):
            custom_response_data['code'] = 'PERMISSION_DENIED'
            custom_response_data['error'] = 'You do not have permission to perform this action'
        elif response.status_code == status.HTTP_400_BAD_REQUEST:
            # Validation errors
            custom_response_data['code'] = 'VALIDATION_ERROR'
            custom_response_data['error'] = 'Validation failed'
            if hasattr(response, 'data') and isinstance(response.data, dict):
                custom_response_data['details'] = response.data
        elif response.status_code == status.HTTP_401_UNAUTHORIZED:
            custom_response_data['code'] = 'AUTHENTICATION_REQUIRED'
            custom_response_data['error'] = 'Authentication required'
        elif response.status_code == status.HTTP_403_FORBIDDEN:
            custom_response_data['code'] = 'PERMISSION_DENIED'
            custom_response_data['error'] = 'You do not have permission to perform this action'
        elif response.status_code == status.HTTP_404_NOT_FOUND:
            custom_response_data['code'] = 'NOT_FOUND'
            custom_response_data['error'] = 'Resource not found'
        elif response.status_code == status.HTTP_429_TOO_MANY_REQUESTS:
            custom_response_data['code'] = 'RATE_LIMIT_EXCEEDED'
            custom_response_data['error'] = 'Rate limit exceeded'
            custom_response_data['message'] = 'Too many requests. Please try again later.'
            if hasattr(response, 'data') and 'retry_after' in response.data:
                custom_response_data['retry_after'] = response.data['retry_after']
        else:
            custom_response_data['code'] = 'SERVER_ERROR'
            custom_response_data['error'] = 'An error occurred'

        response.data = custom_response_data

    return response

