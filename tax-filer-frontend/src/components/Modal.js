// tax-filer-frontend/src/components/Modal.js
import React from 'react';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './Modal.css';

const getFormattedDate = () => {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  return new Date().toLocaleString(undefined, options);
};

const Modal = ({ isOpen, onClose, title, children, formData }) => {
  if (!isOpen) return null;

  const generatePdf = () => {
    const content = document.getElementById('pdf-content-area');
    if (!content) {
      console.error('PDF content area not found!');
      return;
    }

    const cloned = content.cloneNode(true);
    const wrapper = document.createElement('div');
    wrapper.style.width = '800px';
    wrapper.style.padding = '40px';
    wrapper.style.backgroundColor = 'white';
    wrapper.style.fontFamily = 'Arial, sans-serif';
    wrapper.style.lineHeight = '1.6';
    wrapper.style.fontSize = '14px';
    wrapper.style.border = '1px solid #ccc';
    wrapper.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
    wrapper.style.margin = '0 auto';
    wrapper.appendChild(cloned);
    document.body.appendChild(wrapper);

    html2canvas(wrapper, {
      scale: 1.5, // reduce scale
      useCORS: true,
      backgroundColor: '#ffffff',
      allowTaint: true,
      logging: false,
    })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/jpeg', 0.75); // compress image
        const pdf = new jsPDF('p', 'pt', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position -= pageHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`AI-Tax-Advice-${new Date().toISOString()}.pdf`);
        document.body.removeChild(wrapper);
      })
      .catch((err) => {
        console.error('Error generating PDF:', err);
        alert(
          'Sorry, there was an error generating the PDF. Please try again.'
        );
      });
  };

  return (
    <div className="modal-overlay animate__animated animate__fadeIn animate__faster">
      <div className="modal-content-wrapper animate__animated animate__zoomIn animate__faster">
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="modal-close-button">
            &times;
          </button>
        </div>

        <div id="pdf-content-area" className="modal-body">
          <h3 style={{ borderBottom: '2px solid #333', paddingBottom: '6px' }}>
            AI Tax Advice Report
          </h3>
          <p className="report-date" style={{ color: '#666' }}>
            Generated on: {getFormattedDate()}
          </p>

          <h4 style={{ marginTop: '20px' }}>User Input Summary:</h4>
          <div className="user-input-summary">
            <p>
              <strong>Annual Income:</strong> {formData?.income || 'N/A'}
            </p>
            <p>
              <strong>Expenses:</strong> {formData?.expenses || 'N/A'}
            </p>
            <p>
              <strong>Deductions:</strong> {formData?.deductions || 'N/A'}
            </p>
            <p>
              <strong>Country:</strong> {formData?.countryFullName || 'N/A'}
            </p>
          </div>

          <h4 style={{ marginTop: '20px' }}>AI Generated Considerations:</h4>
          <div
            style={{
              background: '#f9f9f9',
              padding: '15px',
              borderRadius: '6px',
            }}
          >
            {typeof children === 'string' ? (
              <ReactMarkdown>{children}</ReactMarkdown>
            ) : (
              children
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={generatePdf} className="pdf-download-button">
            Download as PDF
          </button>
          <button onClick={onClose} className="modal-action-button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
