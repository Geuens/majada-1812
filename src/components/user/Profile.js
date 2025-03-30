import React, { useEffect, useState } from 'react';
import './Profile.css';
import defaultProfilePic1 from '../../resources/default-profile-1.jpg';
import defaultProfilePic2 from '../../resources/default-profile-2.jpg';
import defaultProfilePic3 from '../../resources/default-profile-3.jpg';
import defaultProfilePic4 from '../../resources/default-profile-4.jpg';

const Profile = ({ userInfo, setUserInfo, handleSubmit }) => {
  const [showImageSelector, setShowImageSelector] = useState(false);

  // Map of image IDs to image URLs
  const imageMap = {
    1: defaultProfilePic1,
    2: defaultProfilePic2,
    3: defaultProfilePic3,
    4: defaultProfilePic4,
  };

  // Debugging effect to log subscription status
  useEffect(() => {
    console.log('Subscription status:', userInfo.isSubscribed ? 'Subscribed' : 'Not Subscribed');
  }, [userInfo.isSubscribed]);

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        {/* Profile Picture */}
        <div className="profile-pic-container" onClick={() => setShowImageSelector(true)}>
          <img
            src={imageMap[userInfo.profilePic] || defaultProfilePic1} // Use imageMap to load the selected image
            alt="Profile"
            className="profile-pic"
          />
        </div>

        {/* Profile Info */}
        <div className="profile-info">
          {/* Name Input */}
          <input
            type="text"
            name="name"
            value={userInfo.name}
            onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
            className="name-input"
            placeholder="Your Name"
          />
          {/* Description Textarea */}
          <textarea
            name="description"
            value={userInfo.description}
            onChange={(e) =>
              setUserInfo({ ...userInfo, description: e.target.value })
            }
            placeholder="Tell us about yourself"
          ></textarea>
        </div>
      </div>

      {/* Save Button and Additional Features */}
      <div className="button-checkbox-container">
        <button type="button" className="save-btn" onClick={handleSubmit}>
          Save Profile
        </button>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={userInfo.isSubscribed || false}
            onChange={(e) =>
              setUserInfo({ ...userInfo, isSubscribed: e.target.checked })
            }
          />
          Subscribe to Newsletter
        </label>
      </div>

      {/* Image Selection Modal */}
      {showImageSelector && (
        <div className="image-selector-modal">
          <div className="image-selector-container">
            <h3>Select a Profile Image</h3>
            <div className="image-options">
              {Object.entries(imageMap).map(([id, image]) => (
                <div
                  key={id}
                  className="image-option"
                  onClick={() => {
                    setUserInfo({ ...userInfo, profilePic: id }); // Save the selected image ID
                    setShowImageSelector(false);
                  }}
                >
                  <img src={image} alt={`Profile Option ${id}`} />
                </div>
              ))}
            </div>
            <button
              className="close-modal-btn"
              onClick={() => setShowImageSelector(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
















