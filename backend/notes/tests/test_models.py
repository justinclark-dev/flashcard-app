"""
Test: Notes Models (Note, Category, Tag)
Purpose: Verify model creation, relationships, constraints, and methods
Coverage: Model fields, relationships, constraints, user isolation

Created by: TDD Agent
Date: 2025-01-27
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from notes.models import Note, Category, Tag

User = get_user_model()


class CategoryModelTest(TestCase):
    """Test Category model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='testpass123'
        )
    
    def test_category_creation(self):
        """Test creating a category"""
        category = Category.objects.create(
            name='Python',
            user=self.user,
            color='#3776ab'
        )
        
        self.assertEqual(category.name, 'Python')
        self.assertEqual(category.user, self.user)
        self.assertEqual(category.color, '#3776ab')
        self.assertIsNotNone(category.created_at)
    
    def test_category_default_color(self):
        """Test category uses default color if not provided"""
        category = Category.objects.create(
            name='JavaScript',
            user=self.user
        )
        
        self.assertEqual(category.color, '#4a9eff')
    
    def test_category_unique_per_user(self):
        """Test users can have categories with same name"""
        Category.objects.create(name='Python', user=self.user)
        Category.objects.create(name='Python', user=self.other_user)
        
        # Both should exist
        self.assertEqual(Category.objects.filter(name='Python').count(), 2)
    
    def test_category_duplicate_name_same_user(self):
        """Test user cannot have duplicate category names"""
        Category.objects.create(name='Python', user=self.user)
        
        with self.assertRaises(IntegrityError):
            Category.objects.create(name='Python', user=self.user)
    
    def test_category_cascade_delete(self):
        """Test category is deleted when user is deleted"""
        category = Category.objects.create(name='Python', user=self.user)
        category_id = category.id
        
        self.user.delete()
        
        self.assertFalse(Category.objects.filter(id=category_id).exists())
    
    def test_category_str_representation(self):
        """Test category string representation"""
        category = Category.objects.create(name='Python', user=self.user)
        self.assertEqual(str(category), 'Python')


class TagModelTest(TestCase):
    """Test Tag model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='testpass123'
        )
    
    def test_tag_creation(self):
        """Test creating a tag"""
        tag = Tag.objects.create(
            name='basics',
            user=self.user
        )
        
        self.assertEqual(tag.name, 'basics')
        self.assertEqual(tag.user, self.user)
        self.assertIsNotNone(tag.created_at)
    
    def test_tag_unique_per_user(self):
        """Test users can have tags with same name"""
        Tag.objects.create(name='python', user=self.user)
        Tag.objects.create(name='python', user=self.other_user)
        
        # Both should exist
        self.assertEqual(Tag.objects.filter(name='python').count(), 2)
    
    def test_tag_duplicate_name_same_user(self):
        """Test user cannot have duplicate tag names"""
        Tag.objects.create(name='python', user=self.user)
        
        with self.assertRaises(IntegrityError):
            Tag.objects.create(name='python', user=self.user)
    
    def test_tag_cascade_delete(self):
        """Test tag is deleted when user is deleted"""
        tag = Tag.objects.create(name='python', user=self.user)
        tag_id = tag.id
        
        self.user.delete()
        
        self.assertFalse(Tag.objects.filter(id=tag_id).exists())
    
    def test_tag_str_representation(self):
        """Test tag string representation"""
        tag = Tag.objects.create(name='python', user=self.user)
        self.assertEqual(str(tag), 'python')


class NoteModelTest(TestCase):
    """Test Note model"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='testpass123'
        )
        self.category = Category.objects.create(
            name='Python',
            user=self.user
        )
        self.tag1 = Tag.objects.create(name='basics', user=self.user)
        self.tag2 = Tag.objects.create(name='python', user=self.user)
    
    def test_note_creation(self):
        """Test creating a note"""
        note = Note.objects.create(
            title='Python Basics',
            content='Python is a programming language...',
            user=self.user,
            category=self.category
        )
        
        self.assertEqual(note.title, 'Python Basics')
        self.assertEqual(note.content, 'Python is a programming language...')
        self.assertEqual(note.user, self.user)
        self.assertEqual(note.category, self.category)
        self.assertIsNotNone(note.created_at)
        self.assertIsNotNone(note.updated_at)
    
    def test_note_without_category(self):
        """Test creating a note without category"""
        note = Note.objects.create(
            title='Test Note',
            content='Content here',
            user=self.user
        )
        
        self.assertIsNone(note.category)
    
    def test_note_with_tags(self):
        """Test creating a note with tags"""
        note = Note.objects.create(
            title='Test Note',
            content='Content here',
            user=self.user
        )
        note.tags.add(self.tag1, self.tag2)
        
        self.assertEqual(note.tags.count(), 2)
        self.assertIn(self.tag1, note.tags.all())
        self.assertIn(self.tag2, note.tags.all())
    
    def test_note_with_source_url(self):
        """Test creating a note with source URL"""
        note = Note.objects.create(
            title='Test Note',
            content='Content here',
            user=self.user,
            source_url='https://docs.python.org'
        )
        
        self.assertEqual(note.source_url, 'https://docs.python.org')
    
    def test_note_cascade_delete_user(self):
        """Test note is deleted when user is deleted"""
        note = Note.objects.create(
            title='Test Note',
            content='Content here',
            user=self.user
        )
        note_id = note.id
        
        self.user.delete()
        
        self.assertFalse(Note.objects.filter(id=note_id).exists())
    
    def test_note_set_null_category_delete(self):
        """Test note category is set to null when category is deleted"""
        note = Note.objects.create(
            title='Test Note',
            content='Content here',
            user=self.user,
            category=self.category
        )
        
        self.category.delete()
        note.refresh_from_db()
        
        self.assertIsNone(note.category)
    
    def test_note_tags_removed_on_tag_delete(self):
        """Test note tags are removed when tag is deleted"""
        note = Note.objects.create(
            title='Test Note',
            content='Content here',
            user=self.user
        )
        note.tags.add(self.tag1, self.tag2)
        
        self.tag1.delete()
        note.refresh_from_db()
        
        self.assertEqual(note.tags.count(), 1)
        self.assertNotIn(self.tag1, note.tags.all())
        self.assertIn(self.tag2, note.tags.all())
    
    def test_note_str_representation(self):
        """Test note string representation"""
        note = Note.objects.create(
            title='Python Basics',
            content='Content here',
            user=self.user
        )
        self.assertEqual(str(note), 'Python Basics')
    
    def test_note_get_excerpt(self):
        """Test note get_excerpt method"""
        content = 'This is a long note content that should be truncated to 100 characters when getting the excerpt.'
        note = Note.objects.create(
            title='Test Note',
            content=content,
            user=self.user
        )
        
        excerpt = note.get_excerpt()
        self.assertLessEqual(len(excerpt), 100)
        self.assertTrue(excerpt.startswith('This is a long'))
    
    def test_note_get_excerpt_short_content(self):
        """Test get_excerpt with content shorter than 100 characters"""
        note = Note.objects.create(
            title='Test Note',
            content='Short content',
            user=self.user
        )
        
        excerpt = note.get_excerpt()
        self.assertEqual(excerpt, 'Short content')
    
    def test_note_user_isolation(self):
        """Test notes are isolated per user"""
        note1 = Note.objects.create(
            title='User 1 Note',
            content='Content',
            user=self.user
        )
        note2 = Note.objects.create(
            title='User 2 Note',
            content='Content',
            user=self.other_user
        )
        
        user1_notes = Note.objects.filter(user=self.user)
        self.assertEqual(user1_notes.count(), 1)
        self.assertEqual(user1_notes.first(), note1)
        
        user2_notes = Note.objects.filter(user=self.other_user)
        self.assertEqual(user2_notes.count(), 1)
        self.assertEqual(user2_notes.first(), note2)

