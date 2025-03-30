import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = ({ onLogin }) => {
  const [error, setError] = useState(null);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const accepted = localStorage.getItem('hasAcceptedTerms');
    if (accepted === 'true') {
      setHasAcceptedTerms(true);
    }
  }, []);

  const handleLoginSuccess = async (response) => {
    try {
      const token = response.credential;
      console.log('Login successful, token received:', token);

      const serverResponse = await axios.post('http://localhost:5000/auth/google', { token });

      if (serverResponse.data && serverResponse.data.googleId) {
        localStorage.setItem('googleId', serverResponse.data.googleId);

        const isAdmin = serverResponse.data.email === 'cgeuens720@gmail.com';
        onLogin(true);
        if (isAdmin) {
          navigate('/admin-page');
        } else if (hasAcceptedTerms) {
          navigate('/user-page');
        } else {
          navigate('/terms');
        }
      } else {
        setError('Failed to login. Please try again.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  const handleLoginFailure = () => {
    setError('Login failed. Please try again.');
  };

  const handleAcceptTerms = () => {
    setHasAcceptedTerms(true);
    localStorage.setItem('hasAcceptedTerms', 'true');
    navigate('/user-page');
  };

  return (
    <div className="login-container">
      <h2>Welcome!</h2>
        <p className="business-message">
          Sign in to unlock powerful tools:<br /><br />
          - Create and save <strong>your portfolios</strong><br />
          - Access <strong>real-time financial data (in development)</strong><br />
          - Interact with our <strong>AI-driven chat (in development)</strong><br />
        </p>
      {error && <p className="error-message">{error}</p>}
      <GoogleLogin onSuccess={handleLoginSuccess} onError={handleLoginFailure} useOneTap />
      {!hasAcceptedTerms && (
        <div className="terms-container">
          <h3>Please accept our terms and conditions to proceed.</h3>
          <button onClick={handleAcceptTerms} className="accept-terms-button">
            Accept Terms
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;








