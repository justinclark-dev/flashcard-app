"""
Test: User Model
Purpose: Verify User model functionality and constraints
Coverage: Model creation, validation, relationships, methods

Created by: TDD Agent
Date: 2025-01-27
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()


class UserModelTest(TestCase):
    """Test User model"""
    
    def test_create_user(self):
        """Test creating a user"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='securepass123'
        )
        
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('securepass123'))
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertIsNotNone(user.date_joined)
    
    def test_create_user_without_email(self):
        """Test creating a user without email (email is optional)"""
        user = User.objects.create_user(
            username='testuser',
            password='securepass123'
        )
        
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, '')
        self.assertTrue(user.is_active)
    
    def test_create_superuser(self):
        """Test creating a superuser"""
        user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass123'
        )
        
        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)
        self.assertTrue(user.is_active)
    
    def test_user_str_representation(self):
        """Test user string representation"""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='securepass123'
        )
        
        self.assertEqual(str(user), 'testuser')
    
    def test_user_unique_username(self):
        """Test username must be unique"""
        User.objects.create_user(
            username='testuser',
            password='securepass123'
        )
        
        with self.assertRaises(Exception):  # IntegrityError or ValidationError
            User.objects.create_user(
                username='testuser',
                password='anotherpass123'
            )
    
    def test_user_unique_email(self):
        """Test email must be unique when provided"""
        User.objects.create_user(
            username='user1',
            email='test@example.com',
            password='securepass123'
        )
        
        with self.assertRaises(Exception):  # IntegrityError or ValidationError
            User.objects.create_user(
                username='user2',
                email='test@example.com',
                password='anotherpass123'
            )
    
    def test_user_password_is_hashed(self):
        """Test password is hashed, not stored in plain text"""
        user = User.objects.create_user(
            username='testuser',
            password='securepass123'
        )
        
        # Password should be hashed
        self.assertNotEqual(user.password, 'securepass123')
        self.assertTrue(user.password.startswith('pbkdf2_'))  # Django's default hasher
        # Verify password check works
        self.assertTrue(user.check_password('securepass123'))
        self.assertFalse(user.check_password('wrongpassword'))
    
    def test_user_date_joined_auto_set(self):
        """Test date_joined is automatically set"""
        from django.utils import timezone
        import time
        
        time.sleep(0.1)  # Small delay to ensure different timestamps
        before = timezone.now()
        
        user = User.objects.create_user(
            username='testuser',
            password='securepass123'
        )
        
        after = timezone.now()
        
        self.assertIsNotNone(user.date_joined)
        self.assertGreaterEqual(user.date_joined, before)
        self.assertLessEqual(user.date_joined, after)
    
    def test_user_is_active_default(self):
        """Test user is_active defaults to True"""
        user = User.objects.create_user(
            username='testuser',
            password='securepass123'
        )
        
        self.assertTrue(user.is_active)
    
    def test_user_is_staff_default(self):
        """Test user is_staff defaults to False"""
        user = User.objects.create_user(
            username='testuser',
            password='securepass123'
        )
        
        self.assertFalse(user.is_staff)
    
    def test_user_is_superuser_default(self):
        """Test user is_superuser defaults to False"""
        user = User.objects.create_user(
            username='testuser',
            password='securepass123'
        )
        
        self.assertFalse(user.is_superuser)

