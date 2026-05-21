import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Phone, HeartHandshake, DollarSign, X } from 'lucide-react';

const FloatingActions = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    request_text: '',
    category: 'Spiritual Growth',
    is_anonymous: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePrayerSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('http://localhost:5000/api/prayers', {
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
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        request_text: '',
        category: 'Spiritual Growth',
        is_anonymous: false
      });
    } catch (err) {
      setErrorMsg(err.message || 'Error processing prayer request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Action Bars */}
      <div 
        className="fixed bottom-6 right-6 z-40 flex flex-col gap-3" 
        style={{ position: 'fixed', bottom: '24px', right: '24px' }}
      >
        {/* Call Church */}
        <a 
          href="tel:+971507646822"
          className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-900 text-white shadow-lg hover:scale-110 hover:bg-slate-800 transition-all border border-slate-700"
          title={t('floatingCall')}
        >
          <Phone className="w-5 h-5" />
        </a>

        {/* Global Prayer Modal Trigger */}
        <button 
          onClick={() => { setShowModal(true); setSuccessMsg(''); setErrorMsg(''); }}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-amber-500 text-slate-950 shadow-lg hover:scale-110 hover:bg-amber-400 transition-all border-2 border-white"
          title={t('floatingPray')}
        >
          <HeartHandshake className="w-6 h-6 animate-pulse" />
        </button>
      </div>

      {/* Global Quick Prayer Submission Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div className="glass-panel-dark w-full max-w-lg p-8 relative animate-slideup border border-amber-500/30 shadow-2xl">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-serif font-bold mb-1 flex items-center gap-2 text-white">
              <HeartHandshake className="w-6 h-6 text-amber-400" />
              {t('floatingPray')}
            </h3>
            <p className="text-sm text-slate-300 mb-6">
              Submit your prayer request. The intercession ministry will cover you.
            </p>

            {successMsg ? (
              <div className="p-5 rounded-xl bg-emerald-950/50 text-emerald-300 text-sm font-semibold border border-emerald-500/30 text-center">
                {successMsg}
              </div>
            ) : (
              <form onSubmit={handlePrayerSubmit} className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-amber-400 block mb-1">
                      {t('contactFormName')}
                    </label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input-control" 
                      disabled={formData.is_anonymous}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-bold text-amber-400 block mb-1">
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
                </div>

                <div>
                  <label className="text-xs font-bold text-amber-400 block mb-1">
                    {t('contactFormEmail')}
                  </label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-control"
                    disabled={formData.is_anonymous}
                  />
                </div>

                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <label className="text-xs font-bold text-amber-400 block mb-1">
                      Category
                    </label>
                    <select 
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="input-control"
                    >
                      <option value="Spiritual Growth">Spiritual Growth</option>
                      <option value="Healing & Restoration">Healing & Restoration</option>
                      <option value="Family Peace">Family Peace</option>
                      <option value="Financial Deliverance">Financial Deliverance</option>
                      <option value="Job & Career">Job & Career</option>
                      <option value="Children Welfare">Children Welfare</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <input 
                      type="checkbox" 
                      id="is_anonymous"
                      name="is_anonymous"
                      checked={formData.is_anonymous}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                    />
                    <label htmlFor="is_anonymous" className="text-xs font-bold text-slate-300 cursor-pointer">
                      Submit Anonymously
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-amber-400 block mb-1">
                    Prayer Request *
                  </label>
                  <textarea 
                    name="request_text"
                    value={formData.request_text}
                    onChange={handleInputChange}
                    rows="4" 
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
                  {isSubmitting ? 'Submitting request...' : 'Send Prayer Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingActions;
