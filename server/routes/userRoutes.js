const express = require('express');
const User = require('../models/userModel');
const verifyGoogleToken = require('../services/googleAuth');
const logger = require('winston').loggers.get('default');

const router = express.Router();

// Google Authentication
router.post('/google', async (req, res) => {
  logger.info('Processing Google authentication request...');
  const { token } = req.body;

  if (!token) {
    logger.warn('Google token is missing');
    return res.status(400).json({ error: 'Google token is required' });
  }

  try {
    const payload = await verifyGoogleToken(token);
    const { sub: googleId, email, name } = payload;

    // Find or create user in the database
    let user = await User.findOne({ googleId });
    if (!user) {
      user = new User({ googleId, email, name, description: '', isSubscribed: false, profilePic: '' });
      await user.save();
      logger.info(`New user created: ${googleId}`);
    } else {
      logger.info(`User authenticated: ${googleId}`);
    }

    res.status(200).json({ googleId: user.googleId, email: user.email });
  } catch (error) {
    logger.error(`Google authentication failed: ${error.message}`);
    res.status(401).json({ error: 'Invalid Google token' });
  }
});

// Save User Data
router.post('/save', async (req, res) => {
  logger.info('Processing save-user request...');
  const { googleId, name, description, isSubscribed, profilePic } = req.body;

  if (!googleId) {
    logger.warn('Google ID is missing');
    return res.status(400).json({ error: 'Google ID is required' });
  }

  try {
    const user = await User.findOneAndUpdate(
      { googleId },
      { name, description, isSubscribed, profilePic },
      { new: true, upsert: true }
    );

    logger.info(`User data saved: ${googleId}`);
    res.status(200).json({ message: 'User data saved successfully', googleId: user.googleId });
  } catch (error) {
    logger.error(`Error saving user data: ${error.message}`);
    res.status(500).json({ error: 'Error saving user data' });
  }
});

// Get User Data
router.get('/get/:googleId', async (req, res) => {
  logger.info('Processing get-user request...');
  const { googleId } = req.params;

  if (!googleId) {
    logger.warn('Google ID is missing');
    return res.status(400).json({ error: 'Google ID is required' });
  }

  try {
    const user = await User.findOne({ googleId });
    if (!user) {
      logger.warn(`User not found: ${googleId}`);
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info(`User data fetched: ${googleId}`);
    res.status(200).json(user);
  } catch (error) {
    logger.error(`Error fetching user data: ${error.message}`);
    res.status(500).json({ error: 'Error fetching user data' });
  }
});

module.exports = router;

