import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import TaxForm from './components/TaxForm';
import Navbar from './components/Navbar';
import NotFoundPage from './components/NotFoundPage';
import Footer from './components/Footer';
import { requestAccessToken } from './services/apiService';
import './App.css'; // Global styles
import 'animate.css';

function App() {
  const [appToken, setAppToken] = useState(localStorage.getItem('accessToken'));
  const [tokenError, setTokenError] = useState('');
  const [isFetchingToken, setIsFetchingToken] = useState(false);

  const fetchAndStoreToken = useCallback(async () => {
    if (isFetchingToken) return; // Prevent multiple simultaneous fetches

    setIsFetchingToken(true);
    setTokenError(''); // Clear previous errors
    try {
      const tokenData = await requestAccessToken();
      if (tokenData && tokenData.access_token) {
        localStorage.setItem('accessToken', tokenData.access_token);
        setAppToken(tokenData.access_token);
      } else {
        throw new Error('Received invalid token data from server.');
      }
    } catch (error) {
      const detail =
        error.detail || error.message || 'Could not initialize secure session.';
      setTokenError(
        `${detail} Some features might be unavailable. Please try refreshing the page or check your network.`
      );
      localStorage.removeItem('accessToken'); // Clear any potentially bad token
      setAppToken(null); // Clear token from state
    } finally {
      setIsFetchingToken(false);
    }
  }, [isFetchingToken]);

  useEffect(() => {
    // Initial token fetch if none exists
    if (!appToken && !isFetchingToken) {
      fetchAndStoreToken();
    }

    const handleTokenError = (event) => {
      setTokenError(event.detail.message + ' Attempting to get a new token...');
      fetchAndStoreToken();
    };

    window.addEventListener('tokenError', handleTokenError);

    return () => {
      window.removeEventListener('tokenError', handleTokenError);
    };
  }, [appToken, fetchAndStoreToken, isFetchingToken]);

  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="container">
          {tokenError && (
            <div
              style={{
                color: 'maroon',
                textAlign: 'center',
                padding: '10px 15px',
                backgroundColor: '#ffd2d2',
                border: '1px solid maroon',
                borderRadius: '5px',
                margin: '10px auto',
                maxWidth: '800px',
              }}
            >
              <strong>Session Alert:</strong> {tokenError}
            </div>
          )}
          {/* Added main tag with container class */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tax-form" element={<TaxForm />} />
            <Route path="*" element={<NotFoundPage />} />
            {/* Define more routes? */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
