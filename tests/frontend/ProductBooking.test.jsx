import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProductbookingPage from '../../frontend/components/ProductbookingPage';

global.fetch = jest.fn();
Object.defineProperty(document, 'cookie', {
    writable: true,
    value: 'user_id=testUserId',
});

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ product_id: '1' }),
    useNavigate: () => mockedNavigate,
    useLocation: () => ({
        search: '?frombookingdate=2025-04-30T10:00&tobookingdate=2025-04-30T13:00',
    }),
}));

beforeEach(() => {
    fetch.mockReset();
    mockedNavigate.mockReset();
});

function renderComponent() {
    render(
        <MemoryRouter initialEntries={['/productbooking/1?frombookingdate=2025-04-30T10:00&tobookingdate=2025-04-30T13:00']}>
            <Routes>
                <Route path="/productbooking/:product_id" element={<ProductbookingPage />} />
            </Routes>
        </MemoryRouter>
    );
}

function setupFetchSuccess() {
    fetch.mockImplementation((url) => {
        if (url.includes('/product/')) {
            return Promise.resolve({
                ok: true,
                json: () =>
                    Promise.resolve({
                        productName: 'Camera',
                        productType: 'Electronics',
                        photo: ['https://example.com/camera.jpg'],
                        locationName: 'Hyderabad',
                        price: 100,
                    }),
            });
        } else if (url.includes('/booking')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ message: 'Booking Successful!' }),
            });
        } else if (url.includes('/grabCustomernameProductId')) {
            test('10. Verifies error message format on booking failure', async () => {
                fetch.mockImplementation((url) => {
                    if (url.includes('/product/')) {
                        return Promise.resolve({
                            ok: true,
                            json: () => Promise.resolve({
                                productName: 'Camera',
                                productType: 'Electronics',
                                photo: ['https://example.com/camera.jpg'],
                                locationName: 'Hyderabad', 
                                price: 100
                            })
                        });
                    } else if (url.includes('/booking')) {
                        return Promise.resolve({
                            ok: false,
                            status: 400,
                            json: () => Promise.resolve({
                                error: 'Invalid booking request',
                                message: 'Booking Failed'
                            })
                        });
                    }
                    return Promise.reject('Unknown API');
                });

                renderComponent();

                const payNowBtn = await screen.findByText(/Pay Now/i);
                fireEvent.click(payNowBtn);

                await waitFor(() => {
                    expect(screen.getByRole('alert')).toBeInTheDocument();
                    expect(screen.getByRole('alert')).toHaveTextContent('Booking Failed');
                });
            });

            test('11. Validates pickup/dropoff time format', async () => {
                setupFetchSuccess();
                renderComponent();

                await waitFor(() => {
                    const pickupTime = screen.getByText('10:00');
                    const dropoffTime = screen.getByText('13:00');
                    expect(pickupTime).toBeInTheDocument();
                    expect(dropoffTime).toBeInTheDocument();
                    expect(pickupTime).toMatch(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/);
                    expect(dropoffTime).toMatch(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/);
                });
            });

            test('12. Verifies service charge calculation', async () => {
                setupFetchSuccess();
                renderComponent();

                await waitFor(() => {
                    const basePrice = 300; // ₹100 * 3 hours
                    const serviceCharge = screen.getByText('₹30.00');
                    expect(serviceCharge).toBeInTheDocument();
                    expect(parseFloat(serviceCharge.textContent.replace('₹', ''))).toBe(basePrice * 0.1);
                });
            });
        }
        return Promise.reject(new Error('Unhandled fetch'));
    });
}

describe('ProductbookingPage Tests', () => {
    test('1. Renders product details correctly', async () => {
        setupFetchSuccess();
        renderComponent();

        expect(await screen.findByText('Camera')).toBeInTheDocument();
        expect(screen.getByText('Hyderabad')).toBeInTheDocument();
        expect(screen.getByText(/Fare:/)).toBeInTheDocument();
    });

    test('2. Completes booking when Pay Now is clicked', async () => {
        setupFetchSuccess();
        renderComponent();
    
        // Wait for the button to be present and enabled
        const payNowBtn = await screen.findByText(/Pay Now/i);
        expect(payNowBtn).toBeEnabled();
    
        // Click the button
        fireEvent.click(payNowBtn);
    
        // Verify fetch was called with correct URL and method
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/booking'),
                expect.objectContaining({ method: 'POST' })
            );
        });
    
        // Verify success message appears
        await waitFor(() => {
            expect(screen.getByText(/Booking Successful/i)).toBeInTheDocument();
        });
    });

    test('3. Shows error if booking fails', async () => {
        fetch.mockImplementation((url) => {
            if (url.includes('/product/')) {
                return Promise.resolve({
                    ok: true,
                    json: () =>
                        Promise.resolve({
                            productName: 'Camera',
                            productType: 'Electronics',
                            photo: ['https://example.com/camera.jpg'],
                            locationName: 'Hyderabad',
                            price: 100,
                        }),
                });
            } else if (url.includes('/booking')) {
                return Promise.resolve({
                    ok: false,
                    json: () => Promise.resolve({ message: 'Booking Failed' }),
                });
            }
            return Promise.reject('Unknown API');
        });

        renderComponent();

        const payNowBtn = await screen.findByText(/Pay Now/i);
        fireEvent.click(payNowBtn);

        await waitFor(() => {
            expect(screen.getByText(/Booking Failed/i)).toBeInTheDocument();
        });
    });

    test('4. Redirects to login if user is not logged in', async () => {
        document.cookie = ''; // Clear cookie
        setupFetchSuccess();

        renderComponent();

        await waitFor(() => {
            expect(mockedNavigate).toHaveBeenCalledWith('/login');
        });
    });
});
