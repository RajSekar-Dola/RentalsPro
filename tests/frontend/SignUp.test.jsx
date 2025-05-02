import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import SignupForm from '../../frontend/components/Signup';

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

// Mock fetch
global.fetch = jest.fn();

describe('SignupForm Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        render(
            <BrowserRouter>
                <SignupForm />
            </BrowserRouter>
        );
    });

    // 1. Render Tests
    describe('Render Tests', () => {
        test('should render all form fields', () => {
            expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/email id/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
        });

        test('should render signup and login toggle buttons', () => {
            expect(screen.getByRole('button', { name: /signup/i })).toHaveClass('activebutton');
            expect(screen.getByRole('button', { name: /login/i })).toHaveClass('inactivebutton');
        });

        test('should render submit button', () => {
            expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
        });
    });

    // 2. Form Behavior Tests
    describe('Form Behavior Tests', () => {
        test('should update input fields when user types', async () => {
            const usernameInput = screen.getByLabelText(/username/i);
            const emailInput = screen.getByLabelText(/email id/i);
            const passwordInput = screen.getByLabelText(/^password$/i);

            await userEvent.type(usernameInput, 'testuser');
            await userEvent.type(emailInput, 'test@example.com');
            await userEvent.type(passwordInput, 'Test123!');

            expect(usernameInput).toHaveValue('testuser');
            expect(emailInput).toHaveValue('test@example.com');
            expect(passwordInput).toHaveValue('Test123!');
        });

        test('should show password strength indicator', async () => {
            const passwordInput = screen.getByLabelText(/^password$/i);

            await userEvent.type(passwordInput, 'a');
            expect(screen.getByText(/Password Strength: Weak/i)).toBeInTheDocument();

            await userEvent.type(passwordInput, 'abcd');
            expect(screen.getByText(/Password Strength: Medium/i)).toBeInTheDocument();

            await userEvent.type(passwordInput, 'abcdEFGH123!');
            expect(screen.getByText(/Password Strength: Strong/i)).toBeInTheDocument();
        });
    });

    // 3. Form Validation Tests
    describe('Form Validation Tests', () => {
        test('should validate email format', async () => {
            const emailInput = screen.getByLabelText(/email id/i);

            await userEvent.type(emailInput, 'invalid-email');
            fireEvent.blur(emailInput);

            expect(emailInput).toHaveStyle({ border: '2px solid red' });
        });

        test('should validate age requirement', async () => {
            const dobInput = screen.getByLabelText(/date of birth/i);
            const today = new Date();
            const underageDate = new Date(today.setFullYear(today.getFullYear() - 17));

            fireEvent.change(dobInput, {
                target: { value: underageDate.toISOString().split('T')[0] }
            });

            expect(screen.getByText(/You must be at least 18 years old/i)).toBeInTheDocument();
        });

        test('should validate password match', async () => {
            const passwordInput = screen.getByLabelText(/^password$/i);
            const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

            await userEvent.type(passwordInput, 'Password123!');
            await userEvent.type(confirmPasswordInput, 'Password123');

            expect(confirmPasswordInput).toHaveStyle({ border: '2px solid red' });
        });
    });

    // 4. Form Submission Tests
    describe('Form Submission Tests', () => {
        test('should handle signup failure', async () => {
            // Setup fetch mock for failure
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: false,
                    json: () => Promise.resolve({
                        errormessage: 'Username already exists'
                    })
                })
            );

            // Fill required fields
            await act(async () => {
                await userEvent.type(screen.getByLabelText(/username/i), 'existinguser');
                await userEvent.type(screen.getByLabelText(/email id/i), 'existing@example.com');
                await userEvent.type(screen.getByLabelText(/^password$/i), 'Test123!');
                await userEvent.type(screen.getByLabelText(/confirm password/i), 'Test123!');
                fireEvent.change(screen.getByLabelText(/date of birth/i), {
                    target: { value: '1990-01-01' }
                });
            });

            // Submit form
            await act(async () => {
                fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
            });

            // Verify error message
            await waitFor(() => {
                expect(screen.getByText(/Username already exists/i)).toBeInTheDocument();
            }, { timeout: 3000 });

            // Verify navigation didn't occur
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    // 5. Navigation Tests
    describe('Navigation Tests', () => {
        test('should navigate to login page when login button clicked', () => {
            fireEvent.click(screen.getByRole('button', { name: /login/i }));
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });

        test('should navigate to signup page when signup button clicked', () => {
            fireEvent.click(screen.getByRole('button', { name: /signup/i }));
            expect(mockNavigate).toHaveBeenCalledWith('/Signup');
        });
    });
});