const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Comment = require('../models/commentsModel');

// ✅ GET comments by article type and ID
router.get('/article/:type/:id/comments', async (req, res) => {
    const { type, id } = req.params;

    try {
        const comments = await Comment.findAll({
            where: {
                articleId: id,
                articleType: type,
                isDeleted: false,
            },
            order: [['createdAt', 'DESC']],
        });

        res.json({ comments });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
});

// ✅ POST a new comment
router.post('/article/:articleId/comment', async (req, res) => {
    const { articleId } = req.params;
    const { userId, username, content, articleType, parentId } = req.body;

    if (!userId || !username || !content || !articleId || !articleType) {
        console.error('⚠️ Missing required fields');
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
            content,
        });

        res.status(201).json({ comment: newComment });
    } catch (error) {
        console.error('[❌ ERROR] Adding comment:', error);
        res.status(500).json({ error: 'Error adding comment' });
    }
});

// ✅ Soft delete a comment
router.delete('/article/:articleType/:articleId/comments/:commentId', async (req, res) => {
    const { commentId } = req.params;
    const { userId } = req.body;

    try {
        const comment = await Comment.findOne({ where: { commentId } });

        if (!comment) {
            console.warn('⚠️ Comentario no encontrado');
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (comment.userId !== userId) {
            console.warn('⚠️ Usuario no autorizado para borrar este comentario');
            return res.status(403).json({ error: 'Unauthorized' });
        }

        comment.isDeleted = true;
        comment.content = 'deleted comment';
        await comment.save();

        res.status(200).json({ message: 'Comment deleted', comment });
    } catch (error) {
        console.error('[❌ ERROR] Deleting comment:', error);
        res.status(500).json({ error: 'Error deleting comment' });
    }
});

module.exports = router;
