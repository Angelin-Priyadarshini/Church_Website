import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Globe, LogOut, User } from 'lucide-react';

const Header = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: t('navHome') },
    { path: '/about', label: t('navAbout') },
    { path: '/services', label: t('navServices') },
    { path: '/ministries', label: t('navMinistries') },
    { path: '/events', label: t('navEvents') },
    { path: '/resources', label: t('navResources') },
    { path: '/contact', label: t('navContact') },
  ];

  return (
    <nav className="glass-nav sticky top-0 z-50 w-full" style={{ position: 'sticky' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2 sm:py-3">
          {/* Logo Brand Brand */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img 
              src="/images/logo.png" 
              alt="AGSTC Logo"
              className="w-14 h-14 object-contain transition-transform duration-300 hover:scale-105"
            />
            <div className="flex flex-col justify-center">
              <span className="font-serif font-bold text-xl tracking-tight text-white block leading-none mb-1">
                AGSTC
              </span>
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-widest block">
                {t('headerBrandSub')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden xl:flex items-center gap-3 xl:gap-4 2xl:gap-6 shrink-0">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className="text-xs xl:text-sm font-semibold text-slate-100 hover:text-amber-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {/* Language Switcher */}
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-slate-800 transition-colors text-white"
              title="Toggle Language / மொழி மாற்று"
            >
              <Globe className="w-4 h-4 xl:w-5 xl:h-5 text-slate-200" />
              <span className="text-xs xl:text-sm font-bold text-slate-100 uppercase hover:text-amber-400 transition-colors">
                {language === 'en' ? 'தமிழ்' : 'EN'}
              </span>
            </button>

            {/* Admin session trigger */}
            {user ? (
              <div className="flex items-center gap-2 xl:gap-4 pl-3 xl:pl-4 border-l border-slate-700">
                <Link 
                  to="/admin" 
                  className="flex items-center gap-1.5 text-xs xl:text-sm font-semibold text-slate-200 hover:text-amber-400"
                >
                  <User className="w-4 h-4" />
                  {t('adminDashboard')}
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-1.5 rounded-full hover:bg-red-950/50 text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link 
                to="/admin" 
                className="text-[11px] xl:text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors pl-3 xl:pl-4 border-l border-slate-700"
              >
                {t('adminPortal')}
              </Link>
            )}
          </div>

          {/* Mobile hamburger trigger */}
          <div className="xl:hidden flex items-center gap-4">
            <button 
              onClick={toggleLanguage} 
              className="flex items-center gap-1 p-2 rounded-full hover:bg-slate-800 text-white"
            >
              <Globe className="w-5 h-5 text-slate-200" />
              <span className="text-xs font-bold">{language === 'en' ? 'தமிழ்' : 'EN'}</span>
            </button>
            
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-slate-800 text-white"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="xl:hidden glass-panel bg-slate-950/95 border-amber-500/30 mx-4 my-2 p-4 animate-slideup" style={{ borderRadius: '15px' }}>
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="text-base font-semibold text-slate-200 hover:text-amber-400 py-1"
              >
                {link.label}
              </Link>
            ))}
            
            {user ? (
              <div className="flex flex-col gap-3 pt-3 border-t border-slate-800">
                <Link 
                  to="/admin" 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 text-base font-semibold text-slate-200 hover:text-amber-400"
                >
                  <User className="w-5 h-5" />
                  {t('adminDashboardTitle')}
                </Link>
                <button 
                  onClick={() => { setIsOpen(false); handleLogout(); }}
                  className="flex items-center gap-2 text-base font-semibold text-red-400 text-left"
                >
                  <LogOut className="w-5 h-5" />
                  {language === 'ta' ? 'வெளியேறு' : 'Logout'}
                </button>
              </div>
            ) : (
              <Link 
                to="/admin" 
                onClick={() => setIsOpen(false)}
                className="text-center text-sm font-semibold text-slate-400 hover:text-slate-200 pt-3 border-t border-slate-800"
              >
                {t('adminPortalLogin')}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
