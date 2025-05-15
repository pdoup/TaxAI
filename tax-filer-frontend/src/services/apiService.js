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

const NO_AUTH_REQUIRED_ENDPOINTS = [
  '/token/request-token',
  '/tax/info',
  '/tax/health',
];

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (
      token &&
      config.url &&
      !NO_AUTH_REQUIRED_ENDPOINTS.includes(config.url)
    ) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      (error.response.status === 401 /* Unauthorized */ ||
        error.response.status === 403) /* Forbidden */
    ) {
      localStorage.removeItem('accessToken');

      if (
        originalRequest &&
        originalRequest.url &&
        !NO_AUTH_REQUIRED_ENDPOINTS.includes(originalRequest.url)
      ) {
        const event = new CustomEvent('tokenError', {
          detail: {
            message:
              'Session expired or invalid. Please try refreshing the page.',
          },
        });
        window.dispatchEvent(event);
      }
    }

    if (error.response && error.response.data) {
      if (error.response.status === 401 || error.response.status === 403) {
        return Promise.reject({
          ...(typeof error.response.data === 'object'
            ? error.response.data
            : { detail: error.response.data }),
          isTokenError: true,
          status: error.response.status,
        });
      }
      return Promise.reject(error.response.data);
    }
    return Promise.reject({
      detail: error.message || 'Network error or unhandled API issue',
    });
  }
);

export const requestAccessToken = async () => {
  let response;
  try {
    // This request should NOT have the Authorization header
    response = await apiClient.get('/token/request-token');
    return response.data;
  } catch (error) {
    response = null;
    throw error;
  }
};

export const submitTaxDataForAdvice = async (taxData) => {
  let response;
  try {
    response = await apiClient.post('/tax/submit-advice', taxData);
    return response.data;
  } catch (error) {
    response = null;
    throw error;
  }
};
