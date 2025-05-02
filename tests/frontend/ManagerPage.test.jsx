import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import ManagerPage from '../../frontend/components/ManagerPage';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

// Mock fetch function
global.fetch = jest.fn();

// Mock components for all routes
const MockBookings = () => <div>Bookings Page</div>;
const MockUploads = () => <div>Uploads Page</div>;
const MockRevenue = () => <div>Revenue Page</div>;
const MockUploadNotifications = () => <div>Upload Notifications Page</div>;
const MockBookingNotifications = () => <div>Booking Notifications Page</div>;
const MockCategories = () => <div>Categories Page</div>;

describe('ManagerPage Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful notifications fetch
    global.fetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          notifications: [
            { id: 1, seen: false },
            { id: 2, seen: true },
            { id: 3, seen: false }
          ]
        })
      })
    );
  });

  const renderManagerPage = async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={['/managerpage']}>
          <Routes>
            <Route path="/managerpage" element={<ManagerPage />}>
              <Route path="bookings" element={<MockBookings />} />
              <Route path="uploads" element={<MockUploads />} />
              <Route path="revenue" element={<MockRevenue />} />
              <Route path="uploadnotifications" element={<MockUploadNotifications />} />
              <Route path="Bookingnotifications" element={<MockBookingNotifications />} />
              <Route path="availCategories" element={<MockCategories />} />
            </Route>
          </Routes>
        </MemoryRouter>
      );
    });
  };

  test('1. Renders menu items correctly', async () => {
    await renderManagerPage();
    
    expect(screen.getByText('BOOKINGS')).toBeInTheDocument();
    expect(screen.getByText('UPLOADS')).toBeInTheDocument();
    expect(screen.getByText('REVENUE')).toBeInTheDocument();
    expect(screen.getByText('UPLOAD NOTIFICATIONS')).toBeInTheDocument();
    expect(screen.getByText('BOOKING NOTIFICATIONS')).toBeInTheDocument();
    expect(screen.getByText('CATEGORIES')).toBeInTheDocument();
    expect(screen.getByText('SIGN OUT')).toBeInTheDocument();
  });

  test('2. Shows correct notification count', async () => {
    await renderManagerPage();

    await waitFor(() => {
      expect(screen.getByText('(2)')).toBeInTheDocument();
    });
  });

  test('3. Handles sign out click', async () => {
    await renderManagerPage();
    
    const signOutButton = screen.getByText('SIGN OUT');
    await act(async () => {
      await userEvent.click(signOutButton);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/signOut',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include'
      })
    );
  });

  test('4. Resets notification count on click', async () => {
    await renderManagerPage();
    
    const notificationsLink = screen.getByText(/UPLOAD NOTIFICATIONS/i);
    await act(async () => {
      await userEvent.click(notificationsLink);
    });

    await waitFor(() => {
      expect(screen.queryByText('(2)')).not.toBeInTheDocument();
      expect(screen.getByText('Upload Notifications Page')).toBeInTheDocument();
    });
  });

  test('5. Navigates to correct routes', async () => {
    await renderManagerPage();
    
    const bookingsLink = screen.getByText('BOOKINGS');
    await act(async () => {
      await userEvent.click(bookingsLink);
    });

    await waitFor(() => {
      expect(screen.getByText('Bookings Page')).toBeInTheDocument();
    });
  });
});