import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Chat from '../components/pages_not_pages/Chat'; // Ajusta la ruta si hace falta

export async function getStaticProps() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  try {
    const res = await fetch(`${baseUrl}/data/articles/chat.json`);
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);

    const chatArticles = await res.json();
    return { props: { chatArticles } };
  } catch (error) {
    console.error('Error fetching chatArticles:', error);
    return { props: { chatArticles: [] } };
  }
}

export default function ChatPage({ chatArticles }) {
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

      <Chat chatArticles={chatArticles} />

      <div className="container-sentence">
        <p className="sentence">
          - Poned atención: un corazón solitario no es un corazón -
        </p>
      </div>
    </div>
  );
}


