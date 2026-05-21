import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import VideoPlayer from '../components/VideoPlayer';
import { Search, Filter, Play, Calendar, User, Eye } from 'lucide-react';
import { API_BASE } from '../config';

const Services = () => {
  const { t } = useLanguage();
  const [sermons, setSermons] = useState([]);
  const [selectedSermon, setSelectedSermon] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter state variables
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [preacherFilter, setPreacherFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  const fetchSermons = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        search: searchQuery,
        category: categoryFilter,
        preacher: preacherFilter,
        sort: sortOrder
      });
      const res = await fetch(`${API_BASE}/api/services?${queryParams.toString()}`);
      const data = await res.json();
      setSermons(data);
      // Auto-set the first video as featured if none selected yet
      if (data.length > 0 && !selectedSermon) {
        setSelectedSermon(null);
      }
    } catch (err) {
      console.error('Error fetching sermons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSermons();
  }, [categoryFilter, preacherFilter, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSermons();
  };

  const handleSermonSelect = async (sermon) => {
    setSelectedSermon(sermon);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  return (
    <div className="animate-slideup">
      {/* Header */}
      <section className="bg-slate-950/65 text-white py-16 relative overflow-hidden border-b border-amber-500/20">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_var(--primary-gold))]" style={{ filter: 'blur(80px)' }} />
        <div className="container-box text-center relative z-10">
          <span className="text-xs uppercase font-extrabold text-amber-400 tracking-widest block">
            YouTube Service Broadcasts
          </span>
          <h1 className="heading-primary font-serif font-bold text-white mt-2">
            Sermons & Archives
          </h1>
          <p className="text-slate-300 text-sm max-w-xl mx-auto mt-4">
            Browse and watch our Sunday Tamil messages from our official channel: <strong>@AGSHARJAHTAMILCHURCH</strong>.
          </p>
        </div>
      </section>

      {/* Video Player Display block */}
      {selectedSermon && (
        <section className="container-box py-10">
          <VideoPlayer 
            video={selectedSermon} 
            onClose={() => setSelectedSermon(null)} 
          />
        </section>
      )}

      {/* Filter Options Bar */}
      <section className="container-box py-8">
        <div className="glass-panel p-5 flex flex-wrap gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[280px] relative">
            <input 
              type="text"
              placeholder="Search sermons by topic, title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-control pr-12 w-full"
            />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-amber-500/20 text-amber-400 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>

          <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
            {/* Category selection */}
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-control py-2 text-sm w-full sm:w-auto"
            >
              <option value="">All Categories</option>
              <option value="Sunday Service">Sunday Service</option>
              <option value="Midweek Prayer">Midweek Prayer</option>
              <option value="Sisters Fellowship">Sisters Fellowship</option>
            </select>

            {/* Preacher selection */}
            <select 
              value={preacherFilter}
              onChange={(e) => setPreacherFilter(e.target.value)}
              className="input-control py-2 text-sm w-full sm:w-auto"
            >
              <option value="">All Preachers</option>
              <option value="Pastor Immanuel">Pastor Immanuel</option>
              <option value="Sis. Mary Immanuel">Sis. Mary Immanuel</option>
              <option value="Bro. Gunaseelan">Bro. Gunaseelan</option>
            </select>

            {/* Sort order selection */}
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="input-control py-2 text-sm w-full sm:w-auto"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </section>

      {/* Sermons grid display block */}
      <section className="container-box pb-16">
        {loading ? (
          <div className="text-center py-16 text-slate-300 font-semibold">
            Fetching sermon archives...
          </div>
        ) : sermons.length === 0 ? (
          <div className="text-center py-16 text-slate-300 glass-panel p-8">
            No sermons found matching the chosen search criteria.
          </div>
        ) : (
          <div className="grid-three">
            {sermons.map((sermon) => (
              <div 
                key={sermon.id}
                onClick={() => handleSermonSelect(sermon)}
                className="glass-panel overflow-hidden cursor-pointer group flex flex-col justify-between"
              >
                {/* Thumbnail card */}
                <div className="relative overflow-hidden bg-slate-950 aspect-video flex items-center justify-center shrink-0">
                  <img 
                    src={`https://img.youtube.com/vi/${sermon.youtube_video_id}/mqdefault.jpg`}
                    alt={sermon.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/10 transition-colors" />
                  <div className="absolute w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 fill-slate-950 pl-0.5" />
                  </div>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold">
                    {sermon.duration}
                  </span>
                </div>

                {/* Content details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                      {sermon.category}
                    </span>
                    <h3 className="font-serif font-bold text-base text-white mt-1 mb-2 leading-snug group-hover:text-amber-400 transition-colors line-clamp-2">
                      {sermon.title}
                    </h3>
                  </div>

                  <div className="border-t border-amber-500/10 pt-3 flex items-center justify-between text-xs text-slate-300 font-semibold">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      {sermon.preacher}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      {sermon.upload_date}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Services;
