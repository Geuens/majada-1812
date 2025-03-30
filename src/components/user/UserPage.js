import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Portfolio from './Portfolio';
import Profile from './Profile'; // Import Profile
import './UserPage.css';
import { useNavigate } from 'react-router-dom';

const UserPage = ({ onSignOut }) => {
  const [userInfo, setUserInfo] = useState({
    googleId: localStorage.getItem('googleId') || null,
    name: '',
    description: '',
    isSubscribed: false,
    profilePic: null,
  });
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();

  // Fetch user data once
  useEffect(() => {
    const fetchUserData = async () => {
      const googleId = localStorage.getItem('googleId');
        if (!googleId) {
            navigate('/login'); // Redirect to login
            return;
        }

      try {
        const response = await axios.get(`http://localhost:5000/auth/get/${googleId}`);
        console.log('User data fetched:', response.data); // Debugging log
        setUserInfo({
          ...response.data,
          isSubscribed: response.data.isSubscribed || false, // Ensure default is false
        });
      } catch (err) {
        console.error('Failed to load user data:', err.response?.data || err.message);
        setError('Failed to load user data. Please try again later.');
      }
    };

    fetchUserData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const googleId = localStorage.getItem('googleId');
    if (!googleId) {
      setError('Missing Google ID. Please log in again.');
      return;
    }

    try {
      const updatedData = { ...userInfo, googleId }; // Include isSubscribed in the payload
      await axios.post('http://localhost:5000/auth/save', updatedData);
      alert('Profile saved successfully!');
    } catch (err) {
      console.error('Failed to save profile:', err.response?.data || err.message);
      setError('Failed to save profile. Please try again.');
    }
  };

  const handleSignOut = () => {
    onSignOut();
    localStorage.removeItem('googleId');
    navigate('/login');
  };

  return (
    <div className="user-page-container">
      <h2 className="welcome-title">Welcome to Your Profile</h2>
      {error && <p className="error-message">{error}</p>}

      {/* Tabs for switching between Profile and Portfolio */}
      <div className="tabs">
        <div
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </div>
        <div
          className={`tab ${activeTab === 'portfolio' ? 'active' : ''}`}
          onClick={() => setActiveTab('portfolio')}
        >
          Portfolio
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <Profile userInfo={userInfo} setUserInfo={setUserInfo} handleSubmit={handleSubmit} />
      )}

      {activeTab === 'portfolio' && <Portfolio userId={userInfo.googleId} />}

      <button onClick={handleSignOut} className="signout-button">
        Sign Out
      </button>
    </div>
  );
};

export default UserPage;


