import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './General.module.css';

const valueNone = '/data/articles/articles_resources/image-2.jpg';

export async function getServerSideProps() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  try {
    const res = await fetch(`${baseUrl}/api/articles/values`);
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);

    const valuesArticles = await res.json();
    return { props: { valuesArticles } };
  } catch (error) {
    console.error('Error fetching valuesArticles:', error);
    return { props: { valuesArticles: [] } };
  }
}

function Values({ valuesArticles }) {
  const [hoveredArticle, setHoveredArticle] = useState(null);
  const router = useRouter();

  console.log('📦 Rendered Values component');
  console.log('📚 valuesArticles:', valuesArticles);

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
    console.log(`➡️ Attempting navigation to: ${path}`, context);
    try {
      const res = await fetch(path, { method: 'HEAD' });
      if (res.ok) {
        await router.push(path);
      } else {
        console.error(`🚫 Page not found (status ${res.status}) at: ${path}`, context);
        alert(`❌ Error ${res.status}: La página no existe: ${path}`);
      }
    } catch (err) {
      console.error(`🚫 Navigation failed to ${path}`, err);
      alert(`❌ Error al navegar a: ${path}\n${err.message}`);
    }
  };

  const getTextFromContent = (content) => {
    if (!Array.isArray(content)) {
      console.warn('⚠️ Content is not an array:', content);
      return '';
    }
    return content
      .filter(item => item.type === 'paragraph')
      .map(item => item.text)
      .join(' ');
  };

  return (
    <div className={styles['section-container']}>
      <h2 className={styles['section-title']}>Noticias</h2>
      <div className={styles['content-wrapper']}>
        <div className={styles['article-list']}>
          {valuesArticles.map((article, articleIndex) => (
            <div
              key={article.id} // Use article.id instead of index for unique key
              className={styles['article-list-item']}
              onMouseEnter={() => {
                console.log(`🖱 Hovered article ${article.id}:`, article);
                setHoveredArticle(article); // Set whole article, not just the index
              }}
              onClick={() => {
                const category = 'values';
                const articleId = article.id; // Use article.id instead of index
                const path = `/articles/${category}/${articleId}`;
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
            src={hoveredArticle ? hoveredArticle.cover : valueNone}
            alt="Preview"
            className={styles['preview-image']}
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
                    const category = hoveredArticle.category || 'values';
                    const articleId = hoveredArticle.id; // Use hoveredArticle.id here
                    const path = `/articles/${category}/${articleId}`;
                    safeNavigate(path, { hoveredArticle });
                  }}
                >
                  [Leer más...]
                </span>
              </div>
            </>
          ) : (
            <div className={styles['preview-text']}>
              Majadahonda, entre encinas y silencio...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Values;
