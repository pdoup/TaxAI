import axios from 'axios';

// Use environment variable for API base URL, fallback for local dev if not set via Docker
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const submitTaxDataForAdvice = async (taxData) => {
  try {
    const response = await apiClient.post('/tax/submit-advice', taxData);
    return response.data;
  } catch (error) {
    throw error;
  }
};
