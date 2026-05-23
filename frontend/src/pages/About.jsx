import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert, BookOpen, Clock, Heart, Users } from 'lucide-react';

const About = () => {
  const { t } = useLanguage();

  const faithStatements = [
    {
      title: t('faithTitle1'),
      desc: t('faithDesc1')
    },
    {
      title: t('faithTitle2'),
      desc: t('faithDesc2')
    },
    {
      title: t('faithTitle3'),
      desc: t('faithDesc3')
    },
    {
      title: t('faithTitle4'),
      desc: t('faithDesc4')
    }
  ];

  return (
    <div className="animate-slideup">
      {/* 1. Header Banner */}
      <section className="bg-slate-950/65 text-white py-16 relative overflow-hidden border-b border-amber-500/20">
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

      {/* 2. vision Statement */}
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
          <p className="text-amber-400 leading-relaxed font-bold text-base">
            "{t('aboutMission')}"
          </p>
        </div>
        
        <div className="relative">
          <div className="absolute -inset-1 rounded-2xl bg-amber-500/20 blur opacity-45 pointer-events-none animate-pulse" />
          <img 
            src="/images/home-banner1.JPG" 
            alt="Church Congregation"
            className="relative w-full h-[360px] object-cover rounded-2xl shadow-2xl border border-amber-500/20"
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
                  <h3 className="font-serif font-bold text-lg text-white mb-2">{item.title}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{item.desc}</p>
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
          {/* Milestone 1 */}
          <div className="flex gap-8 items-start relative pl-12">
            <div className="absolute left-4 top-2.5 w-4 h-4 rounded-full bg-amber-500 ring-4 ring-amber-950/50 shrink-0 z-10 animate-pulse" />
            <div className="glass-panel p-5 flex-1">
              <span className="text-xs font-extrabold text-amber-400">1996</span>
              <h3 className="font-serif font-bold text-lg text-white mt-1">{t('milestoneTitle1')}</h3>
              <p className="text-slate-300 text-xs mt-1">
                {t('milestoneDesc1')}
              </p>
            </div>
          </div>

          {/* Milestone 2 */}
          <div className="flex gap-8 items-start relative pl-12">
            <div className="absolute left-4 top-2.5 w-4 h-4 rounded-full bg-amber-500 ring-4 ring-amber-950/50 shrink-0 z-10 animate-pulse" />
            <div className="glass-panel p-5 flex-1">
              <span className="text-xs font-extrabold text-amber-400">2005</span>
              <h3 className="font-serif font-bold text-lg text-white mt-1">{t('milestoneTitle2')}</h3>
              <p className="text-slate-300 text-xs mt-1">
                {t('milestoneDesc2')}
              </p>
            </div>
          </div>

          {/* Milestone 3 */}
          <div className="flex gap-8 items-start relative pl-12">
            <div className="absolute left-4 top-2.5 w-4 h-4 rounded-full bg-amber-500 ring-4 ring-amber-950/50 shrink-0 z-10 animate-pulse" />
            <div className="glass-panel p-5 flex-1">
              <span className="text-xs font-extrabold text-amber-400">2016</span>
              <h3 className="font-serif font-bold text-lg text-white mt-1">{t('milestoneTitle3')}</h3>
              <p className="text-slate-300 text-xs mt-1">
                {t('milestoneDesc3')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
