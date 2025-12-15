/**
 * Main App Component
 * Sets up routing, providers, and application structure.
 */

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { KeyboardShortcutsHelp } from './components/common/KeyboardShortcutsHelp';
import { useKeyboardShortcuts, APP_SHORTCUTS } from './hooks/useKeyboardShortcuts';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Dashboard } from './components/dashboard/Dashboard';
import { Navbar } from './components/common/Navbar';
import { NoteList } from './components/notes/NoteList';
import { NoteDetail } from './components/notes/NoteDetail';
import { NoteEditorRoute } from './components/notes/NoteEditorRoute';
import { FlashcardSetList } from './components/flashcards/FlashcardSetList';
import { FlashcardSetDetail } from './components/flashcards/FlashcardSetDetail';
import { FlashcardSetEditorRoute } from './components/flashcards/FlashcardSetEditorRoute';
import { FlashcardEditorRoute } from './components/flashcards/FlashcardEditorRoute';
import { StudyModeRoute } from './components/flashcards/StudyModeRoute';
import { SpacedRepetitionModeRoute } from './components/flashcards/SpacedRepetitionModeRoute';
import { StudyStatistics } from './components/statistics/StudyStatistics';
import { DebugInfo } from './components/common/DebugInfo';

// Layout component for protected routes
function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}

// App content with keyboard shortcuts
function AppContent() {
  const navigate = useNavigate();
  const [showShortcuts, setShowShortcuts] = useState(false);

  useKeyboardShortcuts([
    {
      ...APP_SHORTCUTS.NEW_NOTE,
      handler: () => navigate('/notes/new'),
    },
    {
      ...APP_SHORTCUTS.SEARCH,
      handler: () => {
        // Focus search input if on notes or flashcards page
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      },
    },
    {
      ...APP_SHORTCUTS.HELP,
      handler: () => setShowShortcuts(true),
    },
    {
      key: 'Escape',
      handler: () => setShowShortcuts(false),
    },
  ]);

  return (
    <>
      <ErrorBoundary>
        <DebugInfo />
        <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              
              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <ProtectedLayout>
                      <Dashboard />
                    </ProtectedLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Notes routes */}
              <Route
                path="/notes"
                element={
                  <ProtectedRoute>
                    <ProtectedLayout>
                      <NoteList />
                    </ProtectedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notes/new"
                element={
                  <ProtectedRoute>
                    <ProtectedLayout>
                      <NoteEditorRoute />
                    </ProtectedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notes/:noteId/edit"
                element={
                  <ProtectedRoute>
                    <ProtectedLayout>
                      <NoteEditorRoute />
                    </ProtectedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notes/:noteId"
                element={
                  <ProtectedRoute>
                    <ProtectedLayout>
                      <NoteDetail />
                    </ProtectedLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Flashcard routes */}
              <Route
                path="/flashcards"
                element={
                  <ProtectedRoute>
                    <ProtectedLayout>
                      <FlashcardSetList />
                    </ProtectedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/flashcards/new"
                element={
                  <ProtectedRoute>
                    <ProtectedLayout>
                      <FlashcardSetEditorRoute />
                    </ProtectedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/flashcards/:setId"
                element={
                  <ProtectedRoute>
                    <ProtectedLayout>
                      <FlashcardSetDetail />
                    </ProtectedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/flashcards/:setId/edit"
                element={
                  <ProtectedRoute>
                    <ProtectedLayout>
                      <FlashcardSetEditorRoute />
                    </ProtectedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/flashcards/:setId/flashcards/new"
                element={
                  <ProtectedRoute>
                    <ProtectedLayout>
                      <FlashcardEditorRoute />
                    </ProtectedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/flashcards/:setId/flashcards/:flashcardId/edit"
                element={
                  <ProtectedRoute>
                    <ProtectedLayout>
                      <FlashcardEditorRoute />
                    </ProtectedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/flashcards/:setId/study"
                element={
                  <ProtectedRoute>
                    <ProtectedLayout>
                      <StudyModeRoute />
                    </ProtectedLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/flashcards/:setId/study/spaced"
                element={
                  <ProtectedRoute>
                    <ProtectedLayout>
                      <SpacedRepetitionModeRoute />
                    </ProtectedLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Statistics route */}
              <Route
                path="/statistics"
                element={
                  <ProtectedRoute>
                    <ProtectedLayout>
                      <StudyStatistics />
                    </ProtectedLayout>
                  </ProtectedRoute>
                }
              />
              
              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
      <KeyboardShortcutsHelp
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

