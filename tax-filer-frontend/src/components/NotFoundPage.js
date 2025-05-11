// tax-filer-frontend/src/components/NotFoundPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';
import { FiAlertTriangle } from 'react-icons/fi';

const NotFoundPage = () => {
  return (
    <div className="not-found-container animate__animated animate__fadeIn">
      <div className="not-found-content">
        {<FiAlertTriangle className="not-found-icon" size={80} />}
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Oops! Page Not Found.</h2>
        <p className="not-found-message">
          Sorry, the page you are looking for does not exist, might have been
          removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link to="/" className="not-found-button">
          Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
