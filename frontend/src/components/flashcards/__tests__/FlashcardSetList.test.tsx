/**
 * FlashcardSetList Component Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import { FlashcardSetList } from '../FlashcardSetList';
import { useFlashcards } from '../../../hooks/useFlashcards';

jest.mock('../../../hooks/useFlashcards');
jest.mock('../../../services/categories', () => ({
  getCategories: jest.fn().mockResolvedValue({
    data: [],
    status: 'success',
  }),
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('FlashcardSetList Component', () => {
  const mockSets = [
    {
      id: 1,
      name: 'Python Basics',
      description: 'Basic Python concepts',
      card_count: 10,
      category: { id: 1, name: 'Python', color: '#3776ab' },
      created_at: '2025-01-27T10:00:00Z'
    },
    {
      id: 2,
      name: 'React Hooks',
      description: 'Common React hooks',
      card_count: 5,
      category: null,
      created_at: '2025-01-27T11:00:00Z'
    }
  ];

  const mockUseFlashcards = {
    flashcardSets: [],
    loading: false,
    error: null,
    filterByCategory: jest.fn(),
    deleteFlashcardSet: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useFlashcards as jest.Mock).mockReturnValue(mockUseFlashcards);
  });

  it('should render flashcard set list with sets', async () => {
    (useFlashcards as jest.Mock).mockReturnValue({
      ...mockUseFlashcards,
      flashcardSets: mockSets,
    });

    render(
      <TestWrapper>
        <FlashcardSetList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Python Basics')).toBeInTheDocument();
    });

    expect(screen.getByText('React Hooks')).toBeInTheDocument();
  });

  it('should display empty state when no sets', async () => {
    (useFlashcards as jest.Mock).mockReturnValue({
      ...mockUseFlashcards,
      flashcardSets: [],
    });

    render(
      <TestWrapper>
        <FlashcardSetList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/no flashcard sets/i)).toBeInTheDocument();
    });
  });

  it('should display loading state initially', () => {
    (useFlashcards as jest.Mock).mockReturnValue({
      ...mockUseFlashcards,
      loading: true,
    });

    render(
      <TestWrapper>
        <FlashcardSetList />
      </TestWrapper>
    );

    // Check for skeleton loading (SkeletonList component)
    expect(screen.getByText('Flashcard Sets')).toBeInTheDocument();
    // SkeletonList renders multiple skeleton items
    const container = screen.getByText('Flashcard Sets').closest('.flashcardSetList');
    expect(container).toBeInTheDocument();
  });

  it('should handle set selection', async () => {
    const onSetSelect = jest.fn();
    (useFlashcards as jest.Mock).mockReturnValue({
      ...mockUseFlashcards,
      flashcardSets: mockSets,
    });

    render(
      <TestWrapper>
        <FlashcardSetList onSetSelect={onSetSelect} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Python Basics')).toBeInTheDocument();
    });

    const setCard = screen.getByText('Python Basics').closest('div');
    if (setCard) {
      fireEvent.click(setCard);
    }

    expect(onSetSelect).toHaveBeenCalledWith(mockSets[0]);
  });

  it('should display error message on load failure', async () => {
    (useFlashcards as jest.Mock).mockReturnValue({
      ...mockUseFlashcards,
      error: 'Failed to load flashcard sets',
    });

    render(
      <TestWrapper>
        <FlashcardSetList />
      </TestWrapper>
    );

    await waitFor(() => {
      // ErrorMessage component shows "Failed to Load Flashcard Sets" as title
      const errorElements = screen.getAllByText(/failed to load flashcard sets/i);
      expect(errorElements.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
    
    // Check for the title specifically to avoid multiple matches
    expect(screen.getByRole('heading', { name: /failed to load flashcard sets/i })).toBeInTheDocument();
  });
});
