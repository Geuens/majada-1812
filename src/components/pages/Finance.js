import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './General.css';
import valueNone from '../../resources/image-3.png';

function Finance() {
    const [financeArticles, setFinanceArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('Starting to fetch finance articles...');
        window.scrollTo(0, 0);

        // Correct path to fetch finance.json
        fetch('/data/articles/finance.json') // Ensure you're fetching the finance.json file here
            .then(response => {
                console.log('Fetch response status:', response.status);
                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                console.log('Articles fetched successfully:', data);
                setFinanceArticles(data);  // Store finance data in a separate state variable
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching articles:', error);
                setError(error.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading articles: {error}</div>;
    }

    return (
        <div className="section-container">
            <h2>Opinión</h2>
            <div className="content-wrapper">
                {/* Left column: List of articles */}
                <div className="article-list">
                    {financeArticles.map((financeArticle, index) => (
                        <Link to={`/financearticle/${index}`} key={index} className="article-list-item">
                            <div className="article-content">
                                <h3 className="article-title">{financeArticle.title}</h3>
                                <p className="article-subtitle">{financeArticle.subtitle}</p>
                                <p className="article-date">{financeArticle.date}</p>
                            </div>
                        </Link>
                    ))}
                </div>
                {/* Right column: Preview or photos */}
                <div className="article-preview">
                    <img src={valueNone} alt="Preview" className="preview-image" />
                    <div className="preview-text">
                    <br /><br /><br />
                        Majadahonda, entre encinas y silencio, donde el sol se posa con suave presencia,
                        y en cada rincón, en cada paso lento, se siente la huella de tu esencia.
                        <br /><br />
                        Bajo el Monte del Pilar, fiel y callado, tu alma se alza, serena y sutil,
                        y en tus calles, de sombras y luz dorada, se funden el tiempo y el alma de tu perfil.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Finance;
