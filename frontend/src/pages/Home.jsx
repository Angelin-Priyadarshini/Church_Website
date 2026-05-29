import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import HeroBanner from '../components/HeroBanner';
import VideoPlayer from '../components/VideoPlayer';
import { Calendar, Heart, Shield, HelpCircle, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE, resolveImageUrl, isValidImagePath } from '../config';

const Home = () => {
  const { t } = useLanguage();
  const [latestSermon, setLatestSermon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch home data from backend APIs
    const fetchData = async () => {
      try {
        const servRes = await fetch(`${API_BASE}/api/services?category=${encodeURIComponent('Sunday Service')}&limit=1`);
        const servData = servRes.ok ? await servRes.json() : [];
        
        if (Array.isArray(servData) && servData.length > 0) {
          setLatestSermon(servData[0]);
        } else {
          setLatestSermon(null);
        }
      } catch (err) {
        console.error('Error fetching landing page data:', err);
        setLatestSermon(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="animate-slideup">
      {/* 1. Hero Carousel */}
      <HeroBanner />

      {/* 2. Pastoral Welcome Card */}
      <section className="section-padding container-box">
        <div className="glass-panel-static p-8 md:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4 text-center">
            <div className="relative inline-block">
              <div className="absolute -inset-1 rounded-full bg-amber-500/25 blur opacity-45 animate-pulse" />
              <img 
                src={resolveImageUrl(isValidImagePath(t('pastorImage')) ? t('pastorImage') : '/images/pastor-immanuel.png')} 
                alt="Pastor Immanuel"
                className="relative w-48 h-48 rounded-full object-cover border-4 border-amber-500 shadow-lg mx-auto bg-slate-950"
                onError={(e) => {
                  e.target.onerror = null;
                  const isHostinger = window.location.pathname.startsWith('/new') || window.location.hostname.includes('agsharjah.org');
                  e.target.src = isHostinger ? '/new/images/pastor-immanuel.png' : '/images/pastor-immanuel.png';
                }}
              />
            </div>
            <h3 className="font-serif font-bold text-xl text-white mt-4 leading-tight">
              {t('pastorName')}
            </h3>
            <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">
              Senior Pastor
            </span>
          </div>

          <div className="lg:col-span-8">
            <h2 className="heading-secondary text-white mb-6">
              {t('pastorMessageTitle')}
            </h2>
            <p className="text-slate-200 leading-relaxed text-base italic" style={{ whiteSpace: 'pre-line' }}>
              "{t('pastorMessageText')}"
            </p>
          </div>
        </div>
      </section>

      {/* 3. Latest Sunday Service Sermon Video */}
      {latestSermon && (
        <section className="bg-slate-950/45 border-t border-b border-slate-900/60 py-16">
          <div className="container-box">
            <div className="text-center mb-10">
              <span className="text-xs uppercase font-extrabold text-amber-400 tracking-widest block">
                {t('featuredSermon')}
              </span>
              <h2 className="font-serif font-bold text-3xl text-white mt-2">
                {t('joinUsTitle')}
              </h2>
            </div>
            
            <VideoPlayer video={latestSermon} autoplay={false} showFooter={false} />
            
            <div className="text-center mt-8">
              <Link to="/services" className="btn-secondary gap-2">
                {t('viewAllServices')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}



      {/* 5. Core Values */}
      <section className="bg-slate-950/60 border-t border-b border-slate-900 py-16">
        <div className="container-box grid-three">
          <div className="glass-panel-static cream-card p-6 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-xl">{t('valGospelTitle')}</h3>
            <p className="text-sm" style={{color: 'var(--text-muted)'}}>
              {t('valGospelDesc')}
            </p>
          </div>

          <div className="glass-panel-static cream-card p-6 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-xl">{t('valSanctuaryTitle')}</h3>
            <p className="text-sm" style={{color: 'var(--text-muted)'}}>
              {t('valSanctuaryDesc')}
            </p>
          </div>

          <div className="glass-panel-static cream-card p-6 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-xl">{t('valOutreachTitle')}</h3>
            <p className="text-sm" style={{color: 'var(--text-muted)'}}>
              {t('valOutreachDesc')}
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
