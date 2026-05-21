import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Calendar, Clock, MapPin, Users, Ticket, CheckCircle, X } from 'lucide-react';
import { API_BASE } from '../config';

const Events = () => {
  const { t } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/events`);
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
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
      const res = await fetch(`${API_BASE}/api/events/${activeBookingEvent.id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Booking reservation failed');
      }

      setBookingSuccess(data.message);
      setFormData({ attendee_name: '', attendee_email: '', attendee_phone: '' });
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
      <section className="bg-slate-950/65 text-white py-16 relative overflow-hidden border-b border-amber-500/20">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,_var(--primary-gold))]" style={{ filter: 'blur(80px)' }} />
        <div className="container-box text-center relative z-10">
          <span className="text-xs uppercase font-extrabold text-amber-400 tracking-widest block">
            Special Assemblies
          </span>
          <h1 className="heading-primary font-serif font-bold text-white mt-2">
            {t('eventsHeader')}
          </h1>
          <p className="text-slate-300 text-sm max-w-xl mx-auto mt-4">
            {t('eventsSub')}
          </p>
        </div>
      </section>

      {/* Events Grid */}
      <section className="container-box section-padding">
        {loading ? (
          <div className="text-center py-16 text-slate-300 font-semibold">
            Loading special calendar schedules...
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 text-slate-300 glass-panel p-8">
            No special events are currently listed for the coming month. Check back weekly!
          </div>
        ) : (
          <div className="grid-three">
            {events.map((evt) => {
              const seatsLeft = Math.max(0, evt.capacity - (evt.registeredCount || 0));
              const isFull = seatsLeft === 0;

              return (
                <div 
                  key={evt.id}
                  className="glass-panel overflow-hidden flex flex-col justify-between"
                >
                  {/* Image cover */}
                  <div className="relative aspect-video overflow-hidden bg-slate-900 shrink-0">
                    <img 
                      src={evt.image_url} 
                      alt={evt.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded-full text-xs uppercase tracking-wider">
                      {evt.date}
                    </div>
                  </div>

                  {/* Details body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-white mb-2">
                        {evt.title}
                      </h3>
                      <p className="text-slate-300 text-xs mb-4 line-clamp-3">
                        {evt.description}
                      </p>
                      
                      <div className="flex flex-col gap-2 text-xs font-semibold text-slate-400 mb-6">
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                          Time: <strong className="text-white font-bold pl-0.5">{evt.time}</strong>
                        </span>
                        <span className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                          Venue: <strong className="text-white font-bold pl-0.5">{evt.location}</strong>
                        </span>
                        <span className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-amber-400 shrink-0" />
                          Limit: <strong className="text-white font-bold pl-0.5">{evt.capacity} Capacity</strong>
                        </span>
                      </div>
                    </div>

                    {/* Booking button */}
                    <div className="border-t border-amber-500/10 pt-4 flex items-center justify-between">
                      <span className={`text-xs font-extrabold ${isFull ? 'text-red-400' : 'text-emerald-400'}`}>
                        {isFull ? t('eventFull') : `${seatsLeft} ${t('seatsRemaining')}`}
                      </span>

                      <button 
                        onClick={() => {
                          setActiveBookingEvent(evt);
                          setBookingSuccess('');
                          setBookingError('');
                        }}
                        disabled={isFull}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                          isFull 
                            ? 'bg-slate-900/60 text-slate-500 border border-slate-800 cursor-not-allowed'
                            : 'bg-amber-500 text-slate-950 hover:bg-amber-400 hover:scale-105 shadow-md'
                        }`}
                      >
                        {t('eventRegisterBtn')}
                      </button>
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
              Seat Reservation / Register
            </h3>
            <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider block mb-4">
              {activeBookingEvent.title}
            </span>

            {bookingSuccess ? (
              <div className="p-4 rounded-lg bg-emerald-950/40 text-emerald-300 text-sm font-semibold border border-emerald-500/30 flex flex-col gap-3 items-center text-center">
                <CheckCircle className="w-8 h-8 text-emerald-400 animate-bounce" />
                <span>{bookingSuccess}</span>
                <button 
                  onClick={() => setActiveBookingEvent(null)}
                  className="btn-primary py-2 px-6 text-xs mt-2"
                >
                  Close Modal
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
                  <input 
                    type="tel" 
                    name="attendee_phone"
                    value={formData.attendee_phone}
                    onChange={handleInputChange}
                    className="input-control"
                  />
                </div>

                {bookingError && (
                  <span className="text-xs font-semibold text-red-400 block">{bookingError}</span>
                )}

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary justify-center w-full mt-2"
                >
                  {isSubmitting ? 'Registering seat...' : 'Confirm Ticket Booking'}
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
