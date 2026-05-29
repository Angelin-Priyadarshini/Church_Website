import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const handleQuickLinkClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={`pt-16 pb-8 border-t-4 border-amber-500 ${isLight ? 'bg-slate-900' : 'bg-slate-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Column 1: Info and logo */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="/images/logo.png" 
                alt="AGSTC Logo"
                className="w-16 h-16 object-contain transition-transform duration-300 hover:scale-105 shrink-0"
              />
              <span className="font-serif font-bold text-lg text-white">AGSTC Sharjah</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t('footerSub')}
            </p>
            <div className="flex flex-col gap-2 mt-2 text-sm text-slate-300">
              <a 
                href="https://www.google.com/maps/search/?api=1&query=St.+Martin's+Anglican+Church,+Yarmook,+Sharjah" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-amber-400 transition-colors"
              >
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                {t('agWorshipHallAddress') || "St. Martin's Anglican Church, Sharjah, UAE"}
              </a>
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                +971 50 764 6822
              </span>
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                admin@agsharjah.org
              </span>
            </div>
          </div>

          {/* Column 2: Worship Timings */}
          <div>
            <h4 className="text-amber-400 text-base font-semibold mb-4 tracking-wider uppercase">
              {t('Sharjah Main Assembly')}
            </h4>
            <ul className="flex flex-col gap-3 text-sm text-slate-300">
              <li>
                <strong className="text-white block">{t('Sundays')}:</strong>
                6:45 AM & 9:00 AM (Tamil Service)
              </li>
              <li>
                <strong className="text-white block">{t('Saturdays')}:</strong>
                10:00 AM - 12:45 PM (Fasting Prayer)
              </li>
              <li>
                <strong className="text-white block">{t('Thursdays')}:</strong>
                8:00 PM - 9:55 PM (Midweek Service)
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Navigation */}
          <div>
            <h4 className="text-amber-400 text-base font-semibold mb-4 tracking-wider uppercase">
              {t('quickLinks')}
            </h4>
            <ul className="grid grid-cols-2 gap-2 text-sm text-slate-300">
              <li><Link to="/" onClick={handleQuickLinkClick} className="hover:text-amber-400 transition-colors">{t('navHome')}</Link></li>
              <li><Link to="/about" onClick={handleQuickLinkClick} className="hover:text-amber-400 transition-colors">{t('navAbout')}</Link></li>
              <li><Link to="/services" onClick={handleQuickLinkClick} className="hover:text-amber-400 transition-colors">{t('navServices')}</Link></li>
              <li><Link to="/ministries" onClick={handleQuickLinkClick} className="hover:text-amber-400 transition-colors">{t('navMinistries')}</Link></li>
              <li><Link to="/events" onClick={handleQuickLinkClick} className="hover:text-amber-400 transition-colors">{t('navEvents')}</Link></li>
              <li><Link to="/resources" onClick={handleQuickLinkClick} className="hover:text-amber-400 transition-colors">{t('navResources')}</Link></li>
              <li><Link to="/contact" onClick={handleQuickLinkClick} className="hover:text-amber-400 transition-colors">{t('navContact')}</Link></li>
            </ul>
          </div>

          {/* Column 4: Location */}
          <div className="flex flex-col gap-3">
            <h4 className="text-amber-400 text-base font-semibold tracking-wider uppercase">
              Worship Location
            </h4>
            <a 
              href="https://www.google.com/maps/search/?api=1&query=St.+Martin's+Anglican+Church,+Yarmook,+Sharjah" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full h-32 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center p-4 text-center text-xs text-slate-300 hover:bg-slate-700/80 hover:border-amber-500/50 transition-all duration-300 group"
            >
              <div>
                <MapPin className="w-6 h-6 text-amber-400 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300 animate-bounce" />
                <span className="block font-semibold text-white group-hover:text-amber-400 transition-colors">St. Martin's Anglican Church</span>
                Sharjah, United Arab Emirates
              </div>
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 gap-4">
          <span>© {new Date().getFullYear()} {t('allRightsReserved')}</span>
          <div className="flex items-center gap-6">
            <a href="https://www.youtube.com/@AGSHARJAHTAMILCHURCH" target="_blank" rel="noreferrer" className="hover:text-amber-400 transition-colors">
              YouTube Channel
            </a>
            <Link to="/admin" className="hover:text-slate-200 transition-colors">
              Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
