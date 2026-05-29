import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BookOpen, FileText, Download, Clock, User, Bookmark } from 'lucide-react';
import { API_BASE } from '../config';

const Resources = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('devotionals'); // devotionals or files
  const [devotionals, setDevotionals] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResourcesData = async () => {
    try {
      const [devRes, fileRes] = await Promise.all([
        fetch(`${API_BASE}/api/blog`),
        fetch(`${API_BASE}/api/resources`)
      ]);

      const devData = devRes.ok ? await devRes.json() : [];
      const fileData = fileRes.ok ? await fileRes.json() : [];

      setDevotionals(Array.isArray(devData) ? devData : []);
      setResources(Array.isArray(fileData) ? fileData : []);
    } catch (err) {
      console.error('Error fetching resources collections:', err);
      setDevotionals([]);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResourcesData();
  }, []);

  const handleDownload = async (file) => {
    try {
      // API call to increment counter
      await fetch(`${API_BASE}/api/resources/${file.id}/download`, {
        method: 'POST'
      });
      
      // Simulate file download by opening pdf in new tab (or downloading)
      window.open(`${API_BASE}${file.file_url}`, '_blank');
      
      // Refresh list to update counters
      fetchResourcesData();
    } catch (err) {
      console.error('Download registration failed:', err);
    }
  };

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
            {t('libraryDevotionals')}
          </h1>
          <p className="text-slate-300 text-sm max-w-xl mx-auto mt-4">
            {t('equipFamilyAltar')}
          </p>

          {(() => {
            const rawParas = t('paras_resources');
            let additionalParas = [];
            try {
              additionalParas = typeof rawParas === 'string' ? JSON.parse(rawParas) : rawParas;
            } catch (e) {
              additionalParas = [];
            }
            if (!Array.isArray(additionalParas)) additionalParas = [];
            return additionalParas.map((p, idx) => (
              <p key={idx} className="text-slate-300 text-xs md:text-sm max-w-xl mx-auto mt-3 leading-relaxed">
                {language === 'ta' ? p.ta : p.en}
              </p>
            ));
          })()}
        </div>
      </section>

      {/* Devotionals Feed */}
      <section className="container-box py-12 md:py-16">
        {loading ? (
          <div className="text-center py-16 text-slate-300 font-semibold">
            {t('fetchingResources')}
          </div>
        ) : (
          /* DEVOTIONALS PANEL */
          <div className="flex flex-col gap-8 max-w-5xl mx-auto">
            {devotionals.map((post) => (
              <article 
                key={post.id}
                className="glass-panel p-7 md:p-9 hover:shadow-md transition-all glow-hover flex flex-col gap-6"
              >
                <div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                    <span className="text-[11px] uppercase font-extrabold text-amber-400 tracking-wider">
                      {t(post.category)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {post.read_time_minutes} {t('readTime')}
                    </span>
                  </div>
                  
                  <h3 className="font-serif font-bold text-2xl md:text-3xl text-white leading-snug text-left">
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
                    {t('published')}: <strong className="text-white">{t(post.publish_date)}</strong>
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Resources;
