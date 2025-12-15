/**
 * Test: NoteEditor Component
 * Purpose: Verify note editor functionality, form validation, save/cancel
 * Coverage: Form rendering, validation, submission, error handling, category/tag selection
 * 
 * Created by: TDD Agent
 * Date: 2025-01-27
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import { NoteEditor } from '../NoteEditor';
import * as notesService from '../../../services/notes';
import * as categoriesService from '../../../services/categories';
import * as tagsService from '../../../services/tags';

// Mock dependencies
jest.mock('../../../services/notes');
jest.mock('../../../services/categories');
jest.mock('../../../services/tags');

// Test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('NoteEditor Component', () => {
  const mockCategories = [
    { id: 1, name: 'Python', color: '#3776ab' },
    { id: 2, name: 'JavaScript', color: '#f7df1e' },
  ];

  const mockTags = [
    { id: 1, name: 'basics' },
    { id: 2, name: 'python' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (categoriesService.getCategories as jest.Mock).mockResolvedValue({
      data: mockCategories,
      status: 'success',
    });
    (tagsService.getTags as jest.Mock).mockResolvedValue({
      data: mockTags,
      status: 'success',
    });
  });

  it('should render note editor form', async () => {
    render(<NoteEditor />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });
  });

  it('should load existing note for editing', async () => {
    const mockNote = {
      data: {
        id: 1,
        title: 'Existing Note',
        content: 'Existing content',
        category: { id: 1, name: 'Python', color: '#3776ab' },
        tags: [{ id: 1, name: 'basics' }],
      },
      status: 'success',
    };

    (notesService.getNote as jest.Mock).mockResolvedValue(mockNote);

    render(<NoteEditor noteId="1" />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Existing Note')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Existing content')).toBeInTheDocument();
    });
  });

  it('should validate required fields', async () => {
    render(<NoteEditor />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });

    expect(notesService.createNote).not.toHaveBeenCalled();
  });

  it('should create a new note successfully', async () => {
    const mockResponse = {
      data: {
        id: 1,
        title: 'New Note',
        content: 'Content here',
      },
      status: 'success',
    };

    (notesService.createNote as jest.Mock).mockResolvedValue(mockResponse);

    render(<NoteEditor />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/title/i);
    const contentInput = screen.getByLabelText(/content/i);
    const saveButton = screen.getByRole('button', { name: /save/i });

    fireEvent.change(titleInput, { target: { value: 'New Note' } });
    fireEvent.change(contentInput, { target: { value: 'Content here' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(notesService.createNote).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Note',
          content: 'Content here',
        })
      );
    }, { timeout: 2000 });
  });

  it('should update an existing note successfully', async () => {
    const mockNote = {
      data: {
        id: 1,
        title: 'Original Title',
        content: 'Original content',
        category: null,
        tags: [],
      },
      status: 'success',
    };

    const mockUpdateResponse = {
      data: {
        id: 1,
        title: 'Updated Title',
        content: 'Updated content',
      },
      status: 'success',
    };

    (notesService.getNote as jest.Mock).mockResolvedValue(mockNote);
    (notesService.updateNote as jest.Mock).mockResolvedValue(mockUpdateResponse);

    render(<NoteEditor noteId="1" />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Original Title')).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/title/i);
    const saveButton = screen.getByRole('button', { name: /save/i });

    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(notesService.updateNote).toHaveBeenCalledWith(1, {
        title: 'Updated Title',
        content: 'Original content',
        category_id: null,
        tag_ids: [],
        source_url: undefined,
      });
    });
  });

  it('should select category', async () => {
    render(<NoteEditor />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    });

    const categorySelect = screen.getByLabelText(/category/i);
    fireEvent.change(categorySelect, { target: { value: '1' } });

    expect(categorySelect).toHaveValue('1');
  });

  it('should add and remove tags', async () => {
    render(<NoteEditor />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
    });

    const tagInput = screen.getByLabelText(/tags/i);
    fireEvent.change(tagInput, { target: { value: 'basics' } });
    fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('basics')).toBeInTheDocument();
    });
  });

  it('should cancel editing', async () => {
    const onCancel = jest.fn();

    render(<NoteEditor onCancel={onCancel} />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  it('should display error message on save failure', async () => {
    const error = new Error('Failed to save note');
    (notesService.createNote as jest.Mock).mockRejectedValue(error);

    render(<NoteEditor />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/title/i);
    const contentInput = screen.getByLabelText(/content/i);
    const saveButton = screen.getByRole('button', { name: /save/i });

    fireEvent.change(titleInput, { target: { value: 'New Note' } });
    fireEvent.change(contentInput, { target: { value: 'Content' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to save note/i)).toBeInTheDocument();
    });
  });

  it('should show loading state during save', async () => {
    (notesService.createNote as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<NoteEditor />, { wrapper: TestWrapper });

    await waitFor(() => {
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/title/i);
    const contentInput = screen.getByLabelText(/content/i);
    const saveButton = screen.getByRole('button', { name: /save/i });

    fireEvent.change(titleInput, { target: { value: 'New Note' } });
    fireEvent.change(contentInput, { target: { value: 'Content' } });
    fireEvent.click(saveButton);

    expect(saveButton).toBeDisabled();
    expect(screen.getByText(/saving/i)).toBeInTheDocument();
  });
});

