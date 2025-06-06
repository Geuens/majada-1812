import React from 'react';
import Head from 'next/head';
import StickyHeader from '../../../components/StickyHeader';
import CommentTemplate from '../../../components/pages_not_pages/CommentTemplate';
import styles from './article_template.module.css';

const categories = ['finance', 'data', 'values']; // Añade aquí todas tus categorías y archivos JSON disponibles

export async function getStaticPaths() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  console.log('🛠️ [getStaticPaths] Using baseUrl:', baseUrl);

  let paths = [];

  for (const category of categories) {
    const url = `${baseUrl}/data/articles/${category}.json`;
    console.log(`📦 Fetching category [${category}] from URL: ${url}`);

    try {
      const res = await fetch(url);

      if (!res.ok) {
        console.error(`❌ Failed to fetch ${category}.json: ${res.status} ${res.statusText}`);
        continue;
      }

      const articles = await res.json();
      console.log(`✅ Fetched ${articles.length} articles for [${category}]`);

      if (!Array.isArray(articles) || articles.length === 0) continue;

      const categoryPaths = articles
        .filter((article) => article.category && article.id !== undefined)
        .map((article) => ({
          params: {
            category: article.category,
            articleId: article.id.toString(),
          },
        }));

      console.log(`➡️  Added ${categoryPaths.length} paths from [${category}]`);
      paths = paths.concat(categoryPaths);

    } catch (error) {
      console.error(`💥 Error fetching articles for [${category}]:`, error);
    }
  }

  console.log('🚀 Final generated paths:', paths);

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const { category, articleId } = params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const url = `${baseUrl}/data/articles/${category}.json`;

  console.log('📄 [getStaticProps] Loading article', { category, articleId });
  console.log('🔗 Fetching from:', url);

  try {
    const res = await fetch(url);

    if (!res.ok) {
      console.error(`❌ Failed to fetch ${category}.json: ${res.status} ${res.statusText}`);
      return { notFound: true };
    }

    const articles = await res.json();
    if (!articles || articles.length === 0) {
      console.error(`📭 No articles found in ${category}.json`);
      return { notFound: true };
    }

    const article = articles.find(
      (art) => art.category === category && art.id.toString() === articleId
    );

    if (!article) {
      console.error('❌ Article not found in JSON list');
      return { notFound: true };
    }

    console.log('✅ Article found:', article.title);
    return {
      props: { article },
    };
  } catch (error) {
    console.error('💥 Error fetching article data:', error);
    return { notFound: true };
  }
}


const ArticlePage = ({ article }) => {
  if (!article) {
    console.error('❌ Article data not found');
    return <p>Article not found!</p>;
  }

  return (
    <>
      <Head>
        <title>{article.title} | Majada1812</title>
        <meta name="description" content={article.subtitle} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.subtitle} />
        <meta property="og:image" content={article.imageUrl || '/default-image.jpg'} />
        <meta property="og:type" content="article" />
        <meta
          property="og:url"
          content={`https://majada1812.com/articles/${article.category}/${article.id}`}
        />
      </Head>

      <StickyHeader />

      <div className={styles['talent-container']}>
        <h1 className={styles['talent-title']}>{article.title}</h1>
        <p className={styles['talent-subtitle']}>{article.subtitle}</p>

        <div className={styles['talent-content']}>
          {article.content &&
            article.content.map((block, index) => {
              if (block.type === 'paragraph') {
                return <p key={index}>{block.text}</p>;
              } else if (block.type === 'image') {
                return (
                  <div key={index} className={styles['talent-image']}>
                    <img src={block.src} alt={block.alt} />
                  </div>
                );
              } else if (block.type === 'subtitle') {
                return (
                  <h2 key={index} className={styles['talent-subtitle']}>
                    {block.text}
                  </h2>
                );
              }
              return null;
            })}
        </div>

        {article.author && (
          <p className={styles['author-style']}>Redactado por {article.author}</p>
        )}

        {article.date && (
          <div className={styles['article-date-template']}>
            {new Date(article.date).toLocaleDateString()}
          </div>
        )}

        {/* Comment section now inside the main container */}
        <div className={styles['comments-wrapper']}>
          <CommentTemplate articleId={article.id} articleType={article.category} />
        </div>

        {/* Spacer div to create extra space below comments */}
        <div style={{ height: '4rem', width: '100%' }}></div>
      </div>
    </>
  );
};

export default ArticlePage;
