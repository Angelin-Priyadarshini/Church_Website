import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config';
import { 
  Lock, RefreshCw, BarChart2, Users, Calendar, 
  HeartHandshake, Check, Trash2, ArrowUpRight, HelpCircle 
} from 'lucide-react';

const Admin = () => {
  const { user, token, login, logout, isModerator } = useAuth();
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard Data State
  const [summary, setSummary] = useState(null);
  const [prayers, setPrayers] = useState([]);
  const [donationsData, setDonationsData] = useState(null);
  const [events, setEvents] = useState([]);
  
  // Controls
  const [activeTab, setActiveTab] = useState('summary');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [actionError, setActionError] = useState('');

  const fetchDashboardData = async () => {
    if (!token) return;

    try {
      // 1. Fetch KPI Summaries
      const sumRes = await fetch(`${API_BASE}/api/dashboard/summary`);
      const sumData = await sumRes.json();
      setSummary(sumData);

      // 2. Fetch prayers list
      const prayRes = await fetch(`${API_BASE}/api/prayers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const prayData = await prayRes.json();
      setPrayers(prayData);

      // 3. Fetch events
      const evtRes = await fetch(`${API_BASE}/api/events`);
      const evtData = await evtRes.json();
      setEvents(evtData);

      // Donations ledger sync removed
    } catch (err) {
      console.error('Error fetching dashboard records:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token, user]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      login(data.token, data.user);
    } catch (err) {
      setAuthError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSyncYoutube = async () => {
    setIsSyncing(true);
    setSyncMessage('');
    setActionError('');

    try {
      const res = await fetch(`${API_BASE}/api/services/sync`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Sync failed');
      }

      setSyncMessage(data.message + ` Sync count: ${data.videosSyncedCount} videos.`);
      fetchDashboardData(); // Refresh grid
    } catch (err) {
      setActionError(err.message || 'Error triggering synchronization.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdatePrayerStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/prayers/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Status update failed');
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeletePrayer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prayer request?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/prayers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Deletion failed');
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Render Login Card if not authenticated
  if (!user) {
    return (
      <section className="section-padding container-box max-w-md">
        <div className="glass-panel p-8 bg-white border border-slate-200 text-center flex flex-col gap-6">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-2xl text-slate-900 leading-tight">
              Administrative Portal
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Authorized church moderators and pastors only.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 text-left">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Email Address
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@agstc.org"
                className="input-control"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Security Password
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-control"
                required
              />
            </div>

            {authError && (
              <span className="text-xs font-semibold text-red-600 block">{authError}</span>
            )}

            <button 
              type="submit" 
              disabled={isLoggingIn}
              className="btn-primary justify-center w-full mt-2"
            >
              {isLoggingIn ? 'Verifying authority keys...' : 'Authorize Login'}
            </button>
          </form>

          <span className="text-[10px] text-slate-400">
            Forgot credentials? Contact systems@agstc.org.
          </span>
        </div>
      </section>
    );
  }

  return (
    <div className="animate-slideup min-h-screen bg-slate-50 border-b border-slate-200">
      {/* 1. Header Banner */}
      <section className="bg-slate-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">
              Control Panel
            </span>
            <h1 className="font-serif font-bold text-2xl text-white mt-1 leading-tight">
              Welcome, {user.name}
            </h1>
            <span className="text-xs text-slate-400 block mt-0.5">
              Authorized Access Tier: <strong className="text-amber-500 uppercase">{user.role}</strong>
            </span>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={handleSyncYoutube}
              disabled={isSyncing}
              className="btn-primary py-2 px-5 text-xs flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync YouTube Channel
            </button>
            <button 
              onClick={logout}
              className="btn-secondary py-2 px-5 text-xs text-white border-white/20 hover:bg-white hover:text-slate-900"
            >
              Logout Session
            </button>
          </div>
        </div>
      </section>

      {/* Sync Log overlays */}
      {(syncMessage || actionError) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className={`p-4 rounded-lg text-sm font-semibold border ${
            actionError 
              ? 'bg-red-50 text-red-800 border-red-200' 
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}>
            {actionError || syncMessage}
          </div>
        </div>
      )}

      {/* 2. KPI Metrics Grid */}
      {summary && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-panel p-5 bg-white border-slate-200 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Sermon Hits</span>
              <span className="font-bold text-slate-900 text-xl block leading-tight">{summary.sermonViews}</span>
            </div>
          </div>

          <div className="glass-panel p-5 bg-white border-slate-200 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Total Events</span>
              <span className="font-bold text-slate-900 text-xl block leading-tight">
                {summary.totalEvents} Scheduled
              </span>
            </div>
          </div>

          <div className="glass-panel p-5 bg-white border-slate-200 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Prayers Queue</span>
              <span className="font-bold text-slate-900 text-xl block leading-tight">{summary.pendingPrayers} Pending</span>
            </div>
          </div>

          <div className="glass-panel p-5 bg-white border-slate-200 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Bookings</span>
              <span className="font-bold text-slate-900 text-xl block leading-tight">{summary.totalBookings} Seats</span>
            </div>
          </div>
        </section>
      )}

      {/* Tabs list selector */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex border-b border-slate-200 gap-4 mb-6">
          <button 
            onClick={() => setActiveTab('summary')}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === 'summary' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Prayers Queue ({prayers.length})
          </button>
          


          <button 
            onClick={() => setActiveTab('events')}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === 'events' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Special Bookings Roster
          </button>
        </div>

        {/* 1. PRAYER QUEUE PANEL */}
        {activeTab === 'summary' && (
          <div className="glass-panel overflow-hidden bg-white border-slate-200">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-900 text-white font-bold text-xs uppercase tracking-wider">
                  <th className="p-4">Sender</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Request Description</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-semibold text-slate-700">
                {prayers.map((pray) => (
                  <tr key={pray.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <span className="block text-slate-900 font-bold">{pray.name}</span>
                      <span className="block text-[10px] text-slate-400">{pray.email}</span>
                      {pray.phone && <span className="block text-[10px] text-slate-400">{pray.phone}</span>}
                    </td>
                    <td className="p-4 text-slate-500 text-xs">{pray.category}</td>
                    <td className="p-4 text-slate-600 leading-relaxed font-normal max-w-md">{pray.request_text}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        pray.status === 'Answered' 
                          ? 'bg-emerald-100 text-emerald-800'
                          : pray.status === 'Prayed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800 animate-pulse'
                      }`}>
                        {pray.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-center">
                        <button 
                          onClick={() => handleUpdatePrayerStatus(pray.id, 'Prayed')}
                          className="p-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
                          title="Mark as Prayed"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleUpdatePrayerStatus(pray.id, 'Answered')}
                          className="p-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          title="Mark as Answered"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeletePrayer(pray.id)}
                          className="p-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
                          title="Delete Request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}



        {/* 3. SPECIAL EVENTS BOOKING PANEL */}
        {activeTab === 'events' && (
          <div className="flex flex-col gap-6">
            {events.map((evt) => (
              <div key={evt.id} className="glass-panel overflow-hidden bg-white border-slate-200">
                <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
                  <div>
                    <h3 className="font-serif font-bold text-base text-slate-900">{evt.title}</h3>
                    <span className="text-xs text-slate-500 font-semibold">{evt.date} | {evt.location}</span>
                  </div>
                  <span className="px-3 py-1 bg-slate-900 text-white font-bold rounded-full text-xs">
                    Capacity Status: {evt.registeredCount || 0} / {evt.capacity} seats booked
                  </span>
                </div>

                <div className="p-4">
                  {/* Detailed inline roster roster fetching */}
                  <EventRoster eventId={evt.id} token={token} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

// Sub-component Helper to query attendee lists asynchronously inside event grids
const EventRoster = ({ eventId, token }) => {
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/events/${eventId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setRoster(data.roster || []);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [eventId, token]);

  if (loading) return <div className="text-xs text-slate-400">Loading attendee roster...</div>;
  if (roster.length === 0) return <div className="text-xs text-slate-400 italic">No attendee bookings made for this event yet.</div>;

  return (
    <table className="w-full text-left text-xs font-semibold text-slate-600 border-collapse">
      <thead>
        <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
          <th className="pb-2">Name</th>
          <th className="pb-2">Email</th>
          <th className="pb-2">Phone</th>
          <th className="pb-2 text-right">Registration Date</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {roster.map((person) => (
          <tr key={person.id} className="hover:bg-slate-50">
            <td className="py-2 text-slate-800 font-bold">{person.attendee_name}</td>
            <td className="py-2 font-mono">{person.attendee_email}</td>
            <td className="py-2">{person.attendee_phone || 'N/A'}</td>
            <td className="py-2 text-right text-slate-400">{person.created_at}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Admin;
