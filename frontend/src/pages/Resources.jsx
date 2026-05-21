import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { BookOpen, FileText, Download, Clock, User, Bookmark } from 'lucide-react';
import { API_BASE } from '../config';

const Resources = () => {
  const { t } = useLanguage();
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

      const devData = await devRes.json();
      const fileData = await fileRes.json();

      setDevotionals(devData);
      setResources(fileData);
    } catch (err) {
      console.error('Error fetching resources collections:', err);
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
      <section className="bg-slate-950/65 text-white py-16 relative overflow-hidden border-b border-amber-500/20">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_var(--primary-gold))]" style={{ filter: 'blur(80px)' }} />
        <div className="container-box text-center relative z-10">
          <span className="text-xs uppercase font-extrabold text-amber-400 tracking-widest block">
            Digital Altar Outlines
          </span>
          <h1 className="heading-primary font-serif font-bold text-white mt-2">
            Library & Devotionals
          </h1>
          <p className="text-slate-300 text-sm max-w-xl mx-auto mt-4">
            Equip your family altar fellowships and children bible studies with standard scripture devotionals and workbook guides.
          </p>
        </div>
      </section>

      {/* Tabs Selector Bar */}
      <section className="container-box pt-10">
        <div className="flex justify-center border-b border-amber-500/20 gap-6">
          <button 
            onClick={() => setActiveTab('devotionals')}
            className={`pb-4 text-base font-bold transition-all relative ${
              activeTab === 'devotionals' 
                ? 'text-amber-400 font-extrabold border-b-2 border-amber-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              {t('devotionalsTitle')}
            </span>
          </button>

          <button 
            onClick={() => setActiveTab('files')}
            className={`pb-4 text-base font-bold transition-all relative ${
              activeTab === 'files' 
                ? 'text-amber-400 font-extrabold border-b-2 border-amber-500'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Download Guides
            </span>
          </button>
        </div>
      </section>

      {/* Dynamic Tab Panels */}
      <section className="container-box py-10">
        {loading ? (
          <div className="text-center py-16 text-slate-300 font-semibold">
            Fetching resources library...
          </div>
        ) : activeTab === 'devotionals' ? (
          /* DEVOTIONALS PANEL */
          <div className="flex flex-col gap-8 max-w-3xl mx-auto">
            {devotionals.map((post) => (
              <article 
                key={post.id}
                className="glass-panel p-6 hover:shadow-md transition-all glow-hover flex flex-col gap-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {post.read_time_minutes} {t('readTime')}
                    </span>
                  </div>
                  
                  <h3 className="font-serif font-bold text-xl text-white leading-snug">
                    {post.title}
                  </h3>
                </div>

                <p className="text-slate-300 text-sm leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
                  {post.content}
                </p>

                <div className="border-t border-amber-500/10 pt-3 flex items-center justify-between text-xs text-slate-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    Written by: <strong className="text-white">{post.author}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                    Published: <strong className="text-white">{post.publish_date}</strong>
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          /* FILES CATALOG PANEL */
          <div className="grid-three">
            {resources.map((file) => (
              <div 
                key={file.id}
                className="glass-panel p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-red-950/40 text-red-400 flex items-center justify-center mb-4 border border-red-900/30 font-bold text-xs shrink-0">
                    PDF
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    {file.category}
                  </span>
                  <h3 className="font-serif font-bold text-base text-white mb-2 leading-snug">
                    {file.title}
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed mb-6">
                    {file.description}
                  </p>
                </div>

                <div className="border-t border-amber-500/10 pt-4 flex items-center justify-between">
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
