# Frontend Component Structure
**Date**: 2025-01-27
**Created By**: Architect Agent
**Status**: Final

## Overview

The frontend is built with React 18+ and TypeScript using Vite as the build tool. Components are organized by feature with shared common components. State management uses React Context API with hooks.

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── notes/
│   │   ├── flashcards/
│   │   ├── categories/
│   │   ├── dashboard/
│   │   └── common/
│   ├── services/
│   ├── hooks/
│   ├── types/
│   ├── utils/
│   ├── contexts/
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

## Component Hierarchy

```
App
├── ThemeProvider
├── AuthProvider
│   └── Router
│       ├── ProtectedRoute
│       │   └── Dashboard
│       │       ├── Header
│       │       ├── Sidebar
│       │       └── MainContent
│       │           ├── NoteList / NoteEditor
│       │           ├── FlashcardSetList / StudyMode
│       │           └── StatsWidget
│       └── PublicRoute
│           └── LoginForm / RegisterForm
└── ErrorBoundary
```

## Component Specifications

### Authentication Components

#### `LoginForm.tsx`
**Location**: `src/components/auth/LoginForm.tsx`

**Props**:
```typescript
interface LoginFormProps {
  onSuccess?: () => void;
}
```

**Features**:
- Email/username and password fields
- Form validation (required fields, format validation)
- Error message display
- Loading state during submission
- Redirect on success
- Link to register page

**State**:
- `username`: string
- `password`: string
- `error`: string | null
- `loading`: boolean

**API Integration**:
- Calls `authService.login(username, password)`

---

#### `RegisterForm.tsx`
**Location**: `src/components/auth/RegisterForm.tsx`

**Props**:
```typescript
interface RegisterFormProps {
  onSuccess?: () => void;
}
```

**Features**:
- Username, email, password, confirm password fields
- Password strength indicator
- Form validation (matching passwords, email format, username requirements)
- Error message display
- Loading state during submission
- Link to login page

**State**:
- `username`: string
- `email`: string
- `password`: string
- `confirmPassword`: string
- `error`: string | null
- `loading`: boolean

---

#### `ProtectedRoute.tsx`
**Location**: `src/components/auth/ProtectedRoute.tsx`

**Props**:
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
}
```

**Features**:
- Check if user is authenticated
- Redirect to login if not authenticated
- Show loading state while checking
- Uses `useAuth` hook

---

### Notes Components

#### `NoteList.tsx`
**Location**: `src/components/notes/NoteList.tsx`

**Props**:
```typescript
interface NoteListProps {
  onNoteSelect?: (note: Note) => void;
}
```

**Features**:
- Display list of notes (grid or list view)
- Filter by category
- Search functionality
- Sort options (date, title)
- Empty state
- Loading state
- Pagination

**State**:
- `notes`: Note[]
- `filteredNotes`: Note[]
- `selectedCategory`: number | null
- `searchQuery`: string
- `sortBy`: 'date' | 'title'
- `loading`: boolean

---

#### `NoteEditor.tsx`
**Location**: `src/components/notes/NoteEditor.tsx`

**Props**:
```typescript
interface NoteEditorProps {
  noteId?: string; // If editing existing note
  onSave?: () => void;
  onCancel?: () => void;
}
```

**Features**:
- Rich text editor (markdown support)
- Title input
- Category selector (dropdown)
- Tag input (multi-select with autocomplete)
- Save/Cancel buttons
- Auto-save draft (optional, localStorage)
- Source URL field (for scraped content)

**State**:
- `title`: string
- `content`: string
- `categoryId`: number | null
- `tagIds`: number[]
- `sourceUrl`: string
- `saving`: boolean
- `error`: string | null

---

#### `NoteCard.tsx`
**Location**: `src/components/notes/NoteCard.tsx`

**Props**:
```typescript
interface NoteCardProps {
  note: Note;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}
```

**Features**:
- Display note title and excerpt
- Show category badge
- Show tags
- Click to view/edit
- Edit/Delete buttons
- Responsive card layout

---

#### `NoteSearch.tsx`
**Location**: `src/components/notes/NoteSearch.tsx`

**Props**:
```typescript
interface NoteSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}
```

**Features**:
- Search input with debounce
- Clear button
- Search icon
- Real-time search results (optional)

---

### Flashcard Components

#### `FlashcardSetList.tsx`
**Location**: `src/components/flashcards/FlashcardSetList.tsx`

**Props**:
```typescript
interface FlashcardSetListProps {
  onSetSelect?: (set: FlashcardSet) => void;
}
```

**Features**:
- Display list of flashcard sets
- Show card count per set
- Filter by category
- Search functionality
- Create new set button
- Empty state

---

#### `FlashcardSetEditor.tsx`
**Location**: `src/components/flashcards/FlashcardSetEditor.tsx`

**Props**:
```typescript
interface FlashcardSetEditorProps {
  setId?: string;
  onSave?: () => void;
}
```

**Features**:
- Name and description fields
- Category selector
- List of cards in set
- Add/Edit/Delete cards
- Generate from note button

---

#### `FlashcardEditor.tsx`
**Location**: `src/components/flashcards/FlashcardEditor.tsx`

**Props**:
```typescript
interface FlashcardEditorProps {
  cardId?: string;
  setId: string;
  onSave?: () => void;
}
```

**Features**:
- Front (question) textarea
- Back (answer) textarea
- Difficulty selector (easy/medium/hard)
- Save/Cancel buttons

---

#### `StudyMode.tsx`
**Location**: `src/components/flashcards/StudyMode.tsx`

**Props**:
```typescript
interface StudyModeProps {
  flashcardSetId: string;
  mode: 'simple' | 'spaced';
}
```

**Features**:
- Switch between simple and spaced repetition modes
- Track study session
- Show progress (X of Y cards)
- End session button
- Statistics display
- Uses `SimpleFlipCard` or `SpacedRepetitionCard` based on mode

**State**:
- `currentCardIndex`: number
- `cards`: Flashcard[]
- `sessionId`: number | null
- `stats`: StudyStats

---

#### `SimpleFlipCard.tsx`
**Location**: `src/components/flashcards/SimpleFlipCard.tsx`

**Props**:
```typescript
interface SimpleFlipCardProps {
  card: Flashcard;
  onAnswer: (correct: boolean) => void;
  onNext: () => void;
}
```

**Features**:
- Show front of card initially
- Flip animation (CSS transition)
- Show back of card after flip
- Correct/Incorrect buttons
- Keyboard navigation (space to flip, arrow keys to navigate)
- Card counter

---

#### `SpacedRepetitionCard.tsx`
**Location**: `src/components/flashcards/SpacedRepetitionCard.tsx`

**Props**:
```typescript
interface SpacedRepetitionCardProps {
  card: Flashcard;
  onReview: (quality: number) => void; // 0-5 scale
  onNext: () => void;
}
```

**Features**:
- Show front, then back
- Quality rating buttons (0-5 scale with labels)
- Show next review date (after rating)
- Calculate and update ease factor (display only, backend calculates)
- Progress indicator
- Keyboard shortcuts for ratings (0-5 keys)

---

### Category Components

#### `CategoryList.tsx`
**Location**: `src/components/categories/CategoryList.tsx`

**Features**:
- Display user's categories
- Color-coded badges
- Create/Edit/Delete categories
- Category count (notes/flashcards)

---

#### `CategorySelector.tsx`
**Location**: `src/components/categories/CategorySelector.tsx`

**Props**:
```typescript
interface CategorySelectorProps {
  value: number | null;
  onChange: (categoryId: number | null) => void;
  allowNone?: boolean;
}
```

**Features**:
- Dropdown selector
- Color-coded options
- "None" option (if allowNone)
- Create new category option

---

### Dashboard Components

#### `Dashboard.tsx`
**Location**: `src/components/dashboard/Dashboard.tsx`

**Features**:
- Overview of user's notes and flashcards
- Recent activity
- Study statistics widget
- Quick actions (create note, start study session)
- Welcome message

---

#### `StatsWidget.tsx`
**Location**: `src/components/dashboard/StatsWidget.tsx`

**Features**:
- Total notes count
- Total flashcards count
- Study streak
- Cards due for review
- Overall accuracy
- Charts/graphs (optional)

---

### Common Components

#### `Header.tsx`
**Location**: `src/components/common/Header.tsx`

**Features**:
- App logo/title
- Navigation menu
- User menu (logout, profile)
- Theme toggle
- Search bar (global)

---

#### `Sidebar.tsx`
**Location**: `src/components/common/Sidebar.tsx`

**Features**:
- Navigation links (Notes, Flashcards, Dashboard, Categories)
- Category filter
- Collapsible sections
- Active route highlighting

---

#### `ThemeToggle.tsx`
**Location**: `src/components/common/ThemeToggle.tsx`

**Features**:
- Toggle between light/dark mode
- Icon button
- Persist preference (localStorage)
- Uses ThemeContext

---

## Services Layer

### `api.ts` - Base API Client
**Location**: `src/services/api.ts`

**Features**:
- Base URL configuration
- CSRF token handling
- Session cookie management
- Request/response interceptors
- Error handling
- Generic GET, POST, PUT, PATCH, DELETE methods

---

### `auth.ts` - Authentication Service
**Location**: `src/services/auth.ts`

**Methods**:
- `login(username: string, password: string): Promise<User>`
- `register(data: RegisterData): Promise<User>`
- `logout(): Promise<void>`
- `getCurrentUser(): Promise<User>`

---

### `notes.ts` - Notes Service
**Location**: `src/services/notes.ts`

**Methods**:
- `getNotes(filters?: NoteFilters): Promise<PaginatedResponse<Note>>`
- `getNote(id: string): Promise<Note>`
- `createNote(data: CreateNoteData): Promise<Note>`
- `updateNote(id: string, data: UpdateNoteData): Promise<Note>`
- `deleteNote(id: string): Promise<void>`
- `searchNotes(query: string): Promise<Note[]>`

---

### `flashcards.ts` - Flashcards Service
**Location**: `src/services/flashcards.ts`

**Methods**:
- `getFlashcardSets(filters?: SetFilters): Promise<PaginatedResponse<FlashcardSet>>`
- `getFlashcardSet(id: string): Promise<FlashcardSet>`
- `createFlashcardSet(data: CreateSetData): Promise<FlashcardSet>`
- `getCards(setId: string, filters?: CardFilters): Promise<PaginatedResponse<Flashcard>>`
- `createCard(setId: string, data: CreateCardData): Promise<Flashcard>`
- `reviewCard(cardId: string, quality: number): Promise<Flashcard>`
- `startStudySession(setId: string, mode: 'simple' | 'spaced'): Promise<StudySession>`
- `endStudySession(sessionId: string): Promise<StudySession>`

---

## Custom Hooks

### `useAuth.ts`
**Location**: `src/hooks/useAuth.ts`

**Returns**:
```typescript
{
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: Error | null;
}
```

---

### `useNotes.ts`
**Location**: `src/hooks/useNotes.ts`

**Returns**:
```typescript
{
  notes: Note[];
  loading: boolean;
  error: Error | null;
  createNote: (data: CreateNoteData) => Promise<void>;
  updateNote: (id: string, data: UpdateNoteData) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  searchNotes: (query: string) => Promise<void>;
  refreshNotes: () => Promise<void>;
}
```

---

### `useFlashcards.ts`
**Location**: `src/hooks/useFlashcards.ts`

**Returns**:
```typescript
{
  sets: FlashcardSet[];
  loading: boolean;
  error: Error | null;
  createSet: (data: CreateSetData) => Promise<void>;
  getCards: (setId: string) => Promise<Flashcard[]>;
  reviewCard: (cardId: string, quality: number) => Promise<void>;
}
```

---

## Contexts

### `ThemeContext.tsx`
**Location**: `src/contexts/ThemeContext.tsx`

**Provides**:
- `theme`: 'light' | 'dark'
- `toggleTheme`: () => void
- `setTheme`: (theme: 'light' | 'dark') => void

---

### `AuthContext.tsx`
**Location**: `src/contexts/AuthContext.tsx`

**Provides**: Same as `useAuth` hook

---

## Types

### `types/auth.ts`
```typescript
interface User {
  id: number;
  username: string;
  email: string;
  date_joined: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
}
```

### `types/notes.ts`
```typescript
interface Note {
  id: number;
  title: string;
  content: string;
  category: Category | null;
  tags: Tag[];
  source_url: string | null;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  name: string;
  color: string;
}

interface Tag {
  id: number;
  name: string;
}
```

### `types/flashcards.ts`
```typescript
interface FlashcardSet {
  id: number;
  name: string;
  description: string;
  category: Category | null;
  card_count: number;
  created_at: string;
  updated_at: string;
}

interface Flashcard {
  id: number;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  last_studied: string | null;
  next_review: string | null;
  review_count: number;
  correct_count: number;
  ease_factor: number;
}
```

---

## Styling

### CSS Variables (Dark Mode)
**Location**: `src/styles/variables.css`

```css
:root[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
  --accent: #4a9eff;
  --border: #404040;
  --error: #ff4444;
  --success: #44ff44;
}

:root[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #000000;
  --text-secondary: #666666;
  --accent: #0066cc;
  --border: #e0e0e0;
  --error: #cc0000;
  --success: #00cc00;
}
```

### CSS Modules
- Each component has its own `.module.css` file
- Scoped styles prevent conflicts
- Use CSS variables for theming

---

**Status**: Component structure design complete. Ready for Frontend Agent implementation and TDD Agent test creation.

