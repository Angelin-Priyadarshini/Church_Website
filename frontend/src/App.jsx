import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Header from './components/Header';
import Footer from './components/Footer';

import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Ministries from './pages/Ministries';
import MinistryDetail from './pages/MinistryDetail';
import Events from './pages/Events';
import Resources from './pages/Resources';
import Contact from './pages/Contact';
import Admin from './pages/Admin';

// ScrollToTop helper to force viewport scroll resets on React Router transitions
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  // This app is always served at /new/ on Hostinger (agsharjah.org/new).
  // On Vercel the VITE_BASE env var is set to '/' so vite.config.js handles that,
  // but the router basename must also match. We read the same env var at build time
  // via a data attribute injected by vite, or fall back to /new.
  const routerBasename = import.meta.env.VITE_BASE || '/new';

  return (
    <Router basename={routerBasename}>
      <ScrollToTop />
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <div className="flex flex-col min-h-screen">
              {/* 1. Global Navigation Bar */}
              <Header />

              {/* 2. Main Page Content Router */}
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/ministries" element={<Ministries />} />
                  <Route path="/ministries/:id" element={<MinistryDetail />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/resources" element={<Resources />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/admin" element={<Admin />} />
                </Routes>
              </main>

              {/* 4. Global Dynamic Footer */}
              <Footer />
            </div>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
