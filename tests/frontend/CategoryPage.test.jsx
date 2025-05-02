import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Category from '../../frontend/components/CategoryPage';
import '@testing-library/jest-dom';

// Define mock product data as a constant so we can reference it in tests
const MOCK_PRODUCTS = {
  products: [
    { 
      _id: '1', 
      productName: 'Test Electronics',
      price: 100, 
      locationName: 'Hyderabad',
      photo: ['test-image.jpg'],
      productType: 'electronics'
    }
  ]
};

// Update the fetch mock to use the constant
global.fetch = jest.fn((url) => {
  if (url === 'http://localhost:3000/locations') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ locations: ['Hyderabad', 'Mumbai', 'Delhi'] })
    });
  } else if (url === 'http://localhost:3000/products') {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(MOCK_PRODUCTS)
    });
  }
  return Promise.reject(new Error(`Unhandled fetch to ${url}`));
});

describe('Category Page Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderCategory = () => {
    render(
      <MemoryRouter initialEntries={['/category/electronics']}>
        <Category />
      </MemoryRouter>
    );
  }; 
   
  test('1. Shows filter section', async () => {
    await act(async () => {
      renderCategory();
    });
    const filterSection = screen.getByTestId('filters-section');
    expect(filterSection).toBeInTheDocument();
  });
  
  test('2. Shows search input', async () => {
    await act(async () => {
      renderCategory();
    });
    const searchInput = screen.getByRole('textbox');
    expect(searchInput).toBeInTheDocument();
  });
  

  test('3. Shows location dropdown', () => {
    renderCategory();
    const locationDropdown = screen.getByRole('combobox');
    expect(locationDropdown).toBeInTheDocument();
  });

  test('4. Shows datetime filter', () => {
    renderCategory();
    const dateTimeFilter = screen.getByTestId('datetime-filter');
    expect(dateTimeFilter).toBeInTheDocument();
  });
});