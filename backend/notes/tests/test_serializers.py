"""
Test: Notes Serializers (Note, Category, Tag)
Purpose: Verify serializer validation, data transformation, and relationships
Coverage: Field validation, nested serializers, read/write operations

Created by: TDD Agent
Date: 2025-01-27
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from notes.models import Note, Category, Tag

User = get_user_model()


class CategorySerializerTest(TestCase):
    """Test Category serializer"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_category_serializer_valid_data(self):
        """Test serializer with valid data"""
        from notes.serializers import CategorySerializer
        
        data = {
            'name': 'Python',
            'color': '#3776ab'
        }
        serializer = CategorySerializer(data=data, context={'request': type('obj', (object,), {'user': self.user})()})
        
        self.assertTrue(serializer.is_valid())
        category = serializer.save(user=self.user)
        
        self.assertEqual(category.name, 'Python')
        self.assertEqual(category.color, '#3776ab')
        self.assertEqual(category.user, self.user)
    
    def test_category_serializer_default_color(self):
        """Test serializer uses default color if not provided"""
        from notes.serializers import CategorySerializer
        
        data = {'name': 'JavaScript'}
        serializer = CategorySerializer(data=data, context={'request': type('obj', (object,), {'user': self.user})()})
        
        self.assertTrue(serializer.is_valid())
        category = serializer.save(user=self.user)
        
        self.assertEqual(category.color, '#4a9eff')
    
    def test_category_serializer_name_required(self):
        """Test serializer requires name field"""
        from notes.serializers import CategorySerializer
        
        data = {'color': '#3776ab'}
        serializer = CategorySerializer(data=data, context={'request': type('obj', (object,), {'user': self.user})()})
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('name', serializer.errors)
    
    def test_category_serializer_duplicate_name(self):
        """Test serializer prevents duplicate category names for same user"""
        from notes.serializers import CategorySerializer
        
        Category.objects.create(name='Python', user=self.user)
        
        data = {'name': 'Python'}
        serializer = CategorySerializer(data=data, context={'request': type('obj', (object,), {'user': self.user})()})
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('name', serializer.errors)


class TagSerializerTest(TestCase):
    """Test Tag serializer"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_tag_serializer_valid_data(self):
        """Test serializer with valid data"""
        from notes.serializers import TagSerializer
        
        data = {'name': 'python'}
        serializer = TagSerializer(data=data, context={'request': type('obj', (object,), {'user': self.user})()})
        
        self.assertTrue(serializer.is_valid())
        tag = serializer.save(user=self.user)
        
        self.assertEqual(tag.name, 'python')
        self.assertEqual(tag.user, self.user)
    
    def test_tag_serializer_name_required(self):
        """Test serializer requires name field"""
        from notes.serializers import TagSerializer
        
        data = {}
        serializer = TagSerializer(data=data, context={'request': type('obj', (object,), {'user': self.user})()})
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('name', serializer.errors)
    
    def test_tag_serializer_duplicate_name(self):
        """Test serializer prevents duplicate tag names for same user"""
        from notes.serializers import TagSerializer
        
        Tag.objects.create(name='python', user=self.user)
        
        data = {'name': 'python'}
        serializer = TagSerializer(data=data, context={'request': type('obj', (object,), {'user': self.user})()})
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('name', serializer.errors)


class NoteSerializerTest(TestCase):
    """Test Note serializer"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.category = Category.objects.create(name='Python', user=self.user)
        self.tag1 = Tag.objects.create(name='basics', user=self.user)
        self.tag2 = Tag.objects.create(name='python', user=self.user)
    
    def test_note_serializer_valid_data(self):
        """Test serializer with valid data"""
        from notes.serializers import NoteSerializer
        
        data = {
            'title': 'Python Basics',
            'content': 'Python is a programming language...',
            'category_id': self.category.id,
            'tag_ids': [self.tag1.id, self.tag2.id],
            'source_url': 'https://docs.python.org'
        }
        serializer = NoteSerializer(data=data, context={'request': type('obj', (object,), {'user': self.user})()})
        
        self.assertTrue(serializer.is_valid())
        note = serializer.save(user=self.user)
        
        self.assertEqual(note.title, 'Python Basics')
        self.assertEqual(note.content, 'Python is a programming language...')
        self.assertEqual(note.category, self.category)
        self.assertEqual(note.tags.count(), 2)
        self.assertEqual(note.source_url, 'https://docs.python.org')
    
    def test_note_serializer_title_required(self):
        """Test serializer requires title field"""
        from notes.serializers import NoteSerializer
        
        data = {
            'content': 'Content here'
        }
        serializer = NoteSerializer(data=data, context={'request': type('obj', (object,), {'user': self.user})()})
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('title', serializer.errors)
    
    def test_note_serializer_content_required(self):
        """Test serializer requires content field"""
        from notes.serializers import NoteSerializer
        
        data = {
            'title': 'Test Note'
        }
        serializer = NoteSerializer(data=data, context={'request': type('obj', (object,), {'user': self.user})()})
        
        self.assertFalse(serializer.is_valid())
        self.assertIn('content', serializer.errors)
    
    def test_note_serializer_without_category(self):
        """Test serializer works without category"""
        from notes.serializers import NoteSerializer
        
        data = {
            'title': 'Test Note',
            'content': 'Content here'
        }
        serializer = NoteSerializer(data=data, context={'request': type('obj', (object,), {'user': self.user})()})
        
        self.assertTrue(serializer.is_valid())
        note = serializer.save(user=self.user)
        
        self.assertIsNone(note.category)
    
    def test_note_serializer_without_tags(self):
        """Test serializer works without tags"""
        from notes.serializers import NoteSerializer
        
        data = {
            'title': 'Test Note',
            'content': 'Content here'
        }
        serializer = NoteSerializer(data=data, context={'request': type('obj', (object,), {'user': self.user})()})
        
        self.assertTrue(serializer.is_valid())
        note = serializer.save(user=self.user)
        
        self.assertEqual(note.tags.count(), 0)
    
    def test_note_serializer_read_representation(self):
        """Test serializer read representation includes nested objects"""
        from notes.serializers import NoteSerializer
        
        note = Note.objects.create(
            title='Test Note',
            content='Content here',
            user=self.user,
            category=self.category
        )
        note.tags.add(self.tag1, self.tag2)
        
        serializer = NoteSerializer(note)
        data = serializer.data
        
        self.assertEqual(data['title'], 'Test Note')
        self.assertIn('category', data)
        self.assertIn('tags', data)
        self.assertEqual(len(data['tags']), 2)
        self.assertIn('created_at', data)
        self.assertIn('updated_at', data)

