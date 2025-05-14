import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

    fireEvent.change(screen.getByLabelText(/total business\/work expenses/i), {
      target: { value: '10000' },
    });
    expect(screen.getByLabelText(/total business\/work expenses/i).value).toBe(
      '10000'
    );

    fireEvent.change(screen.getByLabelText(/country of residence/i), {
      target: { value: 'US' },
    });
    expect(screen.getByLabelText(/country of residence/i).value).toBe('US');
  });

  test('shows error messages for missing or invalid fields on submit', async () => {
    render(<TaxForm />);

    const countrySelect = screen.getByLabelText(/country of residence/i);
    fireEvent.change(countrySelect, { target: { value: '' } });
    expect(countrySelect).toHaveValue('');

    fireEvent.click(screen.getByRole('button', { name: /get ai tax advice/i }));

    expect(
      await screen.findByText(/income must be a non-negative number/i)
    ).toBeVisible();
    expect(
      await screen.findByText(/expenses must be a non-negative number/i)
    ).toBeVisible();
    expect(await screen.findByText(/country is required/i)).toBeVisible();
    expect(submitTaxDataForAdvice).not.toHaveBeenCalled();
  });

  test('shows error if income is negative', async () => {
    render(<TaxForm />);

    fireEvent.change(screen.getByLabelText(/annual income/i), {
      target: { value: '-100' },
    });

    fireEvent.change(screen.getByLabelText(/total business\/work expenses/i), {
      target: { value: '100' },
    });

    fireEvent.change(screen.getByLabelText(/country of residence/i), {
      target: { value: 'US' },
    });
    fireEvent.click(screen.getByRole('button', { name: /get ai tax advice/i }));

    expect(
      await screen.findByText(/income must be a non-negative number/i)
    ).toBeVisible();
  });

  test('shows error if expenses is negative', async () => {
    render(<TaxForm />);

    fireEvent.change(screen.getByLabelText(/annual income/i), {
      target: { value: '50000' },
    });
    fireEvent.change(screen.getByLabelText(/country of residence/i), {
      target: { value: 'US' },
    });
    fireEvent.change(screen.getByLabelText(/total business\/work expenses/i), {
      target: { value: '-500' },
    });
    fireEvent.click(screen.getByRole('button', { name: /get ai tax advice/i }));

    expect(
      await screen.findByText(/expenses must be a non-negative number/i)
    ).toBeVisible();
  });

  test('shows error if deductions is negative', async () => {
    render(<TaxForm />);

    fireEvent.change(screen.getByLabelText(/annual income/i), {
      target: { value: '50000' },
    });
    fireEvent.change(screen.getByLabelText(/total business\/work expenses/i), {
      target: { value: '5000' },
    });
    fireEvent.change(screen.getByLabelText(/country of residence/i), {
      target: { value: 'US' },
    });
    fireEvent.change(screen.getByLabelText(/other deductions claimed/i), {
      target: { value: '-200' },
    });
    fireEvent.click(screen.getByRole('button', { name: /get ai tax advice/i }));

    expect(
      await screen.findByText(/deductions cannot be negative/i)
    ).toBeVisible();
  });

  test('defaults deductions to 0 if empty and submits form correctly', async () => {
    const mockAdvice = 'Mock advice';
    submitTaxDataForAdvice.mockResolvedValueOnce({ advice: mockAdvice });

    render(<TaxForm />);
    fireEvent.change(screen.getByLabelText(/annual income/i), {
      target: { value: '75000' },
    });
    fireEvent.change(screen.getByLabelText(/total business\/work expenses/i), {
      target: { value: '10500' },
    });
    fireEvent.change(screen.getByLabelText(/country of residence/i), {
      target: { value: 'US' },
    });
    fireEvent.click(screen.getByRole('button', { name: /get ai tax advice/i }));

    await waitFor(() => {
      expect(screen.getByText(mockAdvice)).toBeVisible();
    });

    expect(submitTaxDataForAdvice).toHaveBeenCalledWith({
      income: '75000',
      expenses: '10500',
      deductions: '0',
      country: 'US',
    });
  });

  test('submits form data and displays advice in a modal on successful API call', async () => {
    const mockAdvice = 'This is your AI tax advice for US.';
    submitTaxDataForAdvice.mockResolvedValueOnce({ advice: mockAdvice });

    render(<TaxForm />);

    fireEvent.change(screen.getByLabelText(/annual income/i), {
      target: { value: '75000' },
    });
    fireEvent.change(screen.getByLabelText(/total business\/work expenses/i), {
      target: { value: '10500' },
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
      expenses: '10500',
      deductions: '0',
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
    fireEvent.change(screen.getByLabelText(/total business\/work expenses/i), {
      target: { value: '10500' },
    });
    fireEvent.change(screen.getByLabelText(/country of residence/i), {
      target: { value: 'CA' },
    });
    fireEvent.click(screen.getByRole('button', { name: /get ai tax advice/i }));

    expect(await screen.findByText(/API Error Occurred/i)).toBeVisible();
  });
});
