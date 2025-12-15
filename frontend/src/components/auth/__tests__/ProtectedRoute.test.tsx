/**
 * Test: ProtectedRoute Component
 * Purpose: Verify route protection functionality
 * Coverage: Authentication check, redirect behavior, loading states
 * 
 * Created by: TDD Agent
 * Date: 2025-01-27
 */

import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import { ProtectedRoute } from '../ProtectedRoute';
import * as authService from '../../../services/auth';

// Mock dependencies
jest.mock('../../../services/auth');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to }: { to: string }) => <div data-testid="navigate">Redirect to {to}</div>,
}));

// Test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children when user is authenticated', async () => {
    (authService.getCurrentUser as jest.Mock).mockResolvedValue({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { wrapper: TestWrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', async () => {
    (authService.getCurrentUser as jest.Mock).mockRejectedValue(new Error('Not authenticated'));

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { wrapper: TestWrapper }
    );

    await waitFor(() => {
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByText(/redirect to \/login/i)).toBeInTheDocument();
  });

  it('should show loading state while checking authentication', () => {
    (authService.getCurrentUser as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { wrapper: TestWrapper }
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  it('should render children after loading completes and user is authenticated', async () => {
    (authService.getCurrentUser as jest.Mock).mockResolvedValue({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
    });

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { wrapper: TestWrapper }
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });
});

