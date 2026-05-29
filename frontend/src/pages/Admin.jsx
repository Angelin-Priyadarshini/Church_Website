import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import * as XLSX from 'xlsx';
import {
  useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { API_BASE } from '../config';
import { 
  Lock,
  RefreshCw,
  BarChart2,
  Users,
  Calendar,
  HeartHandshake,
  Check,
  Trash2,
  ArrowUpRight,
  HelpCircle,
  Plus,
  Video,
  Edit,
  LogOut,
  Mail,
  MessageSquare,
  X,
  Clock,
  BookOpen,
  Bookmark,
  Sliders,
  Home,
  Eye
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
  const { fetchDynamicAbout, language, t } = useLanguage();
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Believer Registration & Verification State
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'verify'
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Believer Dashboard State
  const [believerPrayers, setBelieverPrayers] = useState([]);
  const [myPrayersLoading, setMyPrayersLoading] = useState(true);
  const [submittingPrayer, setSubmittingPrayer] = useState(false);
  const [prayerSuccess, setPrayerSuccess] = useState('');
  const [newPrayerText, setNewPrayerText] = useState('');
  const [newPrayerCategory, setNewPrayerCategory] = useState('Healing');
  const [newPrayerAnonymous, setNewPrayerAnonymous] = useState(false);
  const [newPrayerPhone, setNewPrayerPhone] = useState('');

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
  const [users, setUsers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [inquiryResponses, setInquiryResponses] = useState({});
  const [isSubmittingResponse, setIsSubmittingResponse] = useState({});

  // --- CUSTOM STATE FOR FOUR-ROLE HIERARCHY ---
  // Portals Tab Controls
  const [believerTab, setBelieverTab] = useState('tracker'); // 'tracker' | 'quizzes'
  const [usherTab, setUsherTab] = useState('newcomer'); // 'newcomer' | 'quizzes' | 'prayers'

  // Newcomer Form state (Ushers)
  const [newcomerForm, setNewcomerForm] = useState({
    full_name: '',
    birthdate: '',
    relationship_status: 'Single',
    wedding_date: '',
    mobile: '',
    country_code: '+971',
    gender: 'Male',
    location: '',
    preferred_language: 'English',
    prayer_needs: ''
  });
  const [newcomerSuccess, setNewcomerSuccess] = useState('');
  const [newcomerError, setNewcomerError] = useState('');
  const [isSubmittingNewcomer, setIsSubmittingNewcomer] = useState(false);
  const [newcomersList, setNewcomersList] = useState([]);

  // Quizzes State
  const [quizzesList, setQuizzesList] = useState([]);
  const [scoresList, setScoresList] = useState([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);

  // Active Quiz State (Taking Quiz)
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { qId: 'A' }
  const [reviewStatus, setReviewStatus] = useState({}); // { qId: true }
  const [quizTimeLeft, setQuizTimeLeft] = useState(0);
  const [quizTimerId, setQuizTimerId] = useState(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [gradedResult, setGradedResult] = useState(null);

  // Quiz Creator State (Data Admin)
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuizQuestions, setNewQuizQuestions] = useState([
    { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' }
  ]);
  const [creatorSuccess, setCreatorSuccess] = useState('');
  const [creatorError, setCreatorError] = useState('');
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);

  // Roster Analysis State (Data Admin)
  const [analysisData, setAnalysisData] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [isImportingRoster, setIsImportingRoster] = useState(false);
  const [importSuccess, setImportSuccess] = useState('');
  const [importError, setImportError] = useState('');
  
  // Believer Roster filter state
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterAgeFilter, setRosterAgeFilter] = useState('');
  const [rosterLocationFilter, setRosterLocationFilter] = useState('');
  const [rosterBirthdayWeekFilter, setRosterBirthdayWeekFilter] = useState('');

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');
  const [isChangingPw, setIsChangingPw] = useState(false);

  // --- PORTAL PORTING API METHODS ---

  // 1. Quizzes API
  const fetchQuizzes = async () => {
    if (!token) return;
    setQuizzesLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/quizzes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuizzesList(data);
      }
      
      const scoreRes = await fetch(`${API_BASE}/api/quizzes/my-scores`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (scoreRes.ok) {
        const scoreData = await scoreRes.json();
        setScoresList(scoreData);
      }
    } catch (err) {
      console.error('Error fetching quizzes:', err);
    } finally {
      setQuizzesLoading(false);
    }
  };

  const handleTakeQuiz = async (quizId) => {
    if (!token) return;
    setQuizzesLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/quizzes/${quizId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch quiz.');

      setActiveQuiz(data.quiz);
      setQuizQuestions(data.questions);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setReviewStatus({});
      setGradedResult(null);
      setQuizTimeLeft(data.quiz.duration_seconds);
    } catch (err) {
      alert(err.message);
    } finally {
      setQuizzesLoading(false);
    }
  };

  const handleSubmitQuiz = async (forced = false) => {
    if (!activeQuiz || !token) return;
    setIsSubmittingQuiz(true);
    try {
      // Clear interval first
      if (quizTimerId) {
        clearInterval(quizTimerId);
        setQuizTimerId(null);
      }

      const answersPayload = quizQuestions.map(q => ({
        question_id: q.id,
        selected_option: userAnswers[q.id] || ''
      }));

      const res = await fetch(`${API_BASE}/api/quizzes/${activeQuiz.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answers: answersPayload })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit quiz.');

      setGradedResult(data);
      if (forced) {
        alert("Time is up! Your quiz has been submitted automatically.");
      }
      fetchQuizzes();
    } catch (err) {
      alert(err.message);
      setActiveQuiz(null); // return to safety
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const handleToggleReview = (qId) => {
    setReviewStatus(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  // 2. Newcomer API
  const fetchNewcomers = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/newcomers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNewcomersList(data);
      }
    } catch (err) {
      console.error('Error fetching newcomers:', err);
    }
  };

  const handleNewcomerSubmit = async (e) => {
    e.preventDefault();
    setNewcomerSuccess('');
    setNewcomerError('');
    setIsSubmittingNewcomer(true);

    try {
      const res = await fetch(`${API_BASE}/api/newcomers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newcomerForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save newcomer.');

      setNewcomerSuccess('Newcomer registered successfully! Data recorded instantly.');
      setNewcomerForm({
        full_name: '',
        birthdate: '',
        relationship_status: 'Single',
        wedding_date: '',
        mobile: '',
        country_code: '+971',
        gender: 'Male',
        location: '',
        preferred_language: 'English',
        prayer_needs: ''
      });
      fetchNewcomers();
    } catch (err) {
      setNewcomerError(err.message);
    } finally {
      setIsSubmittingNewcomer(false);
    }
  };

  // 3. Believers import & Analysis API
  const fetchAnalysis = async () => {
    if (!token) return;
    setAnalysisLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/believers/analysis`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysisData(data);
      }
    } catch (err) {
      console.error('Error fetching roster analysis:', err);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleRosterImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImportingRoster(true);
    setImportSuccess('');
    setImportError('');

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);

          if (data.length === 0) {
            throw new Error('Spreadsheet appears to be empty.');
          }

          // Format check or mapping helper
          const formatted = data.map(row => ({
            full_name: row['Full Name'] || row['Name'] || row['full_name'] || '',
            birthdate: row['Birthdate'] || row['Birthday'] || row['birthdate'] || '',
            relationship_status: row['Relationship Status'] || row['Relationship'] || row['relationship_status'] || 'Single',
            wedding_date: row['Wedding Date'] || row['Anniversary'] || row['wedding_date'] || null,
            mobile: row['Mobile'] || row['Phone'] || row['mobile'] || '',
            gender: row['Gender'] || row['gender'] || 'Male',
            location: row['Location'] || row['Area'] || row['location'] || 'Sharjah',
            preferred_language: row['Preferred Language'] || row['Language'] || row['preferred_language'] || 'English',
            age: row['Age'] || row['age'] || null
          }));

          const res = await fetch(`${API_BASE}/api/believers/import`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ believers: formatted })
          });
          const resData = await res.json();
          if (!res.ok) throw new Error(resData.error || 'Failed to import believers.');

          setImportSuccess(resData.message || 'Roster imported successfully!');
          fetchAnalysis();
        } catch (innerErr) {
          setImportError(innerErr.message);
        }
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      setImportError(err.message);
    } finally {
      setIsImportingRoster(false);
      e.target.value = ''; // reset file input
    }
  };

  // 4. Create Quiz API
  const handleAddQuestion = () => {
    setNewQuizQuestions(prev => [
      ...prev,
      { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' }
    ]);
  };

  const handleDeleteCreatorQuestion = (idx) => {
    if (newQuizQuestions.length <= 1) return;
    setNewQuizQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCreatorQuestionChange = (idx, field, value) => {
    setNewQuizQuestions(prev => prev.map((q, i) => {
      if (i === idx) {
        return { ...q, [field]: value };
      }
      return q;
    }));
  };

  const handleCreateQuizSubmit = async (e) => {
    e.preventDefault();
    setCreatorSuccess('');
    setCreatorError('');
    setIsCreatingQuiz(true);

    if (!newQuizTitle.trim()) {
      setCreatorError('Quiz title is required.');
      setIsCreatingQuiz(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newQuizTitle,
          questions: newQuizQuestions
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish test.');

      setCreatorSuccess('Test published successfully! Notifications dispatched to believers.');
      setNewQuizTitle('');
      setNewQuizQuestions([
        { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A' }
      ]);
      fetchQuizzes();
    } catch (err) {
      setCreatorError(err.message);
    } finally {
      setIsCreatingQuiz(false);
    }
  };

  // Active quiz timer effect
  useEffect(() => {
    if (activeQuiz && quizTimeLeft > 0) {
      const interval = setInterval(() => {
        setQuizTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            // Submit automatically!
            handleSubmitQuiz(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeQuiz, quizTimeLeft]);

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
            parsedCI = [
              '/images/home-banner1.JPG',
              '/images/prayer.jpg',
              '/images/banner1.jpg'
            ];
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

      // 10. Fetch registered users (admin only)
      if (user && user.role === 'admin') {
        const usrRes = await fetch(`${API_BASE}/api/auth/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (usrRes.ok) {
          const usrData = await usrRes.json();
          setUsers(usrData);
        }
      }

      // 11. Fetch inquiries (admin/moderator)
      if (user && (user.role === 'admin' || user.role === 'moderator')) {
        const inqRes = await fetch(`${API_BASE}/api/contact/inquiries`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (inqRes.ok) {
          const inqData = await inqRes.json();
          setInquiries(inqData);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard records:', err);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user role.');
      }
      alert(data.message || 'User role updated successfully.');
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRespondToInquiry = async (inqId) => {
    const responseText = inquiryResponses[inqId];
    if (!responseText || responseText.trim() === '') {
      alert('Please enter a response.');
      return;
    }
    
    setIsSubmittingResponse(prev => ({ ...prev, [inqId]: true }));
    try {
      const res = await fetch(`${API_BASE}/api/contact/inquiries/${inqId}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ responseText })
      });
      const data = await res.json();
      setIsSubmittingResponse(prev => ({ ...prev, [inqId]: false }));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send response.');
      }
      alert(data.message || 'Response sent successfully.');
      setInquiryResponses(prev => ({ ...prev, [inqId]: '' }));
      fetchDashboardData();
    } catch (err) {
      setIsSubmittingResponse(prev => ({ ...prev, [inqId]: false }));
      alert(err.message);
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
    if (token && user) {
      if (user.role === 'admin' || user.role === 'moderator') {
        fetchDashboardData();
      }
      if (user.role === 'user') {
        fetchBelieverPrayers();
        fetchQuizzes();
      }
      if (user.role === 'usher') {
        fetchQuizzes();
        fetchNewcomers();
      }
      if (user.role === 'data_admin') {
        fetchDashboardData();
        fetchAnalysis();
        fetchQuizzes();
      }
      if (user.role === 'admin') {
        fetchAnalysis();
        fetchNewcomers();
        fetchQuizzes();
      }
    }
  }, [token, user]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError('');
    setFormSuccess('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403 && data.requiresVerification) {
          setVerificationEmail(data.email || email);
          setAuthMode('verify');
          throw new Error('Your email has not been verified yet. We have sent you a verification code.');
        }
        throw new Error(data.error || 'Authentication failed');
      }

      login(data.token, data.user);
    } catch (err) {
      setAuthError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setFormSuccess('');

    if (regPassword !== regConfirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    setIsLoggingIn(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: regName, 
          email: regEmail, 
          password: regPassword 
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setVerificationEmail(regEmail);
      setAuthMode('verify');
      setFormSuccess('Registration successful! Please check your email for the 6-digit verification code.');
    } catch (err) {
      setAuthError(err.message || 'Error creating your believer account.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setAuthError('');
    setFormSuccess('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: verificationEmail, 
          code: verificationCode 
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setFormSuccess('Your email has been verified successfully! You can now log in.');
      setAuthMode('login');
      setEmail(verificationEmail);
      setVerificationCode('');
    } catch (err) {
      setAuthError(err.message || 'Invalid or expired verification code.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setAuthError('');
    setFormSuccess('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/resend-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verificationEmail })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Resending code failed');
      }

      setFormSuccess('A new 6-digit verification code has been sent to your email.');
    } catch (err) {
      setAuthError(err.message || 'Error resending verification code.');
    } finally {
      setIsResending(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwSuccess('');
    setPwError('');

    if (newPassword !== confirmPassword) {
      setPwError('New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters long.');
      return;
    }

    setIsChangingPw(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password.');
      }

      setPwSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwError(err.message || 'Error changing password.');
    } finally {
      setIsChangingPw(false);
    }
  };

  const fetchBelieverPrayers = async () => {
    if (!token) return;
    setMyPrayersLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/prayers/my-requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBelieverPrayers(data);
      }
    } catch (err) {
      console.error('Error fetching believer prayers:', err);
    } finally {
      setMyPrayersLoading(false);
    }
  };

  const handleBelieverPrayerSubmit = async (e) => {
    e.preventDefault();
    setPrayerSuccess('');
    setActionError('');
    setSubmittingPrayer(true);

    if (!newPrayerText) {
      setActionError('Please enter your prayer request.');
      setSubmittingPrayer(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/prayers`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          request_text: newPrayerText,
          category: newPrayerCategory,
          is_anonymous: newPrayerAnonymous ? 1 : 0,
          phone: newPrayerPhone
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit prayer request.');
      }

      setPrayerSuccess('Your prayer request has been submitted successfully! The intercessors team is interceding for you.');
      setNewPrayerText('');
      setNewPrayerPhone('');
      setNewPrayerAnonymous(false);
      fetchBelieverPrayers();
    } catch (err) {
      setActionError(err.message || 'Error submitting request.');
    } finally {
      setSubmittingPrayer(false);
    }
  };

  const handleToggleAnswered = async (id, currentAnswered) => {
    try {
      const targetState = !currentAnswered;
      const res = await fetch(`${API_BASE}/api/prayers/${id}/answered`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_answered: targetState ? 1 : 0 })
      });
      if (res.ok) {
        setBelieverPrayers(prev => prev.map(p => p.id === id ? { ...p, is_answered: targetState ? 1 : 0, status: targetState ? 'Answered' : 'Pending' } : p));
        fetchBelieverPrayers();
      }
    } catch (err) {
      console.error('Error toggling answered:', err);
    }
  };

  useEffect(() => {
    if (token && user && user.role === 'user') {
      fetchBelieverPrayers();
    }
  }, [token, user]);

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
        <div className="glass-panel p-8 bg-white border border-slate-200 text-center flex flex-col gap-6 shadow-2xl rounded-2xl animate-fadein">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-2xl text-slate-900 leading-tight">
              {authMode === 'login' && 'Login'}
              {authMode === 'register' && 'Believer Registration'}
              {authMode === 'verify' && 'Email Verification'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {authMode === 'login' && 'Log in to place prayer requests or manage features.'}
              {authMode === 'register' && 'Create your account to submit and track prayers.'}
              {authMode === 'verify' && `We sent a 6-digit verification code to ${verificationEmail}.`}
            </p>
          </div>

          {formSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg text-left">
              {formSuccess}
            </div>
          )}

          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg text-left">
              {authError}
            </div>
          )}

          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 text-left">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Email Address
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="input-control w-full p-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-amber-500"
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
                  className="input-control w-full p-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoggingIn}
                className="btn-primary justify-center w-full mt-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-lg transition-colors flex items-center gap-2"
              >
                {isLoggingIn ? 'Verifying authority keys...' : 'Authorize Login'}
              </button>
            </form>
          )}

          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4 text-left">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Your Full Name
                </label>
                <input 
                  type="text" 
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="John Doe"
                  className="input-control w-full p-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Email Address
                </label>
                <input 
                  type="email" 
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="believer@gmail.com"
                  className="input-control w-full p-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Password
                </label>
                <input 
                  type="password" 
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-control w-full p-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Confirm Password
                </label>
                <input 
                  type="password" 
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-control w-full p-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isLoggingIn}
                className="btn-primary justify-center w-full mt-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-lg transition-colors flex items-center gap-2"
              >
                {isLoggingIn ? 'Creating account...' : 'Complete Registration'}
              </button>
            </form>
          )}

          {authMode === 'verify' && (
            <form onSubmit={handleVerifySubmit} className="flex flex-col gap-4 text-left">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  6-Digit Verification Code
                </label>
                <input 
                  type="text" 
                  maxLength="6"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  className="w-full text-center text-2xl font-bold tracking-[8px] p-2.5 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isVerifying}
                className="btn-primary justify-center w-full mt-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-lg transition-colors flex items-center gap-2"
              >
                {isVerifying ? 'Verifying code...' : 'Verify & Activate'}
              </button>

              <div className="flex justify-between items-center mt-2">
                <button 
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="text-xs text-amber-600 font-bold hover:underline bg-transparent border-0 cursor-pointer text-left"
                >
                  {isResending ? 'Sending...' : 'Resend Verification Code'}
                </button>
                <button 
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-xs text-slate-400 hover:underline bg-transparent border-0 cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* Toggle link */}
          {authMode !== 'verify' && (
            <div className="border-t border-slate-100 pt-4 mt-2">
              {authMode === 'login' ? (
                <p className="text-xs text-slate-500">
                  Are you a believer in the congregation?{' '}
                  <button 
                    onClick={() => { setAuthMode('register'); setAuthError(''); setFormSuccess(''); }}
                    className="text-amber-600 font-bold hover:underline bg-transparent border-0 cursor-pointer"
                  >
                    Register here
                  </button>
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  Already registered?{' '}
                  <button 
                    onClick={() => { setAuthMode('login'); setAuthError(''); setFormSuccess(''); }}
                    className="text-amber-600 font-bold hover:underline bg-transparent border-0 cursor-pointer"
                  >
                    Sign in here
                  </button>
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Render Believer Portal if role === 'user'
  if (user && user.role === 'user') {
    // If active quiz is selected, show focused premium exam panel!
    if (activeQuiz && quizQuestions.length > 0) {
      const currentQuestion = quizQuestions[currentQuestionIndex];
      const selectedOption = userAnswers[currentQuestion.id] || '';
      const isMarkedForReview = reviewStatus[currentQuestion.id] || false;

      // Formatting remaining time
      const mins = Math.floor(quizTimeLeft / 60);
      const secs = quizTimeLeft % 60;
      const timeString = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

      if (gradedResult) {
        // Scorecard display
        return (
          <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto glass-panel p-8 bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl animate-fadein text-center flex flex-col gap-6">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto text-3xl font-bold">
                🏆
              </div>
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
                  Test Completed
                </span>
                <h2 className="font-serif font-bold text-3xl text-white">
                  {activeQuiz.title}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Here is your graded bible study scorecard
                </p>
              </div>

              {/* Large Score Circle */}
              <div className="my-4 py-8 border-y border-slate-900 flex justify-center items-center gap-8">
                <div className="text-center">
                  <span className="text-slate-400 text-xs font-bold block uppercase tracking-wider">Correct Answers</span>
                  <span className="text-5xl font-black text-white block mt-2">
                    {gradedResult.score} <span className="text-slate-600 text-3xl">/ {gradedResult.total}</span>
                  </span>
                </div>
                <div className="w-px h-16 bg-slate-800"></div>
                <div className="text-center">
                  <span className="text-slate-400 text-xs font-bold block uppercase tracking-wider">Accuracy Rating</span>
                  <span className="text-5xl font-black text-amber-400 block mt-2">
                    {gradedResult.percent}%
                  </span>
                </div>
              </div>

              {/* Educational breakdown review */}
              <div className="text-left max-h-96 overflow-y-auto pr-2 flex flex-col gap-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1">Question review checklist:</h4>
                {gradedResult.gradedAnswers.map((graded, index) => {
                  const fullQuestionObj = quizQuestions.find(q => q.id === graded.question_id);
                  if (!fullQuestionObj) return null;

                  return (
                    <div 
                      key={graded.question_id}
                      className={`p-4 rounded-xl border ${
                        graded.is_correct 
                          ? 'border-emerald-500/20 bg-emerald-950/10' 
                          : 'border-red-500/20 bg-red-950/10'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3 mb-2">
                        <span className="text-xs font-bold text-slate-300 block">
                          Question {index + 1}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          graded.is_correct ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {graded.is_correct ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      <p className="text-sm text-white font-medium mb-3 leading-relaxed">
                        {fullQuestionObj.question_text}
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-slate-900 rounded border border-slate-800">
                          <span className="text-slate-500 font-bold block mb-0.5">Your Response</span>
                          <span className={`${graded.is_correct ? 'text-emerald-400' : 'text-red-400'} font-bold`}>
                            {graded.selected_option ? `${graded.selected_option}) ${fullQuestionObj[`option_${graded.selected_option.toLowerCase()}`]}` : 'Left Unanswered'}
                          </span>
                        </div>
                        <div className="p-2 bg-slate-900 rounded border border-slate-800">
                          <span className="text-slate-500 font-bold block mb-0.5">Correct Answer</span>
                          <span className="text-emerald-400 font-bold">
                            {graded.correct_option}) {fullQuestionObj[`option_${graded.correct_option.toLowerCase()}`]}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  setActiveQuiz(null);
                  setGradedResult(null);
                }}
                className="mt-4 w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 px-4 rounded-xl text-sm transition-colors shadow-lg"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        );
      }

      // Live Test taking layout
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 animate-fadein">
          <div className="max-w-6xl mx-auto flex flex-col gap-6">
            
            {/* Countdown header */}
            <div className="glass-panel p-6 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xl">
              <div>
                <span className="text-amber-400 text-[10px] font-extrabold uppercase tracking-widest block mb-0.5">
                  Spiritual Bible Test in Session
                </span>
                <h1 className="font-serif font-bold text-2xl text-white tracking-tight leading-tight">
                  {activeQuiz.title}
                </h1>
              </div>

              {/* Flashing countdown timer */}
              <div className="flex items-center gap-3">
                <div className={`px-5 py-3 rounded-xl border flex items-center gap-2 ${
                  quizTimeLeft < 60 
                    ? 'border-red-500/50 bg-red-950/20 text-red-500 animate-pulse' 
                    : 'border-slate-800 bg-slate-950 text-amber-400'
                }`}>
                  <Clock className="w-5 h-5 shrink-0" />
                  <span className="text-xl font-black font-mono tracking-wider">
                    {timeString}
                  </span>
                </div>
              </div>
            </div>

            {/* Test layout split: Questions & navigation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Question viewport (70%) */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="glass-panel p-8 bg-slate-900/60 border border-slate-800 rounded-xl shadow-xl min-h-[380px] flex flex-col justify-between">
                  <div>
                    {/* Progress tracking */}
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-6">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Question {currentQuestionIndex + 1} of {quizQuestions.length}
                      </span>
                      {isMarkedForReview && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          Marked for Review
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg sm:text-xl font-medium text-white mb-8 leading-relaxed">
                      {currentQuestion.question_text}
                    </h3>

                    {/* Radio Options List */}
                    <div className="flex flex-col gap-3">
                      {['A', 'B', 'C', 'D'].map(opt => {
                        const optText = currentQuestion[`option_${opt.toLowerCase()}`];
                        const isSelected = selectedOption === opt;
                        
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: opt }))}
                            className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-start gap-4 ${
                              isSelected 
                                ? 'bg-amber-500/10 border-amber-500 text-white shadow-md' 
                                : 'bg-slate-950/30 border-slate-850 text-slate-300 hover:bg-slate-900 hover:border-slate-750'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center font-bold text-xs ${
                              isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {opt}
                            </span>
                            <span className="flex-grow pt-0.5 leading-relaxed">{optText}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex justify-between items-center border-t border-slate-800/80 pt-6 mt-8">
                    <button
                      type="button"
                      disabled={currentQuestionIndex === 0}
                      onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                      className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 rounded-lg text-xs font-bold transition-all disabled:opacity-30 disabled:pointer-events-none"
                    >
                      ← Previous
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleReview(currentQuestion.id)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
                        isMarkedForReview 
                          ? 'bg-purple-600/20 border-purple-500 text-purple-400' 
                          : 'bg-transparent border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      ⭐ {isMarkedForReview ? 'Unmark Review' : 'Mark for Review'}
                    </button>

                    {currentQuestionIndex < quizQuestions.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold transition-all"
                      >
                        Next Question →
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSubmitQuiz(false)}
                        disabled={isSubmittingQuiz}
                        className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-lg"
                      >
                        {isSubmittingQuiz ? 'Grading...' : 'Finish & Submit'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar Circle navigation (30%) */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="glass-panel p-6 bg-slate-900/90 border border-slate-800 rounded-xl shadow-xl flex flex-col justify-between h-full">
                  <div>
                    <h4 className="font-serif font-bold text-md text-white mb-2 pb-2 border-b border-slate-800">
                      Bible Test Navigator
                    </h4>
                    <p className="text-[11px] text-slate-400 mb-6 leading-relaxed">
                      Click any question number circle to navigate instantly. Keep track of status by color:
                    </p>

                    {/* Roster circles grid */}
                    <div className="grid grid-cols-5 gap-3 mb-8 justify-items-center">
                      {quizQuestions.map((q, idx) => {
                        const isAns = !!userAnswers[q.id];
                        const isRev = !!reviewStatus[q.id];
                        const isCurrent = currentQuestionIndex === idx;

                        let circleClass = "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700";
                        if (isRev) {
                          circleClass = "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-900/20";
                        } else if (isAns) {
                          circleClass = "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-900/20";
                        }

                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => setCurrentQuestionIndex(idx)}
                            className={`w-10 h-10 rounded-full font-mono text-xs font-bold border transition-all flex items-center justify-center ${circleClass} ${
                              isCurrent ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-slate-950' : ''
                            }`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>

                    {/* Color guide legend */}
                    <div className="flex flex-col gap-2.5 border-t border-slate-800/80 pt-5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status Legend:</span>
                      <div className="flex items-center gap-3 text-xs text-slate-300">
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-800 bg-slate-950 block"></span>
                        <span>Unanswered Question</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-300">
                        <span className="w-3.5 h-3.5 rounded-full border border-emerald-500 bg-emerald-600 block"></span>
                        <span>Answered Question</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-300">
                        <span className="w-3.5 h-3.5 rounded-full border border-purple-500 bg-purple-600 block"></span>
                        <span>Marked for Review</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to end your test and submit your answers?")) {
                        handleSubmitQuiz(false);
                      }
                    }}
                    disabled={isSubmittingQuiz}
                    className="w-full bg-red-950/20 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-white transition-all py-3 rounded-xl font-bold text-xs mt-8 shadow-lg flex items-center justify-center gap-1"
                  >
                    🚩 Force Close & Submit
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      );
    }

    // Standard Believer Portal tabs selector
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          
          {/* Header Panel */}
          <div className="glass-panel p-8 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl">
            <div>
              <span className="text-amber-400 text-xs font-bold uppercase tracking-widest block mb-1">
                Welcome to your Believer Portal
              </span>
              <h1 className="font-serif font-bold text-3xl text-white tracking-tight">
                Shalom, {user.name}
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Submit prayer requests, take biblical quizzes, and track your devotional milestones.
              </p>
            </div>
            
            <button 
              onClick={() => { logout(); }}
              className="px-5 py-2.5 rounded-lg border border-red-500/30 bg-red-950/20 text-red-400 text-sm font-semibold hover:bg-red-500/20 hover:text-white transition-all flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          {/* Sub Navigation tabs */}
          <div className="flex border-b border-slate-850 gap-4">
            <button
              onClick={() => setBelieverTab('tracker')}
              className={`px-5 py-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                believerTab === 'tracker' 
                  ? 'border-amber-500 text-amber-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              Prayer Requests
            </button>

            <button
              onClick={() => setBelieverTab('quizzes')}
              className={`px-5 py-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                believerTab === 'quizzes' 
                  ? 'border-amber-500 text-amber-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Bible Quizzes & Tests
            </button>
          </div>

          {/* Tab contents */}
          {believerTab === 'tracker' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Side: Submit Prayer Form */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="glass-panel p-6 bg-slate-950/80 border border-slate-800 rounded-xl shadow-xl">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-white mb-1">
                    Place a Prayer Request
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Our intercession team and pastor will stand in agreement with you.
                  </p>

                  <form onSubmit={handleBelieverPrayerSubmit} className="flex flex-col gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Prayer Category
                      </label>
                      <select 
                        value={newPrayerCategory}
                        onChange={(e) => setNewPrayerCategory(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 text-sm focus:border-amber-500 focus:outline-none transition-colors"
                      >
                        <option value="Healing">Healing & Deliverance</option>
                        <option value="Provision">Financial Provision & Job</option>
                        <option value="Family">Family Blessing & Peace</option>
                        <option value="Outreach">Outreach & Salvation</option>
                        <option value="Spiritual">Spiritual Growth</option>
                        <option value="Other">Other Personal Needs</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Contact Phone (Optional)
                      </label>
                      <input 
                        type="text"
                        value={newPrayerPhone}
                        onChange={(e) => setNewPrayerPhone(e.target.value)}
                        placeholder="+971 50 XXXXXXX"
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 text-sm focus:border-amber-500 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Request Details
                      </label>
                      <textarea 
                        value={newPrayerText}
                        onChange={(e) => setNewPrayerText(e.target.value)}
                        placeholder="Please share what you would like us to pray for..."
                        rows="4"
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 text-sm focus:border-amber-500 focus:outline-none transition-colors resize-none"
                        required
                      ></textarea>
                    </div>

                    <div className="flex items-center gap-2 py-1">
                      <input 
                        type="checkbox"
                        id="anonymousCheck"
                        checked={newPrayerAnonymous}
                        onChange={(e) => setNewPrayerAnonymous(e.target.checked)}
                        className="w-4 h-4 rounded bg-slate-900 border-slate-800 text-amber-500 focus:ring-amber-500/20"
                      />
                      <label htmlFor="anonymousCheck" className="text-xs text-slate-300 cursor-pointer">
                        Submit anonymously to the intercessors team
                      </label>
                    </div>

                    {prayerSuccess && (
                      <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg">
                        {prayerSuccess}
                      </div>
                    )}

                    {actionError && (
                      <div className="p-3 bg-red-950/30 border border-red-500/30 text-red-400 text-xs rounded-lg">
                        {actionError}
                      </div>
                    )}

                    <button 
                      type="submit"
                      disabled={submittingPrayer}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 px-4 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      {submittingPrayer ? 'Sending Request...' : 'Send Prayer Request'}
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Side: Tracker List */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="glass-panel p-6 bg-slate-950/80 border border-slate-800 rounded-xl shadow-xl min-h-[400px]">
                  <h3 className="font-serif font-bold text-xl text-white mb-1">
                    Your Prayer Request Tracker
                  </h3>
                  <p className="text-xs text-slate-400 mb-6">
                    See the status of your requests and mark when God has answered your prayers!
                  </p>

                  {myPrayersLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                      <span className="text-xs text-slate-400">Loading your prayer requests...</span>
                    </div>
                  ) : believerPrayers.length === 0 ? (
                    <div className="text-center py-16 px-4 border border-dashed border-slate-800 rounded-xl">
                      <HeartHandshake className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-300 text-sm font-semibold">No prayer requests placed yet</p>
                      <p className="text-slate-500 text-xs mt-1">Submit a request on the left to begin tracking.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {believerPrayers.map((pray) => {
                        const isAnswered = pray.is_answered === 1 || pray.status === 'Answered';
                        return (
                          <div 
                            key={pray.id} 
                            className={`p-5 rounded-xl border transition-all duration-300 ${
                              isAnswered 
                                ? 'border-emerald-500/20 bg-emerald-950/10 shadow-lg' 
                                : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                                  {pray.category}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  {new Date(pray.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>

                              {/* Status Badge */}
                              <div className="flex items-center gap-2">
                                {isAnswered ? (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    Answered! Hallelujah
                                  </span>
                                ) : pray.status === 'Prayed' ? (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                                    Prayed for by Intercessors
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                    Pending Prayer
                                  </span>
                                )}
                              </div>
                            </div>

                            <p className="text-sm text-slate-200 leading-relaxed mb-4 whitespace-pre-line">
                              {pray.request_text}
                            </p>

                            <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 mt-1">
                              <span className="text-[10px] text-slate-500">
                                {pray.is_anonymous === 1 ? 'Submitted Anonymously' : 'Shared with Prayer Team'}
                              </span>
                              
                              <button
                                type="button"
                                onClick={() => handleToggleAnswered(pray.id, pray.is_answered === 1)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                                  isAnswered
                                    ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-600'
                                    : 'border border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                                }`}
                              >
                                <Check className={`w-3.5 h-3.5 ${isAnswered ? 'stroke-[3px]' : ''}`} />
                                {isAnswered ? 'Answered!' : 'Mark Answered'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {believerTab === 'quizzes' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Scorecard Dashboard */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="glass-panel p-6 bg-slate-950/80 border border-slate-800 rounded-xl shadow-xl">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                    🏆
                  </div>
                  <h3 className="font-serif font-bold text-lg text-white mb-1">
                    Your Bible Test Ledger
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Monitor your scores and track your study progression history.
                  </p>

                  <div className="flex flex-col gap-3">
                    {scoresList.length === 0 ? (
                      <div className="p-4 bg-slate-900 border border-slate-850 rounded-lg text-center text-xs text-slate-500">
                        No scores recorded yet. Complete an active test to view milestones.
                      </div>
                    ) : (
                      scoresList.map(score => (
                        <div key={score.id} className="p-3.5 bg-slate-900/60 border border-slate-850 rounded-lg flex justify-between items-center gap-2 text-xs">
                          <div>
                            <span className="font-bold text-white block truncate max-w-[140px]">{score.quiz_title}</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              {new Date(score.completed_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-amber-400 block">
                              {score.score} / {score.total}
                            </span>
                            <span className="text-[9px] font-extrabold uppercase text-slate-400">
                              {((score.score / score.total) * 100).toFixed(0)}% score
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Active quizzes listings grid */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="glass-panel p-6 bg-slate-950/80 border border-slate-800 rounded-xl shadow-xl min-h-[400px]">
                  <h3 className="font-serif font-bold text-xl text-white mb-1">
                    Available Bible Quizzes & Tests
                  </h3>
                  <p className="text-xs text-slate-400 mb-6">
                    Assess your biblical insights and scripture knowledge. Timer starts instantly upon launching a test.
                  </p>

                  {quizzesLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                      <span className="text-xs text-slate-400">Syncing available quizzes...</span>
                    </div>
                  ) : quizzesList.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-slate-800 rounded-xl">
                      <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                      <p className="text-slate-300 text-sm font-semibold">No tests published currently</p>
                      <p className="text-slate-500 text-xs mt-1">Our Data Admin will publish new tests shortly.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {quizzesList.map(quiz => (
                        <div key={quiz.id} className="p-5 bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col justify-between gap-4">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                {quiz.question_count} MCQs
                              </span>
                              <span className="text-[10px] font-mono text-slate-500">
                                {Math.round(quiz.duration_seconds / 60)} min limit
                              </span>
                            </div>
                            <h4 className="font-serif font-bold text-white text-md mt-3 leading-tight">
                              {quiz.title}
                            </h4>
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                            {quiz.taken ? (
                              <>
                                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                                  ✅ Grade: {quiz.score} / {quiz.total}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleTakeQuiz(quiz.id)}
                                  className="px-3 py-1.5 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg text-[10px] font-extrabold uppercase transition-all"
                                >
                                  Review Test
                                </button>
                              </>
                            ) : (
                              <>
                                <span className="text-[10px] text-slate-500 font-bold uppercase">
                                  Not Started
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleTakeQuiz(quiz.id)}
                                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-md"
                                >
                                  Take Test
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  // Render Usher Portal if role === 'usher'
  if (user && user.role === 'usher') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-8 animate-fadein">
          
          {/* Header Panel */}
          <div className="glass-panel p-8 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl">
            <div>
              <span className="text-amber-400 text-xs font-bold uppercase tracking-widest block mb-1">
                Welcome to your Usher Portal
              </span>
              <h1 className="font-serif font-bold text-3xl text-white tracking-tight">
                Shalom, {user.name}
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Register newcomers, coordinate bible study quizzes, and monitor intercessory prayers.
              </p>
            </div>
            
            <button 
              onClick={() => { logout(); }}
              className="px-5 py-2.5 rounded-lg border border-red-500/30 bg-red-950/20 text-red-400 text-sm font-semibold hover:bg-red-500/20 hover:text-white transition-all flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          {/* Sub Navigation tabs */}
          <div className="flex border-b border-slate-850 gap-4">
            <button
              onClick={() => setUsherTab('newcomer')}
              className={`px-5 py-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                usherTab === 'newcomer' 
                  ? 'border-amber-500 text-amber-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              👤 Newcomer Registration
            </button>

            <button
              onClick={() => setUsherTab('quizzes')}
              className={`px-5 py-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                usherTab === 'quizzes' 
                  ? 'border-amber-500 text-amber-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              📚 Bible Quizzes
            </button>

            <button
              onClick={() => setUsherTab('prayers')}
              className={`px-5 py-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                usherTab === 'prayers' 
                  ? 'border-amber-500 text-amber-400' 
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              🙏 Prayer Requests
            </button>
          </div>

          {/* Tab contents */}
          {usherTab === 'newcomer' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Side (2 cols): Registration Form */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="glass-panel p-8 bg-slate-950/80 border border-slate-800 rounded-xl shadow-xl">
                  <h3 className="font-serif font-bold text-xl text-white mb-2">
                    Newcomer Roster Registration
                  </h3>
                  <p className="text-xs text-slate-400 mb-6 border-b border-slate-800 pb-3">
                    Submit the information for new families and members visiting our assemblies.
                  </p>

                  <form onSubmit={handleNewcomerSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={newcomerForm.full_name}
                        onChange={(e) => setNewcomerForm(prev => ({ ...prev, full_name: e.target.value }))}
                        placeholder="Brother/Sister Name"
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 text-sm focus:border-amber-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    {/* Birthdate */}
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Birthdate *
                      </label>
                      <input
                        type="date"
                        value={newcomerForm.birthdate}
                        onChange={(e) => setNewcomerForm(prev => ({ ...prev, birthdate: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 text-sm focus:border-amber-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Gender *
                      </label>
                      <select
                        value={newcomerForm.gender}
                        onChange={(e) => setNewcomerForm(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 text-sm focus:border-amber-500 focus:outline-none transition-colors"
                        required
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Relationship status */}
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Relationship Status *
                      </label>
                      <select
                        value={newcomerForm.relationship_status}
                        onChange={(e) => setNewcomerForm(prev => ({ ...prev, relationship_status: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 text-sm focus:border-amber-500 focus:outline-none transition-colors"
                        required
                      >
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                      </select>
                    </div>

                    {/* Wedding Anniversary Date (Conditionally displayed!) */}
                    {newcomerForm.relationship_status === 'Married' && (
                      <div className="animate-slideup">
                        <label className="text-xs font-bold text-slate-300 block mb-1">
                          Wedding Anniversary Date *
                        </label>
                        <input
                          type="date"
                          value={newcomerForm.wedding_date}
                          onChange={(e) => setNewcomerForm(prev => ({ ...prev, wedding_date: e.target.value }))}
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 text-sm border-amber-500/50 focus:border-amber-500 focus:outline-none transition-colors"
                          required={newcomerForm.relationship_status === 'Married'}
                        />
                      </div>
                    )}

                    {/* Mobile with country code */}
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Mobile Number *
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={newcomerForm.country_code}
                          onChange={(e) => setNewcomerForm(prev => ({ ...prev, country_code: e.target.value }))}
                          className="w-24 bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 text-sm focus:border-amber-500 focus:outline-none transition-colors"
                        >
                          <option value="+971">+971 (UAE)</option>
                          <option value="+91">+91 (IN)</option>
                          <option value="+44">+44 (UK)</option>
                          <option value="+1">+1 (US)</option>
                          <option value="+965">+965 (KW)</option>
                          <option value="+966">+966 (SA)</option>
                          <option value="+968">+968 (OM)</option>
                          <option value="+974">+974 (QA)</option>
                        </select>
                        <input
                          type="number"
                          value={newcomerForm.mobile}
                          onChange={(e) => setNewcomerForm(prev => ({ ...prev, mobile: e.target.value }))}
                          placeholder="50XXXXXXX"
                          className="flex-grow bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 text-sm focus:border-amber-500 focus:outline-none transition-colors"
                          required
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Area / Location *
                      </label>
                      <input
                        type="text"
                        value={newcomerForm.location}
                        onChange={(e) => setNewcomerForm(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Sharjah, Rolla / Ajman"
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 text-sm focus:border-amber-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    {/* Preferred language */}
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Preferred Language *
                      </label>
                      <select
                        value={newcomerForm.preferred_language}
                        onChange={(e) => setNewcomerForm(prev => ({ ...prev, preferred_language: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 text-sm focus:border-amber-500 focus:outline-none transition-colors"
                        required
                      >
                        <option value="English">English</option>
                        <option value="Tamil">Tamil</option>
                      </select>
                    </div>

                    {/* Prayer needs */}
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Prayer Needs & Personal Requests
                      </label>
                      <textarea
                        value={newcomerForm.prayer_needs}
                        onChange={(e) => setNewcomerForm(prev => ({ ...prev, prayer_needs: e.target.value }))}
                        placeholder="Share any special needs or spiritual intercessions required..."
                        rows="3"
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2.5 text-sm focus:border-amber-500 focus:outline-none transition-colors resize-none"
                      ></textarea>
                    </div>

                    <div className="sm:col-span-2">
                      {newcomerSuccess && (
                        <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg">
                          {newcomerSuccess}
                        </div>
                      )}

                      {newcomerError && (
                        <div className="p-3 bg-red-950/30 border border-red-500/30 text-red-400 text-xs rounded-lg">
                          {newcomerError}
                        </div>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <button
                        type="submit"
                        disabled={isSubmittingNewcomer}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center gap-1"
                      >
                        {isSubmittingNewcomer ? 'Saving...' : 'Submit Newcomer Registration'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right Side (1 col): Recent registrations list */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="glass-panel p-6 bg-slate-950/80 border border-slate-800 rounded-xl shadow-xl">
                  <h3 className="font-serif font-bold text-lg text-white mb-1">
                    Visitor Registry Logs
                  </h3>
                  <p className="text-xs text-slate-400 mb-6">
                    Roster database of recently cataloged newcomers.
                  </p>

                  <div className="flex flex-col gap-3 max-h-[480px] overflow-y-auto pr-1">
                    {newcomersList.length === 0 ? (
                      <div className="p-4 border border-slate-850 rounded bg-slate-900/60 text-center text-xs text-slate-500">
                        No visitor logs logged currently.
                      </div>
                    ) : (
                      newcomersList.map(n => (
                        <div key={n.id} className="p-4 bg-slate-900 border border-slate-850 rounded-xl text-xs flex flex-col gap-1.5 hover:border-slate-700 transition-all">
                          <div className="flex justify-between items-start gap-1">
                            <span className="font-bold text-white text-sm">{n.full_name}</span>
                            <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-slate-800 text-slate-400 border border-slate-700">
                              {n.preferred_language}
                            </span>
                          </div>
                          <div className="text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                            <span>📱 {n.country_code} {n.mobile}</span>
                            <span>📍 {n.location}</span>
                            <span>🎂 {new Date(n.birthdate).toLocaleDateString()}</span>
                          </div>
                          {n.relationship_status === 'Married' && n.wedding_date && (
                            <div className="text-[10px] text-amber-500 font-medium">
                              💍 Anniversary: {new Date(n.wedding_date).toLocaleDateString()}
                            </div>
                          )}
                          {n.prayer_needs && (
                            <p className="mt-1 text-[11px] text-slate-300 italic border-l-2 border-slate-800 pl-2">
                              " {n.prayer_needs} "
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {usherTab === 'quizzes' && (
            <div className="glass-panel p-6 bg-slate-950/80 border border-slate-800 rounded-xl shadow-xl min-h-[400px]">
              <h3 className="font-serif font-bold text-xl text-white mb-1">
                Active Church Quizzes & Bible Tests
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Bible study quizzes uploaded by the Data Admin. (Ushers view is read-only)
              </p>

              {quizzesList.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-slate-850 rounded-xl">
                  <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-300 text-sm font-semibold">No tests available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quizzesList.map(quiz => (
                    <div key={quiz.id} className="p-5 bg-slate-900/40 border border-slate-850 rounded-xl flex flex-col justify-between gap-4">
                      <div>
                        <div className="flex justify-between items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {quiz.question_count} Questions
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {Math.round(quiz.duration_seconds / 60)} min limit
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-white text-md mt-4">
                          {quiz.title}
                        </h4>
                      </div>
                      <div className="text-[10px] text-slate-500 border-t border-slate-850 pt-2 flex justify-between">
                        <span>Created: {new Date(quiz.created_at).toLocaleDateString()}</span>
                        <span>Quiz ID: {quiz.id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {usherTab === 'prayers' && (
            <div className="glass-panel p-6 bg-slate-950/80 border border-slate-800 rounded-xl shadow-xl min-h-[400px]">
              <h3 className="font-serif font-bold text-xl text-white mb-1">
                Congregation Prayer Request Tracker
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Active requests submitted by our believers and guests. Join with them in agreement and intercession.
              </p>

              {prayers.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-slate-850 rounded-xl">
                  <HeartHandshake className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-300 text-sm font-semibold">No prayer requests active</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prayers.map(pray => {
                    const isAnswered = pray.is_answered === 1 || pray.status === 'Answered';
                    return (
                      <div 
                        key={pray.id} 
                        className={`p-5 rounded-xl border transition-all ${
                          isAnswered 
                            ? 'border-emerald-500/20 bg-emerald-950/10' 
                            : 'border-slate-800 bg-slate-900/40'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <div>
                            <span className="font-bold text-white text-sm block">{pray.name}</span>
                            <span className="text-[10px] text-slate-500">{new Date(pray.created_at).toLocaleDateString()}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                            isAnswered ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {pray.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed italic whitespace-pre-line mb-3">
                          " {pray.request_text} "
                        </p>
                        <div className="text-[9px] font-extrabold uppercase text-slate-400 border-t border-slate-850 pt-2">
                          Category: {pray.category}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    );
  }


  return (
    <div className="animate-slideup min-h-screen bg-slate-50 border-b border-slate-200">
      {/* 1. Header Banner */}
      <section className="bg-slate-900 text-white py-10">
        <div className="max-w-[95%] w-full mx-auto px-4 sm:px-8 lg:px-12 flex flex-col sm:flex-row justify-between items-center gap-4">
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

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button 
              onClick={handleSyncYoutube}
              disabled={isSyncing}
              className="btn-primary py-2 px-5 text-xs flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync YouTube Channel
            </button>
            <button 
              onClick={logout}
              className="btn-secondary py-2 px-5 text-xs text-white border-white/20 hover:bg-white hover:text-slate-900 justify-center w-full sm:w-auto"
            >
              Logout Session
            </button>
          </div>
        </div>
      </section>

      {/* Sync Log overlays */}
      {(syncMessage || actionError) && (
        <div className="max-w-[95%] w-full mx-auto px-4 sm:px-8 lg:px-12 mt-6">
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
        <section className="max-w-[95%] w-full mx-auto px-4 sm:px-8 lg:px-12 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 bg-white border-slate-200 flex items-center gap-4 shadow-sm w-full overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block truncate">Website Visits</span>
              <span className="font-bold text-slate-900 text-xl block leading-tight break-words">{summary.websiteVisits || 0} Visits</span>
            </div>
          </div>

          <div className="glass-panel p-5 bg-white border-slate-200 flex items-center gap-4 shadow-sm w-full overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block truncate">Total Events</span>
              <span className="font-bold text-slate-900 text-xl block leading-tight break-words">
                {summary.totalEvents} Scheduled
              </span>
            </div>
          </div>

          <div className="glass-panel p-5 bg-white border-slate-200 flex items-center gap-4 shadow-sm w-full overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block truncate">Prayers Queue</span>
              <span className="font-bold text-slate-900 text-xl block leading-tight break-words">{summary.pendingPrayers} Pending</span>
            </div>
          </div>

          <div className="glass-panel p-5 bg-white border-slate-200 flex items-center gap-4 shadow-sm w-full overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block truncate">Registered Believers</span>
              <span className="font-bold text-slate-900 text-xl block leading-tight break-words">{summary.totalUsers || 0} Accounts</span>
            </div>
          </div>
        </section>
      )}

      {/* Tabs list selector */}
      <section className="max-w-[95%] w-full mx-auto px-4 sm:px-8 lg:px-12 pb-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Sidebar Menu */}
          <aside className="hidden lg:flex w-full lg:w-72 shrink-0 bg-white border border-slate-200 rounded-2xl shadow-sm p-4 text-left flex flex-col gap-1.5 lg:sticky lg:top-24">
            <div className="border-b border-slate-100 pb-3 mb-2 px-2 flex flex-col">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Admin Control Panel</span>
              <span className="text-xs text-slate-500 font-medium mt-0.5">Logged in as {user?.name || 'Admin'}</span>
            </div>

            {/* Sidebar Tab Buttons */}
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                activeTab === 'summary'
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                  : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-955 border-transparent'
              }`}
            >
              <HeartHandshake className="w-4 h-4 shrink-0" />
              <span className="flex-1">Prayers Queue</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${activeTab === 'summary' ? 'bg-slate-950/20 text-slate-955' : 'bg-slate-100 text-slate-600'}`}>{prayers.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('sermons')}
              className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                activeTab === 'sermons'
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                  : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-955 border-transparent'
              }`}
            >
              <Video className="w-4 h-4 shrink-0" />
              <span className="flex-1">Sermons Manager</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${activeTab === 'sermons' ? 'bg-slate-950/20 text-slate-955' : 'bg-slate-100 text-slate-600'}`}>{sermons.length}</span>
            </button>

            {user?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('events')}
                className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                  activeTab === 'events'
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                    : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-955 border-transparent'
                }`}
              >
                <Calendar className="w-4 h-4 shrink-0" />
                <span className="flex-1">Events Manager</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${activeTab === 'events' ? 'bg-slate-950/20 text-slate-955' : 'bg-slate-100 text-slate-600'}`}>{events.length}</span>
              </button>
            )}

            {/* NEW: Believers Database (admin / data_admin only) */}
            {(user && (user.role === 'admin' || user.role === 'data_admin')) && (
              <button
                onClick={() => { setActiveTab('believers'); fetchAnalysis(); }}
                className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                  activeTab === 'believers'
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                    : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-950 border-transparent'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span className="flex-1">Believers Database</span>
                {analysisData && (
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${activeTab === 'believers' ? 'bg-slate-950/20 text-slate-955' : 'bg-slate-100 text-slate-600'}`}>{analysisData.totalCount}</span>
                )}
              </button>
            )}

            {/* NEW: Upload Bible Tests (admin / data_admin only) */}
            {(user && (user.role === 'admin' || user.role === 'data_admin')) && (
              <button
                onClick={() => setActiveTab('upload_test')}
                className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                  activeTab === 'upload_test'
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                    : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-955 border-transparent'
                }`}
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                <span className="flex-1">Upload Bible Tests</span>
              </button>
            )}

            {/* Restrict standard pages editor from Data Admin */}
            {user && user.role !== 'data_admin' && (
              <>
                <button
                  onClick={() => setActiveTab('homepage')}
                  className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                    activeTab === 'homepage'
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                      : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-955 border-transparent'
                  }`}
                >
                  <Home className="w-4 h-4 shrink-0" />
                  <span className="flex-1">Homepage Content</span>
                </button>

                <button
                  onClick={() => setActiveTab('about')}
                  className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                    activeTab === 'about'
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                      : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-955 border-transparent'
                  }`}
                >
                  <Edit className="w-4 h-4 shrink-0" />
                  <span className="flex-1">About Us Content</span>
                </button>

                <button
                  onClick={() => setActiveTab('customizer')}
                  className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                    activeTab === 'customizer'
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                      : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-955 border-transparent'
                  }`}
                >
                  <Sliders className="w-4 h-4 shrink-0" />
                  <span className="flex-1">Page Customizer</span>
                </button>

                <button
                  onClick={() => setActiveTab('schedules')}
                  className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                    activeTab === 'schedules'
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                      : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-955 border-transparent'
                  }`}
                >
                  <Clock className="w-4 h-4 shrink-0" />
                  <span className="flex-1">Timings & Assemblies</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${activeTab === 'schedules' ? 'bg-slate-950/20 text-slate-955' : 'bg-slate-100 text-slate-600'}`}>{schedules.length}</span>
                </button>

                <button
                  onClick={() => setActiveTab('ministries')}
                  className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                    activeTab === 'ministries'
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                      : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-955 border-transparent'
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0" />
                  <span className="flex-1">Ministries</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${activeTab === 'ministries' ? 'bg-slate-950/20 text-slate-955' : 'bg-slate-100 text-slate-600'}`}>{ministries.length}</span>
                </button>

                <button
                  onClick={() => setActiveTab('resources')}
                  className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                    activeTab === 'resources'
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                      : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-950 border-transparent'
                  }`}
                >
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span className="flex-1">Resources</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${activeTab === 'resources' ? 'bg-slate-950/20 text-slate-955' : 'bg-slate-100 text-slate-600'}`}>{resources.length}</span>
                </button>

                <button
                  onClick={() => setActiveTab('devotionals')}
                  className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                    activeTab === 'devotionals'
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                      : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-950 border-transparent'
                  }`}
                >
                  <Bookmark className="w-4 h-4 shrink-0" />
                  <span className="flex-1">Devotionals</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${activeTab === 'devotionals' ? 'bg-slate-950/20 text-slate-955' : 'bg-slate-100 text-slate-600'}`}>{devotionals.length}</span>
                </button>
              </>
            )}

            {user && user.role === 'admin' && (
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                  activeTab === 'users'
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                    : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-950 border-transparent'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span className="flex-1">Registered Users</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${activeTab === 'users' ? 'bg-slate-950/20 text-slate-955' : 'bg-slate-100 text-slate-600'}`}>{users.length}</span>
              </button>
            )}

            {user && (user.role === 'admin' || user.role === 'moderator') && (
              <button
                onClick={() => setActiveTab('inquiries')}
                className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                  activeTab === 'inquiries'
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                    : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-955 border-transparent'
                }`}
              >
                <Mail className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">Contact Inquiries</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${activeTab === 'inquiries' ? 'bg-slate-950/20 text-slate-955' : 'bg-slate-100 text-slate-600'}`}>{inquiries.length}</span>
              </button>
            )}

            {user && (
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                  activeTab === 'security'
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                    : 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-955 border-transparent'
                }`}
              >
                <Lock className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">Change Password</span>
              </button>
            )}
          </aside>

          {/* Right Panels Container */}
          <div className="flex-1 w-full max-w-full">
            {/* Mobile Tab Dropdown Select */}
            <div className="lg:hidden w-full mb-6 glass-panel p-4 bg-white border-slate-200 shadow-sm flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 block text-left">Select Control Panel Section</label>
              <select
                value={activeTab}
                onChange={(e) => { setActiveTab(e.target.value); if (e.target.value === 'believers') fetchAnalysis(); }}
                className="input-control w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-amber-500"
              >
                <option value="summary">🙏 Prayers Queue ({prayers.length})</option>
                <option value="sermons">🎥 Sermons Manager ({sermons.length})</option>
                {user?.role === 'admin' && <option value="events">📅 Events Manager ({events.length})</option>}
                {(user?.role === 'admin' || user?.role === 'data_admin') && <option value="believers">👥 Believers Database & Import</option>}
                {(user?.role === 'admin' || user?.role === 'data_admin') && <option value="upload_test">📝 Upload Bible Tests</option>}
                {user?.role !== 'data_admin' && (
                  <>
                    <option value="homepage">🏠 Homepage Content Editor</option>
                    <option value="about">ℹ️ About Us Content Editor</option>
                    <option value="customizer">🛠️ Page Headers Customizer</option>
                    <option value="schedules">⏰ Timings & Assemblies ({schedules.length})</option>
                    <option value="ministries">👥 Ministries ({ministries.length})</option>
                    <option value="resources">📚 Resources ({resources.length})</option>
                    <option value="devotionals">🔖 Devotionals ({devotionals.length})</option>
                  </>
                )}
                {user?.role === 'admin' && <option value="users">👤 Registered Believers ({users.length})</option>}
                {(user?.role === 'admin' || user?.role === 'moderator') && <option value="inquiries">✉️ Contact Inquiries ({inquiries.length})</option>}
                <option value="security">🔒 Change Password</option>
              </select>
            </div>
            {/* NEW: BELIEVERS DATABASE & import ANALYSIS PANEL */}
            {activeTab === 'believers' && (
              <div className="flex flex-col gap-6 animate-fadein">
                {/* Excel Import Card */}
                <div className="glass-panel p-6 bg-white border border-slate-200 shadow-sm rounded-2xl text-left">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="font-serif font-bold text-xl text-slate-900">
                        Believer Roster Synchronization
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Upload the congregation's Excel file (.xlsx, .xls, .csv) to analyze statistics and sync birthdays.
                      </p>
                    </div>

                    <div className="relative shrink-0">
                      <input
                        type="file"
                        id="excelFileInput"
                        accept=".xlsx, .xls, .csv"
                        onChange={handleRosterImport}
                        className="hidden"
                        disabled={isImportingRoster}
                      />
                      <label
                        htmlFor="excelFileInput"
                        className={`btn-primary py-2.5 px-5 text-xs flex items-center gap-2 cursor-pointer shadow-md ${
                          isImportingRoster ? 'opacity-50 pointer-events-none' : ''
                        }`}
                      >
                        <RefreshCw className={`w-4 h-4 ${isImportingRoster ? 'animate-spin' : ''}`} />
                        {isImportingRoster ? 'Synchronizing...' : 'Import Excel Sheet'}
                      </label>
                    </div>
                  </div>

                  {importSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl mt-4">
                      ✅ {importSuccess}
                    </div>
                  )}

                  {importError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl mt-4">
                      ❌ {importError}
                    </div>
                  )}
                </div>

                {analysisLoading && (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                    <span className="text-xs text-slate-500">Compiling database analytics...</span>
                  </div>
                )}

                {/* Analysis Dashboard Display */}
                {analysisData && !analysisLoading && (
                  <>
                    {/* Stat Highlight Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="glass-panel p-5 bg-white border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          👥
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Total Members</span>
                          <span className="font-bold text-slate-900 text-lg block leading-tight">{analysisData.totalCount} Believers</span>
                        </div>
                      </div>

                      <div className="glass-panel p-5 bg-white border-slate-200 shadow-sm flex items-center gap-4 animate-pulse">
                        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                          🎂
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Birthdays This Week</span>
                          <span className="font-bold text-amber-600 text-lg block leading-tight">{analysisData.upcomingBirthdays.length} Celebrants</span>
                        </div>
                      </div>

                      <div className="glass-panel p-5 bg-white border-slate-200 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                          💍
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Wedding Anniversaries</span>
                          <span className="font-bold text-pink-600 text-lg block leading-tight">{analysisData.upcomingAnniversaries.length} Couples</span>
                        </div>
                      </div>
                    </div>

                    {/* Highlights & stats split grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Left: Alerts (Birthdays & Anniversaries) */}
                      <div className="glass-panel p-6 bg-white border border-slate-200 shadow-sm rounded-2xl text-left flex flex-col gap-6">
                        {/* Upcoming Birthdays Alert */}
                        <div>
                          <h4 className="font-serif font-bold text-md text-amber-600 flex items-center gap-1.5 mb-3">
                            🎉 Upcoming Weekly Birthdays
                          </h4>
                          {analysisData.upcomingBirthdays.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No birthdays logged in the upcoming week.</p>
                          ) : (
                            <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
                              {analysisData.upcomingBirthdays.map(b => (
                                <div key={b.id} className="p-3 bg-amber-50 border border-amber-150 rounded-xl text-xs flex justify-between items-center">
                                  <div>
                                    <span className="font-bold text-slate-800 block">{b.full_name}</span>
                                    <span className="text-[10px] text-slate-500">🎂 Birthday: {new Date(b.birthdate).toLocaleDateString()}</span>
                                  </div>
                                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-100 text-amber-700">
                                    {b.location}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Upcoming Anniversaries Alert */}
                        <div className="border-t border-slate-100 pt-5">
                          <h4 className="font-serif font-bold text-md text-pink-600 flex items-center gap-1.5 mb-3">
                            💖 Upcoming Wedding Anniversaries
                          </h4>
                          {analysisData.upcomingAnniversaries.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No anniversaries logged in the upcoming week.</p>
                          ) : (
                            <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
                              {analysisData.upcomingAnniversaries.map(b => (
                                <div key={b.id} className="p-3 bg-pink-50 border border-pink-150 rounded-xl text-xs flex justify-between items-center">
                                  <div>
                                    <span className="font-bold text-slate-800 block">{b.full_name}</span>
                                    <span className="text-[10px] text-slate-500">💍 Married: {new Date(b.wedding_date).toLocaleDateString()}</span>
                                  </div>
                                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-pink-100 text-pink-700">
                                    Anniversary
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Charts/Categorization data */}
                      <div className="glass-panel p-6 bg-white border border-slate-200 shadow-sm rounded-2xl text-left flex flex-col gap-6">
                        <h4 className="font-serif font-bold text-md text-slate-800 border-b border-slate-100 pb-2 mb-1">
                          Demographic Categorization
                        </h4>

                        {/* Age groups distribution */}
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">Age Distribution Groups:</span>
                          <div className="flex flex-col gap-2 text-xs">
                            {Object.entries(analysisData.ageGroups).map(([group, count]) => {
                              const pct = analysisData.totalCount > 0 ? ((count / analysisData.totalCount) * 100).toFixed(0) : 0;
                              return (
                                <div key={group} className="flex items-center gap-3">
                                  <span className="w-16 font-bold text-slate-600">{group}</span>
                                  <div className="flex-grow bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                                  </div>
                                  <span className="w-10 text-right text-slate-500 font-bold">{count} ({pct}%)</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Location demographics count */}
                        <div className="border-t border-slate-100 pt-4">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">Location Concentration:</span>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(analysisData.locations).map(([loc, count]) => (
                              <span key={loc} className="px-3 py-1 bg-slate-50 border border-slate-150 rounded-full text-xs text-slate-700 font-semibold flex items-center gap-1.5 shadow-sm">
                                📍 {loc} <strong className="text-amber-600 bg-amber-50 rounded-full w-5 h-5 flex items-center justify-center text-[10px] border border-amber-200">{count}</strong>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Roster Directory Table with JS Filters */}
                    <div className="glass-panel overflow-hidden bg-white border border-slate-200 shadow-sm rounded-2xl text-left mt-2">
                      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <h4 className="font-serif font-bold text-lg text-slate-900">Believers Directory Registry</h4>
                          <span className="text-xs text-slate-400 block mt-0.5">Use criteria below to filter the roster directory</span>
                        </div>
                        
                        {/* Search control */}
                        <input
                          type="text"
                          value={rosterSearch}
                          onChange={(e) => setRosterSearch(e.target.value)}
                          placeholder="🔍 Search name / location..."
                          className="w-full md:w-64 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Dropdown Filters row */}
                      <div className="p-4 bg-slate-50 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        {/* Age Filter */}
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Filter Age Group</label>
                          <select
                            value={rosterAgeFilter}
                            onChange={(e) => setRosterAgeFilter(e.target.value)}
                            className="w-full p-2 bg-white border border-slate-200 rounded-md"
                          >
                            <option value="">All Age Groups</option>
                            <option value="Children">Children (&lt;13)</option>
                            <option value="Youth">Youth (13-25)</option>
                            <option value="Adults">Adults (26-60)</option>
                            <option value="Seniors">Seniors (&gt;60)</option>
                          </select>
                        </div>

                        {/* Location Filter */}
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Filter Location</label>
                          <select
                            value={rosterLocationFilter}
                            onChange={(e) => setRosterLocationFilter(e.target.value)}
                            className="w-full p-2 bg-white border border-slate-200 rounded-md"
                          >
                            <option value="">All Locations</option>
                            {Object.keys(analysisData.locations).map(l => (
                              <option key={l} value={l}>{l}</option>
                            ))}
                          </select>
                        </div>

                        {/* Birthday Week Filter */}
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1">Filter Birthday Week</label>
                          <select
                            value={rosterBirthdayWeekFilter}
                            onChange={(e) => setRosterBirthdayWeekFilter(e.target.value)}
                            className="w-full p-2 bg-white border border-slate-200 rounded-md text-left"
                          >
                            <option value="">All Birthday Weeks</option>
                            {Object.keys(analysisData.birthdayWeeks).sort().map(w => (
                              <option key={w} value={w}>{w}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Directory Table viewport */}
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs min-w-[800px]">
                          <thead>
                            <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                              <th className="p-3">Full Name</th>
                              <th className="p-3">Birthday</th>
                              <th className="p-3">Age</th>
                              <th className="p-3">Gender</th>
                              <th className="p-3">Anniversary</th>
                              <th className="p-3">Mobile</th>
                              <th className="p-3">Location</th>
                              <th className="p-3">Language</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              const filteredList = analysisData.allBelievers.filter(b => {
                                const matchSearch = !rosterSearch || 
                                  b.full_name.toLowerCase().includes(rosterSearch.toLowerCase()) || 
                                  b.location.toLowerCase().includes(rosterSearch.toLowerCase());
                                const matchLocation = !rosterLocationFilter || b.location === rosterLocationFilter;
                                
                                const birthYear = b.birthdate ? parseInt(b.birthdate.split('-')[0], 10) : 0;
                                const age = b.age || (new Date().getFullYear() - birthYear);
                                let ageGroup = 'Adults';
                                if (age < 13) ageGroup = 'Children';
                                else if (age <= 25) ageGroup = 'Youth';
                                else if (age <= 60) ageGroup = 'Adults';
                                else ageGroup = 'Seniors';
                                const matchAge = !rosterAgeFilter || ageGroup === rosterAgeFilter;

                                let weekLabel = '';
                                if (b.birthdate) {
                                  const parts = b.birthdate.split('-');
                                  if (parts.length >= 3) {
                                    let month = parseInt(parts[1], 10);
                                    let day = parseInt(parts[2], 10);
                                    if (parts[0].length !== 4) {
                                      month = parseInt(parts[1], 10);
                                      day = parseInt(parts[0], 10);
                                    }
                                    if (!isNaN(month) && !isNaN(day) && month >= 1 && month <= 12) {
                                      let week = 'Week 4';
                                      if (day <= 7) week = 'Week 1';
                                      else if (day <= 14) week = 'Week 2';
                                      else if (day <= 21) week = 'Week 3';
                                      weekLabel = `${monthNames[month - 1]} - ${week}`;
                                    }
                                  }
                                }
                                const matchBWeek = !rosterBirthdayWeekFilter || weekLabel === rosterBirthdayWeekFilter;

                                return matchSearch && matchLocation && matchAge && matchBWeek;
                              });

                              if (filteredList.length === 0) {
                                return (
                                  <tr>
                                    <td colSpan="8" className="p-8 text-center text-slate-400 italic bg-slate-50">
                                      No believers match the filter criteria.
                                    </td>
                                  </tr>
                                );
                              }

                              return filteredList.map((b, i) => (
                                <tr key={b.id || i} className={`hover:bg-slate-50 transition-colors border-b border-slate-100 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                                  <td className="p-3 font-bold text-slate-800">{b.full_name}</td>
                                  <td className="p-3 font-medium text-slate-600">{b.birthdate ? new Date(b.birthdate).toLocaleDateString() : 'N/A'}</td>
                                  <td className="p-3 text-slate-600 font-bold">{b.age} yrs</td>
                                  <td className="p-3 text-slate-600">{b.gender}</td>
                                  <td className="p-3 text-slate-600">
                                    {b.relationship_status === 'Married' && b.wedding_date ? (
                                      <span className="text-pink-600 font-semibold flex items-center gap-1">💍 {new Date(b.wedding_date).toLocaleDateString()}</span>
                                    ) : 'Single'}
                                  </td>
                                  <td className="p-3 text-slate-500 font-medium">{b.mobile || 'N/A'}</td>
                                  <td className="p-3 text-slate-600 font-semibold">📍 {b.location}</td>
                                  <td className="p-3 text-slate-500">{b.preferred_language}</td>
                                </tr>
                              ));
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* NEW: UPLOAD BIBLE TESTS (QUIZ CREATOR) PANEL */}
            {activeTab === 'upload_test' && (
              <div className="glass-panel p-8 bg-white border border-slate-200 shadow-sm rounded-2xl text-left animate-fadein">
                <div className="border-b border-slate-100 pb-3 mb-6">
                  <h3 className="font-serif font-bold text-xl text-slate-900">
                    Publish Bible Quiz & Test
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Compose spiritual multiple choice questions. An email announcement notification will automatically be dispatched to all believers.
                  </p>
                </div>

                <form onSubmit={handleCreateQuizSubmit} className="flex flex-col gap-6">
                  {/* Title */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Bible Quiz / Test Title *
                    </label>
                    <input
                      type="text"
                      value={newQuizTitle}
                      onChange={(e) => setNewQuizTitle(e.target.value)}
                      placeholder="e.g. Gospel of John Chapter 1 - Knowledge Evaluation"
                      className="input-control w-full p-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  {/* Questions builder */}
                  <div className="flex flex-col gap-5 border-t border-slate-100 pt-5">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Questions List Checklist ({newQuizQuestions.length} added)
                      </h4>
                      
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="px-3.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                      >
                        ➕ Add Another MCQ
                      </button>
                    </div>

                    {newQuizQuestions.map((q, idx) => (
                      <div key={idx} className="p-6 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-4 text-xs shadow-inner animate-fadein relative">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                          <span className="font-extrabold text-slate-600 block text-xs">Question {idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteCreatorQuestion(idx)}
                            disabled={newQuizQuestions.length <= 1}
                            className="text-red-500 font-bold hover:underline bg-transparent border-0 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                          >
                            Remove Question
                          </button>
                        </div>

                        {/* Question Text */}
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 block mb-1">Question Description *</label>
                          <textarea
                            value={q.question_text}
                            onChange={(e) => handleCreatorQuestionChange(idx, 'question_text', e.target.value)}
                            placeholder="e.g. Who was the disciple whom Jesus loved?"
                            rows="2"
                            className="w-full bg-white border border-slate-200 rounded p-2 text-xs focus:border-amber-500 focus:outline-none"
                            required
                          />
                        </div>

                        {/* Options A - D */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Option A *</label>
                            <input
                              type="text"
                              value={q.option_a}
                              onChange={(e) => handleCreatorQuestionChange(idx, 'option_a', e.target.value)}
                              placeholder="Choice A"
                              className="w-full bg-white border border-slate-200 rounded p-2 text-xs focus:border-amber-500 focus:outline-none"
                              required
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Option B *</label>
                            <input
                              type="text"
                              value={q.option_b}
                              onChange={(e) => handleCreatorQuestionChange(idx, 'option_b', e.target.value)}
                              placeholder="Choice B"
                              className="w-full bg-white border border-slate-200 rounded p-2 text-xs focus:border-amber-500 focus:outline-none"
                              required
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Option C *</label>
                            <input
                              type="text"
                              value={q.option_c}
                              onChange={(e) => handleCreatorQuestionChange(idx, 'option_c', e.target.value)}
                              placeholder="Choice C"
                              className="w-full bg-white border border-slate-200 rounded p-2 text-xs focus:border-amber-500 focus:outline-none"
                              required
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Option D *</label>
                            <input
                              type="text"
                              value={q.option_d}
                              onChange={(e) => handleCreatorQuestionChange(idx, 'option_d', e.target.value)}
                              placeholder="Choice D"
                              className="w-full bg-white border border-slate-200 rounded p-2 text-xs focus:border-amber-500 focus:outline-none"
                              required
                            />
                          </div>
                        </div>

                        {/* Correct Answer */}
                        <div className="w-48">
                          <label className="text-[10px] font-bold text-slate-600 block mb-1">Correct Choice Key *</label>
                          <select
                            value={q.correct_option}
                            onChange={(e) => handleCreatorQuestionChange(idx, 'correct_option', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded p-2 text-xs focus:border-amber-500 focus:outline-none"
                            required
                          >
                            <option value="A">Choice A</option>
                            <option value="B">Choice B</option>
                            <option value="C">Choice C</option>
                            <option value="D">Choice D</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>

                  {creatorSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
                      ✅ {creatorSuccess}
                    </div>
                  )}

                  {creatorError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl">
                      ❌ {creatorError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isCreatingQuiz}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-1 mt-4"
                  >
                    {isCreatingQuiz ? 'Publishing & Emailing...' : 'Publish Test & Dispatch Email Alert'}
                  </button>
                </form>
              </div>
            )}

          {/* 1. PRAYER QUEUE PANEL */}
          {activeTab === 'summary' && (
          <div className="glass-panel overflow-hidden bg-white border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm min-w-[700px]">
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
          </div>
        )}



        {/* 3. SPECIAL EVENTS MANAGER PANEL */}
        {activeTab === 'events' && user?.role === 'admin' && (
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
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm min-w-[700px]">
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
          </div>
        )}

            {/* 4. HOMEPAGE CONTENT PANEL */}
        {activeTab === 'homepage' && (
          <div className="flex flex-col gap-6 animate-slideup text-left">
            <div className="glass-panel p-6 bg-slate-900 border-amber-500/20 text-white shadow-sm flex flex-col gap-2">
              <h3 className="font-serif font-bold text-lg text-white">Homepage Content Editor</h3>
              <p className="text-xs text-slate-400">
                Directly edit home banner hero carousel photos, welcome restatements, pastor messages, and the three homepage sliders.
              </p>
            </div>

            <form onSubmit={handleSaveAbout} className="flex flex-col gap-6">
              {/* Congregation Banner Images (Multiple Carousel Images) */}
              <div className="glass-panel p-6 bg-white border-slate-200 shadow-sm flex flex-col gap-5">
                <h4 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
                  Congregation Banner Images (Home Hero Carousel)
                </h4>
                <div className="flex flex-col gap-4 text-left">
                  <p className="text-xs text-slate-500">
                    The homepage hero section displays a sliding carousel with exactly 3 slides. You can upload a custom photo for each slide below, or reset a slide to use its default church image.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border border-slate-100 p-4 rounded-xl bg-slate-50">
                    {[0, 1, 2].map((idx) => {
                      const defaultImages = [
                        '/images/home-banner1.JPG',
                        '/images/prayer.jpg',
                        '/images/banner1.jpg'
                      ];
                      const currentUrl = congregationImages[idx] || defaultImages[idx];
                      const isCustom = !!congregationImages[idx] && congregationImages[idx] !== defaultImages[idx];

                      return (
                        <div key={idx} className="flex flex-col gap-2 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-800">Slide {idx + 1}</span>
                            {isCustom ? (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase">Custom</span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[9px] font-extrabold uppercase">Default</span>
                            )}
                          </div>
                          
                          <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-100 bg-slate-50 group">
                            <img src={currentUrl} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                            {isCustom && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...congregationImages];
                                  updated[idx] = null; // reset to default
                                  setCongregationImages(updated);
                                }}
                                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow transition-colors"
                                title="Reset to Default Image"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-1 mt-1 text-left">
                            <label className="text-[9px] uppercase tracking-wider font-extrabold text-slate-500">
                              {isCustom ? "Replace Image" : "Upload Custom Image"}
                            </label>
                            <input 
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                try {
                                  const url = await uploadFile(file);
                                  const updated = [...congregationImages];
                                  // Ensure array is padded up to index
                                  while (updated.length <= idx) {
                                    updated.push(null);
                                  }
                                  updated[idx] = url;
                                  setCongregationImages(updated);
                                } catch (err) {
                                  alert('Upload failed: ' + err.message);
                                }
                              }}
                              className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer w-full text-slate-700"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Welcome Section */}
              <div className="glass-panel p-6 bg-white border-slate-200 shadow-sm flex flex-col gap-5">
                <h4 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
                  Welcome Section Headers
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Welcome Title (English)</label>
                    <input 
                      type="text"
                      value={aboutEn.welcomeTitle || ''}
                      onChange={(e) => setAboutEn({ ...aboutEn, welcomeTitle: e.target.value })}
                      className="input-control w-full text-slate-950 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Welcome Title (Tamil)</label>
                    <input 
                      type="text"
                      value={aboutTa.welcomeTitle || ''}
                      onChange={(e) => setAboutTa({ ...aboutTa, welcomeTitle: e.target.value })}
                      className="input-control w-full text-slate-950 bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Welcome Subtitle (English)</label>
                    <textarea 
                      value={aboutEn.welcomeSubtitle || ''}
                      onChange={(e) => setAboutEn({ ...aboutEn, welcomeSubtitle: e.target.value })}
                      className="input-control w-full text-slate-950 bg-white"
                      rows="2"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Welcome Subtitle (Tamil)</label>
                    <textarea 
                      value={aboutTa.welcomeSubtitle || ''}
                      onChange={(e) => setAboutTa({ ...aboutTa, welcomeSubtitle: e.target.value })}
                      className="input-control w-full text-slate-950 bg-white"
                      rows="2"
                    />
                  </div>
                </div>
              </div>

              {/* Pastoral Message Section */}
              <div className="glass-panel p-6 bg-white border-slate-200 shadow-sm flex flex-col gap-5">
                <h4 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
                  Pastoral Message & Pastor Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Pastor Name (English)</label>
                    <input 
                      type="text"
                      value={aboutEn.pastorName || ''}
                      onChange={(e) => setAboutEn({ ...aboutEn, pastorName: e.target.value })}
                      className="input-control w-full text-slate-950 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Pastor Name (Tamil)</label>
                    <input 
                      type="text"
                      value={aboutTa.pastorName || ''}
                      onChange={(e) => setAboutTa({ ...aboutTa, pastorName: e.target.value })}
                      className="input-control w-full text-slate-950 bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Pastor Message Title (English)</label>
                    <input 
                      type="text"
                      value={aboutEn.pastorMessageTitle || ''}
                      onChange={(e) => setAboutEn({ ...aboutEn, pastorMessageTitle: e.target.value })}
                      className="input-control w-full text-slate-950 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Pastor Message Title (Tamil)</label>
                    <input 
                      type="text"
                      value={aboutTa.pastorMessageTitle || ''}
                      onChange={(e) => setAboutTa({ ...aboutTa, pastorMessageTitle: e.target.value })}
                      className="input-control w-full text-slate-950 bg-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Pastoral Message Content (English)</label>
                    <textarea 
                      value={aboutEn.pastorMessageText || ''}
                      onChange={(e) => setAboutEn({ ...aboutEn, pastorMessageText: e.target.value })}
                      className="input-control w-full text-slate-955 bg-white"
                      rows="6"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Pastoral Message Content (Tamil)</label>
                    <textarea 
                      value={aboutTa.pastorMessageText || ''}
                      onChange={(e) => setAboutTa({ ...aboutTa, pastorMessageText: e.target.value })}
                      className="input-control w-full text-slate-955 bg-white"
                      rows="6"
                    />
                  </div>
                </div>
                {/* Pastor Image Uploader */}
                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex flex-col gap-3">
                  <span className="text-xs font-bold text-slate-700 block">Pastor Photo Image</span>
                  <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                    {aboutEn.pastorImage && (
                      <img src={aboutEn.pastorImage} alt="Pastor Immanuel" className="w-16 h-16 rounded-full object-cover border border-slate-200 shrink-0" />
                    )}
                    <div className="flex-1 w-full">
                      <input 
                        type="text" 
                        value={aboutEn.pastorImage || ''} 
                        onChange={(e) => {
                          setAboutEn(prev => ({ ...prev, pastorImage: e.target.value }));
                          setAboutTa(prev => ({ ...prev, pastorImage: e.target.value }));
                        }}
                        className="input-control w-full bg-white mb-2"
                        placeholder="e.g. /images/pastor-immanuel.png"
                      />
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            try {
                              const url = await uploadFile(file);
                              setAboutEn(prev => ({ ...prev, pastorImage: url }));
                              setAboutTa(prev => ({ ...prev, pastorImage: url }));
                            } catch (err) { alert(err.message); }
                          }
                        }}
                        className="input-control w-full text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Home Sliding Banners */}
              <div className="glass-panel p-6 bg-white border-slate-200 shadow-sm flex flex-col gap-5">
                <h4 className="font-serif font-bold text-base text-slate-950 border-b border-slate-100 pb-2">
                  Homepage Hero Sliding Banners (3 Slides)
                </h4>
                
                {/* Slide 1 */}
                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex flex-col gap-3">
                  <span className="text-xs font-extrabold text-amber-600 block">SLIDE 1</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      value={aboutEn.heroTitle1 || ''} 
                      onChange={(e) => setAboutEn({ ...aboutEn, heroTitle1: e.target.value })}
                      placeholder="Slide 1 Title (English)"
                      className="input-control w-full bg-white"
                    />
                    <input 
                      type="text" 
                      value={aboutTa.heroTitle1 || ''} 
                      onChange={(e) => setAboutTa({ ...aboutTa, heroTitle1: e.target.value })}
                      placeholder="Slide 1 Title (Tamil)"
                      className="input-control w-full bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <textarea 
                      value={aboutEn.heroSub1 || ''} 
                      onChange={(e) => setAboutEn({ ...aboutEn, heroSub1: e.target.value })}
                      placeholder="Slide 1 Subtitle (English)"
                      className="input-control w-full bg-white"
                      rows="2"
                    />
                    <textarea 
                      value={aboutTa.heroSub1 || ''} 
                      onChange={(e) => setAboutTa({ ...aboutTa, heroSub1: e.target.value })}
                      placeholder="Slide 1 Subtitle (Tamil)"
                      className="input-control w-full bg-white"
                      rows="2"
                    />
                  </div>
                </div>

                {/* Slide 2 */}
                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex flex-col gap-3">
                  <span className="text-xs font-extrabold text-amber-600 block">SLIDE 2</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      value={aboutEn.heroTitle2 || ''} 
                      onChange={(e) => setAboutEn({ ...aboutEn, heroTitle2: e.target.value })}
                      placeholder="Slide 2 Title (English)"
                      className="input-control w-full bg-white"
                    />
                    <input 
                      type="text" 
                      value={aboutTa.heroTitle2 || ''} 
                      onChange={(e) => setAboutTa({ ...aboutTa, heroTitle2: e.target.value })}
                      placeholder="Slide 2 Title (Tamil)"
                      className="input-control w-full bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <textarea 
                      value={aboutEn.heroSub2 || ''} 
                      onChange={(e) => setAboutEn({ ...aboutEn, heroSub2: e.target.value })}
                      placeholder="Slide 2 Subtitle (English)"
                      className="input-control w-full bg-white"
                      rows="2"
                    />
                    <textarea 
                      value={aboutTa.heroSub2 || ''} 
                      onChange={(e) => setAboutTa({ ...aboutTa, heroSub2: e.target.value })}
                      placeholder="Slide 2 Subtitle (Tamil)"
                      className="input-control w-full bg-white"
                      rows="2"
                    />
                  </div>
                </div>

                {/* Slide 3 */}
                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex flex-col gap-3">
                  <span className="text-xs font-extrabold text-amber-600 block">SLIDE 3</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      value={aboutEn.heroTitle3 || ''} 
                      onChange={(e) => setAboutEn({ ...aboutEn, heroTitle3: e.target.value })}
                      placeholder="Slide 3 Title (English)"
                      className="input-control w-full bg-white"
                    />
                    <input 
                      type="text" 
                      value={aboutTa.heroTitle3 || ''} 
                      onChange={(e) => setAboutTa({ ...aboutTa, heroTitle3: e.target.value })}
                      placeholder="Slide 3 Title (Tamil)"
                      className="input-control w-full bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <textarea 
                      value={aboutEn.heroSub3 || ''} 
                      onChange={(e) => setAboutEn({ ...aboutEn, heroSub3: e.target.value })}
                      placeholder="Slide 3 Subtitle (English)"
                      className="input-control w-full bg-white"
                      rows="2"
                    />
                    <textarea 
                      value={aboutTa.heroSub3 || ''} 
                      onChange={(e) => setAboutTa({ ...aboutTa, heroSub3: e.target.value })}
                      placeholder="Slide 3 Subtitle (Tamil)"
                      className="input-control w-full bg-white"
                      rows="2"
                    />
                  </div>
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
                  {isSavingAbout ? 'Saving Homepage Content...' : 'Save Homepage Updates'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 5. ABOUT US CONTENT PANEL */}
        {activeTab === 'about' && (
          <div className="flex flex-col gap-6 animate-slideup text-left">
            <div className="glass-panel p-6 bg-slate-900 border-amber-500/20 text-white shadow-sm flex flex-col gap-2">
              <h3 className="font-serif font-bold text-lg text-white">About Us Content Editor</h3>
              <p className="text-xs text-slate-400">
                Directly change paragraphs, faith declarations, and historic timeline points in both English and Tamil.
              </p>
            </div>

            <form onSubmit={handleSaveAbout} className="flex flex-col gap-6">
              {/* General Headers and Vision Section */}
              <div className="glass-panel p-6 bg-white border-slate-200 shadow-sm flex flex-col gap-5">
                <h4 className="font-serif font-bold text-base text-slate-950 border-b border-slate-100 pb-2">
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
                      className="input-control w-full text-slate-955 bg-white"
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
                  <h4 className="font-serif font-bold text-base text-slate-950">
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
                    <p className="text-xs text-slate-500 italic">No extra history paragraphs added yet.</p>
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
                  <h4 className="font-serif font-bold text-base text-slate-950">
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
                    <p className="text-xs text-slate-500 italic">No milestones defined.</p>
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
                              className="input-control w-full text-slate-955 bg-white"
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
                  <h4 className="font-serif font-bold text-base text-slate-950">
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
                    <p className="text-xs text-slate-500 italic">No faith statements defined.</p>
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
                              className="input-control w-full text-slate-955 bg-white"
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
                              className="input-control w-full text-slate-955 bg-white"
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
                  {isSavingAbout ? 'Saving About Content...' : 'Save About Updates'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 5.5 PAGE HEADERS CUSTOMIZER */}
        {activeTab === 'customizer' && (
          <div className="flex flex-col gap-6 animate-slideup text-left">
            <div className="glass-panel p-6 bg-slate-900 border-amber-500/20 text-white shadow-sm flex flex-col gap-2">
              <h3 className="font-serif font-bold text-lg text-white">Page Headers Customizer</h3>
              <p className="text-xs text-slate-400">
                Upload background images or add additional paragraphs for each of the main page templates.
              </p>
            </div>

            <form onSubmit={handleSaveAbout} className="flex flex-col gap-6">
              <div className="glass-panel p-6 bg-white border-slate-200 shadow-sm flex flex-col gap-5">
                <h4 className="font-serif font-bold text-base text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-amber-500" />
                  Background Image Customizer
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {/* About Page Customizer */}
                  <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex flex-col gap-3">
                    <span className="text-xs font-bold text-amber-600 block uppercase tracking-wider">About Us Page</span>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Header Background Image URL</label>
                      <input 
                        type="text" 
                        value={aboutEn.bg_about || ''} 
                        onChange={(e) => {
                          setAboutEn(prev => ({ ...prev, bg_about: e.target.value }));
                          setAboutTa(prev => ({ ...prev, bg_about: e.target.value }));
                        }}
                        className="input-control w-full bg-white mb-2"
                        placeholder="e.g. /images/about-bg.jpg"
                      />
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            try {
                              const url = await uploadFile(file);
                              setAboutEn(prev => ({ ...prev, bg_about: url }));
                              setAboutTa(prev => ({ ...prev, bg_about: url }));
                            } catch (err) { alert(err.message); }
                          }
                        }}
                        className="input-control w-full text-xs bg-white"
                      />
                    </div>
                  </div>

                  {/* Sermons Page Customizer */}
                  <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex flex-col gap-3">
                    <span className="text-xs font-bold text-amber-600 block uppercase tracking-wider">Sermons Page</span>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Header Background Image URL</label>
                      <input 
                        type="text" 
                        value={aboutEn.bg_services || ''} 
                        onChange={(e) => {
                          setAboutEn(prev => ({ ...prev, bg_services: e.target.value }));
                          setAboutTa(prev => ({ ...prev, bg_services: e.target.value }));
                        }}
                        className="input-control w-full bg-white mb-2"
                        placeholder="e.g. /images/sermons-bg.jpg"
                      />
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            try {
                              const url = await uploadFile(file);
                              setAboutEn(prev => ({ ...prev, bg_services: url }));
                              setAboutTa(prev => ({ ...prev, bg_services: url }));
                            } catch (err) { alert(err.message); }
                          }
                        }}
                        className="input-control w-full text-xs bg-white"
                      />
                    </div>
                  </div>

                  {/* Ministries Page Customizer */}
                  <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex flex-col gap-3">
                    <span className="text-xs font-bold text-amber-600 block uppercase tracking-wider">Ministries Page</span>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Header Background Image URL</label>
                      <input 
                        type="text" 
                        value={aboutEn.bg_ministries || ''} 
                        onChange={(e) => {
                          setAboutEn(prev => ({ ...prev, bg_ministries: e.target.value }));
                          setAboutTa(prev => ({ ...prev, bg_ministries: e.target.value }));
                        }}
                        className="input-control w-full bg-white mb-2"
                        placeholder="e.g. /images/ministries-bg.jpg"
                      />
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            try {
                              const url = await uploadFile(file);
                              setAboutEn(prev => ({ ...prev, bg_ministries: url }));
                              setAboutTa(prev => ({ ...prev, bg_ministries: url }));
                            } catch (err) { alert(err.message); }
                          }
                        }}
                        className="input-control w-full text-xs bg-white"
                      />
                    </div>
                  </div>

                  {/* Events Page Customizer */}
                  <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex flex-col gap-3">
                    <span className="text-xs font-bold text-amber-600 block uppercase tracking-wider">Events Page</span>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Header Background Image URL</label>
                      <input 
                        type="text" 
                        value={aboutEn.bg_events || ''} 
                        onChange={(e) => {
                          setAboutEn(prev => ({ ...prev, bg_events: e.target.value }));
                          setAboutTa(prev => ({ ...prev, bg_events: e.target.value }));
                        }}
                        className="input-control w-full bg-white mb-2"
                        placeholder="e.g. /images/events-bg.jpg"
                      />
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            try {
                              const url = await uploadFile(file);
                              setAboutEn(prev => ({ ...prev, bg_events: url }));
                              setAboutTa(prev => ({ ...prev, bg_events: url }));
                            } catch (err) { alert(err.message); }
                          }
                        }}
                        className="input-control w-full text-xs bg-white"
                      />
                    </div>
                  </div>

                  {/* Resources Page Customizer */}
                  <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex flex-col gap-3">
                    <span className="text-xs font-bold text-amber-600 block uppercase tracking-wider">Resources Page</span>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Header Background Image URL</label>
                      <input 
                        type="text" 
                        value={aboutEn.bg_resources || ''} 
                        onChange={(e) => {
                          setAboutEn(prev => ({ ...prev, bg_resources: e.target.value }));
                          setAboutTa(prev => ({ ...prev, bg_resources: e.target.value }));
                        }}
                        className="input-control w-full bg-white mb-2"
                        placeholder="e.g. /images/resources-bg.jpg"
                      />
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            try {
                              const url = await uploadFile(file);
                              setAboutEn(prev => ({ ...prev, bg_resources: url }));
                              setAboutTa(prev => ({ ...prev, bg_resources: url }));
                            } catch (err) { alert(err.message); }
                          }
                        }}
                        className="input-control w-full text-xs bg-white"
                      />
                    </div>
                  </div>

                  {/* Contact Page Customizer */}
                  <div className="p-4 border border-slate-100 rounded-xl bg-slate-50 flex flex-col gap-3">
                    <span className="text-xs font-bold text-amber-600 block uppercase tracking-wider">Contact Us Page</span>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Header Background Image URL</label>
                      <input 
                        type="text" 
                        value={aboutEn.bg_contact || ''} 
                        onChange={(e) => {
                          setAboutEn(prev => ({ ...prev, bg_contact: e.target.value }));
                          setAboutTa(prev => ({ ...prev, bg_contact: e.target.value }));
                        }}
                        className="input-control w-full bg-white mb-2"
                        placeholder="e.g. /images/contact-bg.jpg"
                      />
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            try {
                              const url = await uploadFile(file);
                              setAboutEn(prev => ({ ...prev, bg_contact: url }));
                              setAboutTa(prev => ({ ...prev, bg_contact: url }));
                            } catch (err) { alert(err.message); }
                          }
                        }}
                        className="input-control w-full text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Centralized Paragraphs Manager */}
                <div className="flex flex-col gap-4 mt-6 border-t border-slate-150 pt-6">
                  <h5 className="font-serif font-bold text-base text-slate-900">Custom Additional Paragraphs Manager</h5>
                  
                  {['about', 'services', 'ministries', 'events', 'resources', 'contact'].map((pageName) => {
                    const key = `paras_${pageName}`;
                    let parasList = [];
                    try {
                      parasList = typeof aboutEn[key] === 'string' ? JSON.parse(aboutEn[key]) : (aboutEn[key] || []);
                    } catch(e) { parasList = []; }
                    if (!Array.isArray(parasList)) parasList = [];

                    return (
                      <div key={pageName} className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex flex-col gap-3">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                          <span className="text-xs font-bold text-slate-700 capitalize">{pageName} Page Paragraphs ({parasList.length})</span>
                          <button 
                            type="button"
                            onClick={() => {
                              const updated = [...parasList, { en: 'New Paragraph English text', ta: 'புதிய பத்தி தமிழ் உரை' }];
                              setAboutEn(prev => ({ ...prev, [key]: JSON.stringify(updated) }));
                              setAboutTa(prev => ({ ...prev, [key]: JSON.stringify(updated) }));
                            }}
                            className="px-2 py-1 rounded bg-amber-500 text-slate-950 hover:bg-amber-600 text-[10px] font-extrabold transition-all"
                          >
                            + Add Paragraph
                          </button>
                        </div>

                        {parasList.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">No additional paragraphs. Click Add above to define some.</span>
                        ) : (
                          <div className="flex flex-col gap-4">
                            {parasList.map((p, idx) => (
                              <div key={idx} className="p-3 border border-slate-200 rounded-lg bg-white flex flex-col gap-2 relative group">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = parasList.filter((_, i) => i !== idx);
                                    setAboutEn(prev => ({ ...prev, [key]: JSON.stringify(updated) }));
                                    setAboutTa(prev => ({ ...prev, [key]: JSON.stringify(updated) }));
                                  }}
                                  className="absolute top-2 right-2 p-1 bg-red-50 hover:bg-red-100 text-red-600 rounded transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>

                                <div>
                                  <label className="text-[9px] uppercase font-extrabold text-slate-400 block mb-0.5">Paragraph {idx+1} (English)</label>
                                  <textarea 
                                    value={p.en || ''}
                                    onChange={(e) => {
                                      const copy = [...parasList];
                                      copy[idx].en = e.target.value;
                                      setAboutEn(prev => ({ ...prev, [key]: JSON.stringify(copy) }));
                                      setAboutTa(prev => ({ ...prev, [key]: JSON.stringify(copy) }));
                                    }}
                                    className="input-control w-full bg-slate-50 border-slate-200 text-xs"
                                    rows="2"
                                  />
                                </div>

                                <div>
                                  <label className="text-[9px] uppercase font-extrabold text-slate-400 block mb-0.5">Paragraph {idx+1} (Tamil)</label>
                                  <textarea 
                                    value={p.ta || ''}
                                    onChange={(e) => {
                                      const copy = [...parasList];
                                      copy[idx].ta = e.target.value;
                                      setAboutEn(prev => ({ ...prev, [key]: JSON.stringify(copy) }));
                                      setAboutTa(prev => ({ ...prev, [key]: JSON.stringify(copy) }));
                                    }}
                                    className="input-control w-full bg-slate-50 border-slate-200 text-xs"
                                    rows="2"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
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
                  {isSavingAbout ? 'Saving Customizer Changes...' : 'Save Customizer Updates'}
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
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm min-w-[700px]">
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
          </div>
        )}

        {/* 7. MINISTRIES PANEL */}
        {activeTab === 'ministries' && (
          <div className="flex flex-col gap-8 animate-slideup text-left">
            {/* Ministries list first */}
            <div className="flex flex-col gap-4 text-left">
              <h4 className="font-serif font-bold text-lg text-slate-900 dark:text-white border-b border-slate-100 pb-2">
                Existing Ministries Spheres
              </h4>
              <div className="grid grid-cols-1 gap-4">
                {ministries.map((min) => (
                  <div key={min.id} className="glass-panel overflow-hidden shadow-sm flex flex-col md:flex-row gap-4 p-4 items-start bg-white border-slate-200">
                    {min.image_url && (
                      <img 
                        src={min.image_url} 
                        alt={min.name}
                        className="w-full md:w-32 h-24 rounded object-cover border border-slate-200 shrink-0 bg-slate-50"
                      />
                    )}
                    
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-500 block mb-0.5">
                            {min.category || 'Ministry'}
                          </span>
                          <h4 className="font-serif font-bold text-lg leading-tight text-slate-900">{min.name}</h4>
                          {min.leader && (
                            <span className="text-[10px] text-slate-400 block mt-0.5">Leader: <strong className="font-bold text-slate-600">{min.leader}</strong></span>
                          )}
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <button 
                            type="button"
                            onClick={() => handleStartEditMinistry(min)}
                            className="p-1.5 rounded bg-amber-50 text-amber-600 hover:bg-amber-100"
                            title="Edit Ministry"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleDeleteMinistry(min.id)}
                            className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100"
                            title="Delete Ministry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs leading-relaxed font-normal text-slate-600">{min.description}</p>
                      
                      <div className="flex flex-wrap gap-4 border-t border-slate-100 pt-2 text-[11px] font-semibold text-slate-400">
                        <span>⏰ Schedule: <strong className="text-slate-700">{min.schedule}</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Ministry Form below existing list */}
            {!editingMinistryId && (
              <div className="glass-panel p-6 shadow-sm flex flex-col gap-4 bg-white border-slate-200">
                <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-amber-500" />
                  <h3 className="font-serif font-bold text-lg text-slate-900">
                    Add New Ministry
                  </h3>
                </div>

                <form onSubmit={handleSaveMinistry} className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-bold block text-slate-700 mb-1">Ministry Name *</label>
                    <input 
                      type="text"
                      value={newMinistry.name}
                      onChange={(e) => setNewMinistry({ ...newMinistry, name: e.target.value })}
                      placeholder="e.g. Youth Outreach Fellowship"
                      className="input-control w-full bg-white text-slate-950"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold block text-slate-700 mb-1">Category</label>
                      <input 
                        type="text"
                        value={newMinistry.category}
                        onChange={(e) => setNewMinistry({ ...newMinistry, category: e.target.value })}
                        placeholder="e.g. Fellowship, Youth"
                        className="input-control w-full bg-white text-slate-950"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold block text-slate-700 mb-1">Schedule / Timings *</label>
                      <input 
                        type="text"
                        value={newMinistry.schedule}
                        onChange={(e) => setNewMinistry({ ...newMinistry, schedule: e.target.value })}
                        placeholder="e.g. Sundays at 11:30 AM"
                        className="input-control w-full bg-white text-slate-950"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold block text-slate-700 mb-1">Leader / Coordinator</label>
                    <input 
                      type="text"
                      value={newMinistry.leader || ''}
                      onChange={(e) => setNewMinistry({ ...newMinistry, leader: e.target.value })}
                      placeholder="e.g. Bro. David"
                      className="input-control w-full bg-white text-slate-950"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold block text-slate-700 mb-1">Banner Image</label>
                    <input 
                      type="text"
                      value={newMinistry.image_url}
                      onChange={(e) => setNewMinistry({ ...newMinistry, image_url: e.target.value })}
                      placeholder="e.g. /images/banner1.jpg"
                      className="input-control w-full font-mono text-xs mb-2 bg-white text-slate-955"
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
                      className="input-control w-full text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold block text-slate-700 mb-1">Detailed Description *</label>
                    <textarea 
                      value={newMinistry.description}
                      onChange={(e) => setNewMinistry({ ...newMinistry, description: e.target.value })}
                      placeholder="Explain the ministry activities..."
                      rows="4"
                      className="input-control w-full bg-white text-slate-955"
                      required
                    />
                  </div>

                  {formError && <span className="text-xs font-bold text-red-600 block">{formError}</span>}
                  {formSuccess && <span className="text-xs font-bold text-emerald-600 block">{formSuccess}</span>}

                  <div className="flex gap-2 border-t border-slate-100 pt-3 mt-1">
                    <button 
                      type="submit"
                      disabled={isSubmittingMinistry}
                      className="btn-primary justify-center py-2.5 px-4 text-xs flex-1 bg-amber-500 hover:bg-amber-600"
                    >
                      {isSubmittingMinistry ? 'Saving...' : 'Add Ministry'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Centered Modal Overlay for Edit */}
            {editingMinistryId && createPortal(
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadein">
                <div className="glass-panel p-6 bg-white border-slate-200 shadow-2xl rounded-2xl flex flex-col gap-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative text-left">
                  <button 
                    onClick={handleCancelEditMinistry}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-transparent border-0 cursor-pointer"
                    title="Close editor"
                    type="button"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Edit className="w-5 h-5 text-amber-500" />
                    <h3 className="font-serif font-bold text-lg text-slate-900">
                      Edit Ministry: {newMinistry.name}
                    </h3>
                  </div>

                  <form onSubmit={handleSaveMinistry} className="flex flex-col gap-4">
                    <div>
                      <label className="text-xs font-bold block text-slate-700 mb-1">Ministry Name *</label>
                      <input 
                        type="text"
                        value={newMinistry.name}
                        onChange={(e) => setNewMinistry({ ...newMinistry, name: e.target.value })}
                        placeholder="e.g. Youth Outreach Fellowship"
                        className="input-control w-full bg-white text-slate-955"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold block text-slate-700 mb-1">Category</label>
                        <input 
                          type="text"
                          value={newMinistry.category}
                          onChange={(e) => setNewMinistry({ ...newMinistry, category: e.target.value })}
                          placeholder="e.g. Fellowship, Youth"
                          className="input-control w-full bg-white text-slate-955"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold block text-slate-700 mb-1">Schedule / Timings *</label>
                        <input 
                          type="text"
                          value={newMinistry.schedule}
                          onChange={(e) => setNewMinistry({ ...newMinistry, schedule: e.target.value })}
                          placeholder="e.g. Sundays at 11:30 AM"
                          className="input-control w-full bg-white text-slate-955"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold block text-slate-700 mb-1">Leader / Coordinator</label>
                      <input 
                        type="text"
                        value={newMinistry.leader || ''}
                        onChange={(e) => setNewMinistry({ ...newMinistry, leader: e.target.value })}
                        placeholder="e.g. Bro. David"
                        className="input-control w-full bg-white text-slate-955"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold block text-slate-700 mb-1">Banner Image</label>
                      <input 
                        type="text"
                        value={newMinistry.image_url}
                        onChange={(e) => setNewMinistry({ ...newMinistry, image_url: e.target.value })}
                        placeholder="e.g. /images/banner1.jpg"
                        className="input-control w-full font-mono text-xs mb-2 bg-white text-slate-955"
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
                        className="input-control w-full text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold block text-slate-700 mb-1">Detailed Description *</label>
                      <textarea 
                        value={newMinistry.description}
                        onChange={(e) => setNewMinistry({ ...newMinistry, description: e.target.value })}
                        placeholder="Explain the ministry activities..."
                        rows="4"
                        className="input-control w-full bg-white text-slate-955"
                        required
                      />
                    </div>

                    {formError && <span className="text-xs font-bold text-red-600 block">{formError}</span>}
                    {formSuccess && <span className="text-xs font-bold text-emerald-600 block">{formSuccess}</span>}

                    <div className="flex gap-2 border-t border-slate-100 pt-3 mt-1">
                      <button 
                        type="button"
                        onClick={handleCancelEditMinistry}
                        className="btn-secondary py-2 px-4 text-xs flex-1 text-center"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={isSubmittingMinistry}
                        className="btn-primary justify-center py-2.5 px-4 text-xs flex-1 bg-amber-500 hover:bg-amber-600"
                      >
                        {isSubmittingMinistry ? 'Saving...' : 'Update Ministry'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>,
              document.body
            )}
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
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm min-w-[700px]">
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
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm min-w-[700px]">
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
          </div>
        )}

        {/* 9. REGISTERED USERS PANEL */}
        {activeTab === 'users' && user && user.role === 'admin' && (
          <div className="glass-panel overflow-hidden bg-white border-slate-200">
            <div className="p-4 bg-slate-900 border-b border-slate-800 text-white font-bold text-base flex justify-between items-center">
              <span>Registered Believers Database</span>
              <span className="text-xs bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-mono font-extrabold">{users.length} Users</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm min-w-[700px]">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold text-xs uppercase tracking-wider">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Current Authorization Role</th>
                    <th className="p-4">Member Since</th>
                    <th className="p-4 text-center">Actions / Upgrades</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-semibold text-slate-700">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <span className="block text-slate-900 font-bold">{u.name}</span>
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-600">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          u.role === 'admin' 
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : u.role === 'moderator'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-slate-100 text-slate-800 border border-slate-200'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-400">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-center">
                          {u.role !== 'admin' ? (
                            <button 
                              type="button"
                              onClick={() => handleUpdateUserRole(u.id, 'admin')}
                              className="px-2 py-1 rounded bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 text-xs font-bold transition-all"
                            >
                              Promote to Admin
                            </button>
                          ) : (
                            u.email !== 'tamilselvimariappan@gmail.com' ? (
                              <button 
                                type="button"
                                onClick={() => handleUpdateUserRole(u.id, 'user')}
                                className="px-2 py-1 rounded bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 text-xs font-bold transition-all"
                              >
                                Demote to User
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400 italic font-normal">Primary Owner</span>
                            )
                          )}
                          
                          {u.role !== 'moderator' && u.email !== 'tamilselvimariappan@gmail.com' && (
                            <button 
                              type="button"
                              onClick={() => handleUpdateUserRole(u.id, 'moderator')}
                              className="px-2 py-1 rounded bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 text-xs font-bold transition-all"
                            >
                              Make Moderator
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 10. CONTACT INQUIRIES RESPONSE PANEL */}
        {activeTab === 'inquiries' && user && (user.role === 'admin' || user.role === 'moderator') && (
          <div className="flex flex-col gap-6 animate-slideup text-left">
            <div className="glass-panel p-6 bg-slate-900 border-amber-500/20 text-white shadow-sm flex flex-col gap-2">
              <h3 className="font-serif font-bold text-lg text-white">General Contact Inquiries</h3>
              <p className="text-xs text-slate-400">
                View submitted contact inquiries, and reply directly. Submitting a reply dispatches a copy to the inquirer's email.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {inquiries.length === 0 ? (
                <div className="glass-panel p-8 text-center bg-white border-slate-200 text-slate-400 text-sm italic shadow-sm">
                  No contact inquiries have been submitted yet.
                </div>
              ) : (
                inquiries.map((inq) => (
                  <div key={inq.id} className="glass-panel p-6 bg-white border-slate-200 shadow-sm flex flex-col gap-4">
                    <div className="flex flex-wrap justify-between items-start border-b border-slate-100 pb-3 gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{inq.name}</h4>
                        <span className="text-xs text-slate-400 font-mono block mt-0.5">{inq.email} {inq.phone ? `| ${inq.phone}` : ''}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold">{new Date(inq.created_at).toLocaleString()}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          inq.is_answered === 1 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800 animate-pulse'
                        }`}>
                          {inq.is_answered === 1 ? 'Answered' : 'Unanswered'}
                        </span>
                      </div>
                    </div>

                    <div className="text-slate-700 leading-relaxed">
                      <p className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">Inquiry Subject</p>
                      <p className="font-bold text-slate-800 mb-2">{inq.subject || 'General Inquiry'}</p>
                      <p className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">Message Body</p>
                      <p className="bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap text-sm text-slate-600">{inq.message}</p>
                    </div>

                    {inq.is_answered === 1 ? (
                      <div className="bg-emerald-50/50 p-4 border border-emerald-100 rounded-xl flex flex-col gap-2">
                        <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider block">Official Response:</span>
                        <p className="text-sm text-emerald-950 font-medium whitespace-pre-wrap">{inq.response_text}</p>
                      </div>
                    ) : (
                      <div className="border-t border-slate-150 pt-4 flex flex-col gap-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">Compose Reply to {inq.name}</label>
                          <textarea 
                            value={inquiryResponses[inq.id] || ''}
                            onChange={(e) => setInquiryResponses({
                              ...inquiryResponses,
                              [inq.id]: e.target.value
                            })}
                            placeholder="Type your official email response here..."
                            rows="3"
                            className="input-control w-full text-slate-900 bg-white"
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleRespondToInquiry(inq.id)}
                            disabled={isSubmittingResponse[inq.id]}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                          >
                            {isSubmittingResponse[inq.id] ? 'Sending...' : 'Send Response & Email'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 11. SECURITY SETTINGS (CHANGE PASSWORD) PANEL */}
        {activeTab === 'security' && user && (
          <div className="flex flex-col gap-6 animate-slideup text-left max-w-md mx-auto lg:mx-0">
            <div className="glass-panel p-6 bg-slate-900 border-amber-500/20 text-white shadow-sm flex flex-col gap-2">
              <h3 className="font-serif font-bold text-lg text-white">Security Settings</h3>
              <p className="text-xs text-slate-400">
                Securely update your admin or believer password here. Verified security validation is enforced.
              </p>
            </div>

            <form onSubmit={handlePasswordChange} className="glass-panel p-6 bg-white border-slate-200 shadow-sm flex flex-col gap-4">
              {pwError && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-xs font-bold text-left">
                  {pwError}
                </div>
              )}
              {pwSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-lg p-3 text-xs font-bold text-left font-semibold">
                  {pwSuccess}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 text-left">Current Password</label>
                <input 
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="input-control w-full text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 text-left">New Password</label>
                <input 
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 6 characters)"
                  className="input-control w-full text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 text-left">Confirm New Password</label>
                <input 
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="input-control w-full text-slate-900 bg-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isChangingPw}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold rounded-xl transition-all shadow-sm disabled:opacity-50"
                >
                  {isChangingPw ? 'Updating Password...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
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
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs font-semibold text-slate-600 border-collapse min-w-[700px]">
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
    </div>
  );
};

export default Admin;
