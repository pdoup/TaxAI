import React from 'react';
import './AIAdviceDisplay.css';

function AIAdviceDisplay({ advice }) {
  if (!advice) {
    return null;
  }

  return (
    <div className="ai-advice-display">
      <h3>AI Generated Tax Advice</h3>
      <div className="advice-content">
        {/* Sanitize html */}
        <pre>{advice}</pre>{' '}
        {/* Using <pre> to preserve formatting like newlines */}
      </div>
      <p className="disclaimer">
        <strong>Note:</strong> This advice is AI-generated and for informational
        purposes only. It is not a substitute for professional tax advice.
      </p>
    </div>
  );
}

export default AIAdviceDisplay;
