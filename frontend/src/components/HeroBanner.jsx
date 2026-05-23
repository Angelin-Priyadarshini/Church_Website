import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ChevronLeft, ChevronRight, Play, HeartHandshake, HelpCircle } from 'lucide-react';

const HeroBanner = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: t('heroTitle1'),
      subtitle: t('heroSub1'),
      image: '/images/home-banner1.JPG',
      ctaText: t('watchSermons'),
      ctaLink: '/services',
      icon: <Play className="w-5 h-5" />
    },
    {
      title: t('heroTitle2'),
      subtitle: t('heroSub2'),
      image: '/images/prayer.jpg',
      ctaText: t('requestPrayer'),
      ctaLink: '/contact',
      icon: <HeartHandshake className="w-5 h-5" />
    },
    {
      title: t('heroTitle3'),
      subtitle: t('heroSub3'),
      image: '/images/banner1.jpg',
      ctaText: t('navMinistries'),
      ctaLink: '/ministries',
      icon: <HelpCircle className="w-5 h-5" />
    }
  ];

  // Auto-play slides every 6 seconds
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(slideInterval);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  return (
    <div className="relative w-full h-[550px] overflow-hidden bg-slate-950">
      {/* Slides mapping */}
      {slides.map((slide, idx) => (
        <div 
          key={idx}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Cover image overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${slide.image})`,
              filter: 'brightness(0.4) contrast(1.1)'
            }}
          />

          {/* Golden animated glow blurs */}
          <div 
            className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none"
            style={{ transform: 'translate(-50%, -50%)' }}
          />

          {/* Content container */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-4xl mx-auto px-6 text-center md:text-left md:px-12 w-full flex flex-col gap-6 animate-slideup">
              <span className="text-xs uppercase tracking-widest font-extrabold text-amber-400 block">
                {t('headerBrandSub')}
              </span>
              <h1 className="heading-primary font-serif font-bold text-white leading-tight max-w-3xl">
                {slide.title}
              </h1>
              <p className="text-lg md:text-xl text-slate-200 font-light max-w-2xl">
                {slide.subtitle}
              </p>
              <div className="flex flex-wrap gap-4 mt-2 justify-center md:justify-start">
                <button 
                  onClick={() => navigate(slide.ctaLink)}
                  className="btn-primary"
                >
                  {slide.icon}
                  {slide.ctaText}
                </button>
                <button 
                  onClick={() => navigate('/about')}
                  className="btn-secondary text-white border-white hover:bg-white hover:text-slate-900"
                >
                  {t('learnHistory')}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation arrows */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white border border-white/10 transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white border border-white/10 transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Index Indicators */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-3">
        {slides.map((_, idx) => (
          <button 
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              idx === currentSlide ? 'bg-amber-400 w-8' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;
