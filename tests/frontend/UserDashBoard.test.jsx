import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Outlet, Link } from 'react-router-dom';
import { Provider } from 'react-redux';
import YourBookings from '../../frontend/components/UserDashBoard/YourBookings';
import YourRentals from '../../frontend/components/UserDashBoard/YourRentals';
import AccountsNotifications from '../../frontend/components/UserDashBoard/AccountsNotifications';
import AccountDetails from '../../frontend/components/UserDashBoard/AccountDetails';
import AccountProfile from '../../frontend/components/UserDashBoard/AccountProfile';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

// Mock Redux store
const mockStore = {
  getState: () => ({
    role: "User",
    auth: {
      isAuthenticated: true,
      user: {
        _id: '1',
        name: 'Test User',
        email: 'test@example.com'
      }
    }
  }),
  subscribe: jest.fn(),
  dispatch: jest.fn()
};

// Mock fetch responses based on actual API responses
global.fetch = jest.fn((url) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (url === 'http://localhost:3000/grabBookings') {
        resolve({
          ok: true,
          json: () => Promise.resolve({
            BookingDetails: [{
              _id: '1',
              product_id: 'prod1',
              fromDateTime: '2025-04-29T10:00',
              toDateTime: '2025-04-29T12:00',
              price: 100,
              level: 0
            }],
            ProductDetails: [{
              _id: 'prod1',
              productName: 'Camera',
              productType: 'Electronics',
              locationName: 'Test Location',
              photo: ['test-photo.jpg']
            }]
          })
        });
      } else if (url === 'http://localhost:3000/grabRentals') {
        resolve({
          ok: true,
          json: () => Promise.resolve({
            rentedProducts: [{
              _id: '1',
              productName: 'Laptop',
              productType: 'electronics',
              locationName: 'Test Location',
              price: 100,
              fromDateTime: '2025-04-29T10:00',
              toDateTime: '2025-04-29T12:00',
              photo: ['laptop-photo.jpg']
            }]
          })
        });
      } else if (url === 'http://localhost:3000/user/notifications') {
        resolve({
          ok: true,
          json: () => Promise.resolve({
            notifications: [
              { _id: '1', message: 'booking1', seen: false },
              { _id: '2', message: 'booking2', seen: false }
            ]
          })
        });
      } else if (url === 'http://localhost:3000/user/notifications/products') {
        resolve({
          ok: true,
          json: () => Promise.resolve({
            products: [{
              reqproduct: {
                productName: 'Camera',
                photo: ['camera-photo.jpg']
              },
              reqbooking: {
                price: 110,
                fromDateTime: '2025-04-29T10:00',
                toDateTime: '2025-04-29T12:00',
                level: 0
              },
              reqbuyer: {
                username: 'Test Buyer',
                email: 'buyer@test.com'
              }
            }]
          })
        });
      }
    }, 100);
  });
});

// Mock DashboardLayout using Link instead of a href
const DashboardLayout = () => (
  <div className="dashboard-layout">
    <nav className="dashboard-nav">
      <ul>
        <li><Link to="/dashboard/mybookings">MY BOOKINGS</Link></li>
        <li><Link to="/dashboard/myuploads">MY UPLOADS</Link></li>
        <li><Link to="/dashboard/notifications">NOTIFICATIONS</Link></li>
        <li><Link to="/logout">SIGN OUT</Link></li>
      </ul>
    </nav>
    <div className="dashboard-content">
      <Outlet />
    </div>
  </div>
);

describe('UserDashBoard Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderComponent = async (path = '/dashboard') => {
    let rendered;
    await act(async () => {
      rendered = render(
        <Provider store={mockStore}>
          <MemoryRouter initialEntries={[path]}>
            <Routes>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route path="mybookings" element={<YourBookings />} />
                <Route path="myuploads" element={<YourRentals />} />
                <Route path="notifications" element={<AccountsNotifications />} />
                <Route path="profile" element={<AccountProfile />} />
                <Route path="details" element={<AccountDetails />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </Provider>
      );
    });

    return rendered;
  };

  test('1. Renders main menu items', async () => {
    await renderComponent();
    
    expect(screen.getByText(/MY BOOKINGS/i)).toBeInTheDocument();
    expect(screen.getByText(/MY UPLOADS/i)).toBeInTheDocument();
    expect(screen.getByText(/NOTIFICATIONS/i)).toBeInTheDocument();
    expect(screen.getByText(/SIGN OUT/i)).toBeInTheDocument();
  });
  
  test('2. Navigation links work correctly', async () => {
    await renderComponent();
    
    const bookingsLink = screen.getByText(/MY BOOKINGS/i);
    
    await act(async () => {
      fireEvent.click(bookingsLink);
      // Advance timers to trigger state updates
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByText(/YOUR BOOKINGS/i)).toBeInTheDocument();
    });
  });

  test('3. Shows loading state while fetching data', async () => {
    // Delay API response
    global.fetch.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve({
              BookingDetails: [],
              ProductDetails: []
            })
          });
        }, 1000)
      )
    );

    let rendered;
    await act(async () => {
      rendered = await renderComponent('/dashboard/mybookings');
    });

    // Check for loading state
    expect(rendered.container.textContent).toContain('Loading');

    // Advance timers and wait for data
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    // Verify loading is gone
    await waitFor(() => {
      expect(rendered.container.textContent).not.toContain('Loading');
    });
  });

  test('4. Handles error states correctly', async () => {
    // Mock a failed API call
    global.fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('API Error'))
    );

    await renderComponent('/dashboard/mybookings');
    
    await waitFor(() => {
      expect(screen.getByText(/An error occurred/i)).toBeInTheDocument();
    });
  });

  test('5. Displays booking details correctly', async () => {
    await renderComponent('/dashboard/mybookings');
    
    await waitFor(() => {
      expect(screen.getByText(/Camera/i)).toBeInTheDocument();
      expect(screen.getByText(/Test Location/i)).toBeInTheDocument();
      expect(screen.getByText(/Electronics/i)).toBeInTheDocument();
      expect(screen.getByText(/Rs.100/i)).toBeInTheDocument();
    });
  });

   // YourBookings Tests
   describe('YourBookings Component', () => {
    test('Displays booking list', async () => {
      await renderComponent('/dashboard/mybookings');

      // Wait for loading to complete and content to appear
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Check for booking details
      await waitFor(() => {
        expect(screen.getByText(/Camera/)).toBeInTheDocument();
        expect(screen.getByText(/Test Location/)).toBeInTheDocument();
        expect(screen.getByText(/Rs.100/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  // YourRentals Tests
  describe('YourRentals Component', () => {
    test('Shows uploaded products', async () => {
      await renderComponent('/dashboard/myuploads');

      // Wait for loading to complete and content to appear
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Check for rental details
      await waitFor(() => {
        expect(screen.getByText(/Laptop/)).toBeInTheDocument();
        expect(screen.getByText(/ELECTRONICS/)).toBeInTheDocument();
        expect(screen.getByText(/Rs.100 \/hr/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  // AccountsNotifications Tests
  describe('AccountsNotifications Component', () => {
    test('Displays notifications', async () => {
      await renderComponent('/dashboard/notifications');

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Check for notification content
      await waitFor(() => {
        expect(screen.getByText(/Camera is booked!/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      // Click notification to show details
      const notificationText = screen.getByText(/Camera is booked!/i);
      fireEvent.click(notificationText);

      // Check for details modal
      await waitFor(() => {
        expect(screen.getByText(/Booking Details/)).toBeInTheDocument();
        expect(screen.getByText(/Test Buyer/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

 // AccountProfile Tests - This one's already passing
  describe('AccountProfile Component', () => {
    test('Displays user profile', async () => {
      await renderComponent('/dashboard/profile');
      
      await waitFor(() => {
        expect(screen.getByText(/Account Profile/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });
});