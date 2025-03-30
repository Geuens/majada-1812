const { OAuth2Client } = require('google-auth-library');

// Google Client ID
const client = new OAuth2Client('127919079296-0rut73bgmq61vca7fml58j3anujtgseo.apps.googleusercontent.com');

const verifyGoogleToken = async (token) => {
  try {
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: '127919079296-0rut73bgmq61vca7fml58j3anujtgseo.apps.googleusercontent.com',
    });
    return ticket.getPayload();
  } catch (error) {
    throw new Error('Invalid Google token');
  }
};

module.exports = verifyGoogleToken;
