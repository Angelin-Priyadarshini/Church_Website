import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Calendar, Clock, MapPin, Users, Ticket, CheckCircle, X } from 'lucide-react';
import { API_BASE, resolveImageUrl } from '../config';

const Events = () => {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const [events, setEvents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schedLoading, setSchedLoading] = useState(true);
  
  // Roster booking state variables
  const [activeBookingEvent, setActiveBookingEvent] = useState(null);
  const [formData, setFormData] = useState({
    attendee_name: '',
    attendee_email: '',
    attendee_phone: ''
  });
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countryCode, setCountryCode] = useState('+971');

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/events`);
      const data = res.ok ? await res.json() : [];
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/schedule`);
      const data = res.ok ? await res.json() : [];
      const filtered = (Array.isArray(data) ? data : []).filter(sched => {
        const name = (sched.name || '').toLowerCase();
        const loc = (sched.location || '').toLowerCase();
        return !name.includes('ajman') && !name.includes('umm al quwain') && !name.includes('uaq') &&
               !loc.includes('ajman') && !loc.includes('umm al quwain') && !loc.includes('uaq');
      });
      setSchedules(filtered);
    } catch (err) {
      console.error('Error fetching weekly schedules:', err);
      setSchedules([]);
    } finally {
      setSchedLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchSchedules();
  }, []);

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!activeBookingEvent) return;
    setIsSubmitting(true);
    setBookingError('');
    setBookingSuccess('');

    try {
      const payload = {
        ...formData,
        attendee_phone: formData.attendee_phone ? `${countryCode} ${formData.attendee_phone}` : ''
      };
      const res = await fetch(`${API_BASE}/api/events/${activeBookingEvent.id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Booking reservation failed');
      }

      setBookingSuccess(data.message);
      setFormData({ attendee_name: '', attendee_email: '', attendee_phone: '' });
      setCountryCode('+971');
      // Reload events to sync the seats counts
      fetchEvents();
    } catch (err) {
      setBookingError(err.message || 'Error processing reservation.');
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
          backgroundImage: t('bg_events') && t('bg_events') !== 'bg_events' ? `linear-gradient(rgba(10, 15, 30, 0.75), rgba(10, 15, 30, 0.75)), url(${t('bg_events')})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_var(--primary-gold))]" style={{ filter: 'blur(80px)' }} />
        <div className="container-box text-center relative z-10">
          <span className="text-xs uppercase font-extrabold text-amber-400 tracking-widest block">
            {t('specialAssemblies')}
          </span>
          <h1 className="heading-primary font-serif font-bold text-white mt-2">
            {t('eventsHeader')}
          </h1>
          <p className="text-slate-300 text-sm max-w-xl mx-auto mt-4">
            {t('eventsSub')}
          </p>
          {(() => {
            const rawParas = t('paras_events');
            let additionalParas = [];
            try {
              additionalParas = typeof rawParas === 'string' ? JSON.parse(rawParas) : rawParas;
            } catch (e) {
              additionalParas = [];
            }
            if (!Array.isArray(additionalParas)) additionalParas = [];
            return additionalParas.map((p, idx) => (
              <p key={idx} className="text-slate-300 text-xs max-w-xl mx-auto mt-2 leading-relaxed">
                {language === 'ta' ? p.ta : p.en}
              </p>
            ));
          })()}
        </div>
      </section>

      {/* Events Grid */}
      <section className="container-box section-padding">
        {loading ? (
          <div className="text-center py-16 text-slate-300 font-semibold">
            {t('loadingSpecialCalendar')}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-slate-300 glass-panel p-8">
            {t('noSpecialEvents')}
          </div>
        ) : (
          <div className="flex flex-col gap-8 max-w-5xl mx-auto">
            {events.map((evt) => {
              const seatsLeft = Math.max(0, evt.capacity - (evt.registeredCount || 0));
              const isFull = seatsLeft === 0;
              const isCompleted = evt.title.includes('RETREAT 2026') || new Date(evt.date) < new Date();

              return (
                <div 
                  key={evt.id}
                  className="glass-panel overflow-hidden flex flex-col md:flex-row gap-6 p-6 items-stretch"
                >
                  {/* Image cover (Left Side) */}
                  <div className="w-full md:w-2/5 shrink-0 flex items-center justify-center bg-slate-950/60 rounded-xl p-2 relative min-h-[300px]">
                    <img 
                      src={resolveImageUrl(evt.image_url)} 
                      alt={evt.title}
                      className="max-h-[500px] object-contain rounded-lg w-full transition-transform duration-300 hover:scale-[1.02]"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/default-event.jpg';
                      }}
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded-full text-xs uppercase tracking-wider shadow">
                      {evt.date}
                    </div>
                  </div>

                  {/* Details body (Right Side) */}
                  <div className="flex-1 flex flex-col justify-between py-2 text-left">
                    <div>
                      <h3 className="font-serif font-bold text-2xl md:text-3xl text-white mb-4 leading-tight">
                        {t(evt.title)}
                      </h3>
                      
                      {/* Event Details Badges (Large text) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold text-slate-300 mb-6 bg-white/5 p-4 rounded-xl border border-white/5">
                        <span className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-amber-400 shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Time</span>
                            <strong className="text-white text-base font-bold">{t(evt.time)}</strong>
                          </div>
                        </span>
                        <span className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Venue</span>
                            <strong className="text-white text-base font-bold">{t(evt.location)}</strong>
                          </div>
                        </span>
                        <span className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-amber-400 shrink-0" />
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Capacity</span>
                            <strong className="text-white text-base font-bold">{evt.capacity} {t('evtCapacity')}</strong>
                          </div>
                        </span>
                      </div>

                      {/* Description text - Enlarged as requested */}
                      <p className="text-slate-200 text-sm md:text-base leading-relaxed mb-6 whitespace-pre-line bg-white/5 p-4 rounded-xl border border-white/5 font-medium">
                        {t(evt.description)}
                      </p>
                    </div>

                    {/* Booking button */}
                    <div className="border-t border-amber-500/15 pt-4 flex items-center justify-between gap-4 mt-auto">
                      {isCompleted ? (
                        <span className="px-4 py-2 rounded-full bg-amber-500/20 text-amber-400 text-sm font-extrabold border border-amber-500/30 flex items-center gap-2">
                          <CheckCircle className="w-4.5 h-4.5 text-amber-400" />
                          Event Completed (450 Attended)
                        </span>
                      ) : (
                        <>
                          <span className={`text-xs md:text-sm font-extrabold ${isFull ? 'text-red-400' : 'text-emerald-400'}`}>
                            {isFull ? t('eventFull') : `${seatsLeft} ${t('seatsRemaining')}`}
                          </span>

                          <button 
                            onClick={() => {
                              setActiveBookingEvent(evt);
                              setBookingSuccess('');
                              setBookingError('');
                            }}
                            disabled={isFull}
                            className={`px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all ${
                              isFull 
                                ? 'bg-slate-900/60 text-slate-500 border border-slate-800 cursor-not-allowed'
                                : 'bg-amber-500 text-slate-950 hover:bg-amber-400 hover:scale-105 shadow-md font-bold'
                            }`}
                          >
                            {t('eventRegisterBtn')}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Weekly Service Timings Section */}
      <section className="container-box pb-32 pt-6">
        <div className="text-center mb-12 relative">
          <div className="absolute inset-x-0 -top-8 -z-10 h-24 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 blur-2xl" />
          <span className="text-xs uppercase font-extrabold text-amber-400 tracking-widest block">
            {language === 'ta' ? 'ஆராதனை நேரங்கள்' : 'Weekly Schedule'}
          </span>
          <h2 className="heading-secondary text-white font-serif font-bold text-3xl mt-2 leading-tight">
            {language === 'ta' ? 'வாராந்திர ஆராதனை நேரங்கள்' : 'Weekly Service Timings'}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto mt-3 leading-relaxed">
            {language === 'ta' 
              ? 'எங்களோடு இணைந்து கர்த்தரை ஆராதித்து, அவருடைய மாறாத அன்பையும் கிருபையையும் உங்கள் வாழ்வில் அநுபவியுங்கள்.' 
              : 'Join us in fellowship and worship, and experience the grace of God Shaddai in our regional gatherings.'}
          </p>
        </div>

        {schedLoading ? (
          <div className="text-center py-12 text-slate-400 font-semibold animate-pulse">
            {language === 'ta' ? 'ஆராதனை நேரங்கள் ஏற்றப்படுகின்றன...' : 'Loading schedules...'}
          </div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-12 text-slate-400 glass-panel">
            {language === 'ta' ? 'ஆராதனை அட்டவணைகள் எதுவும் இல்லை.' : 'No service schedules found.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
             {schedules.map((sched, idx) => {
              const isLight = theme === 'light';
              const cardClass = isLight 
                ? 'bg-white border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.12)]'
                : 'bg-slate-900/45 border-2 border-amber-500 shadow-lg';
              
              const titleColor = isLight ? 'text-[#0A1931]' : 'text-white';
              const labelColor = isLight ? 'text-[#1F4068]/65 font-extrabold' : 'text-slate-500';
              const mainTextColor = isLight ? 'text-[#0A1931] font-extrabold' : 'text-white font-bold';
              const subTextColor = isLight ? 'text-[#15305B] font-semibold' : 'text-slate-300';
              const badgeClass = isLight 
                ? 'bg-amber-500/15 border border-amber-500/35 text-amber-700 font-extrabold' 
                : 'bg-amber-500/10 border border-amber-500/20 text-amber-400';
              
              const recurrenceClass = isLight ? 'text-[#1F4068]/60 font-bold' : 'text-slate-500';
              const visualGlowClass = isLight ? 'bg-amber-500/8' : 'bg-amber-500/5';
              const dividerClass = isLight ? 'border-amber-500/10' : 'border-white/5';

              return (
                <div 
                  key={sched.id || idx}
                  className={`backdrop-blur-md rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between gap-4 ${cardClass}`}
                >
                  {/* Visual Glow Ornament */}
                  <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full pointer-events-none ${visualGlowClass}`} />
                  
                  <div>
                    {/* Service Badge Header */}
                    <div className="flex justify-between items-center mb-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-extrabold uppercase tracking-wider ${badgeClass}`}>
                        {t(sched.category) || (language === 'ta' ? 'ஆராதனை' : 'Worship')}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${recurrenceClass}`}>
                        {t(sched.recurrence) || (language === 'ta' ? 'வாராந்திரம்' : 'Weekly')}
                      </span>
                    </div>

                    {/* Service Name */}
                    <h3 className={`font-serif font-bold text-lg sm:text-xl mb-4 pr-6 leading-tight text-left ${titleColor}`}>
                      {t(sched.name)}
                    </h3>
                  </div>

                  {/* Logistics */}
                  <div className={`flex flex-col gap-3 text-xs sm:text-sm font-semibold mt-2 text-left`}>
                    <div className="flex items-start gap-2.5">
                      <Clock className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${labelColor}`}>
                          {language === 'ta' ? 'நேரம்' : 'Timing'}
                        </span>
                        <strong className={`text-sm tracking-tight mt-0.5 ${mainTextColor}`}>
                          {t(sched.time)}
                        </strong>
                      </div>
                    </div>

                    <div className={`flex items-start gap-2.5 border-t pt-3 mt-1 ${dividerClass}`}>
                      <MapPin className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${labelColor}`}>
                          {language === 'ta' ? 'இடம்' : 'Venue'}
                        </span>
                        <span className={`text-xs sm:text-sm mt-0.5 leading-relaxed ${subTextColor}`}>
                          {t(sched.location)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Booking Form Dialog Modal overlay */}
      {activeBookingEvent && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadein"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div className="glass-panel-dark w-full max-w-md p-6 relative shadow-2xl">
            <button 
              onClick={() => setActiveBookingEvent(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-amber-500/20 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold font-serif mb-1 pr-8 text-white">
              {t('seatReservationRegister')}
            </h3>
            <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider block mb-4">
              {t(activeBookingEvent.title)}
            </span>

            {bookingSuccess ? (
              <div className="p-4 rounded-lg bg-emerald-950/40 text-emerald-300 text-sm font-semibold border border-emerald-500/30 flex flex-col gap-3 items-center text-center">
                <CheckCircle className="w-8 h-8 text-emerald-400 animate-bounce" />
                <span>{bookingSuccess}</span>
                <button 
                  onClick={() => setActiveBookingEvent(null)}
                  className="btn-primary py-2 px-6 text-xs mt-2"
                >
                  {t('closeModal')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    {t('contactFormName')} *
                  </label>
                  <input 
                    type="text" 
                    name="attendee_name"
                    value={formData.attendee_name}
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
                    name="attendee_email"
                    value={formData.attendee_email}
                    onChange={handleInputChange}
                    className="input-control"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    {t('contactFormPhone')}
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="input-control bg-slate-900 border border-white/10 text-white text-xs font-bold focus:border-amber-500 cursor-pointer"
                      style={{ width: '110px', minWidth: '110px', flexShrink: 0 }}
                    >
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+968">🇴🇲 +968</option>
                      <option value="+974">🇶🇦 +974</option>
                      <option value="+973">🇧🇭 +973</option>
                      <option value="+965">🇰🇼 +965</option>
                      <option value="+966">🇸🇦 +966</option>
                      <option value="+1">🇺🇸/🇨🇦 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+65">🇸🇬 +65</option>
                      <option value="+60">🇲🇾 +60</option>
                      <option value="+94">🇱🇰 +94</option>
                      <option value="+61">🇦🇺 +61</option>
                    </select>
                    <input 
                      type="tel" 
                      name="attendee_phone"
                      value={formData.attendee_phone}
                      onChange={handleInputChange}
                      className="input-control flex-1"
                      placeholder={t('phoneNumberPlaceholder')}
                    />
                  </div>
                </div>

                {bookingError && (
                  <span className="text-xs font-semibold text-red-400 block">{bookingError}</span>
                )}

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary justify-center w-full mt-2"
                >
                  {isSubmitting ? t('registeringSeat') : t('confirmTicketBooking')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
