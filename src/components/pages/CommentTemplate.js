import React, { useEffect, useState } from 'react';
import './comment_template.css';

function CommentTemplate({ articleId, articleType }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [collapsedReplies, setCollapsedReplies] = useState({});
    const [userIdAndUsername, setUserIdAndUsername] = useState(''); // One field for userId and username

    useEffect(() => {
        fetchComments();
    }, [articleId, articleType]);

    const fetchComments = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/comments/article/${articleType}/${articleId}/comments`);
            const data = await response.json();
            setComments(data.comments || []);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const renderComments = (parentId) =>
        comments
            .filter((comment) => comment.parentId === parentId)
            .map((comment) => (
                <li key={comment.commentId} className="comment-item">
                    <div>
                        <div className="comment-header">
                            <strong>{comment.username}</strong>
                            <span className="comment-time">
                                {new Date(comment.createdAt).toLocaleString()}
                            </span>
                        </div>
                        <p className="comment-content">
                            {comment.isDeleted ? 'This comment has been deleted.' : comment.content}
                        </p>
                        {comments.some((c) => c.parentId === comment.commentId) && (
                            <button
                                className="toggle-replies-button"
                                onClick={() => toggleReplies(comment.commentId)}
                            >
                                {collapsedReplies[comment.commentId] ? '(+)' : '(-)'}
                            </button>
                        )}
                        {!collapsedReplies[comment.commentId] && (
                            <ul className="nested-comments">{renderComments(comment.commentId)}</ul>
                        )}
                    </div>
                </li>
            ));

    const toggleReplies = (commentId) => {
        setCollapsedReplies((prevState) => ({
            ...prevState,
            [commentId]: !prevState[commentId],
        }));
    };

    const handleCommentSubmit = async (e, parentId = null) => {
        e.preventDefault();
        console.log('Form submitted with comment:', newComment);

        if (!newComment.trim()) {
            console.log('Comment is empty, not submitting.');
            return;  // Don't submit if comment is empty
        }

        // Check if userIdAndUsername is provided
        if (!userIdAndUsername.trim()) {
            console.log('Missing userId or username, please enter them.');
            return;  // Don't submit if userIdAndUsername is missing
        }

        console.log('Posting new comment...');
        try {
            const response = await fetch(`http://localhost:5000/api/comments/article/${articleId}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userIdAndUsername,
                    username: userIdAndUsername,
                    content: newComment,
                    articleType,  // Send articleType in the body
                    parentId,
                }),
            });

            // Log the response text before parsing as JSON to check if it's HTML
            const responseText = await response.text();  // Get response as text to inspect it

            // Check if the response is HTML (start of an error page)
            if (responseText.startsWith('<!DOCTYPE html>')) {
                console.error('Received HTML response instead of JSON:', responseText);
                return;
            }

            // Parse the response as JSON
            const data = JSON.parse(responseText);

            if (!response.ok) {
                console.error('Error adding comment:', data);
                throw new Error('Failed to post comment');
            }

            console.log('New comment added:', data.comment);

            // Update the comments state by adding the new comment to the list
            setComments((prevComments) => [data.comment, ...prevComments]);

            // Reset the new comment input
            setNewComment('');
            setUserIdAndUsername(''); // Clear the input field after submission
        } catch (error) {
            console.error('Error adding comment:', error.message);
        }
    };

    return (
        <div className="comments-section">
            <h2 className="comments-section-title">Comentarios</h2>
            <form className="add-comment-form" onSubmit={handleCommentSubmit}>
                <input
                    type="text"
                    value={userIdAndUsername}
                    onChange={(e) => setUserIdAndUsername(e.target.value)}
                    placeholder="Nombre"
                    className="comment-input"  // Same class as the comment textarea
                />
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe un comentario..."
                    className="comment-textarea"
                />
                <button type="submit" className="comment-submit-button" disabled={!newComment.trim() || !userIdAndUsername.trim()}>
                    Comentar
                </button>
            </form>
            <ul className="comment-list">{renderComments(null)}</ul>
        </div>
    );
}

export default CommentTemplate;
