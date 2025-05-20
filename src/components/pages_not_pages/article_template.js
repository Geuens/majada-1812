import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import CommentTemplate from './CommentTemplate';
import './article_template.css';

function ArticleTemplate({ userId, isLoggedIn, username }) {
    const router = useRouter();
    const { articleCategory, articleId } = router.query; // Use the dynamic route params for articleCategory and articleId

    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const userUsername = username || localStorage.getItem('username') || 'Anonymous';

    useEffect(() => {
        if (articleCategory && articleId) {
            const filePath = `/data/articles/${articleCategory}.json`; // Dynamically select the JSON file based on category

            fetch(filePath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok: ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    const foundArticle = data.find((item, index) => index.toString() === articleId);
                    if (foundArticle) {
                        setArticle(foundArticle);
                    } else {
                        setError('Article not found');
                    }
                    setLoading(false);
                })
                .catch(error => {
                    setError(error.message);
                    setLoading(false);
                });
        }
    }, [articleCategory, articleId]);

    const renderTextWithBold = (text, boldParts) => {
        let renderedText = text.replace(/\n/g, '<span class="line-break"></span>'); // Replace <br /> with <span class="line-break">

        if (boldParts && boldParts.length > 0) {
            boldParts.forEach(part => {
                const boldText = `<strong>${part}</strong>`;
                renderedText = renderedText.replace(part, boldText);
            });
        }

        return <span dangerouslySetInnerHTML={{ __html: renderedText }} />;
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="talent-container">
            <h1 className="talent-title">{article?.title}</h1>
            <p className="talent-subtitle">{article?.subtitle}</p>

            <div className="talent-content">
                {Array.isArray(article?.content) ? (
                    article.content.map((block, index) => {
                        if (block.type === 'paragraph') {
                            return (
                                <p key={index}>
                                    {renderTextWithBold(block.text, block.bold)}
                                </p>
                            );
                        } else if (block.type === 'image') {
                            return (
                                <div key={index} className="talent-image">
                                    <img src={block.src} alt={block.alt} />
                                </div>
                            );
                        } else if (block.type === 'subtitle') {
                            return (
                                <h2 key={index} className="talent-subtitle">{block.text}</h2>
                            );
                        }
                        return null;
                    })
                ) : (
                    <p>No content available for this article.</p>
                )}
            </div>

            {article?.author && (
                <p className="author-style">Redactado por {article.author}</p>
            )}

            {article?.date && (
                <div className="article-date-template">
                    {new Date(article.date).toLocaleDateString()}
                </div>
            )}

            <CommentTemplate
                userId={userId}
                username={userUsername}
                articleId={articleId}
                articleType={articleCategory} // Pass articleType here
                isLoggedIn={isLoggedIn}
            />
        </div>
    );
}

export default ArticleTemplate;

