import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';

import Header from './components/Header';
import Footer from './components/Footer';
import FloatingActions from './components/FloatingActions';

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
  return (
    <Router>
      <ScrollToTop />
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

            {/* 3. Global Floating Action Widgets */}
            <FloatingActions />

            {/* 4. Global Dynamic Footer */}
            <Footer />
          </div>
        </LanguageProvider>
      </AuthProvider>
      <Analytics />
    </Router>
  );
}

export default App;
