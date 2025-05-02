import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReviewForm } from '../../frontend/components/Home/ReviewForm';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

// Mock window.alert
window.alert = jest.fn();

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    this.callback([{ isIntersecting: true }]);
  }
  disconnect() {}
  unobserve() {}
};

// Mock fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: 'Review submitted successfully' })
  })
);

describe('ReviewForm Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert.mockClear();
  });

  const renderReviewForm = () => {
    render(
      <BrowserRouter>
        <ReviewForm onSubmitSuccess={() => {}} />
      </BrowserRouter>
    );
  };

  test('1. Renders review form elements', async () => {
    renderReviewForm();
    
    await waitFor(() => {
      const form = screen.getByTestId('review-form');
      const textarea = screen.getByPlaceholderText(/write your review here/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });
      
      expect(form).toBeInTheDocument();
      expect(textarea).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
    });
  });

  test('2. Updates textarea value on change', async () => {
    renderReviewForm();
    
    const textarea = screen.getByPlaceholderText(/write your review here/i);
    await userEvent.type(textarea, 'Test review');
    
    await waitFor(() => {
      expect(textarea.value).toBe('Test review');
    });
  });

  test('3. Handles star rating selection', async () => {
    renderReviewForm();
    
    const starElements = screen.getAllByText('★');
    await userEvent.click(starElements[2]); // Click the 3rd star
    
    await waitFor(() => {
      expect(starElements[0]).toHaveClass('active');
      expect(starElements[1]).toHaveClass('active');
      expect(starElements[2]).toHaveClass('active');
    });
  });

  test('4. Shows validation message for empty review', async () => {
    renderReviewForm();
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);
    
    // Check if alert was called with correct message
    expect(window.alert).toHaveBeenCalledWith(
      "Please provide a review and select a rating."
    );
  });
});