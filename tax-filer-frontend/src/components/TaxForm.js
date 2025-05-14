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
  const [submittedFormData, setSubmittedFormData] = useState(null);
  const [advice, setAdvice] = useState('');
  const [errors, setErrors] = useState({
    income: '',
    expenses: '',
    deductions: '',
    country: '',
    general: '',
  });
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
    setErrors((prev) => ({ ...prev, [name]: '', general: '' }));
  };

  const validateForm = () => {
    const newErrors = {
      income: '',
      expenses: '',
      deductions: '',
      country: '',
      general: '',
    };
    let isValid = true;

    if (!formData.country || formData.country === '') {
      newErrors.country = 'Country is required.';
      isValid = false;
    }

    if (formData.income === '' || parseFloat(formData.income) < 0) {
      newErrors.income = 'Income must be a non-negative number.';
      isValid = false;
    }

    if (formData.expenses === '' || parseFloat(formData.expenses) < 0) {
      newErrors.expenses = 'Expenses must be a non-negative number.';
      isValid = false;
    }

    if (formData.deductions !== '' && parseFloat(formData.deductions) < 0) {
      newErrors.deductions = 'Deductions cannot be negative.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAdvice('');
    setIsModalOpen(false); // Close modal before new submission
    setSubmittedFormData(null);

    const isValid = validateForm();
    if (!isValid) return;

    const cleanedData = {
      ...formData,
      deductions: formData.deductions === '' ? '0' : formData.deductions,
    };

    setIsLoading(true);
    try {
      const selectedCountryObject = countryList.find(
        (c) => c.code === formData.country
      );
      const currentSubmissionData = {
        ...cleanedData,
        countryFullName: selectedCountryObject
          ? selectedCountryObject.name
          : formData.country,
      };

      const response = await submitTaxDataForAdvice(cleanedData);
      if (response && response.advice) {
        setAdvice(response.advice); // This will be passed to the modal
        setSubmittedFormData(currentSubmissionData);
        setIsModalOpen(true); // Open the modal on success
      } else {
        setErrors((prev) => ({
          ...prev,
          general: response.error || 'Failed to get advice.',
        }));
      }
    } catch (err) {
      let errorMessage =
        'An unexpected error occurred. Please try again later.';
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail
            .map((d) => `${d.loc[1]}: ${d.msg}`)
            .join('; ');
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      setErrors((prev) => ({ ...prev, general: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setAdvice('');
    setSubmittedFormData(null);
  };

  return (
    <div className="tax-form-container animate__animated animate__fadeIn">
      <h2>Get Your AI Tax Insight</h2>
      <form onSubmit={handleSubmit} noValidate>
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
            step="1000"
            min="0"
            required
          />
          {errors.income && <p className="error-message">{errors.income}</p>}
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
            step="100"
            min="0"
            required
          />
          {errors.expenses && (
            <p className="error-message">{errors.expenses}</p>
          )}
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
            step="any"
            min="0"
          />
          {errors.deductions && (
            <p className="error-message">{errors.deductions}</p>
          )}
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
          {errors.country && <p className="error-message">{errors.country}</p>}
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

      {errors.general && (
        <p className="error-message animate__animated animate__shakeX">
          {errors.general}
        </p>
      )}

      {/* The Modal component for displaying AI advice */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="AI Tax Considerations"
        formData={submittedFormData}
      >
        {advice}
      </Modal>
    </div>
  );
};

export default TaxForm;
