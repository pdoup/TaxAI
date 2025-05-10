import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TaxForm from './TaxForm';
import { submitTaxDataForAdvice } from '../services/apiService';

// Mock the apiService
jest.mock('../services/apiService');

// Mock the countryList utility
jest.mock('../utils/countries', () => ({
  countryList: [
    { name: 'United States', code: 'US' },
    { name: 'Canada', code: 'CA' },
  ],
}));

describe('TaxForm Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    submitTaxDataForAdvice.mockClear();
  });

  test('renders the tax form with all fields', () => {
    render(<TaxForm />);
    expect(screen.getByLabelText(/annual income/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/total business\/work expenses/i)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/other deductions claimed/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/country of residence/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /get ai tax advice/i })
    ).toBeInTheDocument();
  });

  test('allows users to input data into form fields', () => {
    render(<TaxForm />);

    fireEvent.change(screen.getByLabelText(/annual income/i), {
      target: { value: '60000' },
    });
    expect(screen.getByLabelText(/annual income/i).value).toBe('60000');

    fireEvent.change(screen.getByLabelText(/country of residence/i), {
      target: { value: 'US' },
    });
    expect(screen.getByLabelText(/country of residence/i).value).toBe('US');
  });

  test('shows an error message if required fields (income, country) are missing on submit', async () => {
    render(<TaxForm />);
    const submitButton = screen.getByRole('button', {
      name: /get ai tax advice/i,
    });
    fireEvent.click(submitButton);

    // Wait for error message to appear
    expect(
      await screen.findByText(/please fill in all fields correctly/i)
    ).toBeVisible();
    expect(submitTaxDataForAdvice).not.toHaveBeenCalled();
  });

  test('submits form data and displays advice in a modal on successful API call', async () => {
    const mockAdvice = 'This is your AI tax advice for US.';
    submitTaxDataForAdvice.mockResolvedValueOnce({ advice: mockAdvice });

    render(<TaxForm />);

    fireEvent.change(screen.getByLabelText(/annual income/i), {
      target: { value: '75000' },
    });
    fireEvent.change(screen.getByLabelText(/country of residence/i), {
      target: { value: 'US' },
    });
    fireEvent.click(screen.getByRole('button', { name: /get ai tax advice/i }));

    // Check for loading state
    expect(
      screen.getByRole('button', { name: /getting advice.../i })
    ).toBeDisabled();
    expect(
      screen
        .getByRole('button', { name: /getting advice.../i })
        .querySelector('.spinner')
    ).toBeInTheDocument();

    // Wait for the modal with advice to appear
    expect(await screen.findByText('AI Tax Considerations')).toBeVisible(); // Modal title
    expect(screen.getByText(mockAdvice)).toBeVisible();
    expect(submitTaxDataForAdvice).toHaveBeenCalledWith({
      income: '75000',
      expenses: '',
      deductions: '',
      country: 'US',
    });
  });

  test('displays an error message if API call fails', async () => {
    submitTaxDataForAdvice.mockRejectedValueOnce({
      response: { data: { detail: 'API Error Occurred' } },
    });

    render(<TaxForm />);
    fireEvent.change(screen.getByLabelText(/annual income/i), {
      target: { value: '50000' },
    });
    fireEvent.change(screen.getByLabelText(/country of residence/i), {
      target: { value: 'CA' },
    });
    fireEvent.click(screen.getByRole('button', { name: /get ai tax advice/i }));

    expect(await screen.findByText(/API Error Occurred/i)).toBeVisible();
  });
});
