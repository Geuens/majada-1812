'use client'; // Necesario porque usa useState y useEffect

import React, { useEffect, useState } from 'react';
import styles from './comment_template.module.css';

export default function CommentTemplate({ articleId, articleType }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [collapsedReplies, setCollapsedReplies] = useState({});
    const [userIdAndUsername, setUserIdAndUsername] = useState('');

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchComments();
    }, [articleId, articleType]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/comments/article/${articleType}/${articleId}/comments`);
            const data = await res.json();
            setComments(data.comments || []);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const renderComments = (parentId) =>
        comments
            .filter((comment) => comment.parentId === parentId)
            .map((comment) => (
                <li key={comment.commentId} className={styles['comment-item']}>
                    <div>
                        <div className={styles['comment-header']}>
                            <strong>{comment.username}</strong>
                            <span className={styles['comment-time']}>
                                {new Date(comment.createdAt).toLocaleString()}
                            </span>
                        </div>
                        <p className={styles['comment-content']}>
                            {comment.isDeleted ? 'Este comentario ha sido eliminado.' : comment.content}
                        </p>
                        {comments.some((c) => c.parentId === comment.commentId) && (
                            <button
                                className={styles['toggle-replies-button']}
                                onClick={() => toggleReplies(comment.commentId)}
                            >
                                {collapsedReplies[comment.commentId] ? '(+)' : '(-)'}
                            </button>
                        )}
                        {!collapsedReplies[comment.commentId] && (
                            <ul className={styles['nested-comments']}>{renderComments(comment.commentId)}</ul>
                        )}
                    </div>
                </li>
            ));

    const toggleReplies = (commentId) => {
        setCollapsedReplies((prev) => ({
            ...prev,
            [commentId]: !prev[commentId],
        }));
    };

    const handleCommentSubmit = async (e, parentId = null) => {
        e.preventDefault();

        if (!newComment.trim() || !userIdAndUsername.trim()) {
            console.log('Faltan datos, no se envía.');
            return;
        }

        try {
            const res = await fetch(`${BACKEND_URL}/api/comments/article/${articleId}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userIdAndUsername,
                    username: userIdAndUsername,
                    content: newComment,
                    articleType,
                    parentId,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                console.error('Error al publicar comentario:', data);
                throw new Error('Fallo al publicar comentario');
            }

            setComments((prev) => [data.comment, ...prev]);
            setNewComment('');
            setUserIdAndUsername('');
        } catch (error) {
            console.error('Error al añadir comentario:', error.message);
        }
    };

    return (
        <div className={styles['comments-section']}>
            <h2 className={styles['comments-section-title']}>Comentarios</h2>
            <form className={styles['add-comment-form']} onSubmit={handleCommentSubmit}>
                <input
                    type="text"
                    value={userIdAndUsername}
                    onChange={(e) => setUserIdAndUsername(e.target.value)}
                    placeholder="Nombre"
                    className={styles['comment-input']}
                />
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe un comentario..."
                    className={styles['comment-textarea']}
                />
                <button
                    type="submit"
                    className={styles['comment-submit-button']}
                    disabled={!newComment.trim() || !userIdAndUsername.trim()}
                >
                    Comentar
                </button>
            </form>
            <ul className={styles['comment-list']}>{renderComments(null)}</ul>
        </div>
    );
}


