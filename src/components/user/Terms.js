import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Terms.css';

const Terms = () => {
  const navigate = useNavigate();

  const handleAccept = () => {
    localStorage.setItem('hasAcceptedTerms', 'true'); // Store the acceptance status
    navigate('/user-page'); // Redirect to user dashboard or appropriate page
  };

  return (
    <div className="terms-container">
      <h2>Terms and Conditions</h2>
      <p>Please read and accept our terms and conditions to continue.</p>
      <button onClick={handleAccept} className="accept-terms-button">
        Accept Terms
      </button>
    </div>
  );
};

export default Terms;
