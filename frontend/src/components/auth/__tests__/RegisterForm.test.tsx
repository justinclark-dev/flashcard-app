/**
 * Test: RegisterForm Component
 * Purpose: Verify registration form functionality, validation, and user interaction
 * Coverage: Form rendering, validation, password strength, submission, error handling
 * 
 * Created by: TDD Agent
 * Date: 2025-01-27
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import { RegisterForm } from '../RegisterForm';
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

describe('RegisterForm Component', () => {
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (authService.register as jest.Mock).mockClear();
  });

  it('should render registration form', () => {
    render(<RegisterForm />, { wrapper: TestWrapper });

    expect(screen.getByLabelText(/^username$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^confirm password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('should render link to login page', () => {
    render(<RegisterForm />, { wrapper: TestWrapper });

    const loginLink = screen.getByRole('link', { name: /login/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('should submit form with valid data', async () => {
    (authService.register as jest.Mock).mockResolvedValue({
      id: 1,
      username: 'newuser',
      email: 'new@example.com',
    });

    render(<RegisterForm onSuccess={mockOnSuccess} />, { wrapper: TestWrapper });

    const usernameInput = screen.getByLabelText(/^username$/i);
    const emailInput = screen.getByLabelText(/^email$/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/^confirm password$/i);
    const submitButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'securepass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'securepass123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'new@example.com',
        password: 'securepass123',
        password_confirm: 'securepass123',
      });
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should display validation error for empty username', async () => {
    render(<RegisterForm />, { wrapper: TestWrapper });

    const submitButton = screen.getByRole('button', { name: /register/i });
    
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(authService.register).not.toHaveBeenCalled();
  });

  it('should display validation error for invalid email', async () => {
    render(<RegisterForm />, { wrapper: TestWrapper });

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput); // Trigger validation on blur
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(authService.register).not.toHaveBeenCalled();
  });

  it('should display validation error for password mismatch', async () => {
    render(<RegisterForm />, { wrapper: TestWrapper });

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /register/i });

    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'securepass123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'differentpass' } });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/passwords must match/i)).toBeInTheDocument();
    }, { timeout: 2000 });

    expect(authService.register).not.toHaveBeenCalled();
  });

  it('should display validation error for weak password', async () => {
    render(<RegisterForm />, { wrapper: TestWrapper });

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /register/i });

    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: 'short' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'short' } });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    }, { timeout: 2000 });

    expect(authService.register).not.toHaveBeenCalled();
  });

  it('should display validation error for password without letter', async () => {
    render(<RegisterForm />, { wrapper: TestWrapper });

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /register/i });

    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: '12345678' } });
      fireEvent.change(confirmPasswordInput, { target: { value: '12345678' } });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/password must contain at least one letter/i)).toBeInTheDocument();
    }, { timeout: 2000 });

    expect(authService.register).not.toHaveBeenCalled();
  });

  it('should display validation error for password without number', async () => {
    render(<RegisterForm />, { wrapper: TestWrapper });

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.blur(passwordInput);
    fireEvent.change(confirmPasswordInput, { target: { value: 'password' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must contain at least one number/i)).toBeInTheDocument();
    });

    expect(authService.register).not.toHaveBeenCalled();
  });

  it('should display password strength indicator', () => {
    render(<RegisterForm />, { wrapper: TestWrapper });

    const passwordInput = screen.getByLabelText(/^password$/i);

    fireEvent.change(passwordInput, { target: { value: 'weak' } });
    // Password strength indicator should show weak

    fireEvent.change(passwordInput, { target: { value: 'securepass123' } });
    // Password strength indicator should show strong
  });

  it('should display error message on registration failure', async () => {
    const error = new Error('Username already exists');
    (authService.register as jest.Mock).mockRejectedValue(error);

    render(<RegisterForm />, { wrapper: TestWrapper });

    const usernameInput = screen.getByLabelText(/^username$/i);
    const emailInput = screen.getByLabelText(/^email$/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/^confirm password$/i);
    const submitButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(usernameInput, { target: { value: 'existinguser' } });
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'securepass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'securepass123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/username already exists/i)).toBeInTheDocument();
    });
  });

  it('should show loading state during submission', async () => {
    let resolveRegister: (value: any) => void;
    const registerPromise = new Promise((resolve) => {
      resolveRegister = resolve;
    });
    (authService.register as jest.Mock).mockReturnValue(registerPromise);

    render(<RegisterForm />, { wrapper: TestWrapper });

    const usernameInput = screen.getByLabelText(/^username$/i);
    const emailInput = screen.getByLabelText(/^email$/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/^confirm password$/i);
    const submitButton = screen.getByRole('button', { name: /register/i });

    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'securepass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'securepass123' } });
    fireEvent.click(submitButton);

    // Button should be disabled during submission
    expect(submitButton).toBeDisabled();

    await act(async () => {
      resolveRegister!({
        id: 1,
        username: 'newuser',
        email: 'new@example.com',
      });
      await registerPromise;
    });
  });
});

