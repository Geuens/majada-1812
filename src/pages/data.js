import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Data from '../components/pages_not_pages/Data'; // Asegúrate que esta ruta y componente existen

export async function getStaticProps() {
  const baseUrl = process.env.NEXT_PUBLIC_ARTICLES_BASE_URL;

  try {
    const res = await fetch(`${baseUrl}/data.json`, {
      // avoid cached fetches during build
      headers: { "cache-control": "no-cache" },
    });
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);

    const dataArticles = await res.json();
    return { props: { dataArticles } };
  } catch (error) {
    console.error('Error fetching dataArticles:', error);
    return { props: { dataArticles: [] } };
  }
}

export default function DataPage({ dataArticles }) {
  const [isFixed, setIsFixed] = useState(false);
  const [navHeight, setNavHeight] = useState(0);
  const navRef = useRef(null);

  useEffect(() => {
    if (navRef.current) {
      setNavHeight(navRef.current.offsetHeight);
    }

    const handleScroll = () => {
      if (navRef.current) {
        const navTop = navRef.current.offsetTop;
        if (window.pageYOffset > navTop && !isFixed) {
          setIsFixed(true);
        } else if (window.pageYOffset <= navTop && isFixed) {
          setIsFixed(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFixed]);

  return (
    <div className="App" style={{ paddingTop: isFixed ? `${navHeight}px` : '0' }}>
      <header className={`app-header ${isFixed ? 'header-fixed' : ''}`}>
        <h1 className={`wsj-title ${isFixed ? 'title-fixed' : ''}`}>majada 1812</h1>
        <h2 className={`wsj-sub-title ${isFixed ? 'sub-title-hidden' : ''}`}>Ad Virtutem, Ad Libertas</h2>

        <nav ref={navRef} className={isFixed ? 'fixed' : ''}>
          <Link href="/values">Noticias</Link>
          <Link href="/finance">Opinión</Link>
          <Link href="/data">Cultura/Deporte</Link>
        </nav>

        <div className="chat-link">
          <Link href="/chat">@Contacto</Link>
        </div>
      </header>

      <Data dataArticles={dataArticles} />

      <div className="container-sentence">
        <p className="sentence">
          - El análisis correcto trae sabiduría al lector -
        </p>
      </div>
    </div>
  );
}
