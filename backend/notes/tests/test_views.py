"""
Test: Notes API Views (Notes, Categories, Tags)
Purpose: Verify API endpoints, CRUD operations, authorization, filtering, search
Coverage: All endpoints, authentication, user isolation, pagination, search

Created by: TDD Agent
Date: 2025-01-27
"""

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from notes.models import Note, Category, Tag

User = get_user_model()


class NotesAPITest(TestCase):
    """Test Notes API endpoints"""
    
    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=False)
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
        self.category = Category.objects.create(name='Python', user=self.user)
        self.tag1 = Tag.objects.create(name='basics', user=self.user)
        self.tag2 = Tag.objects.create(name='python', user=self.user)
    
    def test_list_notes_authenticated(self):
        """Test listing notes when authenticated"""
        self.client.force_authenticate(user=self.user)
        
        Note.objects.create(
            title='Note 1',
            content='Content 1',
            user=self.user
        )
        Note.objects.create(
            title='Note 2',
            content='Content 2',
            user=self.user
        )
        
        url = reverse('notes:note-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')
        self.assertIn('results', response.data)
        self.assertEqual(len(response.data['results']), 2)
    
    def test_list_notes_unauthenticated(self):
        """Test listing notes requires authentication"""
        url = reverse('notes:note-list')
        response = self.client.get(url)
        
        # DRF returns 403 Forbidden for unauthenticated requests with IsAuthenticated permission
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])
    
    def test_list_notes_user_isolation(self):
        """Test users only see their own notes"""
        self.client.force_authenticate(user=self.user)
        
        Note.objects.create(title='User 1 Note', content='Content', user=self.user)
        Note.objects.create(title='User 2 Note', content='Content', user=self.other_user)
        
        url = reverse('notes:note-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], 'User 1 Note')
    
    def test_create_note_authenticated(self):
        """Test creating a note when authenticated"""
        self.client.force_authenticate(user=self.user)
        
        url = reverse('notes:note-list')
        data = {
            'title': 'New Note',
            'content': 'Note content here...',
            'category_id': self.category.id,
            'tag_ids': [self.tag1.id, self.tag2.id]
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'success')
        self.assertIn('data', response.data)
        self.assertEqual(response.data['data']['title'], 'New Note')
        self.assertEqual(response.data['data']['content'], 'Note content here...')
        
        # Verify note was created
        self.assertTrue(Note.objects.filter(title='New Note', user=self.user).exists())
    
    def test_create_note_unauthenticated(self):
        """Test creating a note requires authentication"""
        url = reverse('notes:note-list')
        data = {
            'title': 'New Note',
            'content': 'Note content here...'
        }
        response = self.client.post(url, data, format='json')
        
        # DRF returns 403 Forbidden for unauthenticated requests with IsAuthenticated permission
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])
    
    def test_create_note_validation_error(self):
        """Test creating a note with invalid data"""
        self.client.force_authenticate(user=self.user)
        
        url = reverse('notes:note-list')
        data = {
            'title': '',  # Empty title
            'content': 'Content'
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('title', response.data.get('details', {}))
    
    def test_get_note_detail(self):
        """Test retrieving a specific note"""
        self.client.force_authenticate(user=self.user)
        
        note = Note.objects.create(
            title='Test Note',
            content='Content here',
            user=self.user,
            category=self.category
        )
        note.tags.add(self.tag1, self.tag2)
        
        url = reverse('notes:note-detail', kwargs={'pk': note.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')
        self.assertEqual(response.data['data']['title'], 'Test Note')
        self.assertIn('category', response.data['data'])
        self.assertIn('tags', response.data['data'])
        self.assertEqual(len(response.data['data']['tags']), 2)
    
    def test_get_note_not_found(self):
        """Test retrieving non-existent note returns 404"""
        self.client.force_authenticate(user=self.user)
        
        url = reverse('notes:note-detail', kwargs={'pk': 999})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_get_note_other_user(self):
        """Test cannot retrieve another user's note"""
        self.client.force_authenticate(user=self.user)
        
        note = Note.objects.create(
            title='Other User Note',
            content='Content',
            user=self.other_user
        )
        
        url = reverse('notes:note-detail', kwargs={'pk': note.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_update_note(self):
        """Test updating a note"""
        self.client.force_authenticate(user=self.user)
        
        note = Note.objects.create(
            title='Original Title',
            content='Original content',
            user=self.user
        )
        
        url = reverse('notes:note-detail', kwargs={'pk': note.id})
        data = {
            'title': 'Updated Title',
            'content': 'Updated content',
            'category_id': self.category.id
        }
        response = self.client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        note.refresh_from_db()
        self.assertEqual(note.title, 'Updated Title')
        self.assertEqual(note.content, 'Updated content')
        self.assertEqual(note.category, self.category)
    
    def test_partial_update_note(self):
        """Test partial update of a note"""
        self.client.force_authenticate(user=self.user)
        
        note = Note.objects.create(
            title='Original Title',
            content='Original content',
            user=self.user
        )
        
        url = reverse('notes:note-detail', kwargs={'pk': note.id})
        data = {'title': 'Updated Title'}
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        note.refresh_from_db()
        self.assertEqual(note.title, 'Updated Title')
        self.assertEqual(note.content, 'Original content')  # Unchanged
    
    def test_update_note_other_user(self):
        """Test cannot update another user's note"""
        self.client.force_authenticate(user=self.user)
        
        note = Note.objects.create(
            title='Other User Note',
            content='Content',
            user=self.other_user
        )
        
        url = reverse('notes:note-detail', kwargs={'pk': note.id})
        data = {'title': 'Hacked Title'}
        response = self.client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_delete_note(self):
        """Test deleting a note"""
        self.client.force_authenticate(user=self.user)
        
        note = Note.objects.create(
            title='To Delete',
            content='Content',
            user=self.user
        )
        
        url = reverse('notes:note-detail', kwargs={'pk': note.id})
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Note.objects.filter(id=note.id).exists())
    
    def test_delete_note_other_user(self):
        """Test cannot delete another user's note"""
        self.client.force_authenticate(user=self.user)
        
        note = Note.objects.create(
            title='Other User Note',
            content='Content',
            user=self.other_user
        )
        
        url = reverse('notes:note-detail', kwargs={'pk': note.id})
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Note.objects.filter(id=note.id).exists())
    
    def test_filter_notes_by_category(self):
        """Test filtering notes by category"""
        self.client.force_authenticate(user=self.user)
        
        category2 = Category.objects.create(name='JavaScript', user=self.user)
        
        Note.objects.create(title='Python Note', content='Content', user=self.user, category=self.category)
        Note.objects.create(title='JS Note', content='Content', user=self.user, category=category2)
        
        url = reverse('notes:note-list')
        response = self.client.get(url, {'category': self.category.id})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], 'Python Note')
    
    def test_search_notes_by_title(self):
        """Test searching notes by title"""
        self.client.force_authenticate(user=self.user)
        
        Note.objects.create(title='Python Basics', content='Content', user=self.user)
        Note.objects.create(title='JavaScript Guide', content='Content', user=self.user)
        
        url = reverse('notes:note-list')
        response = self.client.get(url, {'search': 'Python'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], 'Python Basics')
    
    def test_search_notes_by_content(self):
        """Test searching notes by content"""
        self.client.force_authenticate(user=self.user)
        
        Note.objects.create(title='Note 1', content='Python programming language', user=self.user)
        Note.objects.create(title='Note 2', content='JavaScript framework', user=self.user)
        
        url = reverse('notes:note-list')
        response = self.client.get(url, {'search': 'Python'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], 'Note 1')
    
    def test_order_notes_by_created_at(self):
        """Test ordering notes by creation date"""
        self.client.force_authenticate(user=self.user)
        
        note1 = Note.objects.create(title='First Note', content='Content', user=self.user)
        note2 = Note.objects.create(title='Second Note', content='Content', user=self.user)
        
        url = reverse('notes:note-list')
        response = self.client.get(url, {'ordering': 'created_at'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['results'][0]['id'], note1.id)
        self.assertEqual(response.data['results'][1]['id'], note2.id)
    
    def test_order_notes_by_title(self):
        """Test ordering notes by title"""
        self.client.force_authenticate(user=self.user)
        
        Note.objects.create(title='Zebra Note', content='Content', user=self.user)
        Note.objects.create(title='Alpha Note', content='Content', user=self.user)
        
        url = reverse('notes:note-list')
        response = self.client.get(url, {'ordering': 'title'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['results'][0]['title'], 'Alpha Note')
        self.assertEqual(response.data['results'][1]['title'], 'Zebra Note')
    
    def test_pagination(self):
        """Test notes list pagination"""
        self.client.force_authenticate(user=self.user)
        
        # Create 25 notes
        for i in range(25):
            Note.objects.create(
                title=f'Note {i}',
                content='Content',
                user=self.user
            )
        
        url = reverse('notes:note-list')
        response = self.client.get(url, {'page_size': 20})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 20)
        self.assertIn('next', response.data)
        self.assertIn('count', response.data)
        self.assertEqual(response.data['count'], 25)


class CategoriesAPITest(TestCase):
    """Test Categories API endpoints"""
    
    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=False)
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
    
    def test_list_categories_authenticated(self):
        """Test listing categories when authenticated"""
        self.client.force_authenticate(user=self.user)
        
        Category.objects.create(name='Python', user=self.user)
        Category.objects.create(name='JavaScript', user=self.user)
        
        url = reverse('notes:category-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')
        self.assertEqual(len(response.data['data']), 2)
    
    def test_list_categories_user_isolation(self):
        """Test users only see their own categories"""
        self.client.force_authenticate(user=self.user)
        
        Category.objects.create(name='Python', user=self.user)
        Category.objects.create(name='Python', user=self.other_user)
        
        url = reverse('notes:category-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['data']), 1)
    
    def test_create_category(self):
        """Test creating a category"""
        self.client.force_authenticate(user=self.user)
        
        url = reverse('notes:category-list')
        data = {
            'name': 'Python',
            'color': '#3776ab'
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'success')
        self.assertEqual(response.data['data']['name'], 'Python')
        self.assertTrue(Category.objects.filter(name='Python', user=self.user).exists())
    
    def test_create_category_duplicate_name(self):
        """Test cannot create duplicate category names"""
        self.client.force_authenticate(user=self.user)
        
        Category.objects.create(name='Python', user=self.user)
        
        url = reverse('notes:category-list')
        data = {'name': 'Python'}
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_update_category(self):
        """Test updating a category"""
        self.client.force_authenticate(user=self.user)
        
        category = Category.objects.create(name='Python', user=self.user)
        
        url = reverse('notes:category-detail', kwargs={'pk': category.id})
        data = {'name': 'Python 3', 'color': '#3776ab'}
        response = self.client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        category.refresh_from_db()
        self.assertEqual(category.name, 'Python 3')
    
    def test_delete_category(self):
        """Test deleting a category"""
        self.client.force_authenticate(user=self.user)
        
        category = Category.objects.create(name='Python', user=self.user)
        
        url = reverse('notes:category-detail', kwargs={'pk': category.id})
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Category.objects.filter(id=category.id).exists())


class TagsAPITest(TestCase):
    """Test Tags API endpoints"""
    
    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=False)
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
    
    def test_list_tags_authenticated(self):
        """Test listing tags when authenticated"""
        self.client.force_authenticate(user=self.user)
        
        Tag.objects.create(name='python', user=self.user)
        Tag.objects.create(name='javascript', user=self.user)
        
        url = reverse('notes:tag-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')
        self.assertEqual(len(response.data['data']), 2)
    
    def test_list_tags_user_isolation(self):
        """Test users only see their own tags"""
        self.client.force_authenticate(user=self.user)
        
        Tag.objects.create(name='python', user=self.user)
        Tag.objects.create(name='python', user=self.other_user)
        
        url = reverse('notes:tag-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['data']), 1)
    
    def test_create_tag(self):
        """Test creating a tag"""
        self.client.force_authenticate(user=self.user)
        
        url = reverse('notes:tag-list')
        data = {'name': 'python'}
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'success')
        self.assertEqual(response.data['data']['name'], 'python')
        self.assertTrue(Tag.objects.filter(name='python', user=self.user).exists())
    
    def test_create_tag_duplicate_name(self):
        """Test cannot create duplicate tag names"""
        self.client.force_authenticate(user=self.user)
        
        Tag.objects.create(name='python', user=self.user)
        
        url = reverse('notes:tag-list')
        data = {'name': 'python'}
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_update_tag(self):
        """Test updating a tag"""
        self.client.force_authenticate(user=self.user)
        
        tag = Tag.objects.create(name='python', user=self.user)
        
        url = reverse('notes:tag-detail', kwargs={'pk': tag.id})
        data = {'name': 'python3'}
        response = self.client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        tag.refresh_from_db()
        self.assertEqual(tag.name, 'python3')
    
    def test_delete_tag(self):
        """Test deleting a tag"""
        self.client.force_authenticate(user=self.user)
        
        tag = Tag.objects.create(name='python', user=self.user)
        
        url = reverse('notes:tag-detail', kwargs={'pk': tag.id})
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Tag.objects.filter(id=tag.id).exists())

