# Development Environment Setup Guide
**Created By**: Senior Developer Agent  
**Date**: 2025-01-27  
**Purpose**: Manual Testing & Development

## Overview

This guide provides step-by-step instructions for setting up and running the Study Notes & Flashcard App development environment for manual testing.

## Prerequisites

Before starting, ensure you have the following installed:

- **Python 3.11+** (verify with `python3 --version`)
- **PostgreSQL 16.11** (verify with `psql --version`)
- **Node.js 18+** (verify with `node --version`)
- **npm 9+** (verify with `npm --version`)
- **Python virtual environment** (located at `~/python-venv/`)

## Quick Start

### 1. Activate Python Virtual Environment

```bash
source ~/python-venv/bin/activate
```

You should see `(python-venv)` in your terminal prompt.

### 2. Start PostgreSQL Database

Ensure PostgreSQL is running:

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# If not running, start it
sudo systemctl start postgresql
```

The database should already be configured. Verify connection:

```bash
psql -U postgres -d study_app -c "SELECT version();"
```

### 3. Start Backend Server

Navigate to the backend directory and start the Django development server:

```bash
cd /home/justin/code/ga/lectures/cursor-ai/backend
source ~/python-venv/bin/activate
python manage.py runserver
```

The backend will start on **http://localhost:8000**

You should see output like:
```
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

### 4. Start Frontend Server

Open a **new terminal window** and navigate to the frontend directory:

```bash
cd /home/justin/code/ga/lectures/cursor-ai/frontend
npm install  # Only needed first time or after dependency changes
npm run dev
```

The frontend will start on **http://localhost:5173** (Vite default port)

You should see output like:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## Accessing the Application

### Frontend Application
Open your browser and navigate to:
```
http://localhost:5173
```

### Backend API
The API is available at:
```
http://localhost:8000/api/
```

### API Endpoints
- **Authentication**: `http://localhost:8000/api/auth/`
  - Register: `POST /api/auth/register/`
  - Login: `POST /api/auth/login/`
  - Logout: `POST /api/auth/logout/`
  - Current User: `GET /api/auth/user/`
- **Notes**: `http://localhost:8000/api/notes/`
- **Categories**: `http://localhost:8000/api/categories/`
- **Tags**: `http://localhost:8000/api/tags/`
- **Flashcard Sets**: `http://localhost:8000/api/flashcard-sets/`
- **Study Sessions**: `http://localhost:8000/api/study-sessions/`

## Manual Testing Guide

### 1. Authentication Testing

#### Register a New User
1. Navigate to `http://localhost:5173/register`
2. Fill in the registration form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `testpass123` (must be at least 8 characters with letters and numbers)
   - Confirm Password: `testpass123`
3. Click "Register"
4. You should be redirected to the dashboard

#### Login
1. Navigate to `http://localhost:5173/login`
2. Enter credentials:
   - Username: `testuser`
   - Password: `testpass123`
3. Click "Login"
4. You should be redirected to the dashboard

#### Logout
1. Click "Logout" in the navbar (top right)
2. You should be redirected to the login page

### 2. Notes Feature Testing

#### Create a Note
1. Click "Create Note" from the dashboard or navigate to `/notes/new`
2. Fill in the form:
   - Title: `My First Note`
   - Content: `This is the content of my note. It supports markdown!`
   - Category: (optional) Create or select a category
   - Tags: (optional) Add tags like `python`, `django`
   - Source URL: (optional) `https://example.com`
3. Click "Save Note"
4. You should be redirected to `/notes` and see your note in the list

#### View Notes
1. Navigate to `/notes` or click "View Notes" from dashboard
2. You should see a list of all your notes
3. Click on a note card to view details

#### Search Notes
1. On the `/notes` page, use the search box
2. Type a search term (searches in title and content)
3. Results should filter in real-time

#### Filter by Category
1. On the `/notes` page, select a category from the dropdown
2. Only notes with that category should be displayed

#### Edit a Note
1. Click on a note card
2. Click "Edit" button
3. Modify the content
4. Click "Save Note"
5. Changes should be reflected

#### Delete a Note
1. On a note card, click "Delete"
2. Confirm deletion
3. Note should be removed from the list

### 3. Flashcard Feature Testing

#### Create a Flashcard Set
1. Navigate to `/flashcards` or click "Create Flashcard Set" from dashboard
2. Fill in the form:
   - Name: `Python Basics`
   - Description: `Basic Python concepts`
   - Category: (optional) Select a category
3. Click "Save"
4. You should see the new flashcard set

#### Create Flashcards
1. Click on a flashcard set
2. Click "Add Flashcard" or navigate to the set's detail page
3. Fill in:
   - Front: `What is Python?`
   - Back: `A high-level programming language`
   - Difficulty: `easy` (optional)
4. Click "Save"
5. Repeat to add more flashcards

#### Study Flashcards (Simple Mode)
1. Navigate to a flashcard set
2. Click "Study" or navigate to `/flashcards/{setId}/study`
3. You should see the first flashcard (front side)
4. Click the card to flip and see the back
5. Click "Correct" or "Incorrect" to mark your answer
6. Continue through all cards

#### Study Flashcards (Spaced Repetition)
1. Navigate to `/flashcards/{setId}/study/spaced`
2. Study cards using the SM-2 algorithm
3. Rate your performance (0-5):
   - 0-1: Complete failure
   - 2: Incorrect with difficulty
   - 3: Correct with difficulty
   - 4: Correct after hesitation
   - 5: Perfect response
4. Cards will be scheduled for review based on your performance

#### View Study Statistics
1. After completing a study session, view statistics
2. You should see:
   - Cards studied
   - Cards correct
   - Accuracy percentage
   - Study duration

### 4. Navigation Testing

#### Test Navigation Bar
1. Verify navbar appears on all protected routes
2. Click "Dashboard" - should navigate to `/`
3. Click "Notes" - should navigate to `/notes`
4. Click "Flashcards" - should navigate to `/flashcards`
5. Verify active route is highlighted

#### Test Protected Routes
1. Logout
2. Try to access `/notes` directly
3. You should be redirected to `/login`
4. Login again
5. You should be able to access protected routes

### 5. Cross-Feature Testing

#### Create Note and Generate Flashcards
1. Create a note with content
2. Create a flashcard set
3. (Future feature: Generate flashcards from note)
4. Manually create flashcards based on note content

#### Use Categories Across Features
1. Create a category in Notes
2. Use the same category for a Flashcard Set
3. Verify category appears in both places

## Troubleshooting

### Backend Issues

#### Database Connection Error
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check database exists
psql -U postgres -l | grep study_app

# If database doesn't exist, create it
createdb -U postgres study_app
```

#### Migration Issues
```bash
cd backend
source ~/python-venv/bin/activate
python manage.py makemigrations
python manage.py migrate
```

#### Port Already in Use
If port 8000 is already in use:
```bash
# Find process using port 8000
lsof -i :8000

# Kill the process or use a different port
python manage.py runserver 8001
```

### Frontend Issues

#### npm install fails
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Port Already in Use
If port 5173 is already in use, Vite will automatically use the next available port.

#### API Connection Errors
1. Verify backend is running on `http://localhost:8000`
2. Check browser console for CORS errors
3. Verify `VITE_API_BASE_URL` in `.env` file (if using)

### Common Issues

#### Session/Cookie Issues
- Clear browser cookies for `localhost`
- Ensure you're using the same domain (not mixing `localhost` and `127.0.0.1`)

#### CSRF Token Errors
- The backend should handle CSRF automatically
- If issues persist, check browser console for errors

#### Authentication Not Working
1. Verify backend is running
2. Check browser Network tab for API responses
3. Verify session cookies are being set
4. Try logging out and logging back in

## Development Commands Reference

### Backend Commands
```bash
# Activate virtual environment
source ~/python-venv/bin/activate

# Run development server
cd backend
python manage.py runserver

# Run tests
python manage.py test

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser (for admin access)
python manage.py createsuperuser

# Access Django shell
python manage.py shell
```

### Frontend Commands
```bash
# Install dependencies
cd frontend
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

## Testing Checklist

Use this checklist for comprehensive manual testing:

### Authentication
- [ ] Register new user
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should fail)
- [ ] Logout
- [ ] Access protected route when logged out (should redirect)
- [ ] Access protected route when logged in (should work)

### Notes
- [ ] Create note
- [ ] Create note with category
- [ ] Create note with tags
- [ ] List all notes
- [ ] Search notes
- [ ] Filter notes by category
- [ ] View single note
- [ ] Edit note
- [ ] Delete note
- [ ] Verify user isolation (create note as User1, login as User2, shouldn't see User1's notes)

### Categories
- [ ] Create category
- [ ] List categories
- [ ] Update category
- [ ] Delete category
- [ ] Use category in note

### Tags
- [ ] Create tag
- [ ] List tags
- [ ] Update tag
- [ ] Delete tag
- [ ] Use tags in note

### Flashcards
- [ ] Create flashcard set
- [ ] Create flashcard
- [ ] List flashcards in set
- [ ] Study flashcards (simple mode)
- [ ] Study flashcards (spaced repetition)
- [ ] Review flashcard (SM-2 algorithm)
- [ ] Create study session
- [ ] Update study session
- [ ] End study session
- [ ] View study statistics

### Navigation
- [ ] Navigate between all routes
- [ ] Verify navbar works
- [ ] Verify active route highlighting
- [ ] Test browser back/forward buttons
- [ ] Test direct URL access

## Next Steps

After manual testing, you can:

1. **Run Automated Tests**
   ```bash
   # Backend tests
   cd backend
   python manage.py test
   
   # Frontend tests
   cd frontend
   npm test
   
   # Integration tests
   cd backend
   python manage.py test integration_tests
   ```

2. **Check Test Coverage**
   - Backend: 174/174 tests passing (100%)
   - Frontend Service: 26/26 tests passing (100%)
   - Integration: 5/5 tests passing (100%)

3. **Review Documentation**
   - Architecture: `docs/architecture/`
   - API Design: `docs/architecture/api-design.md`
   - Testing: `docs/testing/`

## Support

If you encounter issues not covered in this guide:

1. Check the browser console for errors
2. Check the backend terminal for error messages
3. Review the test files for expected behavior
4. Check the architecture documentation

---

**Status**: Ready for Manual Testing  
**Last Updated**: 2025-01-27

