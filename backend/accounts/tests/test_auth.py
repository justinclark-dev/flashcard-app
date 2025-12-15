"""
Test: Authentication API Endpoints
Purpose: Verify user registration, login, logout, and current user endpoints
Coverage: All authentication flows, validation, error handling, security

Created by: TDD Agent
Date: 2025-01-27
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse

User = get_user_model()


class UserRegistrationTest(TestCase):
    """Test user registration endpoint"""
    
    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=False)
        self.register_url = reverse('auth:register')
        self.valid_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'securepass123',
            'password_confirm': 'securepass123'
        }
    
    def test_register_user_success(self):
        """Test successful user registration"""
        response = self.client.post(self.register_url, self.valid_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'success')
        self.assertIn('data', response.data)
        self.assertEqual(response.data['data']['username'], 'testuser')
        self.assertEqual(response.data['data']['email'], 'test@example.com')
        self.assertIn('id', response.data['data'])
        self.assertNotIn('password', response.data['data'])
        
        # Verify user was created
        self.assertTrue(User.objects.filter(username='testuser').exists())
        user = User.objects.get(username='testuser')
        self.assertTrue(user.check_password('securepass123'))
    
    def test_register_user_password_mismatch(self):
        """Test registration fails when passwords don't match"""
        data = self.valid_data.copy()
        data['password_confirm'] = 'differentpass123'
        
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['status'], 'error')
        self.assertEqual(response.data['code'], 'VALIDATION_ERROR')
        self.assertIn('details', response.data)
        self.assertFalse(User.objects.filter(username='testuser').exists())
    
    def test_register_user_duplicate_username(self):
        """Test registration fails with duplicate username"""
        # Create existing user
        User.objects.create_user(username='testuser', password='pass123')
        
        response = self.client.post(self.register_url, self.valid_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['status'], 'error')
        self.assertEqual(response.data['code'], 'VALIDATION_ERROR')
        self.assertIn('details', response.data)
    
    def test_register_user_duplicate_email(self):
        """Test registration fails with duplicate email"""
        # Create existing user
        User.objects.create_user(username='existing', email='test@example.com', password='pass123')
        
        response = self.client.post(self.register_url, self.valid_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['status'], 'error')
        self.assertEqual(response.data['code'], 'VALIDATION_ERROR')
    
    def test_register_user_weak_password(self):
        """Test registration fails with weak password"""
        data = self.valid_data.copy()
        data['password'] = 'short'
        data['password_confirm'] = 'short'
        
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['status'], 'error')
        self.assertEqual(response.data['code'], 'VALIDATION_ERROR')
    
    def test_register_user_password_no_letter(self):
        """Test registration fails with password containing only numbers"""
        data = self.valid_data.copy()
        data['password'] = '12345678'
        data['password_confirm'] = '12345678'
        
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['status'], 'error')
    
    def test_register_user_password_no_number(self):
        """Test registration fails with password containing only letters"""
        data = self.valid_data.copy()
        data['password'] = 'password'
        data['password_confirm'] = 'password'
        
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['status'], 'error')
    
    def test_register_user_missing_fields(self):
        """Test registration fails with missing required fields"""
        data = {'username': 'testuser'}  # Missing other fields
        
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['status'], 'error')
        self.assertEqual(response.data['code'], 'VALIDATION_ERROR')
    
    def test_register_user_invalid_email(self):
        """Test registration fails with invalid email format"""
        data = self.valid_data.copy()
        data['email'] = 'invalid-email'
        
        response = self.client.post(self.register_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['status'], 'error')
    
    def test_register_user_creates_session(self):
        """Test registration creates a session for the user"""
        response = self.client.post(self.register_url, self.valid_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Verify session was created
        self.assertIn('sessionid', response.cookies)


class UserLoginTest(TestCase):
    """Test user login endpoint"""
    
    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=False)
        self.login_url = reverse('auth:login')
        self.username = 'testuser'
        self.password = 'securepass123'
        self.user = User.objects.create_user(
            username=self.username,
            email='test@example.com',
            password=self.password
        )
    
    def test_login_success(self):
        """Test successful login"""
        data = {
            'username': self.username,
            'password': self.password
        }
        
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')
        self.assertIn('data', response.data)
        self.assertEqual(response.data['data']['username'], self.username)
        self.assertEqual(response.data['data']['email'], 'test@example.com')
        self.assertIn('id', response.data['data'])
        self.assertNotIn('password', response.data['data'])
        
        # Verify session was created
        self.assertIn('sessionid', response.cookies)
    
    def test_login_invalid_username(self):
        """Test login fails with invalid username"""
        data = {
            'username': 'nonexistent',
            'password': self.password
        }
        
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['status'], 'error')
        self.assertEqual(response.data['code'], 'AUTHENTICATION_REQUIRED')
        self.assertIn('error', response.data)
    
    def test_login_invalid_password(self):
        """Test login fails with invalid password"""
        data = {
            'username': self.username,
            'password': 'wrongpassword'
        }
        
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['status'], 'error')
        self.assertEqual(response.data['code'], 'AUTHENTICATION_REQUIRED')
    
    def test_login_missing_fields(self):
        """Test login fails with missing fields"""
        data = {'username': self.username}  # Missing password
        
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['status'], 'error')
    
    def test_login_inactive_user(self):
        """Test login fails for inactive user"""
        self.user.is_active = False
        self.user.save()
        
        data = {
            'username': self.username,
            'password': self.password
        }
        
        response = self.client.post(self.login_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['status'], 'error')
    
    def test_login_case_sensitive_username(self):
        """Test login is case-sensitive for username"""
        data = {
            'username': self.username.upper(),
            'password': self.password
        }
        
        response = self.client.post(self.login_url, data, format='json')
        
        # Should fail if username is case-sensitive
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserLogoutTest(TestCase):
    """Test user logout endpoint"""
    
    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=False)
        self.logout_url = reverse('auth:logout')
        self.user = User.objects.create_user(
            username='testuser',
            password='securepass123'
        )
    
    def test_logout_success(self):
        """Test successful logout"""
        # Login first
        self.client.force_authenticate(user=self.user)
        
        response = self.client.post(self.logout_url, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'Logged out successfully')
    
    def test_logout_requires_authentication(self):
        """Test logout requires authentication"""
        response = self.client.post(self.logout_url, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['status'], 'error')
        self.assertEqual(response.data['code'], 'AUTHENTICATION_REQUIRED')


class CurrentUserTest(TestCase):
    """Test get current user endpoint"""
    
    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=False)
        self.user_url = reverse('auth:user')
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='securepass123'
        )
    
    def test_get_current_user_success(self):
        """Test getting current authenticated user"""
        self.client.force_authenticate(user=self.user)
        
        response = self.client.get(self.user_url, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')
        self.assertIn('data', response.data)
        self.assertEqual(response.data['data']['username'], 'testuser')
        self.assertEqual(response.data['data']['email'], 'test@example.com')
        self.assertIn('id', response.data['data'])
        self.assertIn('date_joined', response.data['data'])
        self.assertNotIn('password', response.data['data'])
    
    def test_get_current_user_requires_authentication(self):
        """Test getting current user requires authentication"""
        response = self.client.get(self.user_url, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['status'], 'error')
        self.assertEqual(response.data['code'], 'AUTHENTICATION_REQUIRED')


class RateLimitingTest(TestCase):
    """Test rate limiting on authentication endpoints"""
    
    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=False)
        self.login_url = reverse('auth:login')
        self.register_url = reverse('auth:register')
        self.user = User.objects.create_user(
            username='testuser',
            password='securepass123'
        )
    
    def test_login_rate_limit(self):
        """Test rate limiting on login endpoint"""
        data = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }
        
        # Make 6 requests (limit is 5 per minute)
        for i in range(6):
            response = self.client.post(self.login_url, data, format='json')
        
        # 6th request should be rate limited
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertEqual(response.data['status'], 'error')
        self.assertEqual(response.data['code'], 'RATE_LIMIT_EXCEEDED')
        self.assertIn('retry_after', response.data)
    
    def test_register_rate_limit(self):
        """Test rate limiting on register endpoint"""
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'securepass123',
            'password_confirm': 'securepass123'
        }
        
        # Make 6 requests (limit is 5 per minute)
        for i in range(6):
            response = self.client.post(self.register_url, data, format='json')
        
        # 6th request should be rate limited
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertEqual(response.data['status'], 'error')
        self.assertEqual(response.data['code'], 'RATE_LIMIT_EXCEEDED')


class CSRFProtectionTest(TestCase):
    """Test CSRF protection on authentication endpoints"""
    
    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=True)
        self.register_url = reverse('auth:register')
        self.valid_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'securepass123',
            'password_confirm': 'securepass123'
        }
    
    def test_csrf_protection_enforced(self):
        """Test CSRF protection is enforced on POST requests"""
        # Note: In actual implementation, CSRF token should be obtained first
        # This test verifies CSRF protection is in place
        response = self.client.post(self.register_url, self.valid_data, format='json')
        
        # Should fail without CSRF token (403 or handled by middleware)
        # Exact behavior depends on Django CSRF middleware configuration
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_400_BAD_REQUEST])

