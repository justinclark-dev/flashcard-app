/**
 * FlashcardEditor Component Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import { FlashcardEditor } from '../FlashcardEditor';
import { useFlashcards } from '../../../hooks/useFlashcards';

jest.mock('../../../hooks/useFlashcards');

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('FlashcardEditor Component', () => {
  const mockFlashcard = {
    id: 1,
    front: 'What is React?',
    back: 'A JavaScript library',
    difficulty: 'medium',
    ease_factor: 2.5,
    review_count: 0
  };

  const mockUseFlashcards = {
    getFlashcards: jest.fn(),
    createFlashcard: jest.fn(),
    updateFlashcard: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useFlashcards as jest.Mock).mockReturnValue(mockUseFlashcards);
  });

  it('should render flashcard editor form', () => {
    render(
      <TestWrapper>
        <FlashcardEditor flashcardSetId={1} />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/front/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/back/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/difficulty/i)).toBeInTheDocument();
  });

  it('should load existing flashcard for editing', async () => {
    (mockUseFlashcards.getFlashcards as jest.Mock).mockResolvedValue([mockFlashcard]);

    render(
      <TestWrapper>
        <FlashcardEditor flashcardSetId={1} flashcardId={1} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('What is React?')).toBeInTheDocument();
    }, { timeout: 5000 });

    expect(screen.getByDisplayValue('A JavaScript library')).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    render(
      <TestWrapper>
        <FlashcardEditor flashcardSetId={1} />
      </TestWrapper>
    );

    const submitButton = screen.getByRole('button', { name: /create flashcard/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/front is required/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should create a new flashcard successfully', async () => {
    (mockUseFlashcards.createFlashcard as jest.Mock).mockResolvedValue({
      id: 1,
      front: 'New Question',
      back: 'New Answer'
    });

    render(
      <TestWrapper>
        <FlashcardEditor flashcardSetId={1} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/front/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/front/i), {
      target: { value: 'New Question' }
    });
    fireEvent.change(screen.getByLabelText(/back/i), {
      target: { value: 'New Answer' }
    });

    const submitButton = screen.getByRole('button', { name: /create flashcard/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUseFlashcards.createFlashcard).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          front: 'New Question',
          back: 'New Answer',
          difficulty: 'medium'
        })
      );
    }, { timeout: 3000 });
  });

  it('should update an existing flashcard successfully', async () => {
    (mockUseFlashcards.getFlashcards as jest.Mock).mockResolvedValue([mockFlashcard]);
    (mockUseFlashcards.updateFlashcard as jest.Mock).mockResolvedValue({
      ...mockFlashcard,
      front: 'Updated Question'
    });

    render(
      <TestWrapper>
        <FlashcardEditor flashcardSetId={1} flashcardId={1} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('What is React?')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/front/i), {
      target: { value: 'Updated Question' }
    });

    const submitButton = screen.getByRole('button', { name: /update flashcard/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUseFlashcards.updateFlashcard).toHaveBeenCalledWith(
        1,
        1,
        expect.objectContaining({
          front: 'Updated Question',
          back: 'A JavaScript library',
          difficulty: 'medium'
        })
      );
    }, { timeout: 3000 });
  });

  it('should cancel editing', async () => {
    const onCancel = jest.fn();

    render(
      <TestWrapper>
        <FlashcardEditor flashcardSetId={1} onCancel={onCancel} />
      </TestWrapper>
    );

    const cancelButton = screen.getByText(/cancel/i);
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  it('should display error message on save failure', async () => {
    (mockUseFlashcards.createFlashcard as jest.Mock).mockRejectedValue(
      new Error('Failed to save')
    );

    render(
      <TestWrapper>
        <FlashcardEditor flashcardSetId={1} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/front/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/front/i), {
      target: { value: 'Question' }
    });
    fireEvent.change(screen.getByLabelText(/back/i), {
      target: { value: 'Answer' }
    });

    const submitButton = screen.getByRole('button', { name: /create flashcard/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to save/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
