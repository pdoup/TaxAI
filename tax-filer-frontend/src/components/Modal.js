// tax-filer-frontend/src/components/Modal.js
import React from 'react';
import ReactMarkdown from 'react-markdown';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay animate__animated animate__fadeIn animate__faster">
      <div className="modal-content animate__animated animate__zoomIn animate__faster">
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="modal-close-button">
            &times;
          </button>
        </div>
        <div className="modal-body">
          {typeof children === 'string' ? (
            <ReactMarkdown>{children}</ReactMarkdown>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
