import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BookOpen, FileText, User, Bookmark } from 'lucide-react';
import { API_BASE } from '../config';
import Quiz from './Quiz';

const Resources = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('promises'); // 'promises' or 'quiz'
  const [devotionals, setDevotionals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResourcesData = async () => {
    try {
      const devRes = await fetch(`${API_BASE}/api/blog`);
      const devData = devRes.ok ? await devRes.json() : [];
      setDevotionals(Array.isArray(devData) ? devData : []);
    } catch (err) {
      console.error('Error fetching resources collections:', err);
      setDevotionals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResourcesData();
  }, []);

  return (
    <div className="animate-slideup">
      {/* Header */}
      <section 
        className="bg-slate-950/65 text-white py-16 relative overflow-hidden border-b border-amber-500/20"
        style={{
          backgroundImage: t('bg_resources') && t('bg_resources') !== 'bg_resources' ? `linear-gradient(rgba(10, 15, 30, 0.75), rgba(10, 15, 30, 0.75)), url(${t('bg_resources')})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_var(--primary-gold))]" style={{ filter: 'blur(80px)' }} />
        <div className="container-box text-center relative z-10">
          <span className="text-xs uppercase font-extrabold text-amber-400 tracking-widest block">
            {t('digitalAltarOutlines')}
          </span>
          <h1 className="heading-primary font-serif font-bold text-white mt-2">
            {activeTab === 'promises' ? t('navDailyPromises') : t('navBibleQuiz')}
          </h1>
          <p className="text-slate-300 text-sm max-w-xl mx-auto mt-4">
            {t('equipFamilyAltar')}
          </p>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="border-b border-amber-500/10 bg-transparent py-1">
        <div className="container-box flex justify-center gap-6">
          <button
            onClick={() => setActiveTab('promises')}
            className={`px-6 py-3.5 text-xs font-extrabold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 bg-transparent border-transparent cursor-pointer ${
              activeTab === 'promises'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            {t('navDailyPromises')}
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-6 py-3.5 text-xs font-extrabold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 bg-transparent border-transparent cursor-pointer ${
              activeTab === 'quiz'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            {t('navBibleQuiz')}
          </button>
        </div>
      </div>

      {/* Daily Promises Tab Content */}
      {activeTab === 'promises' && (
        <section className="container-box py-10">
          {loading ? (
            <div className="text-center py-16 text-slate-300 font-semibold">
              {t('fetchingResources')}
            </div>
          ) : (() => {
            const filteredDevs = devotionals;

            if (filteredDevs.length === 0) {
              return (
                <div className="text-center py-16 text-slate-400 font-medium italic">
                  {language === 'ta' ? 'தியானங்கள் எதுவும் கிடைக்கவில்லை.' : 'No devotionals found in this section.'}
                </div>
              );
            }

            return (
              <div className="flex flex-col gap-8 max-w-5xl mx-auto">
                {filteredDevs.map((post) => (
                  <article 
                    key={post.id}
                    className="glass-panel p-7 md:p-9 hover:shadow-md transition-all glow-hover flex flex-col gap-6"
                  >
                    <div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                        <span className="text-[11px] uppercase font-extrabold text-amber-400 tracking-wider">
                          {t(post.category)}
                        </span>
                      </div>
                      
                      <h3 className="font-serif font-bold text-2xl md:text-3xl text-white leading-snug text-left font-serif">
                        {t(post.title)}
                      </h3>
                    </div>

                    <p className="text-slate-300 text-base leading-8 text-left" style={{ whiteSpace: 'pre-line' }}>
                      {t(post.content)}
                    </p>

                    <div className="border-t border-amber-500/10 pt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400 font-semibold">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-amber-400" />
                        {t('writtenBy')}: <strong className="text-white">{t(post.author)}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                        {t('published')}: <strong className="text-white">{post.publish_date ? post.publish_date.split('T')[0] : ''}</strong>
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            );
          })()}
        </section>
      )}

      {/* Bible Quiz Tab Content */}
      {activeTab === 'quiz' && (
        <section className="py-6">
          <Quiz />
        </section>
      )}
    </div>
  );
};

export default Resources;
