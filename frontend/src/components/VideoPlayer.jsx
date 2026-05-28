import React from 'react';
import { Calendar, User, Eye, Play } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const VideoPlayer = ({ video, onClose, autoplay = true }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  if (!video) return null;

  return (
    <div className={`overflow-hidden border shadow-2xl rounded-2xl max-w-4xl mx-auto w-full animate-slideup ${isLight ? 'bg-[#FAF7F0] border-[#D2C2A4]' : 'glass-panel-dark border-amber-500/30 bg-slate-950/85'}`}>
      {/* Title Bar */}
      <div className={`border-b px-6 py-4 flex justify-between items-center ${isLight ? 'bg-[#FAF7F0] border-[#D2C2A4] text-[#0A1128]' : 'bg-slate-950/95 border-amber-500/20 text-white'}`}>
        <div>
          <span className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>
            {video.category || 'Sunday Sermon'}
          </span>
          <h3 className={`font-serif font-bold text-lg leading-tight mt-0.5 ${isLight ? 'text-[#0A1128]' : 'text-white'}`}>
            {video.title}
          </h3>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className={`text-xs uppercase tracking-wider font-bold px-3 py-1.5 rounded transition-colors ${isLight ? 'bg-amber-500/10 hover:bg-amber-500/20 text-[#0A1128]' : 'bg-white/10 hover:bg-white/20 text-white'}`}
          >
            Close Player
          </button>
        )}
      </div>

      {/* Embedded IFrame Responsive block */}
      <div className="relative w-full overflow-hidden" style={{ paddingTop: '56.25%' }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full border-0"
          src={`https://www.youtube.com/embed/${video.youtube_video_id}?autoplay=${autoplay ? 1 : 0}&rel=0`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      {/* Meta details footer */}
      <div className={`p-6 border-t ${isLight ? 'bg-[#FAF7F0] border-[#D2C2A4]' : 'bg-slate-900/60 border-amber-500/20'}`}>
        <h4 className={`font-serif font-bold text-base sm:text-lg mb-4 leading-tight ${isLight ? 'text-[#0A1128]' : 'text-white'}`}>
          {video.title}
        </h4>
        <div className={`flex flex-wrap gap-6 text-sm font-semibold mb-2 ${isLight ? 'text-[#0A1128]' : 'text-slate-300'}`}>
          <span className="flex items-center gap-2">
            <User className={`w-4 h-4 ${isLight ? 'text-[#0A1128]' : 'text-amber-400'}`} />
            Preacher: <strong className={isLight ? 'text-[#0A1128]' : 'text-slate-100'}>{video.preacher || 'Pastor Immanuel'}</strong>
          </span>
          <span className="flex items-center gap-2">
            <Calendar className={`w-4 h-4 ${isLight ? 'text-[#0A1128]' : 'text-amber-400'}`} />
            Uploaded: <strong className={isLight ? 'text-[#0A1128]' : 'text-slate-100'}>{video.upload_date}</strong>
          </span>
          <span className="flex items-center gap-2">
            <Eye className={`w-4 h-4 ${isLight ? 'text-[#0A1128]' : 'text-amber-400'}`} />
            Views: <strong className={isLight ? 'text-[#0A1128]' : 'text-slate-100'}>{video.view_count || 0}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
