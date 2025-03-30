const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  name: String,
  description: String,
  isSubscribed: Boolean,
  profilePic: String,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
