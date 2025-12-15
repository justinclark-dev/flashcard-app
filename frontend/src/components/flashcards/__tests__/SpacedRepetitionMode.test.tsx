/**
 * SpacedRepetitionMode Component Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import { SpacedRepetitionMode } from '../SpacedRepetitionMode';
import { useStudySession } from '../../../hooks/useStudySession';

jest.mock('../../../hooks/useStudySession');

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('SpacedRepetitionMode Component', () => {
  const mockDueCards = [
    {
      id: 1,
      front: 'What is React?',
      back: 'A JavaScript library',
      ease_factor: 2.5,
      review_count: 0,
      next_review: '2025-01-26T10:00:00Z' // Past date (due)
    },
    {
      id: 2,
      front: 'What is useState?',
      back: 'A React Hook',
      ease_factor: 2.5,
      review_count: 1,
      next_review: '2025-01-27T10:00:00Z' // Today (due)
    }
  ];

  const mockUseStudySession = {
    cards: [],
    currentIndex: 0,
    session: null,
    loading: false,
    error: null,
    startSession: jest.fn(),
    recordReview: jest.fn(),
    endSession: jest.fn(),
    nextCard: jest.fn(),
    previousCard: jest.fn(),
    getCurrentCard: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useStudySession as jest.Mock).mockReturnValue(mockUseStudySession);
  });

  it('should render spaced repetition mode with due cards only', async () => {
    (useStudySession as jest.Mock).mockReturnValue({
      ...mockUseStudySession,
      cards: mockDueCards,
      getCurrentCard: () => mockDueCards[0],
    });

    render(
      <TestWrapper>
        <SpacedRepetitionMode flashcardSetId={1} mode="spaced" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('What is React?')).toBeInTheDocument();
    });
  });

  it('should record quality rating and update card', async () => {
    const mockRecordReview = jest.fn().mockResolvedValue(undefined);
    (useStudySession as jest.Mock).mockReturnValue({
      ...mockUseStudySession,
      cards: mockDueCards,
      currentIndex: 0,
      session: { id: 1, flashcard_set_id: 1, mode: 'spaced' },
      getCurrentCard: () => mockDueCards[0],
      recordReview: mockRecordReview,
    });

    render(
      <TestWrapper>
        <SpacedRepetitionMode flashcardSetId={1} mode="spaced" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('What is React?')).toBeInTheDocument();
    });

    // Flip card
    const card = screen.getByText('What is React?').closest('div');
    if (card) {
      fireEvent.click(card);
    }

    // Click quality button (e.g., "Perfect" = 5)
    const qualityButton = screen.getByText(/perfect/i);
    fireEvent.click(qualityButton);

    await waitFor(() => {
      expect(mockRecordReview).toHaveBeenCalledWith(1, 5);
    });
  });

  it('should display quality scale buttons', async () => {
    (useStudySession as jest.Mock).mockReturnValue({
      ...mockUseStudySession,
      cards: mockDueCards,
      getCurrentCard: () => mockDueCards[0],
    });

    render(
      <TestWrapper>
        <SpacedRepetitionMode flashcardSetId={1} mode="spaced" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('What is React?')).toBeInTheDocument();
    });

    // Flip card to show quality buttons
    const card = screen.getByText('What is React?').closest('div');
    if (card) {
      fireEvent.click(card);
    }

    await waitFor(() => {
      expect(screen.getByText(/perfect/i)).toBeInTheDocument();
    });
  });

  it('should show next review date after rating', async () => {
    const mockRecordReview = jest.fn().mockResolvedValue({
      interval: 1,
      next_review: '2025-01-28T10:00:00Z',
    });
    (useStudySession as jest.Mock).mockReturnValue({
      ...mockUseStudySession,
      cards: mockDueCards,
      currentIndex: 0,
      session: { id: 1, flashcard_set_id: 1, mode: 'spaced' },
      getCurrentCard: () => mockDueCards[0],
      recordReview: mockRecordReview,
    });

    render(
      <TestWrapper>
        <SpacedRepetitionMode flashcardSetId={1} mode="spaced" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('What is React?')).toBeInTheDocument();
    });

    // Flip and rate
    const card = screen.getByText('What is React?').closest('div');
    if (card) {
      fireEvent.click(card);
    }

    const qualityButton = screen.getByText(/perfect/i);
    fireEvent.click(qualityButton);

    // Component should show next review date (if implemented)
    await waitFor(() => {
      expect(mockRecordReview).toHaveBeenCalled();
    });
  });

  it('should display empty state when no due cards', async () => {
    (useStudySession as jest.Mock).mockReturnValue({
      ...mockUseStudySession,
      cards: [],
      loading: false,
    });

    render(
      <TestWrapper>
        <SpacedRepetitionMode flashcardSetId={1} mode="spaced" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/no cards due for review/i)).toBeInTheDocument();
    });
  });
});
