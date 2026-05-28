import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import HeroBanner from '../components/HeroBanner';
import VideoPlayer from '../components/VideoPlayer';
import { Calendar, Heart, Shield, HelpCircle, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../config';

const Home = () => {
  const { t } = useLanguage();
  const [schedules, setSchedules] = useState([]);
  const [latestSermon, setLatestSermon] = useState(null);
  const [testimonies, setTestimonies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch home data from backend APIs
    const fetchData = async () => {
      try {
        const [schedRes, servRes, testRes] = await Promise.all([
          fetch(`${API_BASE}/api/schedule`),
          fetch(`${API_BASE}/api/services?category=${encodeURIComponent('Sunday Service')}&limit=1`),
          fetch(`${API_BASE}/api/testimonies`)
        ]);
        
        const schedData = await schedRes.json();
        const servData = await servRes.json();
        const testData = await testRes.json();
        
        setSchedules(schedData);
        if (servData.length > 0) {
          setLatestSermon(servData[0]);
        }
        setTestimonies(testData.slice(0, 3)); // show top 3
      } catch (err) {
        console.error('Error fetching landing page data:', err);
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
                src={t('pastorImage') || '/images/pastor-immanuel.png'} 
                alt="Pastor Immanuel"
                className="relative w-48 h-48 rounded-full object-cover border-4 border-amber-500 shadow-lg mx-auto bg-slate-950"
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
            
            <VideoPlayer video={latestSermon} autoplay={false} />
            
            <div className="text-center mt-8">
              <Link to="/services" className="btn-secondary gap-2">
                {t('viewAllServices')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 4. Service Timings Schedule Grid */}
      <section className="section-padding container-box">
        <div className="text-center mb-12">
          <span className="text-xs uppercase font-extrabold text-amber-400 tracking-widest block">
            {t('weeklySchedule')}
          </span>
          <h2 className="heading-secondary">
            {t('timingTableTitle')}
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-400 font-semibold">Loading schedule...</div>
        ) : (
          <div className="glass-panel overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/70 text-amber-400 text-sm uppercase tracking-wider font-bold border-b border-amber-500/20">
                    <th className="p-4 md:p-6">{t('serviceName')}</th>
                    <th className="p-4 md:p-6">{t('serviceHour')}</th>
                    <th className="p-4 md:p-6">{t('serviceVenue')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {schedules.map((sched) => (
                    <tr key={sched.id} className="transition-colors">
                      <td className="p-4 md:p-6 font-semibold text-slate-200">{t(sched.name)}</td>
                      <td className="p-4 md:p-6 text-amber-400 font-bold">{t(sched.time)}</td>
                      <td className="p-4 md:p-6 text-slate-300 font-medium">{t(sched.location)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards List View */}
            <div className="block sm:hidden divide-y divide-slate-800">
              {schedules.map((sched) => (
                <div key={sched.id} className="p-5 flex flex-col gap-2 bg-slate-950/20 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-serif font-bold text-sm text-white">{t(sched.name)}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-xs font-bold shrink-0">{t(sched.time)}</span>
                  </div>
                  <div className="text-slate-400 text-xs font-semibold">
                    <span className="text-amber-400/80 mr-1">📍</span> {t(sched.location)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

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

      {/* 6. Testimonies Grid */}
      {testimonies.length > 0 && (
        <section className="section-padding container-box">
          <div className="text-center mb-12">
            <span className="text-xs uppercase font-extrabold text-amber-400 tracking-widest block">
              {t('testimoniesHeader')}
            </span>
            <h2 className="heading-secondary">
              {t('testimoniesSub')}
            </h2>
          </div>

          <div className="grid-three">
            {testimonies.map((test) => (
              <div
                key={test.id}
                className="glass-panel-static cream-card p-6 relative flex flex-col justify-between"
              >
                <div className="absolute top-4 right-4 text-amber-400">
                  <Star className="w-5 h-5 fill-amber-400" />
                </div>
                <div className="mb-4">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block mb-2">
                    {t(test.category) || 'Miracle'}
                  </span>
                  <p className="text-sm leading-relaxed italic" style={{color: 'var(--text-muted)'}}>
                    "{t(test.story_text)}"
                  </p>
                </div>
                <div className="border-t pt-4" style={{borderColor: 'var(--border-glass)'}}>
                  <span className="font-bold text-sm" style={{color: 'var(--text-main)'}}>{test.author_name}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/contact" className="btn-primary">
              {t('submitYourStory')}
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
