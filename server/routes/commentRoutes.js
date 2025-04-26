const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Comment = require('../models/commentsModel');

// Get comments
router.get('/article/:articleType/:articleId/comments', async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: {
        articleType: req.params.articleType,
        articleId: req.params.articleId
      },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ comments });
  } catch (error) {
    console.error('[ERROR] Fetching comments:', error.message);
    res.status(500).json({ error: 'Error fetching comments' });
  }
});

// Add comment
router.post('/article/:articleId/comment', async (req, res) => {
  const { articleId } = req.params;
  const { userId, username, content, articleType, parentId } = req.body;

  if (!userId || !username || !content || !articleId || !articleType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const newComment = await Comment.create({
      commentId: uuidv4(),
      articleId,
      articleType,
      parentId: parentId || null,
      userId,
      username,
      content
    });

    res.status(201).json({ comment: newComment });
  } catch (error) {
    console.error('[ERROR] Adding comment:', error.message);
    res.status(500).json({ error: 'Error adding comment' });
  }
});

// Soft-delete comment
router.delete('/article/:articleType/:articleId/comments/:commentId', async (req, res) => {
  const { commentId } = req.params;
  const { userId } = req.body;

  try {
    const comment = await Comment.findOne({ where: { commentId } });

    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

    comment.isDeleted = true;
    comment.content = 'deleted comment';
    await comment.save();

    res.status(200).json({ message: 'Comment deleted', comment });
  } catch (error) {
    console.error('[ERROR] Deleting comment:', error.message);
    res.status(500).json({ error: 'Error deleting comment' });
  }
});

module.exports = router;
