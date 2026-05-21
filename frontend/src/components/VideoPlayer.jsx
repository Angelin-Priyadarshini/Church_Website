import React from 'react';
import { Calendar, User, Eye, Play } from 'lucide-react';

const VideoPlayer = ({ video, onClose }) => {
  if (!video) return null;

  return (
    <div className="glass-panel-dark overflow-hidden border border-amber-500/30 shadow-2xl bg-slate-950/85 max-w-4xl mx-auto w-full animate-slideup">
      {/* Title Bar */}
      <div className="bg-slate-950/95 border-b border-amber-500/20 text-white px-6 py-4 flex justify-between items-center">
        <div>
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
            {video.category || 'Sunday Sermon'}
          </span>
          <h3 className="font-serif font-bold text-lg text-white leading-tight mt-0.5">
            {video.title}
          </h3>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-xs uppercase tracking-wider font-bold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded transition-colors text-white"
          >
            Close Player
          </button>
        )}
      </div>

      {/* Embedded IFrame Responsive block */}
      <div className="relative w-full overflow-hidden" style={{ paddingTop: '56.25%' }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full border-0"
          src={`https://www.youtube.com/embed/${video.youtube_video_id}?autoplay=1&rel=0`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      {/* Meta details footer */}
      <div className="p-6 bg-slate-900/60 border-t border-amber-500/20">
        <div className="flex flex-wrap gap-6 text-sm text-slate-300 font-semibold mb-4">
          <span className="flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            Preacher: <strong className="text-slate-100">{video.preacher || 'Pastor Immanuel'}</strong>
          </span>
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            Uploaded: <strong className="text-slate-100">{video.upload_date}</strong>
          </span>
          <span className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-400" />
            Views: <strong className="text-slate-100">{video.view_count || 0}</strong>
          </span>
        </div>
        
        <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-4 rounded-lg border border-amber-500/10">
          {video.description || 'Join us in worship and study. This service recording brings you closer to the Word of God.'}
        </p>
      </div>
    </div>
  );
};

export default VideoPlayer;
