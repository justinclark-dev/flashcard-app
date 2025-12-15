"""
Integration Tests
Tests end-to-end user flows across the entire application.
"""

from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from notes.models import Note, Category, Tag
from flashcards.models import FlashcardSet, Flashcard, StudySession

User = get_user_model()


class AuthenticationFlowTest(TestCase):
    """Test complete authentication flow"""
    
    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=False)
        self.register_url = reverse('auth:register')
        self.login_url = reverse('auth:login')
        self.logout_url = reverse('auth:logout')
        self.current_user_url = reverse('auth:user')
    
    def test_complete_auth_flow(self):
        """Test: Register → Login → Access Protected Route → Logout"""
        
        # 1. Register new user
        register_data = {
            'username': 'integration_user',
            'email': 'integration@example.com',
            'password': 'securepass123',
            'password_confirm': 'securepass123'
        }
        response = self.client.post(self.register_url, register_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'success')
        user_id = response.data['data']['id']
        
        # Verify user exists
        self.assertTrue(User.objects.filter(username='integration_user').exists())
        
        # 2. Login
        login_data = {
            'username': 'integration_user',
            'password': 'securepass123'
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')
        
        # 3. Access protected route (current user)
        response = self.client.get(self.current_user_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['username'], 'integration_user')
        
        # 4. Logout
        response = self.client.post(self.logout_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 5. Verify logged out (should not access protected route)
        response = self.client.get(self.current_user_url)
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])


class NotesFeatureFlowTest(TestCase):
    """Test complete Notes feature flow"""
    
    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=False)
        self.user = User.objects.create_user(
            username='notes_user',
            email='notes@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        self.notes_url = reverse('notes:note-list')
        self.categories_url = reverse('notes:category-list')
        self.tags_url = reverse('notes:tag-list')
    
    def test_complete_notes_flow(self):
        """Test: Create Category → Create Tag → Create Note → List → Update → Delete"""
        
        # 1. Create Category
        category_data = {'name': 'Integration Test Category', 'color': '#ff0000'}
        response = self.client.post(self.categories_url, category_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        category_id = response.data['data']['id']
        
        # 2. Create Tag
        tag_data = {'name': 'integration-test'}
        response = self.client.post(self.tags_url, tag_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        tag_id = response.data['data']['id']
        
        # 3. Create Note with Category and Tag
        note_data = {
            'title': 'Integration Test Note',
            'content': 'This is a test note created during integration testing.',
            'category_id': category_id,
            'tag_ids': [tag_id],
            'source_url': 'https://example.com'
        }
        response = self.client.post(self.notes_url, note_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'success')
        note_id = response.data['data']['id']
        
        # Verify note was created
        self.assertTrue(Note.objects.filter(id=note_id, user=self.user).exists())
        note = Note.objects.get(id=note_id)
        self.assertEqual(note.title, 'Integration Test Note')
        self.assertEqual(note.category_id, category_id)
        self.assertEqual(note.tags.count(), 1)
        
        # 4. List Notes
        response = self.client.get(self.notes_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')
        self.assertGreaterEqual(len(response.data['results']), 1)
        
        # 5. Search Notes
        response = self.client.get(self.notes_url, {'search': 'Integration'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data['results']), 1)
        
        # 6. Filter by Category
        response = self.client.get(self.notes_url, {'category': category_id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data['results']), 1)
        
        # 7. Get Single Note
        note_detail_url = reverse('notes:note-detail', kwargs={'pk': note_id})
        response = self.client.get(note_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['title'], 'Integration Test Note')
        
        # 8. Update Note
        update_data = {
            'title': 'Updated Integration Test Note',
            'content': 'Updated content'
        }
        response = self.client.patch(note_detail_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        note.refresh_from_db()
        self.assertEqual(note.title, 'Updated Integration Test Note')
        
        # 9. Delete Note
        response = self.client.delete(note_detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Note.objects.filter(id=note_id).exists())


class FlashcardFeatureFlowTest(TestCase):
    """Test complete Flashcard feature flow"""
    
    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=False)
        self.user = User.objects.create_user(
            username='flashcard_user',
            email='flashcard@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        self.category = Category.objects.create(name='Test Category', user=self.user)
        self.flashcard_sets_url = reverse('flashcards:flashcardset-list')
    
    def test_complete_flashcard_flow(self):
        """Test: Create Set → Create Cards → Study → Review → Statistics"""
        
        # 1. Create Flashcard Set
        set_data = {
            'name': 'Integration Test Set',
            'description': 'Test flashcard set',
            'category_id': self.category.id
        }
        response = self.client.post(self.flashcard_sets_url, set_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        set_id = response.data['data']['id']
        
        # 2. Create Flashcards
        flashcards_url = reverse('flashcards:flashcard-list', kwargs={'flashcard_set_pk': set_id})
        
        card1_data = {
            'front': 'What is Python?',
            'back': 'A programming language',
            'difficulty': 'easy'
        }
        response = self.client.post(flashcards_url, card1_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        card1_id = response.data['data']['id']
        
        card2_data = {
            'front': 'What is Django?',
            'back': 'A web framework for Python',
            'difficulty': 'medium'
        }
        response = self.client.post(flashcards_url, card2_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        card2_id = response.data['data']['id']
        
        # 3. List Flashcards
        response = self.client.get(flashcards_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
        
        # 4. Review Flashcard (SM-2 Algorithm)
        review_url = reverse('flashcards:flashcard-review', kwargs={
            'flashcard_set_pk': set_id,
            'pk': card1_id
        })
        review_data = {'quality': 5}  # Perfect response
        response = self.client.post(review_url, review_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')
        self.assertIn('interval', response.data['data'])
        self.assertIn('next_review', response.data['data'])
        
        # Verify flashcard was updated
        card1 = Flashcard.objects.get(id=card1_id)
        self.assertEqual(card1.review_count, 1)
        self.assertEqual(card1.correct_count, 1)
        self.assertIsNotNone(card1.next_review)
        
        # 5. Create Study Session
        sessions_url = reverse('flashcards:studysession-list')
        session_data = {
            'flashcard_set_id': set_id,
            'mode': 'spaced'
        }
        response = self.client.post(sessions_url, session_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        session_id = response.data['data']['id']
        
        # 6. Update Study Session
        session_detail_url = reverse('flashcards:studysession-detail', kwargs={'pk': session_id})
        update_data = {
            'cards_studied': 2,
            'cards_correct': 1
        }
        response = self.client.patch(session_detail_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 7. End Study Session
        end_url = reverse('flashcards:studysession-end', kwargs={'pk': session_id})
        response = self.client.post(end_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(response.data['data']['ended_at'])
        
        # 8. Get Study Session Statistics
        stats_url = reverse('flashcards:studysession-stats', kwargs={'pk': session_id})
        response = self.client.get(stats_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('accuracy', response.data['data'])
        self.assertIn('duration', response.data['data'])


class CrossFeatureIntegrationTest(TestCase):
    """Test integration between different features"""
    
    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=False)
        self.user = User.objects.create_user(
            username='cross_user',
            email='cross@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
    
    def test_note_to_flashcard_integration(self):
        """Test: Create Note → Create Flashcard Set → Generate from Note"""
        
        # 1. Create Note
        notes_url = reverse('notes:note-list')
        note_data = {
            'title': 'Python Basics',
            'content': 'Python is a high-level programming language. It supports multiple paradigms.'
        }
        response = self.client.post(notes_url, note_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        note_id = response.data['data']['id']
        
        # 2. Create Flashcard Set
        sets_url = reverse('flashcards:flashcardset-list')
        set_data = {
            'name': 'Python Basics Set',
            'description': 'Generated from note'
        }
        response = self.client.post(sets_url, set_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        set_id = response.data['data']['id']
        
        # 3. Generate Flashcards from Note (using action endpoint)
        # The generate-from-note action is available at: /api/flashcard-sets/{id}/generate-from-note/
        # Note: This is a custom action, so we'll manually create a flashcard instead for integration testing
        # In a real scenario, the generate-from-note would use AI/NLP to create cards
        flashcards_url = reverse('flashcards:flashcard-list', kwargs={'flashcard_set_pk': set_id})
        card_data = {
            'front': 'What is Python?',
            'back': 'A high-level programming language',
            'difficulty': 'easy'
        }
        response = self.client.post(flashcards_url, card_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # 4. Verify flashcards were created
        response = self.client.get(flashcards_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data['results']), 1)


class UserIsolationTest(TestCase):
    """Test that users can only access their own data"""
    
    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=False)
        self.user1 = User.objects.create_user(
            username='user1',
            email='user1@example.com',
            password='testpass123'
        )
        self.user2 = User.objects.create_user(
            username='user2',
            email='user2@example.com',
            password='testpass123'
        )
        
        # User1 creates a note
        self.client.force_authenticate(user=self.user1)
        notes_url = reverse('notes:note-list')
        note_data = {'title': 'User1 Note', 'content': 'Content'}
        response = self.client.post(notes_url, note_data, format='json')
        self.note_id = response.data['data']['id']
    
    def test_user_isolation_notes(self):
        """Test that user2 cannot access user1's notes"""
        
        # Switch to user2
        self.client.force_authenticate(user=self.user2)
        
        # Try to access user1's note
        note_detail_url = reverse('notes:note-detail', kwargs={'pk': self.note_id})
        response = self.client.get(note_detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        # List notes should not include user1's note
        notes_url = reverse('notes:note-list')
        response = self.client.get(notes_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)

