import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert, BookOpen, Clock, Heart, Users } from 'lucide-react';
import { resolveImageUrl } from '../config';

const About = () => {
  const { t, language } = useLanguage();
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  // Dynamic Statements of Faith from database
  const rawFaith = t('faithStatements');
  let faithStatements = [];
  try {
    faithStatements = typeof rawFaith === 'string' ? JSON.parse(rawFaith) : rawFaith;
  } catch (e) {
    faithStatements = [];
  }
  if (!Array.isArray(faithStatements) || faithStatements.length === 0) {
    faithStatements = [
      {
        titleEn: "The Scriptures Inspired",
        titleTa: "வேதவசனங்களின் தெய்வீக உத்வேகம்",
        descEn: "The Bible is the inspired, infallible Word of God, a divine revelation and the authoritative rule of faith and conduct.",
        descTa: "சத்திய வேதாகமம் தேவ ஆவியினால் அருளப்பட்டதும், தவறுகளற்றதும், விசுவாசத்திற்கும் ஜீவியத்திற்கும் அதிகாரம் கொண்ட தேவ வெளிப்பாடாகும்."
      },
      {
        titleEn: "The One True God",
        titleTa: "ஒரே மெய்யான தேவன்",
        descEn: "The one true God has revealed Himself as the eternally self-existent \"I AM,\" the Creator of heaven and earth, manifested as Father, Son, and Holy Spirit.",
        descTa: "ஒரே மெய்யான தேவன் தம்மை நித்திய சுயம்புவாகிய \"நான் இருக்கிறவராக இருக்கிறேன்\" என்றும், வானத்தையும் பூமியையும் படைத்த சிருஷ்டிகராகவும், பிதா, குமாரன், பரிசுத்த ஆவியாக வெளிப்படுத்தியுள்ளார்."
      },
      {
        titleEn: "Salvation of Man",
        titleTa: "மனிதனின் இரட்சிப்பு",
        descEn: "Man's only hope of redemption is through the shed blood of Jesus Christ the Son of God, received by faith and repentance.",
        descTa: "தேவ குமாரனாகிய இயேசு கிறிஸ்துவின் சிந்தப்பட்ட இரத்தத்தின் மூலமே மனிதனுக்கு மீட்பு உண்டு, இது விசுவாசத்தாலும் மனந்திரும்புதலாலும் பெறப்படுகிறது."
      },
      {
        titleEn: "Baptism in the Holy Spirit",
        titleTa: "பரிசுத்த ஆவியின் அபிஷேகம்",
        descEn: "All believers are entitled to and should ardently expect the promise of the Father, the baptism in the Holy Spirit, which gives power for life and service.",
        descTa: "விசுவாசிகள் அனைவரும் பிதாவின் வாக்குத்தத்தமாகிய பரிசுத்த ஆவியின் அபிஷேகத்தை ஆவலோடு எதிர்பார்க்க வேண்டும், இது கிறிஸ்தவ ஜீவியத்திற்கும் ஊழியத்திற்கும் வல்லமையளிக்கிறது."
      }
    ];
  }

  // Dynamic Milestones from database
  const rawMilestones = t('milestones');
  let milestones = [];
  try {
    milestones = typeof rawMilestones === 'string' ? JSON.parse(rawMilestones) : rawMilestones;
  } catch (e) {
    milestones = [];
  }
  if (!Array.isArray(milestones) || milestones.length === 0) {
    milestones = [
      {
        year: "1996",
        titleEn: "Humble Beginnings",
        titleTa: "எளிய ஆரம்பம்",
        descEn: "Started as a weekly bilingually home fellowship in Sharjah, with a focus on supporting regional expatriate workers.",
        descTa: "ஷார்ஜாவில் ஒரு எளிய இல்ல ஜெபக் கூட்டமாகத் தொடங்கப்பட்டு, தூரதேசத்தில் வாழும் உழைப்பாளர்களை ஆவிக்குரிய ரீதியில் ஆதரிப்பதை நோக்கமாகக் கொண்டு ஆரம்பிக்கப்பட்டது."
      },
      {
        year: "2005",
        titleEn: "Transport fleet launched",
        titleTa: "போக்குவரத்து சேவை துவக்கம்",
        descEn: "Purchased our first shuttle bus to fetch Tamil laborers completely free of charge from far-flung industrial camps.",
        descTa: "தொளிலாளர்கள் எவ்வித சிரமமுமின்றி ஆராதனையில் கலந்து கொள்ள தூர முகாம்களில் இருந்து முற்றிலும் இலவசமாக அழைத்து வர முதல் பேருந்து வாங்கப்பட்டது."
      },
      {
        year: "2016",
        titleEn: "Expanded Cell Fellowships",
        titleTa: "வீட்டு ஐக்கியங்கள் விரிவாக்கம்",
        descEn: "Formally established regional cell fellowships to expand weekly home ministries across neighboring communities.",
        descTa: "அண்டை பகுதிகளில் முறையான வாராந்திர வீட்டு ஐக்கியங்கள் மற்றும் ஜெபக் குழுக்கள் ஏற்படுத்தப்பட்டு ஊழியங்கள் விரிவுபடுத்தப்பட்டன."
      }
    ];
  }

  // Dynamic Additional Paragraphs from database
  const rawParas = t('paras_about');
  let additionalParas = [];
  try {
    additionalParas = typeof rawParas === 'string' ? JSON.parse(rawParas) : rawParas;
  } catch (e) {
    additionalParas = [];
  }
  if (!Array.isArray(additionalParas)) {
    additionalParas = [];
  }

  // Dynamic Congregation Image Helper
  const getAboutImage = () => {
    const rawImages = t('aboutImages');
    if (rawImages && rawImages !== 'aboutImages') {
      try {
        const parsed = JSON.parse(rawImages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        }
      } catch (e) {}
    }
    const singleImg = t('aboutImage');
    if (singleImg && singleImg !== 'aboutImage') {
      return singleImg;
    }
    return "/images/home-banner1.JPG";
  };

  return (
    <div className={`animate-slideup ${isLocal ? 'about-localhost-fonts' : ''}`}>
      {/* 1. Header Banner */}
      <section 
        className="bg-slate-950/65 text-white py-16 relative overflow-hidden border-b border-amber-500/20"
        style={{
          backgroundImage: t('bg_about') && t('bg_about') !== 'bg_about' ? `linear-gradient(rgba(10, 15, 30, 0.75), rgba(10, 15, 30, 0.75)), url(${resolveImageUrl(t('bg_about'))})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_var(--primary-gold))]" style={{ filter: 'blur(80px)' }} />
        <div className="container-box text-center relative z-10">
          <span className="text-xs uppercase font-extrabold text-amber-400 tracking-widest block">
            Assemblies of God Sharjah
          </span>
          <h1 className="heading-primary font-serif font-bold text-white mt-2">
            {t('navAbout')}
          </h1>
          <p className="text-slate-300 text-sm max-w-xl mx-auto mt-4">
            {t('aboutHeaderSub')}
          </p>
        </div>
      </section>

      {/* 2. Vision Statement */}
      <section className="section-padding container-box grid-two items-center">
        <div>
          <h2 className="heading-secondary">
            {t('aboutTitle')}
          </h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            {t('aboutPara1')}
          </p>
          <p className="text-slate-300 leading-relaxed mb-4">
            {t('aboutPara2')}
          </p>
          
          {/* Dynamic Extra Paragraphs */}
          {additionalParas.map((p, idx) => (
            <p key={idx} className="text-slate-300 leading-relaxed mb-4">
              {language === 'ta' ? p.ta : p.en}
            </p>
          ))}

          <p className="text-amber-400 leading-relaxed font-bold text-base mt-6">
            "{t('aboutMission')}"
          </p>
        </div>
        
        <div className="relative">
          <div className="absolute -inset-1 rounded-2xl bg-amber-500/20 blur opacity-45 pointer-events-none animate-pulse" />
          <img 
            src={resolveImageUrl(getAboutImage())} 
            alt="Church Congregation"
            className="relative w-full h-[360px] object-cover rounded-2xl shadow-2xl border border-amber-500/20"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/images/home-banner1.JPG";
            }}
          />
        </div>
      </section>

      {/* 3. Statements of Faith */}
      <section className="bg-slate-950/45 py-16 border-t border-b border-slate-900/60">
        <div className="container-box">
          <div className="text-center mb-12">
            <span className="text-xs uppercase font-extrabold text-amber-400 tracking-widest block">
              {t('whatWeBelieve')}
            </span>
            <h2 className="heading-secondary">
              {t('statementsOfFaith')}
            </h2>
          </div>

          <div className="grid-two">
            {faithStatements.map((item, idx) => (
              <div 
                key={idx} 
                className="glass-panel p-6 flex gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-white mb-2">
                    {language === 'ta' ? item.titleTa : item.titleEn}
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {language === 'ta' ? item.descTa : item.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Timeline Milestones */}
      <section className="section-padding container-box">
        <div className="text-center mb-12">
          <span className="text-xs uppercase font-extrabold text-amber-400 tracking-widest block">
            {t('weeklySchedule') === 'வாராந்திர ஆராதனை நேரங்கள்' ? 'வரலாற்று மைல்கற்கள்' : 'Milestones Timeline'}
          </span>
          <h2 className="heading-secondary">
            {t('weeklySchedule') === 'வாராந்திர ஆராதனை நேரங்கள்' ? 'விசுவாசத்தின் பயணம்' : 'A Journey of Faith'}
          </h2>
        </div>

        <div className="max-w-3xl mx-auto flex flex-col gap-8 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-[2px] before:bg-amber-500/30">
          {milestones.map((item, idx) => (
            <div key={idx} className="flex gap-8 items-start relative pl-12">
              <div className="absolute left-4 top-2.5 w-4 h-4 rounded-full bg-amber-500 ring-4 ring-amber-950/50 shrink-0 z-10 animate-pulse" />
              <div className="glass-panel p-5 flex-1">
                <span className="text-xs font-extrabold text-amber-400">{item.year}</span>
                <h3 className="font-serif font-bold text-lg text-white mt-1">
                  {language === 'ta' ? item.titleTa : item.titleEn}
                </h3>
                <p className="text-slate-300 text-xs mt-1">
                  {language === 'ta' ? item.descTa : item.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;
