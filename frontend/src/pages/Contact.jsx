import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Phone, Mail, MapPin, CheckCircle, Send, Globe } from 'lucide-react';
import { API_BASE } from '../config';

const Contact = () => {
  const { t } = useLanguage();
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
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      setSuccessMsg(data.message);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setErrorMsg(err.message || 'Error sending inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-slideup">
      {/* Header */}
      <section className="bg-slate-950/65 text-white py-16 relative overflow-hidden border-b border-amber-500/20">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_var(--primary-gold))]" style={{ filter: 'blur(80px)' }} />
        <div className="container-box text-center relative z-10">
          <span className="text-xs uppercase font-extrabold text-amber-400 tracking-widest block">
            Fellowship Intercessions
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
        <div className="glass-panel p-6">
          <h3 className="font-serif font-bold text-xl text-white mb-2">
            Send an Inquiry
          </h3>
          <p className="text-xs text-slate-300 mb-6">
            Have questions about timings, free transport routing or counseling services? Drop us a line.
          </p>

          {successMsg ? (
            <div className="p-5 rounded-lg bg-emerald-950/40 text-emerald-300 text-sm font-semibold border border-emerald-500/30 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    {t('contactFormName')} *
                  </label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-control"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    {t('contactFormEmail')} *
                  </label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-control"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    {t('contactFormPhone')}
                  </label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-control"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    {t('contactFormSubject')}
                  </label>
                  <input 
                    type="text" 
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="input-control"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Message Content *
                </label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="5"
                  className="input-control"
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
                {isSubmitting ? 'Sending message...' : t('contactSubmitBtn')}
              </button>
            </form>
          )}
        </div>

        {/* Directory details Column */}
        <div className="flex flex-col gap-6 w-full">
          {/* Main Info */}
          <div className="glass-panel p-6 text-slate-300">
            <h3 className="font-serif font-bold text-lg text-white mb-4">
              Worship Sanctuary Details
            </h3>

            <div className="flex flex-col gap-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Physical Location:</strong>
                  AG Worship Hall, Near Glass Area, Industrial Sector 5, Sharjah, United Arab Emirates
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Counseling Office / Dials:</strong>
                  +971 50 764 6822
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Email Queries:</strong>
                  ministry@agstc.org
                </div>
              </div>
            </div>
          </div>

          {/* Regional Branches lists */}
          <div className="glass-panel p-6">
            <h3 className="font-serif font-bold text-lg text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-amber-400" />
              Northern Emirates Branches
            </h3>

            <ul className="flex flex-col gap-4 text-sm text-slate-300">
              <li className="pb-3 border-b border-amber-500/10">
                <strong className="text-amber-400 block">Ajman Fellowship Branch</strong>
                Weekly cells gathering in Al Nuaimia center at Saturdays, 7:30 PM. Active transport shuttles operated.
              </li>
              <li>
                <strong className="text-amber-400 block">Umm Al Quwain Cell Branch</strong>
                Weekly fellowships at UAQ Industrial District on Thursdays, 8:00 PM. Pastoral care covered.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
