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
      <div className="container-box">
        <div className="flex items-center justify-between py-3 sm:py-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2 shrink-0 -ml-3 sm:-ml-6 lg:-ml-9 xl:-ml-12">
            <img
              src="/images/logo.png"
              alt="AGSTC Logo"
              className="w-12 h-12 sm:w-15 sm:h-15 object-contain transition-transform duration-300 hover:scale-105 shrink-0"
            />
            <div className="flex flex-col justify-center">
              <span className={`font-serif font-bold text-lg sm:text-[22px] tracking-tight block leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                AGSTC
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-amber-500 tracking-wider block leading-tight mt-0.5">
                {t('headerBrandSub')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className={`hidden xl:flex items-center ${language === 'ta' ? 'gap-2 xl:gap-2.5 2xl:gap-6' : 'gap-4 xl:gap-5 2xl:gap-8'} shrink-0`}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`${language === 'ta' ? 'text-[12.5px] 2xl:text-[14px] tracking-tighter' : 'text-[16px] 2xl:text-[17px]'} font-semibold transition-colors ${navTextColor} ${navHoverColor} whitespace-nowrap`}
              >
                {link.label}
              </Link>
            ))}

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className={`flex items-center gap-1.5 p-1.5 rounded-full hover:bg-amber-500/10 transition-colors ${iconColor} shrink-0`}
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
              className={`p-2 rounded-full hover:bg-amber-500/10 transition-colors ${iconColor} shrink-0`}
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
              <div className={`flex items-center gap-2 xl:gap-3 pl-3 xl:pl-4 border-l ${isDark ? 'border-slate-700' : 'border-slate-300'} shrink-0`}>
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
                className={`text-[12px] xl:text-xs font-semibold transition-colors pl-3 xl:pl-4 border-l ${isDark ? 'border-slate-700 text-slate-400 hover:text-slate-200' : 'border-slate-300 text-slate-500 hover:text-slate-800'} shrink-0`}
              >
                {language === 'ta' ? 'உள்நுழை' : 'Login'}
              </Link>
            )}

            {/* Assemblies of God Shield Logo (Far Right) */}
            <div className={`flex items-center shrink-0 pl-3 xl:pl-4 border-l ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>
              <img 
                src="/images/ag-right-logo.png" 
                alt="Assemblies of God Logo" 
                className="w-11 h-11 object-contain transition-transform duration-300 hover:scale-105 shrink-0"
                onError={(e) => {
                  e.target.onerror = null;
                  const isHostinger = window.location.pathname.startsWith('/new') || window.location.hostname.includes('agsharjah.org');
                  e.target.src = isHostinger ? '/new/images/ag-right-logo.png' : '/images/ag-right-logo.png';
                }}
              />
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="xl:hidden flex items-center gap-1 shrink-0">
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

            {/* Assemblies of God Shield Logo (Far Right Mobile) */}
            <img 
              src="/images/ag-right-logo.png" 
              alt="Assemblies of God Logo" 
              className="w-9 h-9 object-contain ml-1 transition-transform duration-300 hover:scale-105 shrink-0"
              onError={(e) => {
                e.target.onerror = null;
                const isHostinger = window.location.pathname.startsWith('/new') || window.location.hostname.includes('agsharjah.org');
                e.target.src = isHostinger ? '/new/images/ag-right-logo.png' : '/images/ag-right-logo.png';
              }}
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          className="xl:hidden absolute left-3 right-3 top-full mt-2 glass-panel p-4 animate-slideup max-h-[calc(100vh-92px)] overflow-y-auto"
          style={{ borderRadius: '14px', background: isDark ? 'rgba(8,12,24,0.98)' : 'rgba(255,255,255,0.99)' }}
        >
          <div className="grid grid-cols-1 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`rounded-lg px-4 py-3 text-base font-semibold transition-colors ${isDark ? 'text-slate-200 hover:bg-white/10 hover:text-amber-400' : 'text-slate-700 hover:bg-amber-50 hover:text-amber-700'}`}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <div className={`flex flex-col gap-2 pt-3 mt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-3 text-base font-semibold ${isDark ? 'text-slate-200 hover:bg-white/10 hover:text-amber-400' : 'text-slate-700 hover:bg-amber-50 hover:text-amber-700'}`}
                >
                  <User className="w-5 h-5" />
                  {dashboardTitleLabel}
                </Link>
                <button
                  onClick={() => { setIsOpen(false); handleLogout(); }}
                  className="flex items-center gap-2 rounded-lg px-4 py-3 text-base font-semibold text-red-400 text-left hover:bg-red-500/10"
                >
                  <LogOut className="w-5 h-5" />
                  {language === 'ta' ? 'வெளியேறு' : 'Logout'}
                </button>
              </div>
            ) : (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className={`block rounded-lg px-4 py-3 mt-2 border-t text-base font-semibold ${isDark ? 'border-slate-800 text-slate-300 hover:bg-white/10 hover:text-slate-100' : 'border-slate-100 text-slate-600 hover:bg-amber-50 hover:text-slate-900'}`}
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
