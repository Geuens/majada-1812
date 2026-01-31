import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './General.module.css';

const valueNone = '/data/articles/articles_resources/cover_4.png'; // Imagen por defecto para Finance

export async function getServerSideProps() {
  const baseUrl = process.env.NEXT_PUBLIC_ARTICLES_BASE_URL;

  try {
    const res = await fetch(`${baseUrl}/api/articles/finance`);
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);

    const financeArticles = await res.json();
    return { props: { financeArticles } };
  } catch (error) {
    console.error('Error fetching financeArticles:', error);
    return { props: { financeArticles: [] } };
  }
}

function Finance({ financeArticles }) {
  const [hoveredArticle, setHoveredArticle] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const handleRouteChangeStart = (url) => {
      console.log(`🚀 Starting route change to: ${url}`);
    };

    const handleRouteChangeComplete = (url) => {
      console.log(`✅ Route change complete: ${url}`);
    };

    const handleRouteChangeError = (err, url) => {
      console.error(`❌ Route change error to ${url}`, err);
      if (err?.cancelled === false) {
        alert(`404 Navigation Error:\nURL: ${url}\nError: ${err.message || 'Unknown'}`);
      }
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [router]);

  const safeNavigate = async (path, context = {}) => {
    try {
      const res = await fetch(path, { method: 'HEAD' });
      if (res.ok) {
        await router.push(path);
      } else {
        alert(`❌ Error ${res.status}: La página no existe: ${path}`);
      }
    } catch (err) {
      alert(`❌ Error al navegar a: ${path}\n${err.message}`);
    }
  };

  const getTextFromContent = (content) => {
    if (!Array.isArray(content)) return '';
    return content
      .filter(item => item.type === 'paragraph')
      .map(item => item.text)
      .join(' ');
  };

  return (
    <div className={styles['section-container']}>
      <h2 className={styles['section-title']}>Opinión</h2>
      <div className={styles['content-wrapper']}>
        <div className={styles['article-list']}>
          {financeArticles.map((article) => (
            <div
              key={article.id}
              className={styles['article-list-item']}
              onMouseEnter={() => setHoveredArticle(article)}
              onClick={() => {
                const category = 'finance';
                const path = `/articles/${category}/${article.id}`;
                safeNavigate(path, { article });
              }}
            >
              <div className={styles['article-content']}>
                <div className={styles['cover-image-container']}>
                  <img src={article.cover || valueNone} alt="Cover" className={styles['cover-image']} />
                </div>
                <div className={styles['article-text']}>
                  <h3 className={styles['article-title']}>{article.title}</h3>
                  <p className={styles['article-subtitle']}>{article.subtitle}</p>
                  <p className={styles['article-date']}>{article.date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles['article-preview']}>
          <img
            src={hoveredArticle?.cover || valueNone}
            alt={hoveredArticle ? hoveredArticle.title : "Default preview"}
            className={styles["preview-image"]}
          />
          {hoveredArticle ? (
            <>
              <h3 className={styles['preview-title']}>{hoveredArticle.title}</h3>
              <div className={styles['preview-text']}>
                {getTextFromContent(hoveredArticle.content).length > 300
                  ? getTextFromContent(hoveredArticle.content).slice(0, 300) + "..."
                  : getTextFromContent(hoveredArticle.content)}
                <br />
                <span
                  className={styles['read-more']}
                  onClick={() => {
                    const category = hoveredArticle.category || 'finance';
                    const path = `/articles/${category}/${hoveredArticle.id}`;
                    safeNavigate(path, { hoveredArticle });
                  }}
                >
                  [Leer más...]
                </span>
              </div>
            </>
          ) : (
            <div className={styles['preview-text']}>
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


