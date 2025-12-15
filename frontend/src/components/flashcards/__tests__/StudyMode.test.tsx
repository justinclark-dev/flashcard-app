/**
 * StudyMode Component Tests
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import { StudyMode } from '../StudyMode';
import { useStudySession } from '../../../hooks/useStudySession';

jest.mock('../../../hooks/useStudySession');

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('StudyMode Component', () => {
  const mockCards = [
    {
      id: 1,
      front: 'What is React?',
      back: 'A JavaScript library',
      ease_factor: 2.5,
      review_count: 0
    },
    {
      id: 2,
      front: 'What is useState?',
      back: 'A React Hook',
      ease_factor: 2.5,
      review_count: 0
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

  it('should render study mode with cards', async () => {
    (useStudySession as jest.Mock).mockReturnValue({
      ...mockUseStudySession,
      cards: mockCards,
      getCurrentCard: () => mockCards[0],
    });

    render(
      <TestWrapper>
        <StudyMode flashcardSetId={1} mode="simple" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('What is React?')).toBeInTheDocument();
    });
  });

  it('should flip card on click', async () => {
    (useStudySession as jest.Mock).mockReturnValue({
      ...mockUseStudySession,
      cards: mockCards,
      getCurrentCard: () => mockCards[0],
    });

    render(
      <TestWrapper>
        <StudyMode flashcardSetId={1} mode="simple" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('What is React?')).toBeInTheDocument();
    });

    const card = screen.getByText('What is React?').closest('div');
    if (card) {
      fireEvent.click(card);
    }

    await waitFor(() => {
      expect(screen.getByText('A JavaScript library')).toBeInTheDocument();
    });
  });

  it('should record answer and move to next card', async () => {
    const mockRecordReview = jest.fn().mockResolvedValue(undefined);
    const mockNextCard = jest.fn();
    (useStudySession as jest.Mock).mockReturnValue({
      ...mockUseStudySession,
      cards: mockCards,
      currentIndex: 0,
      session: { id: 1, flashcard_set_id: 1, mode: 'simple' },
      getCurrentCard: () => mockCards[0],
      recordReview: mockRecordReview,
      nextCard: mockNextCard,
    });

    render(
      <TestWrapper>
        <StudyMode flashcardSetId={1} mode="simple" />
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

    // Click correct button (use getAllByText and select the first one, or use getByRole)
    const correctButtons = screen.getAllByText(/correct/i);
    fireEvent.click(correctButtons[0]);

    await waitFor(() => {
      expect(mockRecordReview).toHaveBeenCalled();
    });
  });

  it('should display progress indicator', async () => {
    (useStudySession as jest.Mock).mockReturnValue({
      ...mockUseStudySession,
      cards: mockCards,
      currentIndex: 0,
      getCurrentCard: () => mockCards[0],
    });

    render(
      <TestWrapper>
        <StudyMode flashcardSetId={1} mode="simple" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/1 of 2/i)).toBeInTheDocument();
    });
  });

  it('should end session when all cards studied', async () => {
    const mockEndSession = jest.fn().mockResolvedValue(undefined);
    (useStudySession as jest.Mock).mockReturnValue({
      ...mockUseStudySession,
      cards: [mockCards[0]],
      currentIndex: 1, // Past the last card
      session: { id: 1, flashcard_set_id: 1, mode: 'simple' },
      getCurrentCard: () => null,
      endSession: mockEndSession,
    });

    render(
      <TestWrapper>
        <StudyMode flashcardSetId={1} mode="simple" />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockEndSession).toHaveBeenCalled();
    });
  });
});

