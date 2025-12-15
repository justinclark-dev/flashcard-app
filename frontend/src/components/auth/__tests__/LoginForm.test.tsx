/**
 * Test: LoginForm Component
 * Purpose: Verify login form functionality, validation, and user interaction
 * Coverage: Form rendering, validation, submission, error handling, loading states
 * 
 * Created by: TDD Agent
 * Date: 2025-01-27
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import { LoginForm } from '../LoginForm';
import * as authService from '../../../services/auth';

// Mock dependencies
jest.mock('../../../services/auth');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

// Test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('LoginForm Component', () => {
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (authService.login as jest.Mock).mockClear();
  });

  it('should render login form', () => {
    render(<LoginForm />, { wrapper: TestWrapper });

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should render link to register page', () => {
    render(<LoginForm />, { wrapper: TestWrapper });

    const registerLink = screen.getByRole('link', { name: /register/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('should submit form with valid data', async () => {
    (authService.login as jest.Mock).mockResolvedValue({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
    });

    render(<LoginForm onSuccess={mockOnSuccess} />, { wrapper: TestWrapper });

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'securepass123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('testuser', 'securepass123');
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should display validation error for empty username', async () => {
    render(<LoginForm />, { wrapper: TestWrapper });

    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    });

    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should display validation error for empty password', async () => {
    render(<LoginForm />, { wrapper: TestWrapper });

    const usernameInput = screen.getByLabelText(/username/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    }, { timeout: 2000 });

    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should display error message on login failure', async () => {
    const error = new Error('Invalid credentials');
    (authService.login as jest.Mock).mockRejectedValue(error);

    render(<LoginForm />, { wrapper: TestWrapper });

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('should show loading state during submission', async () => {
    let resolveLogin: (value: any) => void;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });
    (authService.login as jest.Mock).mockReturnValue(loginPromise);

    render(<LoginForm />, { wrapper: TestWrapper });

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'securepass123' } });
    fireEvent.click(submitButton);

    // Button should be disabled during submission
    expect(submitButton).toBeDisabled();

    await act(async () => {
      resolveLogin!({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
      });
      await loginPromise;
    });
  });

  it('should clear error when user starts typing', async () => {
    const error = new Error('Invalid credentials');
    (authService.login as jest.Mock).mockRejectedValueOnce(error);

    render(<LoginForm />, { wrapper: TestWrapper });

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    // Submit with wrong credentials
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });

    // Start typing - error should clear
    fireEvent.change(usernameInput, { target: { value: 'testuser2' } });

    await waitFor(() => {
      expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
    });
  });

  it('should handle network errors', async () => {
    const error = new Error('Network error');
    (authService.login as jest.Mock).mockRejectedValue(error);

    render(<LoginForm />, { wrapper: TestWrapper });

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'securepass123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });
});

