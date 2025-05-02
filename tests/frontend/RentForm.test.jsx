import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RentForm from '../../frontend/components/RentForm';
import { BrowserRouter } from 'react-router-dom';

// Define product price limits
const PRODUCT_PRICE_LIMITS = {
  bikes: 100,
  cars: 200,
  cameras: 100,
  drones: 100,
  fishingrods: 50,
  speakers: 50,
  cycles: 90
};

// Mock fetch for locations
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ locations: ['Location 1', 'Location 2'] })
  })
);

describe('RentForm Render Tests', () => {
  beforeEach(async () => {
    fetch.mockClear();
    await act(async () => {
      render(
        <BrowserRouter>
          <RentForm />
        </BrowserRouter>
      );
      // Wait for locations to load
      await new Promise(resolve => setTimeout(resolve, 0));
    });
  });

  test('should render form heading', () => {
    expect(screen.getByText('Lend Form')).toBeInTheDocument();
  });

  test('should render all input fields and labels', () => {
    // Product Type dropdown
    expect(screen.getByLabelText(/SELECT PRODUCT TYPE:/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /SELECT PRODUCT TYPE:/i })).toHaveDisplayValue('Select a product');

    // Product Name field
    expect(screen.getByLabelText(/ProductName/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /ProductName/i })).toBeInTheDocument();

    // Location dropdown
    expect(screen.getByLabelText(/SELECT LOCATION:/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /SELECT LOCATION:/i })).toHaveDisplayValue('Select a location');

    // Date fields
    expect(screen.getByLabelText(/RENT FROM:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/RENT UPTO:/i)).toBeInTheDocument();

    // Price field
    expect(screen.getByLabelText(/PRICE:/i)).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /PRICE:/i })).toBeInTheDocument();

    // Photo upload
    expect(screen.getByLabelText(/UPLOAD PHOTO OF PRODUCT/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /SUBMIT/i })).toBeInTheDocument();
  });

  test('should render product type options', () => {
    const productSelect = screen.getByLabelText(/SELECT PRODUCT TYPE:/i);
    expect(productSelect).toHaveDisplayValue('Select a product');
    
    const options = ['CAR', 'BIKE', 'CAMERA', 'DRONE', 'FISHING ROD', 'SPEAKER', 'CYCLE'];
    options.forEach(option => {
      expect(screen.getByRole('option', { name: option })).toBeInTheDocument();
    });
  });

  test('should render all required attributes', () => {
    // Check required fields
    expect(screen.getByLabelText(/SELECT PRODUCT TYPE:/i)).toBeRequired();
    expect(screen.getByLabelText(/ProductName/i)).toBeRequired();
    expect(screen.getByLabelText(/SELECT LOCATION:/i)).toBeRequired();
    expect(screen.getByLabelText(/RENT FROM:/i)).toBeRequired();
    expect(screen.getByLabelText(/RENT UPTO:/i)).toBeRequired();
    expect(screen.getByLabelText(/PRICE:/i)).toBeRequired();
    expect(screen.getByLabelText(/UPLOAD PHOTO OF PRODUCT/i)).toBeRequired();
  });

  test('should render price input with correct constraints', () => {
    const priceInput = screen.getByLabelText(/PRICE:/i);
    expect(priceInput).toHaveAttribute('min', '1');
    expect(priceInput).toHaveAttribute('step', '1');
    expect(priceInput).toHaveAttribute('type', 'number');
  });

  test('should render date inputs with correct step', () => {
    const fromDate = screen.getByLabelText(/RENT FROM:/i);
    const toDate = screen.getByLabelText(/RENT UPTO:/i);
    
    expect(fromDate).toHaveAttribute('step', '1800');
    expect(toDate).toHaveAttribute('step', '1800');
    expect(fromDate).toHaveAttribute('type', 'datetime-local');
    expect(toDate).toHaveAttribute('type', 'datetime-local');
  });
});
