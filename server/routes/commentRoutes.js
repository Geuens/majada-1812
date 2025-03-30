const express = require('express');
const router = express.Router();
const Comment = require('../models/commentsModel');

const { v4: uuidv4 } = require('uuid');

// Fetch comments for an article
router.get('/article/:articleType/:articleId/comments', async (req, res) => {
    const { articleType, articleId } = req.params;

    try {
        console.log(`[INFO] Fetching comments for article: ${articleId}, type: ${articleType}`);
        const comments = await Comment.find({ articleId, articleType}).sort({ createdAt: -1 });

        console.log(`[SUCCESS] Fetched ${comments.length} comments`);
        res.status(200).json({ comments });
    } catch (error) {
        console.error('[ERROR] Failed to fetch comments:', error.message);
        res.status(500).json({ error: 'Error fetching comments' });
    }
});

// Add a comment or reply
router.post('/article/:articleId/comment', async (req, res) => {
    const { articleId } = req.params;
    const { userId, username, content, articleType, parentId } = req.body;

    try {
        if (!userId || !username || !content || !articleId || !articleType) {
            console.error('[ERROR] Missing required fields.');
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newComment = new Comment({
            commentId: uuidv4(),
            articleId,
            articleType,
            parentId: parentId || null, // null for root comments
            userId,
            username,
            content,
            createdAt: new Date(),
        });

        await newComment.save();
        console.log(`[SUCCESS] Comment added: ${newComment.commentId}`);
        res.status(201).json({ comment: newComment });
    } catch (error) {
        console.error('[ERROR] Failed to add comment:', error.message);
        res.status(500).json({ error: 'Error adding comment' });
    }
});

// Delete a comment
router.delete('/article/:articleType/:articleId/comments/:commentId', async (req, res) => {
    const { articleType, articleId, commentId } = req.params;
    const { userId } = req.body; // User ID should be passed in the request body

    try {
        // Find the comment to verify ownership and match
        const comment = await Comment.findOne({ commentId, articleId, articleType });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Check if the user owns the comment
        if (comment.userId !== userId) {
            return res.status(403).json({ error: 'You do not have permission to delete this comment' });
        }

        // Update the comment to "deleted" status
        comment.isDeleted = true;
        comment.content = 'deleted comment';
        await comment.save();

        console.log(`[SUCCESS] Comment deleted: ${commentId}`);
        res.status(200).json({ message: 'Comment deleted successfully', comment });
    } catch (error) {
        console.error('[ERROR] Failed to delete comment:', error.message);
        res.status(500).json({ error: 'Error deleting comment' });
    }
});





module.exports = router;


