import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import LoginForm from '../../frontend/components/Login';
import configureMockStore from 'redux-mock-store';

// Create mock store
const mockStore = configureMockStore([]);
const store = mockStore({});

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('LoginForm Tests', () => {
  let xhrMockClass;
  let xhrMockInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    store.clearActions();

    xhrMockInstance = {
      open: jest.fn(),
      send: jest.fn(),
      setRequestHeader: jest.fn(),
      withCredentials: true,
      readyState: 0,
      status: 0,
      responseText: '',
      onreadystatechange: null,
      onerror: null,
    };

    xhrMockClass = jest.fn(() => xhrMockInstance);

    global.XMLHttpRequest = xhrMockClass;

    render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      </Provider>
    );
  });

  describe('Render Tests', () => {
    test('should render all form fields and buttons', () => {
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
      const signInButtons = screen.getAllByRole('button', { name: /sign in/i });
      expect(signInButtons.length).toBeGreaterThanOrEqual(2); // nav + form buttons
      expect(signInButtons[1]).toBeInTheDocument(); // or whatever index is the submit
    });

    test('should render role options', () => {
      const roleSelect = screen.getByLabelText(/role/i);
      expect(roleSelect).toHaveValue('User');
      ['User', 'Admin', 'Manager'].forEach(role => {
        expect(screen.getByRole('option', { name: role })).toBeInTheDocument();
      });
    });

    test('should render auth toggle buttons', () => {
      const buttons = screen.getAllByRole('button', { name: /sign in/i });
      expect(buttons[0]).toHaveClass('activebutton');
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });
  });

  describe('Form Behavior Tests', () => {
    test('should update input fields when user types', async () => {
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await userEvent.type(usernameInput, 'testuser');
      await userEvent.type(passwordInput, 'password123');

      expect(usernameInput).toHaveValue('testuser');
      expect(passwordInput).toHaveValue('password123');
    });

    test('should update role when selected', async () => {
      const roleSelect = screen.getByLabelText(/role/i);
      await userEvent.selectOptions(roleSelect, 'Manager');
      expect(roleSelect).toHaveValue('Manager');
    });
  });

  describe('Form Submission Tests', () => {
    test('should handle successful login', async () => {
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const roleSelect = screen.getByLabelText(/role/i);

      await userEvent.type(usernameInput, 'testuser');
      await userEvent.type(passwordInput, 'password123');
      await userEvent.selectOptions(roleSelect, 'User');

      await act(async () => {
        fireEvent.submit(screen.getByTestId('login-form'));

        xhrMockInstance.status = 200;
        xhrMockInstance.responseText = JSON.stringify({ message: 'Login successful' });

        xhrMockInstance.readyState = 4;
        xhrMockInstance.onreadystatechange();
      });

      expect(screen.getByText(/sign in successful/i)).toBeInTheDocument();
    });


    test('should handle failed login', async () => {
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const roleSelect = screen.getByLabelText(/role/i);

      await userEvent.type(usernameInput, 'wronguser');
      await userEvent.type(passwordInput, 'wrongpass');
      await userEvent.selectOptions(roleSelect, 'User');

      await act(async () => {
        fireEvent.submit(screen.getByTestId('login-form'));

        xhrMockInstance.status = 401;
        xhrMockInstance.responseText = JSON.stringify({ errormessage: 'Invalid credentials' });

        xhrMockInstance.readyState = 4;
        xhrMockInstance.onreadystatechange();
      });

      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  describe('Navigation Tests', () => {
    test('should navigate to signup page when signup button clicked', () => {
      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
      expect(mockNavigate).toHaveBeenCalledWith('/Signup');
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle network error', async () => {
      await act(async () => {
        fireEvent.submit(screen.getByTestId('login-form'));

        xhrMockInstance.onerror();
      });

      expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument();
    });
  });
});
