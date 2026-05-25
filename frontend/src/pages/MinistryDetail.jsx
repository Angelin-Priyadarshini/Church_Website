import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { User, Calendar, Tag, ArrowLeft, ArrowRight, HeartHandshake, PhoneCall } from 'lucide-react';
import { API_BASE } from '../config';

const MinistryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [ministry, setMinistry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`${API_BASE}/api/ministries/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Ministry details not found.');
        }
        return res.json();
      })
      .then((data) => {
        setMinistry(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching ministry details:', err);
        setError(err.message || 'Server error loading ministry details.');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-amber-400 gap-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-300 text-sm tracking-wider font-semibold">
          {language === 'ta' ? 'விபரங்களை ஏற்றுகிறது...' : 'Loading ministry details...'}
        </p>
      </div>
    );
  }

  if (error || !ministry) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6">
        <div className="glass-panel p-8 max-w-md border border-white/10 bg-white/5">
          <h2 className="text-xl font-serif font-bold text-white mb-2">
            {language === 'ta' ? 'விபரங்களை ஏற்ற முடியவில்லை' : 'Ministry Not Found'}
          </h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            {error || (language === 'ta' ? 'நீங்கள் தேடிய ஊழியம் பற்றிய தகவல்கள் கிடைக்கவில்லை.' : 'We could not find the active ministry information matching this link.')}
          </p>
          <Link to="/ministries" className="btn-primary py-2.5 px-6 justify-center w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'ta' ? 'ஊழியங்கள் பக்கத்திற்குச் செல்லவும்' : 'Back to All Ministries'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slideup min-h-screen bg-slate-950 pb-20">
      {/* 1. Header Banner */}
      <section className="bg-slate-950/65 text-white py-20 relative overflow-hidden border-b border-amber-500/20">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--primary-gold))]" style={{ filter: 'blur(100px)' }} />
        <div className="container-box text-center relative z-10">
          <Link 
            to="/ministries" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-500 transition-colors uppercase tracking-wider mb-6 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'ta' ? 'அனைத்து ஊழியங்கள்' : 'All Ministries'}
          </Link>
          <span className="text-xs uppercase font-extrabold text-amber-400 tracking-[0.2em] block mb-3">
            {t(ministry.category)}
          </span>
          <h1 className="heading-primary font-serif font-bold text-white leading-tight">
            {t(ministry.name)}
          </h1>
        </div>
      </section>

      {/* 2. Detailed Profile Section */}
      <section className="container-box py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        {/* Left Side: Descriptive Card */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="relative overflow-hidden aspect-video rounded-2xl border border-white/10 bg-slate-950 shadow-2xl">
            <img 
              src={ministry.image_url} 
              alt={ministry.name}
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/15 to-transparent" />
          </div>
          
          <div className="glass-panel p-8 border border-white/10 bg-white/5 backdrop-blur-md">
            <h2 className="font-serif font-bold text-2xl text-white mb-4">
              {language === 'ta' ? 'ஊழியத்தின் தரிசனம் & நோக்கம்' : 'Mission & Core Purpose'}
            </h2>
            <p className="text-slate-200 leading-relaxed text-base mb-6 font-medium">
              {t(ministry.description)}
            </p>
            <p className="text-slate-300 leading-relaxed text-sm">
              {language === 'ta' 
                ? 'இவ்ஊழியமானது எமது ஏஜி ஷார்ஜா தமிழ் சபையின் மிக முக்கியமான ஒரு தூணாக விளங்குகிறது. தேவனுடைய அன்பை பகிர்ந்துகொள்ளவும், விசுவாசிகளை கிறிஸ்துவின் அறிவிலும் சத்தியத்திலும் வளர்க்கவும், குடும்பங்களை ஆவிக்குரிய ஜீவியத்தில் கட்டியெழுப்பவும் இவ்ஊழியம் அர்ப்பணிக்கப்பட்டுள்ளது.' 
                : 'This ministry operates as a vital pillar of the Assemblies of God Sharjah Tamil Church. It is committed to fostering authentic fellowship, strengthening spiritual values, and ensuring that families and workers in Sharjah are equipped with pastoral care and prayer outreach.'}
            </p>
          </div>
        </div>

        {/* Right Side: Metadata / Leader Card */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Metadata Card */}
          <div className="glass-panel p-6 border border-white/10 bg-white/5 backdrop-blur-md flex flex-col gap-5">
            <h3 className="font-serif font-bold text-xl text-white border-b border-white/10 pb-3">
              {language === 'ta' ? 'ஊழிய விபரங்கள்' : 'Ministry Details'}
            </h3>

            <div className="flex flex-col gap-4 text-sm font-semibold text-slate-300">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block uppercase font-bold">{t('scheduleLabel')}</span>
                  <strong className="text-white text-base font-bold mt-0.5 block">{t(ministry.schedule)}</strong>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block uppercase font-bold">{t('categoryLabel')}</span>
                  <strong className="text-white text-base font-bold mt-0.5 block">{t(ministry.category)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Call-to-action block */}
          <div className="glass-panel-dark p-6 bg-slate-900/60 border border-amber-500/15 flex flex-col gap-4 text-center glow-hover">
            <div className="w-11 h-11 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
              <HeartHandshake className="w-5.5 h-5.5" />
            </div>
            <h4 className="font-serif font-bold text-lg text-white">
              {language === 'ta' ? 'இவ்ஊழியத்தில் இணைய விரும்புகிறீர்களா?' : 'Want to Get Involved?'}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
              {language === 'ta'
                ? 'ஆலயத்தின் ஆவிக்குரிய ஊழியங்களில் பங்குபெற அல்லது எமது intercessory ஜெபக் குழுவினரோடு இணைய எங்களைத் தொடர்பு கொள்ளுங்கள்!'
                : 'If you feel a calling to serve or want to join this ministry, please reach out to our pastoral team for further guidance!'}
            </p>
            <Link to="/contact" className="btn-primary py-2.5 px-6 justify-center mt-2">
              <PhoneCall className="w-4 h-4 mr-2" />
              {language === 'ta' ? 'தொடர்பு கொள்ள' : 'Contact Pastoral Team'}
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Photo Gallery Section */}
      {(() => {
        let gallery = [];
        if (ministry.gallery_urls) {
          try {
            gallery = typeof ministry.gallery_urls === 'string' ? JSON.parse(ministry.gallery_urls) : ministry.gallery_urls;
          } catch (e) {
            gallery = [];
          }
        }
        if (!Array.isArray(gallery)) {
          gallery = [];
        }

        if (gallery.length === 0) return null;

        return (
          <section className="container-box py-12 border-t border-slate-900/60">
            <div className="text-center mb-8 animate-slideup">
              <span className="text-xs uppercase font-extrabold text-amber-400 tracking-widest block">
                {language === 'ta' ? 'புகைப்பட தொகுப்பு' : 'Photo Gallery'}
              </span>
              <h2 className="heading-secondary mt-1">
                {language === 'ta' ? 'ஊழியத்தின் புகைப்படங்கள்' : 'Ministry Moments'}
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-slideup">
              {gallery.map((url, idx) => (
                <div 
                  key={idx} 
                  className="relative overflow-hidden aspect-square rounded-xl border border-white/10 bg-slate-950 group shadow-lg hover:border-amber-500/35 transition-all duration-300"
                >
                  <img 
                    src={url} 
                    alt={`Ministry moment ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              ))}
            </div>
          </section>
        );
      })()}
    </div>
  );
};

export default MinistryDetail;
