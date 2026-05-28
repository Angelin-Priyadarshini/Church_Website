import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { User, Calendar, Tag, ArrowRight } from 'lucide-react';
import { API_BASE, resolveImageUrl } from '../config';

const Ministries = () => {
  const { t, language } = useLanguage();
  const [ministries, setMinistries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/ministries`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        const hiddenMinistries = [
          'ajman ministry',
          'choir ministry',
          'jeremiah ministry',
          'umm-al-quwain ministry',
          'umm al quwain ministry'
        ];
        const filtered = (Array.isArray(data) ? data : []).filter(
          min => !hiddenMinistries.includes(min.name.toLowerCase().trim())
        );
        setMinistries(filtered);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching ministries:', err);
        setMinistries([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="animate-slideup">
      {/* Header */}
      <section 
        className="bg-slate-950/65 text-white py-16 relative overflow-hidden border-b border-amber-500/20"
        style={{
          backgroundImage: t('bg_ministries') && t('bg_ministries') !== 'bg_ministries' ? `linear-gradient(rgba(10, 15, 30, 0.75), rgba(10, 15, 30, 0.75)), url(${t('bg_ministries')})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_var(--primary-gold))]" style={{ filter: 'blur(80px)' }} />
        <div className="container-box text-center relative z-10">
          <span className="text-xs uppercase font-extrabold text-amber-400 tracking-widest block">
            {t('fellowshipCircles')}
          </span>
          <h1 className="heading-primary font-serif font-bold text-white mt-2">
            {t('ministriesTitle')}
          </h1>
          <p className="text-slate-300 text-sm max-w-xl mx-auto mt-4">
            {t('ministriesSub')}
          </p>

          {(() => {
            const rawParas = t('paras_ministries');
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

      {/* Grid Spheres */}
      <section className="container-box section-padding">
        {loading ? (
          <div className="text-center py-16 text-slate-300 font-semibold">
            {t('fetchingActiveMinistries')}
          </div>
        ) : (
          <div className="grid-three">
            {ministries.map((min) => (
              <Link 
                key={min.id}
                to={`/ministries/${min.id}`}
                className="glass-panel overflow-hidden flex flex-col justify-between group cursor-pointer text-left block"
              >
                {/* Image block */}
                <div className="relative aspect-video overflow-hidden bg-slate-900 flex items-center justify-center shrink-0">
                  <img 
                    src={resolveImageUrl(min.image_url)} 
                    alt={t(min.name)}
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <span className="absolute bottom-4 left-4 font-serif font-bold text-white text-lg leading-tight">
                    {t(min.name)}
                  </span>
                </div>

                {/* Body block */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <p className="text-slate-300 text-sm leading-relaxed mb-6">
                    {t(min.description)}
                  </p>

                  <div className="border-t border-amber-500/10 pt-4 flex flex-col gap-2 text-xs font-semibold text-slate-400">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                      {t('scheduleLabel')}: <strong className="text-white font-bold pl-0.5">{t(min.schedule)}</strong>
                    </span>
                    <span className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-amber-400 shrink-0" />
                      {t('categoryLabel')}: <strong className="text-white font-bold pl-0.5">{t(min.category)}</strong>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Ministries;
