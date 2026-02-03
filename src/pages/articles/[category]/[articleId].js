import React from 'react';
import Head from 'next/head';
import StickyHeader from '../../../components/StickyHeader';
import CommentTemplate from '../../../components/pages_not_pages/CommentTemplate';
import styles from './article_template.module.css';

const categories = ['finance', 'data', 'values'];

export async function getStaticPaths() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  let paths = [];

  for (const category of categories) {
    const url = `${baseUrl}/data/articles/${category}.json`;

    try {
      const res = await fetch(url);
      if (!res.ok) continue;

      const articles = await res.json();
      if (!Array.isArray(articles)) continue;

      const categoryPaths = articles
        .filter((article) => article.category && article.id !== undefined)
        .map((article) => ({
          params: {
            category: article.category,
            articleId: article.id.toString(),
          },
        }));

      paths = paths.concat(categoryPaths);
    } catch {
      continue;
    }
  }

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const { category, articleId } = params;
  const baseUrl = process.env.NEXT_PUBLIC_ARTICLES_BASE_URL;
  const url = `${baseUrl}/${category}.json`;

  try {
    const res = await fetch(url);
    if (!res.ok) return { notFound: true };

    const articles = await res.json();
    if (!Array.isArray(articles)) return { notFound: true };

    const article = articles.find(
      (art) => art.category === category && art.id.toString() === articleId
    );

    if (!article) return { notFound: true };

    return {
      props: { article },
    };
  } catch {
    return { notFound: true };
  }
}

const ArticlePage = ({ article }) => {
  if (!article) return <p>Article not found!</p>;

  // ✅ FECHA SEGURA (NO rompe build)
  const parsedDate = new Date(article.date);
  const isoDate = isNaN(parsedDate.getTime())
    ? new Date().toISOString()
    : parsedDate.toISOString();

  const articleUrl = `https://majada1812.com/articles/${article.category}/${article.id}`;
  const imageUrl = article.imageUrl || 'https://majada1812.com/default-image.jpg';
  const authorName = article.author || 'Redacción Majada1812';

  return (
    <>
      <Head>
        <title>{article.title} | Majada1812</title>
        <meta name="description" content={article.subtitle} />

        {/* Open Graph */}
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.subtitle} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={articleUrl} />

        {/* ✅ GOOGLE NEWS STRUCTURED DATA */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NewsArticle",
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": articleUrl,
              },
              "headline": article.title,
              "description": article.subtitle,
              "image": [imageUrl],
              "datePublished": isoDate,
              "dateModified": isoDate,
              "author": {
                "@type": "Organization",
                "name": authorName,
              },
              "publisher": {
                "@type": "Organization",
                "name": "Majada1812",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://majada1812.com/logo.png",
                },
              },
            }),
          }}
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
              }
              if (block.type === 'image') {
                return (
                  <div key={index} className={styles['talent-image']}>
                    <img src={block.src} alt={block.alt || ''} />
                  </div>
                );
              }
              if (block.type === 'subtitle') {
                return (
                  <h2 key={index} className={styles['talent-subtitle']}>
                    {block.text}
                  </h2>
                );
              }
              return null;
            })}
        </div>

        <p className={styles['author-style']}>Redactado por {authorName}</p>

        <div className={styles['article-date-template']}>
          {parsedDate.toLocaleDateString()}
        </div>

        {/*
        <div className={styles['comments-wrapper']}>
          <CommentTemplate articleId={article.id} articleType={article.category} />
        </div>
        */}

        <div style={{ height: '4rem', width: '100%' }} />
      </div>
    </>
  );
};

export default ArticlePage;
