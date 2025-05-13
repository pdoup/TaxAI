// tax-filer-frontend/src/components/Footer.js
import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p>&copy; {currentYear} Your AI Tax Companion. All rights reserved.</p>
        {/* Placeholder */}
      </div>
    </footer>
  );
};

export default Footer;
