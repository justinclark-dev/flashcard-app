"""
Test: Authentication Serializers
Purpose: Verify serializer validation and data transformation
Coverage: Registration serializer, user serializer, validation rules

Created by: TDD Agent
Date: 2025-01-27
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from accounts.serializers import UserRegistrationSerializer, UserSerializer

User = get_user_model()


class UserRegistrationSerializerTest(TestCase):
    """Test user registration serializer"""
    
    def test_valid_registration_data(self):
        """Test serializer validates valid registration data"""
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'securepass123',
            'password_confirm': 'securepass123'
        }
        
        serializer = UserRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid())
    
    def test_password_mismatch(self):
        """Test serializer rejects mismatched passwords"""
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'securepass123',
            'password_confirm': 'differentpass123'
        }
        
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password_confirm', serializer.errors)
    
    def test_weak_password(self):
        """Test serializer rejects weak passwords"""
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'short',
            'password_confirm': 'short'
        }
        
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)
    
    def test_invalid_email(self):
        """Test serializer rejects invalid email format"""
        data = {
            'username': 'testuser',
            'email': 'invalid-email',
            'password': 'securepass123',
            'password_confirm': 'securepass123'
        }
        
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('email', serializer.errors)
    
    def test_username_too_long(self):
        """Test serializer rejects username exceeding max length"""
        data = {
            'username': 'a' * 151,  # Max is 150
            'email': 'test@example.com',
            'password': 'securepass123',
            'password_confirm': 'securepass123'
        }
        
        serializer = UserRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('username', serializer.errors)
    
    def test_serializer_creates_user(self):
        """Test serializer creates user when valid"""
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'securepass123',
            'password_confirm': 'securepass123'
        }
        
        serializer = UserRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        
        self.assertIsInstance(user, User)
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('securepass123'))


class UserSerializerTest(TestCase):
    """Test user serializer"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='securepass123'
        )
    
    def test_serialize_user(self):
        """Test serializing user data"""
        serializer = UserSerializer(self.user)
        data = serializer.data
        
        self.assertEqual(data['id'], self.user.id)
        self.assertEqual(data['username'], 'testuser')
        self.assertEqual(data['email'], 'test@example.com')
        self.assertIn('date_joined', data)
        self.assertNotIn('password', data)
        self.assertNotIn('is_staff', data)
        self.assertNotIn('is_superuser', data)

