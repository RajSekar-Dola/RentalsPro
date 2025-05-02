import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Users from '../../frontend/components/Admindashboard/Users';
import Managers from '../../frontend/components/Admindashboard/Managerslist';
import AdminBookings from '../../frontend/components/Admindashboard/AdminBookings';
import AdminRevenue from '../../frontend/components/Admindashboard/AdminRevenue';
import AddLocation from '../../frontend/components/Admindashboard/AddBranch';
import BranchForm from '../../frontend/components/Admindashboard/CreateBranchForm';

// Mock fetch API
global.fetch = jest.fn();

// Mock Chart.js
jest.mock('chart.js', () => ({
    Chart: { register: jest.fn() },
    registerables: []
}));

// Mock react-chartjs-2
jest.mock('react-chartjs-2', () => ({
    Line: () => null,
    Bar: () => null,
    Pie: () => null
}));

describe('Admin Dashboard Components', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Users Component Tests
    describe('Users Component', () => {
        const mockUsers = {
            users: [
                { _id: '1', username: 'testuser1', email: 'test1@example.com' },
                { _id: '2', username: 'testuser2', email: 'test2@example.com' }
            ],
            registercount: 2
        };

        beforeEach(() => {
            global.fetch.mockImplementation(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockUsers)
                })
            );
        });

        test('1. Displays user list and count', async () => {
            await act(async () => {
                render(<Users />);
            });

            await waitFor(() => {
                expect(screen.getByText('Total Registered Users')).toBeInTheDocument();
                expect(screen.getByText('2')).toBeInTheDocument();
            });
        });

        test('2. Handles user deletion', async () => {
            global.fetch
                .mockImplementationOnce(() => Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockUsers)
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ alert: false })
                }));

            await act(async () => {
                render(<Users />);
            });

            await waitFor(() => {
                const deleteButton = screen.getAllByRole('button')[0];
                fireEvent.click(deleteButton);
            });

            await waitFor(() => {
                expect(screen.getByText('User deleted successfully!')).toBeInTheDocument();
            });
        });
    });

    // Managers Component Tests

    describe('Managers Component', () => {
    const mockLocations = { locations: ['Location1', 'Location2'] };
    const mockManagers = {
        managers: [
            { _id: '1', username: 'manager1', email: 'manager1@test.com', branch: 'Location1' }
        ],
        registercount: 1
    };

    beforeEach(() => {
        global.fetch.mockImplementation((url) => {
            if (url.includes('/locations')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockLocations)
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockManagers)
            });
        });
    });

        test('9. Validates manager form inputs', async () => {
            render(<Managers />);

            const form = document.getElementById('ManagerForm');

            await act(async () => {
                fireEvent.submit(form);
            });

            await waitFor(() => {
                expect(screen.getByText('All fields are required.')).toBeInTheDocument();
            });
        });
    });

    // AdminBookings and AdminRevenue Tests
    describe('Charts Components', () => {
        test('4. Renders booking charts', async () => {
            const mockData = [{ _id: '2023-01-01', count: 5 }];

            global.fetch.mockImplementation(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockData)
                })
            );

            await act(async () => {
                render(<AdminBookings />);
            });

            await waitFor(() => {
                expect(screen.getByText('Daily Bookings')).toBeInTheDocument();
                expect(screen.getByText('Monthly Bookings')).toBeInTheDocument();
            });
        });

        test('5. Renders revenue charts', async () => {
            const mockData = [{ _id: '2023-01-01', totalRevenue: 1000 }];

            global.fetch.mockImplementation(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockData)
                })
            );

            await act(async () => {
                render(<AdminRevenue />);
            });

            await waitFor(() => {
                expect(screen.getByText('Daily Revenue')).toBeInTheDocument();
                expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
            });
        });
    });

    // Error Handling Tests
    describe('Error Handling', () => {
        test('8. Handles network errors', async () => {
            global.fetch.mockImplementationOnce(() =>
                Promise.reject(new Error('Network error'))
            );

            await act(async () => {
                render(<Users />);
            });

            await waitFor(() => {
                expect(screen.getByText('Failed to fetch users')).toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    // AddLocation Component Tests
    describe('AddLocation Component', () => {
        test('6. Adds new location', async () => {
            global.fetch.mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ message: 'Location added successfully!' })
                })
            );

            render(<AddLocation />);

            fireEvent.change(screen.getByLabelText(/Location Name:/i), {
                target: { value: 'New Location' }
            });

            fireEvent.submit(screen.getByTestId('location-form'));

            await waitFor(() => {
                expect(screen.getByText('Location added successfully!')).toBeInTheDocument();
            });
        });
    });

});