import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, X, Globe, LogOut, User, Sun, Moon } from 'lucide-react';

const Header = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
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

  const dashboardLabel = user?.role === 'user'
    ? (language === 'ta' ? 'எனது பலகை' : 'My Dashboard')
    : t('adminDashboard');

  const dashboardTitleLabel = user?.role === 'user'
    ? (language === 'ta' ? 'எனது பலகை' : 'My Dashboard')
    : t('adminDashboardTitle');

  const isDark = theme === 'dark';
  const navTextColor = isDark ? 'text-slate-100' : 'text-slate-700';
  const navHoverColor = 'hover:text-amber-500';
  const iconColor = isDark ? 'text-slate-200' : 'text-slate-600';

  return (
    <nav className="glass-nav sticky top-0 z-50 w-full" style={{ position: 'sticky' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2 sm:py-3">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img
              src="/images/logo.png"
              alt="AGSTC Logo"
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain transition-transform duration-300 hover:scale-105"
            />
            <div className="flex flex-col justify-center">
              <span className={`font-serif font-bold text-lg sm:text-xl tracking-tight block leading-none mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                AGSTC
              </span>
              <span className="text-[10px] uppercase font-bold text-amber-500 tracking-widest block">
                {t('headerBrandSub')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center gap-3 xl:gap-4 2xl:gap-6 shrink-0">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-xs xl:text-sm font-semibold transition-colors ${navTextColor} ${navHoverColor}`}
              >
                {link.label}
              </Link>
            ))}

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className={`flex items-center gap-1.5 p-1.5 rounded-full hover:bg-amber-500/10 transition-colors ${iconColor}`}
              title="Toggle Language / மொழி மாற்று"
            >
              <Globe className="w-4 h-4 xl:w-5 xl:h-5" />
              <span className={`text-xs xl:text-sm font-bold uppercase transition-colors ${navTextColor} ${navHoverColor}`}>
                {language === 'en' ? 'தமிழ்' : 'EN'}
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full hover:bg-amber-500/10 transition-colors ${iconColor}`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              id="theme-toggle-btn"
            >
              {isDark
                ? <Sun className="w-4 h-4 xl:w-5 xl:h-5 text-amber-400" />
                : <Moon className="w-4 h-4 xl:w-5 xl:h-5 text-slate-500" />
              }
            </button>

            {/* Auth */}
            {user ? (
              <div className={`flex items-center gap-2 xl:gap-4 pl-3 xl:pl-4 border-l ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>
                <Link
                  to="/admin"
                  className={`flex items-center gap-1.5 text-xs xl:text-sm font-semibold ${navTextColor} ${navHoverColor}`}
                >
                  <User className="w-4 h-4" />
                  {dashboardLabel}
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
                className={`text-[11px] xl:text-xs font-semibold transition-colors pl-3 xl:pl-4 border-l ${isDark ? 'border-slate-700 text-slate-400 hover:text-slate-200' : 'border-slate-300 text-slate-500 hover:text-slate-800'}`}
              >
                {language === 'ta' ? 'உள்நுழை' : 'Login'}
              </Link>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="xl:hidden flex items-center gap-2">
            {/* Theme toggle mobile */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full hover:bg-amber-500/10 transition-colors ${iconColor}`}
              title="Toggle theme"
            >
              {isDark
                ? <Sun className="w-5 h-5 text-amber-400" />
                : <Moon className="w-5 h-5 text-slate-500" />
              }
            </button>

            <button
              onClick={toggleLanguage}
              className={`flex items-center gap-1 p-2 rounded-full hover:bg-amber-500/10 ${iconColor}`}
            >
              <Globe className="w-5 h-5" />
              <span className="text-xs font-bold">{language === 'en' ? 'தமிழ்' : 'EN'}</span>
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-lg hover:bg-amber-500/10 ${iconColor}`}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          className="xl:hidden glass-panel mx-3 my-2 p-5 animate-slideup"
          style={{ borderRadius: '16px', background: isDark ? 'rgba(8,12,24,0.97)' : 'rgba(255,255,255,0.98)' }}
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`text-base font-semibold py-1.5 border-b ${isDark ? 'text-slate-200 border-slate-800 hover:text-amber-400' : 'text-slate-700 border-slate-100 hover:text-amber-500'}`}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <div className="flex flex-col gap-3 pt-2">
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2 text-base font-semibold ${isDark ? 'text-slate-200 hover:text-amber-400' : 'text-slate-700 hover:text-amber-500'}`}
                >
                  <User className="w-5 h-5" />
                  {dashboardTitleLabel}
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
                className={`text-sm font-semibold pt-2 ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {language === 'ta' ? 'உள்நுழை' : 'Login'}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
