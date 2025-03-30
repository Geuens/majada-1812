import React, { useEffect, useRef, useState } from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import Values from './components/pages/Values';
import Finance from './components/pages/Finance';
import Data from './components/pages/Data';
import Chat from './components/pages/Chat';
import ArticleTemplate from './components/pages/article_template';
import Login from './components/user/Login'; // Import the Login component
import AdminPage from './components/user/AdminPage'; // Admin page
import UserPage from './components/user/UserPage'; // User page
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';
import { Navigate } from 'react-router-dom';

function App() {
  const navRef = useRef(null);
  const [isFixed, setIsFixed] = useState(false);
  const [navHeight, setNavHeight] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state
  const [userId, setUserId] = useState(localStorage.getItem('googleId') || null);
  const [username, setUsername] = useState(localStorage.getItem('username') || null);

  useEffect(() => {
    const googleId = localStorage.getItem('googleId');

    if (googleId) {
      setIsLoggedIn(true);
      setUserId(googleId);

      if (!username) {
        // Fetch the user's name if not already cached
        fetch(`http://localhost:5000/auth/get/${googleId}`)
          .then((response) => response.json())
          .then((data) => {
            if (data.name) {
              setUsername(data.name);
              localStorage.setItem('username', data.name); // Cache it for future use
            } else {
              console.error('No "name" field in user data:', data);
            }
          })
          .catch((error) => console.error('Error fetching user data:', error));
      }
    } else {
      setIsLoggedIn(false);
      setUsername(null);
      localStorage.removeItem('username'); // Clear cached username if not logged in
    }

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
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isFixed, username]);

  const handleLoginStatus = (status) => {
    setIsLoggedIn(status);
    if (status) {
      localStorage.setItem('userId', userId); // Update localStorage on login
    } else {
      localStorage.removeItem('userId');
      localStorage.removeItem('username'); // Clear username on logout
    }
  };

  return (
    <GoogleOAuthProvider clientId="127919079296-0rut73bgmq61vca7fml58j3anujtgseo.apps.googleusercontent.com">
      <div className="App" style={{ paddingTop: isFixed ? `${navHeight}px` : '0' }}>
        <header className={`app-header ${isFixed ? 'header-fixed' : ''}`}>
          <h1 className={`wsj-title ${isFixed ? 'title-fixed' : ''}`}>majada 1812</h1>
          <h2 className={`wsj-sub-title ${isFixed ? 'sub-title-hidden' : ''}`}>Ad Virtutem, Ad Libertas</h2>
          <nav ref={navRef} className={isFixed ? 'fixed' : ''}>
            <Link to="/values">Noticias</Link>
            <Link to="/finance">Opinión</Link>
            <Link to="/data">Cultura/Deporte</Link>
          </nav>
        <div className="chat-link">
          <Link to="/Chat">@Contacto</Link>
        </div>
        </header>

        <Routes>
          <Route path="/" element={<Values />} />
          <Route path="/values" element={<Values />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/data" element={<Data userId={userId} isLoggedIn={isLoggedIn} />} />
          <Route path="/chat" element={<Chat isLoggedIn={isLoggedIn} />} />
          <Route
            path="/valuesarticle/:articleId"
            element={<ArticleTemplate userId={userId} username={username} isLoggedIn={isLoggedIn} />}
          />
          <Route
            path="/financearticle/:articleId"
            element={<ArticleTemplate userId={userId} username={username} isLoggedIn={isLoggedIn} />}
          />
          <Route path="/login" element={<Login onLogin={handleLoginStatus} />} />
          <Route path="/admin-page" element={<AdminPage />} />
          <Route
            path="/user-page"
            element={<UserPage onSignOut={() => handleLoginStatus(false)} />}
          />
        </Routes>

        <div className="container-sentence">
          <p className="sentence">
            - Poned atención: un corazón solitario no es un corazón -
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
