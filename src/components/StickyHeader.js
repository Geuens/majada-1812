// components/StickyHeader.js
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const StickyHeader = () => {
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
    <header className={`app-header ${isFixed ? 'header-fixed' : ''}`} style={{ paddingTop: isFixed ? `${navHeight}px` : '0' }}>
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
  );
};

export default StickyHeader;
