import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import valueNone from '../../resources/image-3.png'; // Asegúrate de que esta ruta es correcta

function Finance() {
    const [financeArticles, setFinanceArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hoveredArticle, setHoveredArticle] = useState(null);

    useEffect(() => {
        console.log('Starting to fetch finance articles...');
        window.scrollTo(0, 0);

        fetch('/data/articles/finance.json')
            .then(response => {
                console.log('Fetch response status:', response.status);
                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                console.log('Articles fetched successfully:', data);
                setFinanceArticles(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching articles:', error);
                setError(error.message);
                setLoading(false);
            });
    }, []);

    const getFirstParagraph = (content) => {
        if (!Array.isArray(content)) return "No content available.";
        const paragraph = content.find(item => item.type === "paragraph");
        return paragraph ? paragraph.text : "No preview available.";
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error loading articles: {error}</div>;

    return (
        <div className="section-container">
            <h2>Opinión</h2>
            <div className="content-wrapper">
                {/* Left column: List of articles */}
                <div className="article-list">
                    {financeArticles.map((financeArticle, index) => (
                        <Link
                            to={`/financearticle/${index}`}
                            key={index}
                            className="article-list-item"
                            onMouseEnter={() => setHoveredArticle({ ...financeArticle, index })}
                        >
                            <div className="article-content">
                                <div className="cover-image-container">
                                    <img src={financeArticle.cover} alt="Cover" className="cover-image" />
                                </div>
                                <div className="article-text">
                                    <h3 className="article-title">{financeArticle.title}</h3>
                                    <p className="article-subtitle">{financeArticle.subtitle}</p>
                                    <p className="article-date">{financeArticle.date}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Right column: Article preview */}
                <div className="article-preview">
                    <img
                        src={hoveredArticle ? hoveredArticle.cover : valueNone}
                        alt="Preview"
                        className="preview-image"
                    />
                    {hoveredArticle ? (
                        <>
                            <h3 className="preview-title">{hoveredArticle.title}</h3>
                            <div className="preview-text">
                                {getFirstParagraph(hoveredArticle.content).length > 300
                                    ? getFirstParagraph(hoveredArticle.content).slice(0, 300) + "..."
                                    : getFirstParagraph(hoveredArticle.content)}
                                <br />
                                <Link to={`/financearticle/${hoveredArticle.index}`} className="read-more">[Leer más...]</Link>
                            </div>
                        </>
                    ) : (
                        <div className="preview-text">
                            <br /><br /><br />
                            Majadahonda, entre encinas y silencio, donde el sol se posa con suave presencia,
                            y en cada rincón, en cada paso lento, se siente la huella de tu esencia.
                            <br /><br />
                            Bajo el Monte del Pilar, fiel y callado, tu alma se alza, serena y sutil,
                            y en tus calles, de sombras y luz dorada, se funden el tiempo y el alma de tu perfil.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Finance;
