import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import VideoPlayer from '../components/VideoPlayer';
import { Search, Play, Calendar, User, Eye, ArrowUp, ArrowDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { API_BASE } from '../config';

const Services = () => {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [allSermons, setAllSermons] = useState([]);
  const [filteredSermons, setFilteredSermons] = useState([]);
  const [selectedSermon, setSelectedSermon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(18);

  // Search & Filter state variables
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [preacherFilter, setPreacherFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  // Static filter lists
  const STATIC_CATEGORIES = [
    'Sunday Service',
    'Midweek Prayer',
    'New Year Service',
    'Christmas Service',
    'Fasting Prayer',
    'Youth & Children',
    'Sisters Fellowship',
    'Retreats & Special'
  ];

  const STATIC_PREACHERS = [
    'Pastor Immanuel',
    'Rev. Andrew',
    'Bro. Durai',
    'Bro. William',
    'Asst. Past. Paulsamy',
    'Bro. Ruskin',
    'Br. Jeyaraj',
    'Pastor Regilin',
    'Sis. Mary Immanuel',
    'Bro. Gunaseelan'
  ];

  // Fetch all sermons from backend on component mount
  const fetchAllSermons = async () => {
    setLoading(true);
    try {
      // Query backend for all services (no filters initially so we can build dynamic select dropdowns)
      const res = await fetch(`${API_BASE}/api/services`);
      if (!res.ok) throw new Error('Failed to fetch sermons archive.');
      const data = await res.json();
      
      setAllSermons(data);
    } catch (err) {
      console.error('Error fetching sermons catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSermons();
  }, []);

  // Instant React filtering & sorting engine
  useEffect(() => {
    let result = [...allSermons];

    // 1. Keyword search (checks both title and description)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (sermon) =>
          (sermon.title && sermon.title.toLowerCase().includes(q)) ||
          (sermon.description && sermon.description.toLowerCase().includes(q))
      );
    }

    // 2. Category dynamic filter
    if (categoryFilter) {
      result = result.filter((sermon) => sermon.category === categoryFilter);
    }

    // 3. Preacher dynamic filter
    if (preacherFilter) {
      result = result.filter((sermon) => sermon.preacher === preacherFilter);
    }

    // 4. Chronological date & popularity sorting
    // Parse upload_date safely — null/missing dates sort to the bottom
    const toDate = (dateStr) => {
      if (!dateStr) return -Infinity;
      const ts = Date.parse(dateStr);
      return isNaN(ts) ? -Infinity : ts;
    };

    if (sortOrder === 'oldest') {
      result.sort((a, b) => {
        const da = toDate(a.upload_date), db_ = toDate(b.upload_date);
        // nulls go to the bottom even in oldest-first view
        if (da === -Infinity && db_ === -Infinity) return a.id - b.id;
        if (da === -Infinity) return 1;
        if (db_ === -Infinity) return -1;
        const dateDiff = da - db_;
        if (dateDiff !== 0) return dateDiff;
        return a.id - b.id;
      });
    } else if (sortOrder === 'popular') {
      result.sort((a, b) => {
        const viewDiff = (b.view_count || 0) - (a.view_count || 0);
        if (viewDiff !== 0) return viewDiff;
        return toDate(b.upload_date) - toDate(a.upload_date);
      });
    } else {
      // Default: newest first, nulls at bottom
      result.sort((a, b) => {
        const da = toDate(a.upload_date), db_ = toDate(b.upload_date);
        if (da === -Infinity && db_ === -Infinity) return b.id - a.id;
        if (da === -Infinity) return 1;
        if (db_ === -Infinity) return -1;
        const dateDiff = db_ - da;
        if (dateDiff !== 0) return dateDiff;
        return b.id - a.id;
      });
    }

    setFilteredSermons(result);
    setVisibleCount(18);
  }, [searchQuery, categoryFilter, preacherFilter, sortOrder, allSermons]);

  const handleSermonSelect = (sermon) => {
    setSelectedSermon(sermon);
    // Smooth scroll to the top of the video player display
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setPreacherFilter('');
    setSortOrder('newest');
  };

  return (
    <div className="animate-slideup min-h-screen bg-slate-950 pb-16 sm:pb-20">
      {/* Header Page Title Block */}
      <section 
        className="bg-slate-950/70 text-white py-14 sm:py-20 relative overflow-hidden border-b border-amber-500/25"
        style={{
          backgroundImage: t('bg_services') && t('bg_services') !== 'bg_services' ? `linear-gradient(rgba(10, 15, 30, 0.75), rgba(10, 15, 30, 0.75)), url(${t('bg_services')})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--primary-gold))]" style={{ filter: 'blur(100px)' }} />
        <div className="container-box text-center relative z-10">
          <span className="text-xs uppercase font-extrabold text-amber-400 tracking-[0.25em] block mb-3">
            {t('digitalWorshipArchives')}
          </span>
          <h1 id="sermons-page-title" className="heading-primary font-serif font-bold text-white leading-tight">
            {t('sermonsBroadcasts')}
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-xl mx-auto mt-4 leading-relaxed font-semibold">
            {t('watchRecentBroadcasts')}<span className="text-amber-400 font-bold">@AGSHARJAHTAMILCHURCH</span>.
          </p>

          {(() => {
            const rawParas = t('paras_services');
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

      {/* Video Player Display block */}
      {selectedSermon && (
        <section className="container-box py-10" id="sermon-player-view">
          <VideoPlayer 
            video={selectedSermon} 
            onClose={() => setSelectedSermon(null)} 
          />
        </section>
      )}

      {/* Filter Options Bar */}
      <section className="container-box py-6 sm:py-8" id="sermon-search-filters">
        <div className="glass-panel p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 border border-white/10 shadow-2xl bg-white/5 backdrop-blur-md">
          {/* Keyword Search Form */}
          <form onSubmit={(e) => e.preventDefault()} className="w-full relative">
            <input 
              id="sermon-keyword-search"
              type="text"
              placeholder={t('searchSermonsPlaceholder')}
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (val.trim()) {
                  setCategoryFilter('');
                  setPreacherFilter('');
                }
              }}
              className="input-control h-12 sm:h-auto pr-12 w-full bg-[#FAF7F0] border border-[#D2C2A4] text-slate-950 placeholder-slate-500 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 font-semibold shadow-sm"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#0A1128]">
              <Search className="w-5 h-5" />
            </div>
          </form>

          {/* Dynamic Select Filters — 2-col grid on mobile, row on sm+ */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between w-full">
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:flex-1">
              {/* Static Category Selector */}
              <select 
                id="sermon-category-select"
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setSearchQuery(''); // Instantly clear search bar on filter selection
                }}
                className="input-control py-2 px-2.5 text-xs font-bold text-white bg-slate-900 border border-white/10 w-full sm:w-auto focus:border-amber-500 cursor-pointer"
              >
                <option value="">{t('allCategories')}</option>
                {STATIC_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{t(cat)}</option>
                ))}
              </select>

              {/* Static Preacher Selector */}
              <select 
                id="sermon-preacher-select"
                value={preacherFilter}
                onChange={(e) => {
                  setPreacherFilter(e.target.value);
                  setSearchQuery(''); // Instantly clear search bar on filter selection
                }}
                className="input-control py-2 px-2.5 text-xs font-bold text-white bg-slate-900 border border-white/10 w-full sm:w-auto focus:border-amber-500 cursor-pointer"
              >
                <option value="">{t('allPreachers')}</option>
                {STATIC_PREACHERS.map((preacher) => (
                  <option key={preacher} value={preacher}>{t(preacher)}</option>
                ))}
              </select>

              {/* Sort order Selection */}
              <select 
                id="sermon-sort-select"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="input-control py-2 px-2.5 text-xs font-bold text-white bg-slate-900 border border-white/10 w-full sm:w-auto focus:border-amber-500 cursor-pointer col-span-2 sm:col-span-1"
              >
                <option value="newest">{t('newestUploads')}</option>
                <option value="oldest">{t('oldestUploads')}</option>
                <option value="popular">{t('mostPopular')}</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {(searchQuery || categoryFilter || preacherFilter || sortOrder !== 'newest') && (
              <button 
                id="clear-filters-btn"
                onClick={handleClearFilters}
                className="py-2 px-4 rounded text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-colors cursor-pointer w-full sm:w-auto text-center"
              >
                {t('resetFilters')}
              </button>
            )}
          </div>
        </div>
      </section>


      {/* Sermons count summary and dynamic catalog grid */}
      <section className="container-box pb-16" id="sermons-catalog-display">
        {loading ? (
          <div className="text-center py-20 text-amber-400/90 font-bold flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-300 text-sm tracking-wider mt-2">
              Synchronizing and loading sermon archives...
            </p>
          </div>
        ) : filteredSermons.length === 0 ? (
          <div className="text-center py-20 text-slate-300 glass-panel p-10 border border-white/10 bg-white/5">
            <h3 className="font-serif text-lg font-bold text-white mb-2">{t('noSermonsFound')}</h3>
            <p className="text-sm text-slate-400 mb-4 max-w-md mx-auto">
              {t('noSermonsDesc')}
            </p>
            <button 
              onClick={handleClearFilters}
              className="btn-primary py-2 px-6 inline-flex mx-auto"
            >
              {t('clearAllFilters')}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Sort indicator only — no count shown */}
            <div className="flex justify-end">
              <span className="flex items-center gap-1.5 text-amber-400 uppercase font-bold text-xs tracking-wider">
                {sortOrder === 'newest' && <><ArrowDown className="w-3.5 h-3.5" /> {t('latestFirst')}</>}
                {sortOrder === 'oldest' && <><ArrowUp className="w-3.5 h-3.5" /> {t('chronologicalOldest')}</>}
                {sortOrder === 'popular' && <><Eye className="w-3.5 h-3.5" /> {t('sortByPopularity')}</>}
              </span>
            </div>

            {/* Grid layout */}
            <div className="grid-three">
              {filteredSermons.slice(0, visibleCount).map((sermon) => (
                <article 
                  key={sermon.id}
                  id={`sermon-card-${sermon.id}`}
                  onClick={() => handleSermonSelect(sermon)}
                  className={`overflow-hidden cursor-pointer group flex flex-col justify-between border transition-all duration-300 shadow-lg rounded-xl relative ${isLight ? 'bg-[#FAF7F0] border-[#D2C2A4] hover:border-[#0A1128]/40 hover:shadow-md' : 'glass-panel border-white/10 hover:border-amber-500/40 bg-white/5 hover:bg-white/10'}`}
                >
                  {/* Video Thumbnail card */}
                  <div className="relative overflow-hidden bg-slate-950 aspect-video flex items-center justify-center shrink-0 border-b border-white/10">
                    <img 
                      src={`https://img.youtube.com/vi/${sermon.youtube_video_id}/mqdefault.jpg`}
                      alt={sermon.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-slate-950/50 group-hover:bg-slate-950/20 transition-colors" />
                    
                    {/* Play button micro-animation */}
                    <div className={`absolute w-12 h-12 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300 border ${isLight ? 'bg-[#0A1128] border-[#0A1128]/25 text-white' : 'bg-amber-500 border-white/20 text-slate-950'}`}>
                      <Play className={`w-5 h-5 pl-0.5 ${isLight ? 'fill-white text-white' : 'fill-slate-950 text-slate-950'}`} />
                    </div>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white text-[10px] font-bold border border-white/5">
                      {sermon.duration}
                    </span>
                  </div>

                  {/* Content details block */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-extrabold text-[#0A1128] dark:text-sky-400 tracking-wider">
                        {t(sermon.category)}
                      </span>
                      <h3 className={`font-serif font-bold text-base mt-1 mb-3 leading-snug transition-colors line-clamp-2 ${isLight ? 'text-[#0A1128] group-hover:text-amber-700' : 'text-white group-hover:text-amber-400'}`}>
                        {t(sermon.title)}
                      </h3>
                    </div>

                    <div className={`border-t pt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs font-semibold mt-auto ${isLight ? 'border-[#D2C2A4]/40 text-[#0A1128]' : 'border-white/10 text-slate-300'}`}>
                      <span className="flex items-center gap-1.5" title="Preacher name">
                        <User className="w-3.5 h-3.5 text-[#0A1128] dark:text-sky-400" />
                        {t(sermon.preacher)}
                      </span>
                      <span className="flex items-center gap-1.5" title="Broadcast upload date">
                        <Calendar className="w-3.5 h-3.5 text-[#0A1128] dark:text-sky-400" />
                        {sermon.upload_date ? t(sermon.upload_date) : <span className="text-slate-500 italic">Date unknown</span>}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {visibleCount < filteredSermons.length && (
              <div className="text-center mt-12">
                <button
                  id="load-more-btn"
                  onClick={() => setVisibleCount(prev => prev + 18)}
                  className="py-3 px-8 rounded-full font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all duration-300 shadow-lg hover:shadow-amber-500/25 cursor-pointer inline-flex items-center gap-2"
                >
                  {t('loadMoreSermons')}
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Services;
