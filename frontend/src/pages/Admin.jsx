import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { API_BASE } from '../config';
import { 
  Lock, RefreshCw, BarChart2, Users, Calendar, 
  HeartHandshake, Check, Trash2, ArrowUpRight, HelpCircle,
  Plus, Video, Edit
} from 'lucide-react';

// Custom SVG YouTube Icon component to avoid lucide-react export mismatches
const YoutubeIcon = (props) => (
  <svg 
    viewBox="0 0 24 24" 
    width="24" 
    height="24" 
    fill="currentColor" 
    className={props.className}
  >
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.388.555A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.47 20.5 12 20.5 12 20.5s7.53 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const Admin = () => {
  const { user, token, login, logout, isModerator } = useAuth();
  const { fetchDynamicAbout } = useLanguage();
  
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

  // Sermons Management State
  const [sermons, setSermons] = useState([]);
  const [sermonSearch, setSermonSearch] = useState('');
  const [sermonCategoryFilter, setSermonCategoryFilter] = useState('');
  const [sermonPreacherFilter, setSermonPreacherFilter] = useState('');
  
  // Manual Add Form State
  const [newSermon, setNewSermon] = useState({
    title: '',
    youtube_video_id: '',
    description: '',
    category: 'Sunday Service',
    duration: '1:30:00',
    upload_date: new Date().toISOString().split('T')[0],
    preacher: 'Pastor Immanuel'
  });
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmittingSermon, setIsSubmittingSermon] = useState(false);

  // Devotionals Management State
  const [devotionals, setDevotionals] = useState([]);
  const [isSubmittingDevotional, setIsSubmittingDevotional] = useState(false);
  const [editingDevotionalId, setEditingDevotionalId] = useState(null);
  const [newDevotional, setNewDevotional] = useState({
    title: '',
    content: '',
    author: 'Pastor Immanuel',
    category: 'Daily Promise',
    read_time_minutes: 3
  });

  // Dynamic About Us Editor State
  const [aboutEn, setAboutEn] = useState({});
  const [aboutTa, setAboutTa] = useState({});
  const [isSavingAbout, setIsSavingAbout] = useState(false);
  const [additionalParas, setAdditionalParas] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [faithStatements, setFaithStatements] = useState([]);
  const [congregationImages, setCongregationImages] = useState([]);

  // Timings & Assemblies Schedule State
  const [schedules, setSchedules] = useState([]);
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [newSchedule, setNewSchedule] = useState({
    name: '',
    time: '',
    location: '',
    category: 'Main Worship',
    recurrence: 'Weekly'
  });

  // Ministries Management State
  const [ministries, setMinistries] = useState([]);
  const [isSubmittingMinistry, setIsSubmittingMinistry] = useState(false);
  const [editingMinistryId, setEditingMinistryId] = useState(null);
  const [newMinistry, setNewMinistry] = useState({
    name: '',
    description: '',
    leader: '',
    schedule: '',
    category: '',
    image_url: '',
    gallery_urls: '[]'
  });

  // Special Events Management State (CRUD)
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    location: '',
    image_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
    capacity: 100
  });

  // Study Resources Management State
  const [resources, setResources] = useState([]);
  const [isSubmittingResource, setIsSubmittingResource] = useState(false);
  const [editingResourceId, setEditingResourceId] = useState(null);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    file_url: '',
    file_type: 'PDF',
    category: 'Bible Study'
  });

  // Dynamic file/image base64 uploading helper
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file, subFolder = 'images') => {
    setIsUploading(true);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const res = await fetch(`${API_BASE}/api/upload`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              fileName: file.name,
              base64Data: reader.result,
              subFolder
            })
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || 'Upload failed');
          }
          resolve(data.fileUrl);
        } catch (err) {
          reject(err);
        } finally {
          setIsUploading(false);
        }
      };
      reader.onerror = (error) => {
        setIsUploading(false);
        reject(error);
      };
    });
  };

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

      // 4. Fetch sermons list
      const srmRes = await fetch(`${API_BASE}/api/services`);
      const srmData = await srmRes.json();
      setSermons(srmData);

      // 5. Fetch devotionals list
      const devRes = await fetch(`${API_BASE}/api/blog`);
      if (devRes.ok) {
        const devData = await devRes.json();
        setDevotionals(devData);
      }

      // 6. Fetch dynamic about content
      const abRes = await fetch(`${API_BASE}/api/about`);
      if (abRes.ok) {
        const abData = await abRes.json();
        const enObj = abData.en || {};
        const taObj = abData.ta || {};
        setAboutEn(enObj);
        setAboutTa(taObj);

        // Parse milestones
        try {
          const rawM = enObj.milestones || '[]';
          setMilestones(typeof rawM === 'string' ? JSON.parse(rawM) : rawM);
        } catch(e) { setMilestones([]); }

        // Parse faithStatements
        try {
          const rawF = enObj.faithStatements || '[]';
          setFaithStatements(typeof rawF === 'string' ? JSON.parse(rawF) : rawF);
        } catch(e) { setFaithStatements([]); }

        // Parse aboutParagraphs
        try {
          const rawP = enObj.aboutParagraphs || '[]';
          setAdditionalParas(typeof rawP === 'string' ? JSON.parse(rawP) : rawP);
        } catch(e) { setAdditionalParas([]); }

        // Parse congregation images
        try {
          const rawCI = enObj.aboutImages;
          let parsedCI = [];
          if (rawCI) {
            parsedCI = typeof rawCI === 'string' ? JSON.parse(rawCI) : rawCI;
          }
          if (!Array.isArray(parsedCI) || parsedCI.length === 0) {
            if (enObj.aboutImage) {
              parsedCI = [enObj.aboutImage];
            }
          }
          setCongregationImages(parsedCI);
        } catch(e) { setCongregationImages([]); }
      }

      // 7. Fetch schedules
      const scRes = await fetch(`${API_BASE}/api/schedule`);
      if (scRes.ok) {
        const scData = await scRes.json();
        setSchedules(scData);
      }

      // 8. Fetch ministries
      const mnRes = await fetch(`${API_BASE}/api/ministries`);
      if (mnRes.ok) {
        const mnData = await mnRes.json();
        setMinistries(mnData);
      }

      // 9. Fetch study resources
      const rsRes = await fetch(`${API_BASE}/api/resources`);
      if (rsRes.ok) {
        const rsData = await rsRes.json();
        setResources(rsData);
      }
    } catch (err) {
      console.error('Error fetching dashboard records:', err);
    }
  };

  const handleDeleteSermon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sermon from the website catalog?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/services/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete sermon.');
      }
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddSermon = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsSubmittingSermon(true);

    if (!newSermon.title || !newSermon.youtube_video_id) {
      setFormError('Title and YouTube Video ID are required.');
      setIsSubmittingSermon(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSermon)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create manual sermon entry.');
      }

      setFormSuccess('Sermon successfully cataloged manually!');
      setNewSermon({
        title: '',
        youtube_video_id: '',
        description: '',
        category: 'Sunday Service',
        duration: '1:30:00',
        upload_date: new Date().toISOString().split('T')[0],
        preacher: 'Pastor Immanuel'
      });
      fetchDashboardData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmittingSermon(false);
    }
  };

  const handleSaveDevotional = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsSubmittingDevotional(true);

    if (!newDevotional.title || !newDevotional.content) {
      setFormError('Title and content are required.');
      setIsSubmittingDevotional(false);
      return;
    }

    try {
      const url = editingDevotionalId 
        ? `${API_BASE}/api/blog/${editingDevotionalId}` 
        : `${API_BASE}/api/blog`;
      const method = editingDevotionalId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newDevotional)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save devotional.');
      }

      setFormSuccess(editingDevotionalId ? 'Devotional updated successfully!' : 'Devotional published successfully!');
      setNewDevotional({
        title: '',
        content: '',
        author: 'Pastor Immanuel',
        category: 'Daily Promise',
        read_time_minutes: 3
      });
      setEditingDevotionalId(null);
      fetchDashboardData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmittingDevotional(false);
    }
  };

  const handleDeleteDevotional = async (id) => {
    if (!window.confirm('Are you sure you want to delete this devotional?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/blog/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete devotional.');
      }
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStartEditDevotional = (dev) => {
    setEditingDevotionalId(dev.id);
    setNewDevotional({
      title: dev.title,
      content: dev.content,
      author: dev.author,
      category: dev.category,
      read_time_minutes: dev.read_time_minutes
    });
    setFormError('');
    setFormSuccess('');
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  const handleCancelEditDevotional = () => {
    setEditingDevotionalId(null);
    setNewDevotional({
      title: '',
      content: '',
      author: 'Pastor Immanuel',
      category: 'Daily Promise',
      read_time_minutes: 3
    });
    setFormError('');
    setFormSuccess('');
  };

  // 1. About Us Handler
  const handleSaveAbout = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsSavingAbout(true);

    try {
      const updatedEn = {
        ...aboutEn,
        milestones: JSON.stringify(milestones),
        faithStatements: JSON.stringify(faithStatements),
        aboutParagraphs: JSON.stringify(additionalParas),
        aboutImages: JSON.stringify(congregationImages),
        aboutImage: congregationImages[0] || ''
      };
      const updatedTa = {
        ...aboutTa,
        milestones: JSON.stringify(milestones),
        faithStatements: JSON.stringify(faithStatements),
        aboutParagraphs: JSON.stringify(additionalParas),
        aboutImages: JSON.stringify(congregationImages),
        aboutImage: congregationImages[0] || ''
      };

      const res = await fetch(`${API_BASE}/api/about`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ en: updatedEn, ta: updatedTa })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save about content.');
      }

      setFormSuccess('About Us content updated successfully!');
      if (typeof fetchDynamicAbout === 'function') {
        fetchDynamicAbout();
      }
      fetchDashboardData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSavingAbout(false);
    }
  };

  // 2. Timings & Assemblies Schedule Handlers
  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsSubmittingSchedule(true);

    try {
      const url = editingScheduleId 
        ? `${API_BASE}/api/schedule/${editingScheduleId}` 
        : `${API_BASE}/api/schedule`;
      const method = editingScheduleId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSchedule)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save schedule.');
      }

      setFormSuccess(editingScheduleId ? 'Schedule updated successfully!' : 'Schedule added successfully!');
      setNewSchedule({
        name: '',
        time: '',
        location: '',
        category: 'Main Worship',
        recurrence: 'Weekly'
      });
      setEditingScheduleId(null);
      fetchDashboardData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Are you sure you want to delete this schedule entry?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/schedule/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete schedule.');
      }
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStartEditSchedule = (sched) => {
    setEditingScheduleId(sched.id);
    setNewSchedule({
      name: sched.name,
      time: sched.time,
      location: sched.location,
      category: sched.category,
      recurrence: sched.recurrence
    });
    setFormError('');
    setFormSuccess('');
  };

  const handleCancelEditSchedule = () => {
    setEditingScheduleId(null);
    setNewSchedule({
      name: '',
      time: '',
      location: '',
      category: 'Main Worship',
      recurrence: 'Weekly'
    });
    setFormError('');
    setFormSuccess('');
  };

  // 3. Ministries Handlers
  const handleSaveMinistry = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsSubmittingMinistry(true);

    try {
      const url = editingMinistryId 
        ? `${API_BASE}/api/ministries/${editingMinistryId}` 
        : `${API_BASE}/api/ministries`;
      const method = editingMinistryId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newMinistry)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save ministry.');
      }

      setFormSuccess(editingMinistryId ? 'Ministry updated successfully!' : 'Ministry added successfully!');
      setNewMinistry({
        name: '',
        description: '',
        leader: '',
        schedule: '',
        category: '',
        image_url: ''
      });
      setEditingMinistryId(null);
      fetchDashboardData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmittingMinistry(false);
    }
  };

  const handleDeleteMinistry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ministry?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/ministries/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete ministry.');
      }
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStartEditMinistry = (min) => {
    setEditingMinistryId(min.id);
    setNewMinistry({
      name: min.name,
      description: min.description,
      leader: min.leader,
      schedule: min.schedule,
      category: min.category,
      image_url: min.image_url
    });
    setFormError('');
    setFormSuccess('');
  };

  const handleCancelEditMinistry = () => {
    setEditingMinistryId(null);
    setNewMinistry({
      name: '',
      description: '',
      leader: '',
      schedule: '',
      category: '',
      image_url: ''
    });
    setFormError('');
    setFormSuccess('');
  };

  // 4. Special Events Handlers
  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsSubmittingEvent(true);

    try {
      const url = editingEventId 
        ? `${API_BASE}/api/events/${editingEventId}` 
        : `${API_BASE}/api/events`;
      const method = editingEventId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newEvent)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save event.');
      }

      setFormSuccess(editingEventId ? 'Event updated successfully!' : 'Event created successfully!');
      setNewEvent({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        location: '',
        image_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
        capacity: 100
      });
      setEditingEventId(null);
      fetchDashboardData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event? This will also remove all registrations for this event!')) return;
    try {
      const res = await fetch(`${API_BASE}/api/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete event.');
      }
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStartEditEvent = (evt) => {
    setEditingEventId(evt.id);
    setNewEvent({
      title: evt.title,
      description: evt.description,
      date: evt.date,
      time: evt.time,
      location: evt.location,
      image_url: evt.image_url,
      capacity: evt.capacity
    });
    setFormError('');
    setFormSuccess('');
  };

  const handleCancelEditEvent = () => {
    setEditingEventId(null);
    setNewEvent({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      location: '',
      image_url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
      capacity: 100
    });
    setFormError('');
    setFormSuccess('');
  };

  // 5. Study Resources Handlers
  const handleSaveResource = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setIsSubmittingResource(true);

    try {
      const url = editingResourceId 
        ? `${API_BASE}/api/resources/${editingResourceId}` 
        : `${API_BASE}/api/resources`;
      const method = editingResourceId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newResource)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save resource.');
      }

      setFormSuccess(editingResourceId ? 'Study resource updated successfully!' : 'Study resource cataloged successfully!');
      setNewResource({
        title: '',
        description: '',
        file_url: '',
        file_type: 'PDF',
        category: 'Bible Study'
      });
      setEditingResourceId(null);
      fetchDashboardData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmittingResource(false);
    }
  };

  const handleDeleteResource = async (id) => {
    if (!window.confirm('Are you sure you want to remove this downloadable resource?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/resources/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete resource.');
      }
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStartEditResource = (rs) => {
    setEditingResourceId(rs.id);
    setNewResource({
      title: rs.title,
      description: rs.description,
      file_url: rs.file_url,
      file_type: rs.file_type,
      category: rs.category
    });
    setFormError('');
    setFormSuccess('');
  };

  const handleCancelEditResource = () => {
    setEditingResourceId(null);
    setNewResource({
      title: '',
      description: '',
      file_url: '',
      file_type: 'PDF',
      category: 'Bible Study'
    });
    setFormError('');
    setFormSuccess('');
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
        <div className="flex flex-wrap border-b border-slate-200 gap-x-6 gap-y-2 mb-6">
          <button 
            onClick={() => setActiveTab('summary')}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === 'summary' ? 'text-amber-600 border-b-2 border-amber-500 font-extrabold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Prayers Queue ({prayers.length})
          </button>
          
          <button 
            onClick={() => setActiveTab('sermons')}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === 'sermons' ? 'text-amber-600 border-b-2 border-amber-500 font-extrabold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Sermons Manager ({sermons.length})
          </button>

          <button 
            onClick={() => setActiveTab('events')}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === 'events' ? 'text-amber-600 border-b-2 border-amber-500 font-extrabold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Events Manager ({events.length})
          </button>

          <button 
            onClick={() => setActiveTab('about')}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === 'about' ? 'text-amber-600 border-b-2 border-amber-500 font-extrabold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            About Us Content
          </button>

          <button 
            onClick={() => setActiveTab('schedules')}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === 'schedules' ? 'text-amber-600 border-b-2 border-amber-500 font-extrabold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Timings & Assemblies ({schedules.length})
          </button>

          <button 
            onClick={() => setActiveTab('ministries')}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === 'ministries' ? 'text-amber-600 border-b-2 border-amber-500 font-extrabold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Ministries ({ministries.length})
          </button>

          <button 
            onClick={() => setActiveTab('resources')}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === 'resources' ? 'text-amber-600 border-b-2 border-amber-500 font-extrabold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Resources ({resources.length})
          </button>

          <button 
            onClick={() => setActiveTab('devotionals')}
            className={`pb-3 text-sm font-bold transition-all relative ${
              activeTab === 'devotionals' ? 'text-amber-600 border-b-2 border-amber-500 font-extrabold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Devotionals ({devotionals.length})
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



        {/* 3. SPECIAL EVENTS MANAGER PANEL */}
        {activeTab === 'events' && (
          <div className="flex flex-col gap-8 animate-slideup">
            {/* Top row - Form & instructions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add/Edit Event Form */}
              <div className="lg:col-span-1 glass-panel p-6 bg-white border-slate-200 shadow-sm flex flex-col gap-4">
                <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-amber-500" />
                  <h3 className="font-serif font-bold text-lg text-slate-900">
                    {editingEventId ? 'Edit Calendar Event' : 'Create Special Event'}
                  </h3>
                </div>

                <form onSubmit={handleSaveEvent} className="flex flex-col gap-4 text-left">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Event Title *</label>
                    <input 
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="e.g. Annual Youth Retreat 2026"
                      className="input-control w-full text-slate-950 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Date (YYYY-MM-DD) *</label>
                    <input 
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="input-control w-full text-slate-950 bg-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Time *</label>
                      <input 
                        type="text"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                        placeholder="e.g. 06:00 PM"
                        className="input-control w-full text-slate-950 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Capacity *</label>
                      <input 
                        type="number"
                        value={newEvent.capacity}
                        onChange={(e) => setNewEvent({ ...newEvent, capacity: parseInt(e.target.value, 10) || 100 })}
                        className="input-control w-full text-slate-950 bg-white"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Location / Venue *</label>
                    <input 
                      type="text"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      placeholder="e.g. Sharjah Worship Hall"
                      className="input-control w-full text-slate-950 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Image URL / Selector</label>
                    <input 
                      type="text"
                      value={newEvent.image_url}
                      onChange={(e) => setNewEvent({ ...newEvent, image_url: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="input-control w-full text-slate-950 bg-white font-mono text-xs mb-2"
                    />
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          try {
                            const url = await uploadFile(file);
                            setNewEvent({ ...newEvent, image_url: url });
                          } catch (err) {
                            alert('Upload failed: ' + err.message);
                          }
                        }
                      }}
                      className="input-control w-full text-slate-950 bg-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Event Description</label>
                    <textarea 
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      placeholder="Share details, guest speakers, key activities..."
                      rows="3"
                      className="input-control w-full text-slate-950 bg-white"
                    />
                  </div>

                  {formError && <span className="text-xs font-bold text-red-600 block">{formError}</span>}
                  {formSuccess && <span className="text-xs font-bold text-emerald-600 block">{formSuccess}</span>}

                  <div className="flex gap-2 border-t border-slate-100 pt-3">
                    {editingEventId && (
                      <button 
                        type="button"
                        onClick={handleCancelEditEvent}
                        className="btn-secondary py-2 px-4 text-xs flex-1"
                      >
                        Cancel
                      </button>
                    )}
                    <button 
                      type="submit"
                      disabled={isSubmittingEvent}
                      className="btn-primary justify-center py-2 px-4 text-xs flex-1"
                    >
                      {isSubmittingEvent ? 'Saving...' : (editingEventId ? 'Update Event' : 'Create Event')}
                    </button>
                  </div>
                </form>
              </div>

              {/* List of Current Events & Bookings */}
              <div className="lg:col-span-2 flex flex-col gap-6 text-left">
                <div className="glass-panel p-4 bg-slate-900 border-amber-500/25 text-white flex justify-between items-center">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-white">Scheduled Calendar Events</h3>
                    <p className="text-xs text-slate-400">Manage registrations, edit details, and add slots.</p>
                  </div>
                </div>

                {events.length === 0 ? (
                  <div className="glass-panel p-8 text-center bg-white border-slate-200 text-slate-400 font-semibold italic">
                    No upcoming events are currently cataloged.
                  </div>
                ) : (
                  events.map((evt) => {
                    const bookedPercent = Math.min(100, Math.round(((evt.registeredCount || 0) / evt.capacity) * 100));
                    return (
                      <div key={evt.id} className="glass-panel overflow-hidden bg-white border-slate-200 shadow-sm flex flex-col">
                        <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                          <div className="flex items-center gap-3">
                            {evt.image_url && (
                              <img 
                                src={evt.image_url} 
                                alt={evt.title} 
                                className="w-12 h-12 rounded object-cover border border-slate-200"
                              />
                            )}
                            <div>
                              <h4 className="font-serif font-bold text-base text-slate-900">{evt.title}</h4>
                              <span className="text-[11px] text-slate-500 font-semibold block md:inline">
                                📅 {evt.date} | ⏰ {evt.time} | 📍 {evt.location}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2 self-stretch md:self-auto justify-end">
                            <button 
                              onClick={() => handleStartEditEvent(evt)}
                              className="p-1.5 rounded bg-amber-50 text-amber-600 hover:bg-amber-100"
                              title="Edit Event"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteEvent(evt.id)}
                              className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100"
                              title="Delete Event"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="p-4 flex flex-col gap-4">
                          <div className="text-xs text-slate-600 leading-relaxed font-normal">
                            {evt.description || <span className="italic text-slate-400">No description provided.</span>}
                          </div>

                          {/* Capacity tracker bar */}
                          <div className="flex flex-col gap-1.5 bg-slate-50 p-3 rounded border border-slate-100">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                              <span>Capacity Bookings</span>
                              <span>{evt.registeredCount || 0} / {evt.capacity} seats ({bookedPercent}%)</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-500 ${
                                  bookedPercent >= 90 
                                    ? 'bg-red-500' 
                                    : bookedPercent >= 75 
                                    ? 'bg-amber-500' 
                                    : 'bg-emerald-500'
                                }`} 
                                style={{ width: `${bookedPercent}%` }}
                              />
                            </div>
                          </div>

                          {/* Attendee Roster sub-component */}
                          <div className="border-t border-slate-100 pt-3">
                            <h5 className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-2">
                              Registered Passenger Roster ({evt.registeredCount || 0} booked)
                            </h5>
                            <EventRoster eventId={evt.id} token={token} />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. SERMONS MANAGER PANEL */}
        {activeTab === 'sermons' && (
          <div className="flex flex-col gap-8 animate-slideup">
            {/* Top row - Form */}
            <div className="grid grid-cols-1 gap-6">
              {/* Manual Add form */}
              <div className="glass-panel p-6 bg-white border-slate-200 shadow-sm flex flex-col gap-4">
                <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-amber-500" />
                  <h3 className="font-serif font-bold text-lg text-slate-900">Add Sermon Manually</h3>
                </div>

                <form onSubmit={handleAddSermon} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Sermon Video Title *</label>
                    <input 
                      type="text"
                      value={newSermon.title}
                      onChange={(e) => setNewSermon({ ...newSermon, title: e.target.value })}
                      placeholder="e.g. 24/5/26 | SUNDAY SERVICE | Worship: Bro. Durai | Message: Pastor Immanuel"
                      className="input-control w-full text-slate-950 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">YouTube Video ID *</label>
                    <input 
                      type="text"
                      value={newSermon.youtube_video_id}
                      onChange={(e) => setNewSermon({ ...newSermon, youtube_video_id: e.target.value })}
                      placeholder="e.g. pRUBl8hbfWM"
                      className="input-control w-full text-slate-950 bg-white font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Sermon Category</label>
                    <select
                      value={newSermon.category}
                      onChange={(e) => setNewSermon({ ...newSermon, category: e.target.value })}
                      className="input-control w-full text-slate-950 bg-white"
                    >
                      <option value="Sunday Service">Sunday Service</option>
                      <option value="Midweek Prayer">Midweek Prayer</option>
                      <option value="New Year Service">New Year Service</option>
                      <option value="Christmas Service">Christmas Service</option>
                      <option value="Fasting Prayer">Fasting Prayer</option>
                      <option value="Youth & Children">Youth & Children</option>
                      <option value="Sisters Fellowship">Sisters Fellowship</option>
                      <option value="Retreats & Special">Retreats & Special</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Preacher Name</label>
                    <input 
                      type="text"
                      value={newSermon.preacher}
                      onChange={(e) => setNewSermon({ ...newSermon, preacher: e.target.value })}
                      placeholder="e.g. Pastor Immanuel"
                      className="input-control w-full text-slate-950 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Upload Date (YYYY-MM-DD)</label>
                    <input 
                      type="date"
                      value={newSermon.upload_date}
                      onChange={(e) => setNewSermon({ ...newSermon, upload_date: e.target.value })}
                      className="input-control w-full text-slate-950 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Video Duration (H:MM:SS)</label>
                    <input 
                      type="text"
                      value={newSermon.duration}
                      onChange={(e) => setNewSermon({ ...newSermon, duration: e.target.value })}
                      placeholder="e.g. 2:15:00"
                      className="input-control w-full text-slate-950 bg-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Sermon Description</label>
                    <textarea 
                      value={newSermon.description}
                      onChange={(e) => setNewSermon({ ...newSermon, description: e.target.value })}
                      placeholder="Enter sermon details or scriptures shared..."
                      rows="3"
                      className="input-control w-full text-slate-950 bg-white"
                    />
                  </div>

                  {formError && <span className="md:col-span-2 text-xs font-bold text-red-600">{formError}</span>}
                  {formSuccess && <span className="md:col-span-2 text-xs font-bold text-emerald-600">{formSuccess}</span>}

                  <button 
                    type="submit"
                    disabled={isSubmittingSermon}
                    className="md:col-span-2 btn-primary justify-center w-full py-2.5"
                  >
                    {isSubmittingSermon ? 'Saving sermon to catalog...' : 'Add Sermon to Website'}
                  </button>
                </form>
              </div>
            </div>

            {/* Filter and Search Bar for table */}
            <div className="glass-panel p-5 bg-white border-slate-200 flex flex-wrap gap-4 items-center justify-between shadow-sm">
              <div className="flex-1 min-w-[280px]">
                <input 
                  type="text"
                  placeholder="Filter cached sermons by title keyword..."
                  value={sermonSearch}
                  onChange={(e) => setSermonSearch(e.target.value)}
                  className="input-control w-full text-slate-950 bg-white"
                />
              </div>

              <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                <select 
                  value={sermonCategoryFilter}
                  onChange={(e) => setSermonCategoryFilter(e.target.value)}
                  className="input-control py-2 text-sm text-slate-950 bg-white"
                >
                  <option value="">All Categories</option>
                  <option value="Sunday Service">Sunday Service</option>
                  <option value="Midweek Prayer">Midweek Prayer</option>
                  <option value="New Year Service">New Year Service</option>
                  <option value="Christmas Service">Christmas Service</option>
                  <option value="Fasting Prayer">Fasting Prayer</option>
                  <option value="Youth & Children">Youth & Children</option>
                  <option value="Sisters Fellowship">Sisters Fellowship</option>
                  <option value="Retreats & Special">Retreats & Special</option>
                </select>

                <select 
                  value={sermonPreacherFilter}
                  onChange={(e) => setSermonPreacherFilter(e.target.value)}
                  className="input-control py-2 text-sm text-slate-950 bg-white"
                >
                  <option value="">All Preachers</option>
                  <option value="Pastor Immanuel">Pastor Immanuel</option>
                  <option value="Rev. Andrew">Rev. Andrew</option>
                  <option value="Bro. Durai">Bro. Durai</option>
                  <option value="Bro. William">Bro. William</option>
                  <option value="Asst. Past. Paulsamy">Asst. Past. Paulsamy</option>
                  <option value="Bro. Ruskin">Bro. Ruskin</option>
                  <option value="Br. Jeyaraj">Br. Jeyaraj</option>
                  <option value="Pastor Regilin">Pastor Regilin</option>
                  <option value="Sis. Mary Immanuel">Sis. Mary Immanuel</option>
                  <option value="Bro. Gunaseelan">Bro. Gunaseelan</option>
                </select>
              </div>
            </div>

            {/* Sermons Table */}
            <div className="glass-panel overflow-hidden bg-white border-slate-200 shadow-sm">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold text-xs uppercase tracking-wider">
                    <th className="p-4 w-[160px]">Sermon Video</th>
                    <th className="p-4">Title & Details</th>
                    <th className="p-4">Preacher</th>
                    <th className="p-4">Upload Date</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-semibold text-slate-700">
                  {sermons
                    .filter((srm) => {
                      const matchSearch = srm.title.toLowerCase().includes(sermonSearch.toLowerCase());
                      const matchCat = !sermonCategoryFilter || srm.category === sermonCategoryFilter;
                      const matchPreach = !sermonPreacherFilter || srm.preacher === sermonPreacherFilter;
                      return matchSearch && matchCat && matchPreach;
                    })
                    .map((srm) => (
                      <tr key={srm.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <a 
                            href={`https://www.youtube.com/watch?v=${srm.youtube_video_id}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="block relative overflow-hidden bg-slate-950 aspect-video rounded border border-slate-200 group shrink-0"
                          >
                            <img 
                              src={`https://img.youtube.com/vi/${srm.youtube_video_id}/mqdefault.jpg`}
                              alt={srm.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/75 text-white text-[9px] font-bold">
                              {srm.duration}
                            </span>
                          </a>
                        </td>
                        <td className="p-4">
                          <a 
                            href={`https://www.youtube.com/watch?v=${srm.youtube_video_id}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-slate-900 font-bold hover:text-amber-500 transition-colors line-clamp-2 leading-tight block mb-1"
                          >
                            {srm.title}
                          </a>
                          <div className="flex gap-2 items-center">
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-extrabold uppercase rounded">
                              {srm.category}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              ID: {srm.youtube_video_id}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600 text-xs font-bold">{srm.preacher}</td>
                        <td className="p-4 text-slate-500 font-mono text-xs">{srm.upload_date}</td>
                        <td className="p-4">
                          <div className="flex gap-2 justify-center">
                            <button 
                              onClick={() => handleDeleteSermon(srm.id)}
                              className="p-2 rounded bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                              title="Delete Sermon from website database cache"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. ABOUT US CONTENT PANEL */}
        {activeTab === 'about' && (
          <div className="flex flex-col gap-6 animate-slideup text-left">
            <div className="glass-panel p-6 bg-slate-900 border-amber-500/20 text-white shadow-sm flex flex-col gap-2">
              <h3 className="font-serif font-bold text-lg text-white">About Us Content Editor</h3>
              <p className="text-xs text-slate-400">
                Directly change paragraphs, faith declarations, and historic timeline points in both English and Tamil. 
                All layout and headings will remain untouched.
              </p>
            </div>

            <form onSubmit={handleSaveAbout} className="flex flex-col gap-6">
              {/* Congregation Banner Images (Multiple Carousel Images) */}
              <div className="glass-panel p-6 bg-white border-slate-200 shadow-sm flex flex-col gap-5">
                <h4 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
                  Congregation Banner Images (Home Hero Carousel)
                </h4>
                <div className="flex flex-col gap-4">
                  <label className="text-xs font-bold text-slate-700 block">Current Carousel Banner Images</label>
                  {congregationImages.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 border border-slate-100 p-3 rounded-xl bg-slate-50">
                      {congregationImages.map((url, idx) => (
                        <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 group bg-slate-100 shadow-sm">
                          <img src={url} alt={`Congregation Banner ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = congregationImages.filter((_, i) => i !== idx);
                              setCongregationImages(updated);
                            }}
                            className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                          <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-sans">
                            Slide {idx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50 text-slate-400 text-xs">
                      No Carousel Images. Upload some below.
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-700 block">Upload New Images</label>
                    <input 
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={async (e) => {
                        const files = Array.from(e.target.files);
                        const newUrls = [];
                        for (const file of files) {
                          try {
                            const url = await uploadFile(file);
                            newUrls.push(url);
                          } catch (err) {
                            alert('Upload failed: ' + err.message);
                          }
                        }
                        if (newUrls.length > 0) {
                          setCongregationImages([...congregationImages, ...newUrls]);
                        }
                      }}
                      className="input-control w-full text-slate-950 bg-white"
                    />
                    <p className="text-xs text-slate-500">
                      Select one or more high-quality photos to display in the website's initial sliding carousel. Drag/Upload more to extend. Hover and click the trash can overlay to remove images.
                    </p>
                  </div>
                </div>
              </div>


              {/* General Headers and Vision Section */}
              <div className="glass-panel p-6 bg-white border-slate-200 shadow-sm flex flex-col gap-5">
                <h4 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
                  Header Subtitle & Vision Statements
                </h4>
                
                {/* aboutHeaderSub */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Header Subtitle (English)</label>
                    <textarea 
                      value={aboutEn.aboutHeaderSub || ''}
                      onChange={(e) => setAboutEn({ ...aboutEn, aboutHeaderSub: e.target.value })}
                      className="input-control w-full text-slate-950 bg-white"
                      rows="2"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Header Subtitle (Tamil)</label>
                    <textarea 
                      value={aboutTa.aboutHeaderSub || ''}
                      onChange={(e) => setAboutTa({ ...aboutTa, aboutHeaderSub: e.target.value })}
                      className="input-control w-full text-slate-950 bg-white"
                      rows="2"
                    />
                  </div>
                </div>

                {/* aboutTitle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">History Title (English)</label>
                    <input 
                      type="text"
                      value={aboutEn.aboutTitle || ''}
                      onChange={(e) => setAboutEn({ ...aboutEn, aboutTitle: e.target.value })}
                      className="input-control w-full text-slate-950 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">History Title (Tamil)</label>
                    <input 
                      type="text"
                      value={aboutTa.aboutTitle || ''}
                      onChange={(e) => setAboutTa({ ...aboutTa, aboutTitle: e.target.value })}
                      className="input-control w-full text-slate-950 bg-white"
                    />
                  </div>
                </div>

                {/* aboutPara1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">History Paragraph 1 (English)</label>
                    <textarea 
                      value={aboutEn.aboutPara1 || ''}
                      onChange={(e) => setAboutEn({ ...aboutEn, aboutPara1: e.target.value })}
                      className="input-control w-full text-slate-950 bg-white"
                      rows="4"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">History Paragraph 1 (Tamil)</label>
                    <textarea 
                      value={aboutTa.aboutPara1 || ''}
                      onChange={(e) => setAboutTa({ ...aboutTa, aboutPara1: e.target.value })}
                      className="input-control w-full text-slate-950 bg-white"
                      rows="4"
                    />
                  </div>
                </div>

                {/* aboutPara2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">History Paragraph 2 (English)</label>
                    <textarea 
                      value={aboutEn.aboutPara2 || ''}
                      onChange={(e) => setAboutEn({ ...aboutEn, aboutPara2: e.target.value })}
                      className="input-control w-full text-slate-950 bg-white"
                      rows="4"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">History Paragraph 2 (Tamil)</label>
                    <textarea 
                      value={aboutTa.aboutPara2 || ''}
                      onChange={(e) => setAboutTa({ ...aboutTa, aboutPara2: e.target.value })}
                      className="input-control w-full text-slate-950 bg-white"
                      rows="4"
                    />
                  </div>
                </div>

                {/* aboutMission */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Mission Restatement (English)</label>
                    <textarea 
                      value={aboutEn.aboutMission || ''}
                      onChange={(e) => setAboutEn({ ...aboutEn, aboutMission: e.target.value })}
                      className="input-control w-full text-slate-950 bg-white"
                      rows="2"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Mission Restatement (Tamil)</label>
                    <textarea 
                      value={aboutTa.aboutMission || ''}
                      onChange={(e) => setAboutTa({ ...aboutTa, aboutMission: e.target.value })}
                      className="input-control w-full text-slate-950 bg-white"
                      rows="2"
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Paragraphs Manager */}
              <div className="glass-panel p-6 bg-white border-slate-200 shadow-sm flex flex-col gap-5">
                <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                  <h4 className="font-serif font-bold text-base text-slate-900">
                    Additional History Paragraphs (Dynamic)
                  </h4>
                  <button
                    type="button"
                    onClick={() => setAdditionalParas([...additionalParas, { en: '', ta: '' }])}
                    className="btn-primary py-1 px-3 text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Paragraph
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {additionalParas.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No extra history paragraphs added yet. Click 'Add Paragraph' to add more.</p>
                  ) : (
                    additionalParas.map((para, idx) => (
                      <div key={idx} className="border border-slate-100 p-4 rounded bg-slate-50 flex flex-col gap-3 relative group">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                          <span className="text-xs font-extrabold text-amber-600">Extra Paragraph #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => setAdditionalParas(additionalParas.filter((_, i) => i !== idx))}
                            className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                            title="Remove Paragraph"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-slate-600 block mb-1">Paragraph Text (English)</label>
                            <textarea
                              value={para.en}
                              onChange={(e) => {
                                const copy = [...additionalParas];
                                copy[idx].en = e.target.value;
                                setAdditionalParas(copy);
                              }}
                              className="input-control w-full text-slate-950 bg-white"
                              rows="3"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-slate-600 block mb-1">Paragraph Text (Tamil)</label>
                            <textarea
                              value={para.ta}
                              onChange={(e) => {
                                const copy = [...additionalParas];
                                copy[idx].ta = e.target.value;
                                setAdditionalParas(copy);
                              }}
                              className="input-control w-full text-slate-950 bg-white"
                              rows="3"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Dynamic timeline Milestones */}
              <div className="glass-panel p-6 bg-white border-slate-200 shadow-sm flex flex-col gap-5">
                <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                  <h4 className="font-serif font-bold text-base text-slate-900">
                    Historic Timeline Milestones
                  </h4>
                  <button
                    type="button"
                    onClick={() => setMilestones([...milestones, { year: '', titleEn: '', titleTa: '', descEn: '', descTa: '' }])}
                    className="btn-primary py-1 px-3 text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Milestone
                  </button>
                </div>

                <div className="flex flex-col gap-6">
                  {milestones.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No milestones defined. Click 'Add Milestone' to begin.</p>
                  ) : (
                    milestones.map((m, idx) => (
                      <div key={idx} className="border border-slate-100 p-4 rounded bg-slate-50 flex flex-col gap-4 relative">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                          <span className="text-xs font-extrabold text-amber-600">Milestone #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => setMilestones(milestones.filter((_, i) => i !== idx))}
                            className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                            title="Remove Milestone"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                          <div className="md:col-span-1">
                            <label className="text-[10px] uppercase font-bold text-slate-600 block mb-1">Year</label>
                            <input 
                              type="text"
                              value={m.year}
                              onChange={(e) => {
                                const copy = [...milestones];
                                copy[idx].year = e.target.value;
                                setMilestones(copy);
                              }}
                              placeholder="e.g. 1996"
                              className="input-control w-full text-slate-950 bg-white"
                              required
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-[10px] uppercase font-bold text-slate-600 block mb-1">Title (English)</label>
                            <input 
                              type="text"
                              value={m.titleEn}
                              onChange={(e) => {
                                const copy = [...milestones];
                                copy[idx].titleEn = e.target.value;
                                setMilestones(copy);
                              }}
                              className="input-control w-full text-slate-950 bg-white"
                              required
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="text-[10px] uppercase font-bold text-slate-600 block mb-1">Title (Tamil)</label>
                            <input 
                              type="text"
                              value={m.titleTa}
                              onChange={(e) => {
                                const copy = [...milestones];
                                copy[idx].titleTa = e.target.value;
                                setMilestones(copy);
                              }}
                              className="input-control w-full text-slate-950 bg-white"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-slate-600 block mb-1">Description (English)</label>
                            <textarea 
                              value={m.descEn}
                              onChange={(e) => {
                                const copy = [...milestones];
                                copy[idx].descEn = e.target.value;
                                setMilestones(copy);
                              }}
                              className="input-control w-full text-slate-950 bg-white"
                              rows="2"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-slate-600 block mb-1">Description (Tamil)</label>
                            <textarea 
                              value={m.descTa}
                              onChange={(e) => {
                                const copy = [...milestones];
                                copy[idx].descTa = e.target.value;
                                setMilestones(copy);
                              }}
                              className="input-control w-full text-slate-950 bg-white"
                              rows="2"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Dynamic Statements of Faith */}
              <div className="glass-panel p-6 bg-white border-slate-200 shadow-sm flex flex-col gap-5">
                <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
                  <h4 className="font-serif font-bold text-base text-slate-900">
                    Statements of Faith (Core Beliefs)
                  </h4>
                  <button
                    type="button"
                    onClick={() => setFaithStatements([...faithStatements, { titleEn: '', titleTa: '', descEn: '', descTa: '' }])}
                    className="btn-primary py-1 px-3 text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Statement
                  </button>
                </div>

                <div className="flex flex-col gap-6">
                  {faithStatements.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No faith statements defined. Click 'Add Statement' to begin.</p>
                  ) : (
                    faithStatements.map((f, idx) => (
                      <div key={idx} className="border border-slate-100 p-4 rounded bg-slate-50 flex flex-col gap-4 relative">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                          <span className="text-xs font-extrabold text-amber-600">Belief Statement #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => setFaithStatements(faithStatements.filter((_, i) => i !== idx))}
                            className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                            title="Remove Statement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-slate-600 block mb-1">Title (English)</label>
                            <input 
                              type="text"
                              value={f.titleEn}
                              onChange={(e) => {
                                const copy = [...faithStatements];
                                copy[idx].titleEn = e.target.value;
                                setFaithStatements(copy);
                              }}
                              className="input-control w-full text-slate-950 bg-white"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-slate-600 block mb-1">Title (Tamil)</label>
                            <input 
                              type="text"
                              value={f.titleTa}
                              onChange={(e) => {
                                const copy = [...faithStatements];
                                copy[idx].titleTa = e.target.value;
                                setFaithStatements(copy);
                              }}
                              className="input-control w-full text-slate-950 bg-white"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-slate-600 block mb-1">Description (English)</label>
                            <textarea 
                              value={f.descEn}
                              onChange={(e) => {
                                const copy = [...faithStatements];
                                copy[idx].descEn = e.target.value;
                                setFaithStatements(copy);
                              }}
                              className="input-control w-full text-slate-950 bg-white"
                              rows="3"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-slate-600 block mb-1">Description (Tamil)</label>
                            <textarea 
                              value={f.descTa}
                              onChange={(e) => {
                                const copy = [...faithStatements];
                                copy[idx].descTa = e.target.value;
                                setFaithStatements(copy);
                              }}
                              className="input-control w-full text-slate-950 bg-white"
                              rows="3"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {formError && <span className="text-xs font-bold text-red-600 block text-center">{formError}</span>}
              {formSuccess && <span className="text-xs font-bold text-emerald-600 block text-center">{formSuccess}</span>}

              <div className="flex justify-end gap-3 pb-8">
                <button 
                  type="submit"
                  disabled={isSavingAbout}
                  className="btn-primary py-2.5 px-8 text-sm"
                >
                  {isSavingAbout ? 'Saving Content Changes...' : 'Save All Content Updates'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 6. TIMINGS & ASSEMBLIES PANEL */}
        {activeTab === 'schedules' && (
          <div className="flex flex-col gap-8 animate-slideup text-left">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add / Edit Form */}
              <div className="lg:col-span-1 glass-panel p-6 bg-white border-slate-200 shadow-sm flex flex-col gap-4">
                <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-amber-500" />
                  <h3 className="font-serif font-bold text-lg text-slate-900">
                    {editingScheduleId ? 'Edit Assembly Time' : 'Add New Assembly'}
                  </h3>
                </div>

                <form onSubmit={handleSaveSchedule} className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Assembly Name *</label>
                    <input 
                      type="text"
                      value={newSchedule.name}
                      onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                      placeholder="e.g. Sunday First Service"
                      className="input-control w-full text-slate-950 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Service Time / Hour *</label>
                    <input 
                      type="text"
                      value={newSchedule.time}
                      onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
                      placeholder="e.g. 09:00 AM - 10:45 AM"
                      className="input-control w-full text-slate-950 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Location / Venue *</label>
                    <input 
                      type="text"
                      value={newSchedule.location}
                      onChange={(e) => setNewSchedule({ ...newSchedule, location: e.target.value })}
                      placeholder="e.g. St. Martin's Church Hall"
                      className="input-control w-full text-slate-950 bg-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                      <select 
                        value={newSchedule.category}
                        onChange={(e) => setNewSchedule({ ...newSchedule, category: e.target.value })}
                        className="input-control w-full text-slate-950 bg-white"
                      >
                        <option value="Main Worship">Main Worship</option>
                        <option value="Sunday School">Sunday School</option>
                        <option value="Youth">Youth</option>
                        <option value="Fellowship">Fellowship</option>
                        <option value="Prayer Meeting">Prayer Meeting</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Recurrence</label>
                      <input 
                        type="text"
                        value={newSchedule.recurrence}
                        onChange={(e) => setNewSchedule({ ...newSchedule, recurrence: e.target.value })}
                        placeholder="Weekly, Monthly..."
                        className="input-control w-full text-slate-950 bg-white"
                      />
                    </div>
                  </div>

                  {formError && <span className="text-xs font-bold text-red-600 block">{formError}</span>}
                  {formSuccess && <span className="text-xs font-bold text-emerald-600 block">{formSuccess}</span>}

                  <div className="flex gap-2 border-t border-slate-100 pt-3 mt-1">
                    {editingScheduleId && (
                      <button 
                        type="button"
                        onClick={handleCancelEditSchedule}
                        className="btn-secondary py-2 px-4 text-xs flex-1"
                      >
                        Cancel
                      </button>
                    )}
                    <button 
                      type="submit"
                      disabled={isSubmittingSchedule}
                      className="btn-primary justify-center py-2 px-4 text-xs flex-1"
                    >
                      {isSubmittingSchedule ? 'Saving...' : (editingScheduleId ? 'Update Timing' : 'Add Assembly')}
                    </button>
                  </div>
                </form>
              </div>

              {/* Current Timings list */}
              <div className="lg:col-span-2 glass-panel overflow-hidden bg-white border-slate-200 shadow-sm flex flex-col">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold text-xs uppercase tracking-wider">
                      <th className="p-4">Assembly Details</th>
                      <th className="p-4">Schedule Time</th>
                      <th className="p-4">Category / Recur</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-semibold text-slate-700">
                    {schedules.map((sched) => (
                      <tr key={sched.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <span className="block text-slate-900 font-bold">{sched.name}</span>
                          <span className="block text-xs text-slate-400 font-medium">📍 {sched.location}</span>
                        </td>
                        <td className="p-4 text-amber-600 font-bold text-xs">{sched.time}</td>
                        <td className="p-4">
                          <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[9px] font-extrabold uppercase rounded block w-fit mb-1">
                            {sched.category}
                          </span>
                          <span className="text-[10px] text-slate-400 block">{sched.recurrence}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2 justify-center">
                            <button 
                              onClick={() => handleStartEditSchedule(sched)}
                              className="p-1.5 rounded bg-amber-50 text-amber-600 hover:bg-amber-100"
                              title="Edit schedule entry"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteSchedule(sched.id)}
                              className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100"
                              title="Delete schedule entry"
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
            </div>
          </div>
        )}

        {/* 7. MINISTRIES PANEL */}
        {activeTab === 'ministries' && (
          <div className="flex flex-col gap-8 animate-slideup text-left">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form block */}
              <div className="lg:col-span-1 glass-panel p-6 bg-white border-slate-200 shadow-sm flex flex-col gap-4">
                <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-amber-500" />
                  <h3 className="font-serif font-bold text-lg text-slate-900">
                    {editingMinistryId ? 'Edit Ministry Sphere' : 'Add New Ministry'}
                  </h3>
                </div>

                <form onSubmit={handleSaveMinistry} className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Ministry Name *</label>
                    <input 
                      type="text"
                      value={newMinistry.name}
                      onChange={(e) => setNewMinistry({ ...newMinistry, name: e.target.value })}
                      placeholder="e.g. Youth Outreach Fellowship"
                      className="input-control w-full text-slate-950 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                    <input 
                      type="text"
                      value={newMinistry.category}
                      onChange={(e) => setNewMinistry({ ...newMinistry, category: e.target.value })}
                      placeholder="e.g. Fellowship, Youth"
                      className="input-control w-full text-slate-950 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Schedule / Timings *</label>
                    <input 
                      type="text"
                      value={newMinistry.schedule}
                      onChange={(e) => setNewMinistry({ ...newMinistry, schedule: e.target.value })}
                      placeholder="e.g. Sundays at 11:30 AM"
                      className="input-control w-full text-slate-950 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Banner Image</label>
                    <input 
                      type="text"
                      value={newMinistry.image_url}
                      onChange={(e) => setNewMinistry({ ...newMinistry, image_url: e.target.value })}
                      placeholder="e.g. /images/banner1.jpg"
                      className="input-control w-full text-slate-950 bg-white font-mono text-xs mb-2"
                    />
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          try {
                            const url = await uploadFile(file);
                            setNewMinistry({ ...newMinistry, image_url: url });
                          } catch (err) {
                            alert('Upload failed: ' + err.message);
                          }
                        }
                      }}
                      className="input-control w-full text-slate-950 bg-white text-xs"
                    />
                  </div>

                  {/* Ministry Photo Gallery Uploader */}
                  <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-700 block">Ministry Photo Gallery</label>
                    {(() => {
                      let gallery = [];
                      try {
                        gallery = JSON.parse(newMinistry.gallery_urls || '[]');
                      } catch(e) {
                        gallery = [];
                      }
                      if (!Array.isArray(gallery)) gallery = [];

                      return (
                        <div className="flex flex-col gap-2">
                          {gallery.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 border border-slate-100 p-2 rounded bg-slate-50 max-h-[160px] overflow-y-auto">
                              {gallery.map((url, idx) => (
                                <div key={idx} className="relative aspect-square rounded overflow-hidden border border-slate-200 group">
                                  <img src={url} alt="" className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = gallery.filter((_, i) => i !== idx);
                                      setNewMinistry({ ...newMinistry, gallery_urls: JSON.stringify(updated) });
                                    }}
                                    className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          <input 
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={async (e) => {
                              const files = Array.from(e.target.files);
                              const newUrls = [];
                              for (const file of files) {
                                try {
                                  const url = await uploadFile(file);
                                  newUrls.push(url);
                                } catch (err) {
                                  alert('Upload failed: ' + err.message);
                                }
                              }
                              if (newUrls.length > 0) {
                                const updated = [...gallery, ...newUrls];
                                setNewMinistry({ ...newMinistry, gallery_urls: JSON.stringify(updated) });
                              }
                            }}
                            className="input-control w-full text-slate-950 bg-white text-xs"
                          />
                          <span className="text-[10px] text-slate-500 italic block leading-snug">
                            Select one or more photos from your device to upload. Hover and click trash to delete.
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Detailed Description *</label>
                    <textarea 
                      value={newMinistry.description}
                      onChange={(e) => setNewMinistry({ ...newMinistry, description: e.target.value })}
                      placeholder="Explain the ministry activities and spiritual targets..."
                      rows="4"
                      className="input-control w-full text-slate-950 bg-white"
                      required
                    />
                  </div>

                  {formError && <span className="text-xs font-bold text-red-600 block">{formError}</span>}
                  {formSuccess && <span className="text-xs font-bold text-emerald-600 block">{formSuccess}</span>}

                  <div className="flex gap-2 border-t border-slate-100 pt-3 mt-1">
                    {editingMinistryId && (
                      <button 
                        type="button"
                        onClick={handleCancelEditMinistry}
                        className="btn-secondary py-2 px-4 text-xs flex-1"
                      >
                        Cancel
                      </button>
                    )}
                    <button 
                      type="submit"
                      disabled={isSubmittingMinistry}
                      className="btn-primary justify-center py-2 px-4 text-xs flex-1"
                    >
                      {isSubmittingMinistry ? 'Saving...' : (editingMinistryId ? 'Update Ministry' : 'Add Ministry')}
                    </button>
                  </div>
                </form>
              </div>

              {/* Ministries Grid */}
              <div className="lg:col-span-2 flex flex-col gap-4 text-left">
                {ministries.map((min) => (
                  <div key={min.id} className="glass-panel overflow-hidden bg-white border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 p-4 items-start">
                    {min.image_url && (
                      <img 
                        src={min.image_url} 
                        alt={min.name}
                        className="w-full md:w-32 h-24 rounded object-cover border border-slate-200 shrink-0"
                      />
                    )}
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-serif font-bold text-base text-slate-900 leading-tight">{min.name}</h4>
                          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">{min.category || 'General'}</span>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <button 
                            onClick={() => handleStartEditMinistry(min)}
                            className="p-1.5 rounded bg-amber-50 text-amber-600 hover:bg-amber-100"
                            title="Edit Ministry"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteMinistry(min.id)}
                            className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100"
                            title="Delete Ministry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-normal">{min.description}</p>
                      
                      <div className="flex flex-wrap gap-4 border-t border-slate-100 pt-2 text-[11px] font-semibold text-slate-400">
                        <span>⏰ Schedule: <strong className="text-slate-700">{min.schedule}</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 8. STUDY RESOURCES PANEL */}
        {activeTab === 'resources' && (
          <div className="flex flex-col gap-8 animate-slideup text-left">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form block */}
              <div className="lg:col-span-1 glass-panel p-6 bg-white border-slate-200 shadow-sm flex flex-col gap-4">
                <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-amber-500" />
                  <h3 className="font-serif font-bold text-lg text-slate-900">
                    {editingResourceId ? 'Edit Study Material' : 'Catalog New Material'}
                  </h3>
                </div>

                <form onSubmit={handleSaveResource} className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Resource Title *</label>
                    <input 
                      type="text"
                      value={newResource.title}
                      onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                      placeholder="e.g. Family Altar Guide - June 2026"
                      className="input-control w-full text-slate-950 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">File Path / URL *</label>
                    <input 
                      type="text"
                      value={newResource.file_url}
                      onChange={(e) => setNewResource({ ...newResource, file_url: e.target.value })}
                      placeholder="e.g. /resources/guide-june2026.pdf"
                      className="input-control w-full text-slate-950 bg-white font-mono text-xs mb-2"
                      required
                    />
                    <input 
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          try {
                            const url = await uploadFile(file, 'resources');
                            setNewResource({ 
                              ...newResource, 
                              file_url: url,
                              file_type: file.name.split('.').pop().toUpperCase()
                            });
                          } catch (err) {
                            alert('Upload failed: ' + err.message);
                          }
                        }
                      }}
                      className="input-control w-full text-slate-950 bg-white text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">File Type</label>
                      <input 
                        type="text"
                        value={newResource.file_type}
                        onChange={(e) => setNewResource({ ...newResource, file_type: e.target.value })}
                        placeholder="e.g. PDF"
                        className="input-control w-full text-slate-950 bg-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                      <select
                        value={newResource.category}
                        onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
                        className="input-control w-full text-slate-950 bg-white"
                      >
                        <option value="Bible Study">Bible Study</option>
                        <option value="Children Corner">Children Corner</option>
                        <option value="Family Devotional">Family Devotional</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Short Description</label>
                    <textarea 
                      value={newResource.description}
                      onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                      placeholder="Provide outline points, details, target group..."
                      rows="3"
                      className="input-control w-full text-slate-950 bg-white"
                    />
                  </div>

                  {formError && <span className="text-xs font-bold text-red-600 block">{formError}</span>}
                  {formSuccess && <span className="text-xs font-bold text-emerald-600 block">{formSuccess}</span>}

                  <div className="flex gap-2 border-t border-slate-100 pt-3 mt-1">
                    {editingResourceId && (
                      <button 
                        type="button"
                        onClick={handleCancelEditResource}
                        className="btn-secondary py-2 px-4 text-xs flex-1"
                      >
                        Cancel
                      </button>
                    )}
                    <button 
                      type="submit"
                      disabled={isSubmittingResource}
                      className="btn-primary justify-center py-2 px-4 text-xs flex-1"
                    >
                      {isSubmittingResource ? 'Saving...' : (editingResourceId ? 'Update Resource' : 'Catalog Resource')}
                    </button>
                  </div>
                </form>
              </div>

              {/* Resources Table list */}
              <div className="lg:col-span-2 glass-panel overflow-hidden bg-white border-slate-200 shadow-sm flex flex-col">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold text-xs uppercase tracking-wider">
                      <th className="p-4">Resource Outline</th>
                      <th className="p-4">Category / Type</th>
                      <th className="p-4 text-center">Stats</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-semibold text-slate-700">
                    {resources.map((rs) => (
                      <tr key={rs.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <span className="block text-slate-900 font-bold">{rs.title}</span>
                          <span className="block text-xs text-slate-400 font-medium leading-relaxed mt-0.5">{rs.description}</span>
                          <span className="block font-mono text-[9px] text-amber-600 mt-1 select-all">{rs.file_url}</span>
                        </td>
                        <td className="p-4">
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-extrabold uppercase rounded block w-fit mb-1">
                            {rs.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold block">{rs.file_type}</span>
                        </td>
                        <td className="p-4 text-center font-bold text-xs text-slate-500">
                          📥 {rs.download_count || 0}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2 justify-center">
                            <button 
                              onClick={() => handleStartEditResource(rs)}
                              className="p-1.5 rounded bg-amber-50 text-amber-600 hover:bg-amber-100"
                              title="Edit Resource"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteResource(rs.id)}
                              className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100"
                              title="Delete Resource"
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
            </div>
          </div>
        )}

        {/* 4. DEVOTIONALS MANAGER PANEL */}
        {activeTab === 'devotionals' && (
          <div className="flex flex-col gap-6">
            {/* Add / Edit Form Block */}
            <div className="glass-panel p-6 bg-white border-slate-200 shadow-sm">
              <h3 className="font-serif font-bold text-lg text-slate-900 border-b border-slate-100 pb-3 mb-4">
                {editingDevotionalId ? 'Edit Devotional Post' : 'Publish New Devotional / Daily Promise'}
              </h3>
              <form onSubmit={handleSaveDevotional} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Devotional Title *</label>
                    <input 
                      type="text"
                      value={newDevotional.title}
                      onChange={(e) => setNewDevotional({ ...newDevotional, title: e.target.value })}
                      placeholder="e.g. Daily Promise - Isaiah 41:10"
                      className="input-control w-full text-slate-950 bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Read Time (minutes)</label>
                    <input 
                      type="number"
                      value={newDevotional.read_time_minutes}
                      onChange={(e) => setNewDevotional({ ...newDevotional, read_time_minutes: parseInt(e.target.value, 10) || 3 })}
                      className="input-control w-full text-slate-950 bg-white"
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Author</label>
                    <input 
                      type="text"
                      value={newDevotional.author}
                      onChange={(e) => setNewDevotional({ ...newDevotional, author: e.target.value })}
                      className="input-control w-full text-slate-950 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                    <select
                      value={newDevotional.category}
                      onChange={(e) => setNewDevotional({ ...newDevotional, category: e.target.value })}
                      className="input-control w-full text-slate-950 bg-white"
                    >
                      <option value="Daily Promise">Daily Promise</option>
                      <option value="Devotional reflection">Devotional reflection</option>
                      <option value="Pastor Message">Pastor Message</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Devotional Content / Message *</label>
                  <textarea 
                    value={newDevotional.content}
                    onChange={(e) => setNewDevotional({ ...newDevotional, content: e.target.value })}
                    placeholder="Write the full scripture promise, daily meditation or pastoral message here..."
                    className="input-control w-full text-slate-950 bg-white min-h-[160px]"
                    required
                  />
                </div>

                <div className="flex gap-3 justify-end border-t border-slate-100 pt-4 mt-2">
                  {editingDevotionalId && (
                    <button 
                      type="button"
                      onClick={handleCancelEditDevotional}
                      className="btn-secondary py-2 px-6"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button 
                    type="submit"
                    disabled={isSubmittingDevotional}
                    className="btn-primary py-2 px-8"
                  >
                    {isSubmittingDevotional ? 'Saving devotional post...' : (editingDevotionalId ? 'Update Post' : 'Publish Devotional')}
                  </button>
                </div>
              </form>
            </div>

            {/* List of Devotionals */}
            <div className="glass-panel overflow-hidden bg-white border-slate-200 shadow-sm">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold text-xs uppercase tracking-wider">
                    <th className="p-4">Date</th>
                    <th className="p-4">Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Author</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-semibold text-slate-700">
                  {devotionals.map((dev) => (
                    <tr key={dev.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-slate-500 font-mono text-xs">
                        {dev.publish_date ? dev.publish_date.split('T')[0] : ''}
                      </td>
                      <td className="p-4 text-slate-900 font-bold max-w-sm line-clamp-2 leading-tight">
                        {dev.title}
                      </td>
                      <td className="p-4 text-slate-500 text-xs">
                        <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase rounded">
                          {dev.category}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 text-xs">{dev.author}</td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-center">
                          <button 
                            onClick={() => handleStartEditDevotional(dev)}
                            className="p-1.5 rounded bg-amber-50 text-amber-600 hover:bg-amber-100"
                            title="Edit Devotional"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteDevotional(dev.id)}
                            className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100"
                            title="Delete Devotional"
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
