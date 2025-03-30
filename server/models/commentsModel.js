const mongoose = require('mongoose');

// Flat Comment Schema
const commentSchema = new mongoose.Schema({
  commentId: { type: String, required: true, unique: true },
  articleId: { type: String, required: true },
  articleType: { type: String, required: true },
  parentId: { type: String, default: null }, // Parent comment ID (null for root comments)
  userId: { type: String, required: true },
  username: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;









