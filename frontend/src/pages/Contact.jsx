import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Phone, Mail, MapPin, CheckCircle, Send, Globe } from 'lucide-react';
import { API_BASE } from '../config';
import { useTheme } from '../context/ThemeContext';

const Contact = () => {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [countryCode, setCountryCode] = useState('+971');
 
  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
 
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
 
    try {
      const payload = {
        ...formData,
        phone: formData.phone ? `${countryCode} ${formData.phone}` : ''
      };
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      setSuccessMsg(data.message);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setCountryCode('+971');
    } catch (err) {
      setErrorMsg(err.message || 'Error sending inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-slideup">
      {/* Header */}
      <section 
        className="bg-slate-950/65 text-white py-16 relative overflow-hidden border-b border-amber-500/20"
        style={{
          backgroundImage: t('bg_contact') && t('bg_contact') !== 'bg_contact' ? `linear-gradient(rgba(10, 15, 30, 0.75), rgba(10, 15, 30, 0.75)), url(${t('bg_contact')})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_var(--primary-gold))]" style={{ filter: 'blur(80px)' }} />
        <div className="container-box text-center relative z-10">
          <span className="text-xs uppercase font-extrabold text-amber-400 tracking-widest block">
            {t('fellowshipIntercessions')}
          </span>
          <h1 className="heading-primary font-serif font-bold text-white mt-2">
            {t('navContact')}
          </h1>
          <p className="text-slate-300 text-sm max-w-xl mx-auto mt-4">
            {t('contactSub')}
          </p>
        </div>
      </section>

      {/* Grid Layout Layout */}
      <section className="container-box section-padding grid-two items-start">
        {/* Contact Form Column */}
        <div className={`${theme === 'light' ? 'bg-[#FBF8F0] border border-[#1E3A8A]/20 text-[#1A365D]' : 'bg-[#0B0F1E] border border-amber-500/20 text-white'} rounded-2xl p-6 shadow-xl flex flex-col gap-4`}>
          <h3 className={`font-serif font-bold text-xl mb-2 ${theme === 'light' ? 'text-[#1A365D]' : 'text-white'}`}>
            {t('sendInquiry')}
          </h3>
          <p className={`text-xs mb-6 font-semibold ${theme === 'light' ? 'text-[#1E3A8A]' : 'text-slate-300'}`}>
            {t('haveQuestionsContact')}
          </p>

          {(() => {
            const rawParas = t('paras_contact');
            let additionalParas = [];
            try {
              additionalParas = typeof rawParas === 'string' ? JSON.parse(rawParas) : rawParas;
            } catch (e) {
              additionalParas = [];
            }
            if (!Array.isArray(additionalParas)) additionalParas = [];
            return additionalParas.map((p, idx) => (
              <p key={idx} className={`text-xs mb-4 leading-relaxed font-semibold ${theme === 'light' ? 'text-[#1E3A8A]' : 'text-slate-200'}`}>
                {language === 'ta' ? p.ta : p.en}
              </p>
            ));
          })()}

          {successMsg ? (
            <div className="p-5 rounded-lg bg-emerald-950/40 text-emerald-300 text-sm font-semibold border border-emerald-500/30 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="flex flex-col gap-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`text-xs font-bold block mb-1 ${theme === 'light' ? 'text-[#1A365D]' : 'text-slate-200'}`}>
                    {t('contactFormName')} *
                  </label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`input-control ${theme === 'light' ? 'text-[#1A365D] bg-white border-[#1E3A8A]/30 placeholder-[#1E3A8A]/50' : 'text-white bg-slate-955/50 border-white/10'}`}
                    required
                  />
                </div>

                <div>
                  <label className={`text-xs font-bold block mb-1 ${theme === 'light' ? 'text-[#1A365D]' : 'text-slate-200'}`}>
                    {t('contactFormEmail')} *
                  </label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`input-control ${theme === 'light' ? 'text-[#1A365D] bg-white border-[#1E3A8A]/30 placeholder-[#1E3A8A]/50' : 'text-white bg-slate-955/50 border-white/10'}`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className={`text-xs font-bold block mb-1 ${theme === 'light' ? 'text-[#1A365D]' : 'text-slate-200'}`}>
                    {t('contactFormPhone')}
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className={`input-control text-[11px] font-extrabold cursor-pointer ${theme === 'light' ? 'text-[#1A365D] bg-white border-[#1E3A8A]/30' : 'text-white bg-slate-955/50 border-white/10'}`}
                      style={{ width: '100px', minWidth: '100px', flexShrink: 0, paddingLeft: '0.4rem', paddingRight: '0.4rem' }}
                    >
                      <option value="+971" className="text-slate-955">🇦🇪 +971</option>
                      <option value="+91" className="text-slate-955">🇮🇳 +91</option>
                      <option value="+968" className="text-slate-955">🇴🇲 +968</option>
                      <option value="+974" className="text-slate-955">🇶🇦 +974</option>
                      <option value="+973" className="text-slate-955">🇧🇭 +973</option>
                      <option value="+965" className="text-slate-955">🇰🇼 +965</option>
                      <option value="+966" className="text-slate-955">🇸🇦 +966</option>
                      <option value="+1" className="text-slate-955">🇺🇸/🇨🇦 +1</option>
                      <option value="+44" className="text-slate-955">🇬🇧 +44</option>
                      <option value="+65" className="text-slate-955">🇸🇬 +65</option>
                      <option value="+60" className="text-slate-955">🇲🇾 +60</option>
                      <option value="+94" className="text-slate-955">🇱🇰 +94</option>
                      <option value="+61" className="text-slate-955">🇦🇺 +61</option>
                    </select>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`input-control flex-1 ${theme === 'light' ? 'text-[#1A365D] bg-white border-[#1E3A8A]/30 placeholder-[#1E3A8A]/50' : 'text-white bg-slate-955/50 border-white/10'}`}
                      placeholder={t('phoneNumberPlaceholder')}
                    />
                  </div>
                </div>

                <div>
                  <label className={`text-xs font-bold block mb-1 ${theme === 'light' ? 'text-[#1A365D]' : 'text-slate-200'}`}>
                    {t('contactFormSubject')}
                  </label>
                  <input 
                    type="text" 
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className={`input-control ${theme === 'light' ? 'text-[#1A365D] bg-white border-[#1E3A8A]/30 placeholder-[#1E3A8A]/50' : 'text-white bg-slate-955/50 border-white/10'}`}
                  />
                </div>
              </div>

              <div>
                <label className={`text-xs font-bold block mb-1 ${theme === 'light' ? 'text-[#1A365D]' : 'text-slate-200'}`}>
                  {t('messageContent')} *
                </label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="5"
                  className={`input-control ${theme === 'light' ? 'text-[#1A365D] bg-white border-[#1E3A8A]/30 placeholder-[#1E3A8A]/50' : 'text-white bg-slate-955/50 border-white/10'}`}
                  required
                ></textarea>
              </div>

              {errorMsg && (
                <span className="text-xs font-semibold text-red-400 block">{errorMsg}</span>
              )}

              <button 
                type="submit"
                disabled={isSubmitting}
                className="btn-primary justify-center w-full mt-2"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? t('sendingMessage') : t('contactSubmitBtn')}
              </button>
            </form>
          )}
        </div>

        {/* Directory details Column */}
        <div className="flex flex-col gap-6 w-full font-semibold text-left">
          {/* Main Info */}
          <div className="glass-panel p-6">
            <h3 className={`font-serif font-bold text-lg mb-4 ${theme === 'dark' ? 'text-white' : 'text-[#1E3A8A]'}`}>
              {t('worshipSanctuaryDetails')}
            </h3>

            <div className="flex flex-col gap-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className={`block ${theme === 'dark' ? 'text-white' : 'text-[#1A365D]'}`}>{t('physicalLocation')}:</strong>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-[#1E3A8A]'}`}>{t('agWorshipHallAddress')}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className={`block ${theme === 'dark' ? 'text-white' : 'text-[#1A365D]'}`}>{t('counselingOfficeDials')}:</strong>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-[#1E3A8A]'}`}>+971 50 764 6822</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className={`block ${theme === 'dark' ? 'text-white' : 'text-[#1A365D]'}`}>{t('emailQueries')}:</strong>
                  <span className={`font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-[#1E3A8A]'}`}>admin@agsharjah.org</span>
                </div>
              </div>
            </div>
          </div>

          {/* Regional Branches lists */}
          <div className="glass-panel p-6">
            <h3 className={`font-serif font-bold text-lg mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-[#1E3A8A]'}`}>
              <Globe className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              {t('northernEmiratesBranches')}
            </h3>

            <ul className="flex flex-col gap-4 text-sm font-semibold">
              <li className={`pb-3 border-b border-amber-500/10 ${theme === 'dark' ? 'text-slate-300' : 'text-[#1E3A8A]'}`}>
                <strong className={`block ${theme === 'dark' ? 'text-amber-400' : 'text-[#1A365D]'}`}>{t('ajmanFellowshipBranch')}</strong>
                <span className={`${theme === 'dark' ? 'text-slate-300' : 'text-[#1E3A8A]'}`}>{t('ajmanFellowshipDesc')}</span>
              </li>
              <li className={theme === 'dark' ? 'text-slate-300' : 'text-[#1E3A8A]'}>
                <strong className={`block ${theme === 'dark' ? 'text-amber-400' : 'text-[#1A365D]'}`}>{t('uaqCellBranch')}</strong>
                <span className={`${theme === 'dark' ? 'text-slate-300' : 'text-[#1E3A8A]'}`}>{t('uaqCellDesc')}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
