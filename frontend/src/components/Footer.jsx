import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t-4 border-amber-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Column 1: Info and logo */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="/images/logo.png" 
                alt="AGSTC Logo"
                className="w-20 h-20 object-contain"
              />
              <span className="font-serif font-bold text-lg text-white">AGSTC Sharjah</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t('footerSub')}
            </p>
            <div className="flex flex-col gap-2 mt-2 text-sm">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                Sharjah Worship Center, UAE
              </span>
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500" />
                +971 50 764 6822
              </span>
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500" />
                ministry@agstc.org
              </span>
            </div>
          </div>

          {/* Column 2: Branches */}
          <div>
            <h4 className="text-white text-base font-semibold mb-4 tracking-wider uppercase font-body">
              {t('branchesTitle')}
            </h4>
            <ul className="flex flex-col gap-3 text-sm text-slate-400">
              <li>
                <strong className="text-slate-300 block">Sharjah Main Assembly:</strong>
                Sundays: 9:00 AM & 6:30 PM
              </li>
              <li>
                <strong className="text-slate-300 block">Ajman Worship Fellowship:</strong>
                Saturdays: 7:30 PM
              </li>
              <li>
                <strong className="text-slate-300 block">Umm Al Quwain Assembly:</strong>
                Thursdays: 8:00 PM
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Navigation */}
          <div>
            <h4 className="text-white text-base font-semibold mb-4 tracking-wider uppercase font-body">
              {t('quickLinks')}
            </h4>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              <li>
                <Link to="/" className="hover:text-amber-500 transition-colors">
                  {t('navHome')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-amber-500 transition-colors">
                  {t('navAbout')}
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-amber-500 transition-colors">
                  {t('navServices')}
                </Link>
              </li>
              <li>
                <Link to="/ministries" className="hover:text-amber-500 transition-colors">
                  {t('navMinistries')}
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-amber-500 transition-colors">
                  {t('navEvents')}
                </Link>
              </li>
              <li>
                <Link to="/resources" className="hover:text-amber-500 transition-colors">
                  {t('navResources')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-500 transition-colors">
                  {t('navContact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Location Map Preview */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white text-base font-semibold tracking-wider uppercase font-body">
              Worship Location
            </h4>
            <div 
              className="w-full h-32 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center p-4 text-center text-xs text-slate-400"
              style={{ backgroundSize: 'cover' }}
            >
              <div>
                <MapPin className="w-6 h-6 text-amber-500 mx-auto mb-2 animate-bounce" />
                <span className="block font-semibold text-slate-200">AG Worship Hall</span>
                Sharjah Glass Area, Near Al Khan, Sharjah, UAE
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <span>
            © {new Date().getFullYear()} {t('allRightsReserved')}
          </span>
          <div className="flex gap-6">
            <a href="https://www.youtube.com/@AGSHARJAHTAMILCHURCH" target="_blank" rel="noreferrer" className="hover:text-amber-500">
              YouTube Channel
            </a>
            <Link to="/admin" className="hover:text-slate-300">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
