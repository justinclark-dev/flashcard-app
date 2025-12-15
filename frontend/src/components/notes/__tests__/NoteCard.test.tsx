/**
 * Test: NoteCard Component
 * Purpose: Verify note card display and interactions
 * Coverage: Rendering, click handlers, edit/delete buttons, category/tags display
 * 
 * Created by: TDD Agent
 * Date: 2025-01-27
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { NoteCard } from '../NoteCard';

// Test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('NoteCard Component', () => {
  const mockNote = {
    id: 1,
    title: 'Python Basics',
    content: 'Python is a programming language that is widely used for web development, data science, and automation.',
    category: {
      id: 1,
      name: 'Python',
      color: '#3776ab',
    },
    tags: [
      { id: 1, name: 'basics' },
      { id: 2, name: 'python' },
    ],
    created_at: '2025-01-27T10:00:00Z',
    updated_at: '2025-01-27T10:00:00Z',
  };

  it('should render note card with title and excerpt', () => {
    render(<NoteCard note={mockNote} />, { wrapper: TestWrapper });

    expect(screen.getByText('Python Basics')).toBeInTheDocument();
    expect(screen.getByText(/python is a programming language/i)).toBeInTheDocument();
  });

  it('should display category badge', () => {
    render(<NoteCard note={mockNote} />, { wrapper: TestWrapper });

    expect(screen.getByText('Python')).toBeInTheDocument();
  });

  it('should display tags', () => {
    render(<NoteCard note={mockNote} />, { wrapper: TestWrapper });

    expect(screen.getByText('basics')).toBeInTheDocument();
    expect(screen.getByText('python')).toBeInTheDocument();
  });

  it('should handle note without category', () => {
    const noteWithoutCategory = {
      ...mockNote,
      category: null,
    };

    render(<NoteCard note={noteWithoutCategory} />, { wrapper: TestWrapper });

    expect(screen.getByText('Python Basics')).toBeInTheDocument();
    expect(screen.queryByText('Python')).not.toBeInTheDocument();
  });

  it('should handle note without tags', () => {
    const noteWithoutTags = {
      ...mockNote,
      tags: [],
    };

    render(<NoteCard note={noteWithoutTags} />, { wrapper: TestWrapper });

    expect(screen.getByText('Python Basics')).toBeInTheDocument();
    expect(screen.queryByText('basics')).not.toBeInTheDocument();
  });

  it('should call onClick handler when card is clicked', () => {
    const onClick = jest.fn();

    render(<NoteCard note={mockNote} onClick={onClick} />, { wrapper: TestWrapper });

    const card = screen.getByText('Python Basics').closest('div');
    fireEvent.click(card!);

    expect(onClick).toHaveBeenCalled();
  });

  it('should call onEdit handler when edit button is clicked', () => {
    const onEdit = jest.fn();

    render(<NoteCard note={mockNote} onEdit={onEdit} />, { wrapper: TestWrapper });

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(onEdit).toHaveBeenCalled();
  });

  it('should call onDelete handler when delete button is clicked', () => {
    const onDelete = jest.fn();

    render(<NoteCard note={mockNote} onDelete={onDelete} />, { wrapper: TestWrapper });

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalled();
  });

  it('should truncate long content', () => {
    const longContentNote = {
      ...mockNote,
      content: 'A'.repeat(200), // Very long content
    };

    render(<NoteCard note={longContentNote} />, { wrapper: TestWrapper });

    const content = screen.getByText(/^A+/);
    expect(content.textContent?.length).toBeLessThan(200);
  });

  it('should display formatted date', () => {
    render(<NoteCard note={mockNote} />, { wrapper: TestWrapper });

    // Date should be displayed in a readable format
    expect(screen.getByText(/january|2025/i)).toBeInTheDocument();
  });
});

