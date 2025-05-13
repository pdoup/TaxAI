// tax-filer-frontend/src/components/TaxForm.js
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { submitTaxDataForAdvice } from '../services/apiService';
import '../TaxForm.css';
import Modal from './Modal'; // Import the Modal component
import { countryList } from '../utils/countries'; // Import the country list

const LAST_COUNTRY_COOKIE = 'lastSelectedCountry';

const TaxForm = () => {
  const [formData, setFormData] = useState({
    income: '',
    expenses: '',
    deductions: '',
    country: Cookies.get(LAST_COUNTRY_COOKIE) || '',
  });
  const [advice, setAdvice] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal

  useEffect(() => {
    // Update on change
    if (formData.country) {
      Cookies.set(LAST_COUNTRY_COOKIE, formData.country, { expires: 30 }); // Cookie expires in 30 days
    }
  }, [formData.country]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'country' ? value : value, // Store the country code directly
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAdvice('');
    setIsLoading(true);
    setIsModalOpen(false); // Close modal before new submission

    try {
      // Basic client-side validation
      if (
        !formData.country ||
        formData.income === '' ||
        parseFloat(formData.income) < 0
      ) {
        setError(
          'Please fill in all fields correctly. Income must be a non-negative number.'
        );
        setIsLoading(false);
        return;
      }

      const response = await submitTaxDataForAdvice(formData);
      if (response && response.advice) {
        setAdvice(response.advice); // This will be passed to the modal
        setIsModalOpen(true); // Open the modal on success
      } else {
        setError(response.error || 'Failed to get advice. Please try again.');
      }
    } catch (err) {
      let errorMessage =
        'An unexpected error occurred. Please try again later.';
      if (err.response && err.response.data && err.response.data.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail
            .map((d) => `${d.loc[1]}: ${d.msg}`)
            .join('; ');
        } else if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setAdvice('');
  };

  return (
    <div className="tax-form-container animate__animated animate__fadeIn">
      <h2>Get Your AI Tax Insight</h2>
      <form onSubmit={handleSubmit}>
        {/* Form Groups */}
        <div className="form-group">
          <label htmlFor="income">Annual Income:</label>
          <input
            type="number"
            id="income"
            name="income"
            value={formData.income}
            onChange={handleChange}
            placeholder="e.g., 50000"
            min="0"
            step="any"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="expenses">
            Total Business/Work Expenses (if applicable):
          </label>
          <input
            type="number"
            id="expenses"
            name="expenses"
            value={formData.expenses}
            onChange={handleChange}
            placeholder="e.g., 10000"
            min="0"
            step="any"
          />
        </div>
        <div className="form-group">
          <label htmlFor="deductions">Other Deductions Claimed:</label>
          <input
            type="number"
            id="deductions"
            name="deductions"
            value={formData.deductions}
            onChange={handleChange}
            placeholder="e.g., 2000"
            min="0"
            step="any"
          />
        </div>
        <div className="form-group">
          <label htmlFor="country">Country of Residence:</label>
          <select
            id="country"
            name="country"
            value={formData.country} // This will be the country code
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Select your country
            </option>
            {countryList
              .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically by name
              .map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
          </select>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner"></span>
                <span>Getting Advice...</span>
              </>
            ) : (
              'Get AI Tax Advice'
            )}
          </button>
        </div>
      </form>

      {error && (
        <p className="error-message animate__animated animate__shakeX">
          {error}
        </p>
      )}

      {/* The Modal component for displaying AI advice */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="AI Tax Considerations"
      >
        {advice}
      </Modal>
    </div>
  );
};

export default TaxForm;
