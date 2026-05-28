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

      {/* Tabs Selector Bar */}
      <section className="container-box pt-12">
        <div className="mx-auto flex w-full max-w-2xl rounded-lg border border-amber-500/20 bg-white/5 p-1.5 shadow-sm">
          <button 
            onClick={() => setActiveTab('devotionals')}
            className={`flex-1 rounded-md px-4 py-3 text-sm font-bold transition-all ${
              activeTab === 'devotionals' 
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:bg-white/10 hover:text-amber-400'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <BookOpen className="w-5 h-5" />
              {t('devotionalsTitle')}
            </span>
          </button>

          <button 
            onClick={() => setActiveTab('files')}
            className={`flex-1 rounded-md px-4 py-3 text-sm font-bold transition-all ${
              activeTab === 'files' 
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:bg-white/10 hover:text-amber-400'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <FileText className="w-5 h-5" />
              {t('downloadGuides')}
            </span>
          </button>
        </div>
      </section>

      {/* Dynamic Tab Panels */}
      <section className="container-box py-12 md:py-16">
        {loading ? (
          <div className="text-center py-16 text-slate-300 font-semibold">
            {t('fetchingResources')}
          </div>
        ) : activeTab === 'devotionals' ? (
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
                  
                  <h3 className="font-serif font-bold text-2xl md:text-3xl text-white leading-snug">
                    {t(post.title)}
                  </h3>
                </div>

                <p className="text-slate-300 text-base leading-8" style={{ whiteSpace: 'pre-line' }}>
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
        ) : (
          /* FILES CATALOG PANEL */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
            {resources.map((file) => (
              <div 
                key={file.id}
                className="glass-panel p-7 flex flex-col justify-between min-h-[260px]"
              >
                <div>
                  <div className="w-12 h-12 rounded-lg bg-red-950/40 text-red-400 flex items-center justify-center mb-5 border border-red-900/30 font-bold text-xs shrink-0">
                    PDF
                  </div>
                  <span className="text-[11px] uppercase font-extrabold text-amber-400 tracking-wider block mb-2">
                    {t(file.category)}
                  </span>
                  <h3 className="font-serif font-bold text-xl text-white mb-3 leading-snug">
                    {t(file.title)}
                  </h3>
                  <p className="text-slate-300 text-sm leading-6 mb-8">
                    {t(file.description)}
                  </p>
                </div>

                <div className="border-t border-amber-500/10 pt-5 flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-400 font-semibold">
                    {file.download_count || 0} {t('downloadsCount')}
                  </span>

                  <button 
                    onClick={() => handleDownload(file)}
                    className="btn-primary py-2 px-4 gap-2 text-xs"
                  >
                    <Download className="w-4 h-4" />
                    {t('downloadBtn')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Resources;
