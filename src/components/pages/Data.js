import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './General.css';
import valueNone from '../../resources/image-4.png';

function Data() {
    const [dataArticles, setDataArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('Starting to fetch data articles...');
        window.scrollTo(0, 0);

        fetch('/data/articles/data.json') // Adjusted correct path
            .then(response => {
                console.log('Fetch response status:', response.status);
                return response.text(); // Log as text first to catch HTML errors
            })
            .then(text => {
                try {
                    const jsonData = JSON.parse(text);
                    console.log('Articles fetched successfully:', jsonData);
                    setDataArticles(jsonData);
                    setLoading(false);
                } catch (err) {
                    throw new Error('Invalid JSON response');
                }
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
            <h2>Cultura/Deporte</h2>
            <div className="content-wrapper">
                {/* Left column: List of articles */}
                <div className="article-list">
                    {dataArticles.map((dataArticle, index) => (
                        <Link to={`/dataarticle/${index}`} key={index} className="article-list-item">
                            <div className="article-content">
                                <h3 className="article-title">{dataArticle.title}</h3>
                                <p className="article-subtitle">{dataArticle.subtitle}</p>
                                <p className="article-date">{dataArticle.date}</p>
                            </div>
                        </Link>
                    ))}
                </div>
                {/* Right column: Preview or photos */}
                <div className="article-preview">
                    <img src={valueNone} alt="Preview" className="preview-image" />
                    <div className="preview-text">
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

export default Data;

