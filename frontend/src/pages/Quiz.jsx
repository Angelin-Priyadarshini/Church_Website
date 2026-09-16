import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Clock, BookOpen, User, Bookmark, Check, RefreshCw, LogOut, Key, Mail, ShieldAlert } from 'lucide-react';
import { API_BASE } from '../config';

const Quiz = () => {
  const { language } = useLanguage();
  const { user, token, login, logout } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Request Access State
  const [requestName, setRequestName] = useState('');
  const [requestEmail, setRequestEmail] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState('');
  const [requestError, setRequestError] = useState('');

  // Name Confirmation Modal State (Before taking a quiz)
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [promptQuizId, setPromptQuizId] = useState(null);
  const [promptTakerName, setPromptTakerName] = useState('');

  // Login State
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Quizzes and Scores State
  const [quizzesList, setQuizzesList] = useState([]);
  const [scoresList, setScoresList] = useState([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);

  // Document Import States (for Admin role directly in Quiz portal)
  const [isImporting, setIsImporting] = useState(false);
  const [importQuestions, setImportQuestions] = useState([]);
  const [importTitle, setImportTitle] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState('');
  const [publishError, setPublishError] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // Active Quiz taking state
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { question_id: 'A' }
  const [reviewStatus, setReviewStatus] = useState({}); // { question_id: true }
  const [quizTimeLeft, setQuizTimeLeft] = useState(0);
  const [quizTimerId, setQuizTimerId] = useState(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [gradedResult, setGradedResult] = useState(null);
  const [isReviewMode, setIsReviewMode] = useState(false);

  const handleImportFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (ext !== '.docx' && ext !== '.pdf') {
      alert("Please upload only .docx or .pdf documents.");
      return;
    }

    setIsImporting(true);
    setPublishError('');
    setPublishSuccess('');

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64Data = event.target.result;
          const response = await fetch(`${API_BASE}/api/quizzes/parse-document`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              fileName: file.name,
              base64Data
            })
          });

          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Failed to parse document.');

          if (data.questions && data.questions.length > 0) {
            const formatted = data.questions.map(q => ({
              question_text: q.question_text || '',
              option_a: q.option_a || '',
              option_b: q.option_b || '',
              option_c: q.option_c || '',
              option_d: q.option_d || '',
              option_e: q.option_e || '',
              correct_option: q.correct_option || 'A',
              reference_verse: q.reference_verse || ''
            }));
            setImportQuestions(formatted);
            const defaultTitle = file.name.replace(/\.[^/.]+$/, "");
            setImportTitle(defaultTitle);
            setShowPreviewModal(true);
          } else {
            throw new Error("No valid questions found in the document.");
          }
        } catch (err) {
          alert(err.message);
        } finally {
          setIsImporting(false);
          e.target.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert(err.message);
      setIsImporting(false);
      e.target.value = '';
    }
  };

  const handlePublishImportedQuiz = async () => {
    if (!importTitle.trim()) {
      setPublishError('Quiz title is required.');
      return;
    }

    setIsPublishing(true);
    setPublishError('');

    try {
      const response = await fetch(`${API_BASE}/api/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: importTitle,
          questions: importQuestions
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to publish quiz.');

      setPublishSuccess('Quiz published successfully!');
      setShowPreviewModal(false);
      fetchQuizzesAndScores();
      alert('Quiz published successfully! An announcement was dispatched to believers.');
    } catch (err) {
      setPublishError(err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  // Fetch Quizzes and Scores
  const fetchQuizzesAndScores = async () => {
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
      console.error('Error fetching quizzes/scores:', err);
    } finally {
      setQuizzesLoading(false);
    }
  };

  const handleRequestAccess = async (e) => {
    e.preventDefault();
    if (!requestName.trim() || !requestEmail.trim()) return;
    setRequestLoading(true);
    setRequestError('');
    setRequestSuccess('');
    try {
      const res = await fetch(`${API_BASE}/api/quizzes/request-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: requestName.trim(), email: requestEmail.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request access.');
      setRequestSuccess(data.message || 'Access credentials generated and sent to your email.');
      setRequestName('');
      setRequestEmail('');
    } catch (err) {
      setRequestError(err.message);
    } finally {
      setRequestLoading(false);
    }
  };

  const handleQuizLogin = async (e) => {
    e.preventDefault();
    if (!loginId || !loginPassword) return;
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginId, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed.');
      login(data.token, data.user);
      setLoginId('');
      setLoginPassword('');
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  // Take quiz name prompt states
  const [currentTakerName, setCurrentTakerName] = useState('');

  const handleStartQuizPrompt = (quizId) => {
    setPromptQuizId(quizId);
    setPromptTakerName(user?.name || '');
    setShowNamePrompt(true);
  };

  const handleConfirmStartQuiz = () => {
    setShowNamePrompt(false);
    handleTakeQuiz(promptQuizId, false, promptTakerName);
  };

  // Take quiz handler
  const handleTakeQuiz = async (quizId, reviewMode = false, takerName = '') => {
    if (!token) return;
    setQuizzesLoading(true);
    setCurrentTakerName(takerName);
    try {
      const res = await fetch(`${API_BASE}/api/quizzes/${quizId}?mode=${reviewMode ? 'review' : 'take'}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load test.');

      setActiveQuiz(data.quiz);
      setQuizQuestions(data.questions);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
      setReviewStatus({});
      setGradedResult(null);
      setQuizTimeLeft(data.quiz.duration_seconds);
      setIsReviewMode(reviewMode);
    } catch (err) {
      alert(err.message);
    } finally {
      setQuizzesLoading(false);
    }
  };

  // Active quiz timer effect
  useEffect(() => {
    if (activeQuiz && quizTimeLeft > 0 && !isReviewMode) {
      const interval = setInterval(() => {
        setQuizTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            handleSubmitQuiz(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setQuizTimerId(interval);
      return () => clearInterval(interval);
    }
  }, [activeQuiz, quizTimeLeft, isReviewMode]);

  // Submit quiz handler
  const handleSubmitQuiz = async (forced = false) => {
    if (!activeQuiz || !token) return;
    setIsSubmittingQuiz(true);
    try {
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
        body: JSON.stringify({ 
          answers: answersPayload,
          name: currentTakerName
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed.');

      setGradedResult(data);
      if (forced) {
        alert(language === 'ta' ? "நேரம் முடிந்துவிட்டது! உங்கள் விடைத்தாள் சமர்ப்பிக்கப்பட்டது." : "Time is up! Your answers have been submitted.");
      }
      
      // Refresh context profile name in case it changed
      try {
        const profileRes = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          login(token, profileData.user);
        }
      } catch (e) {
        console.error('Error updating user context name:', e);
      }

      fetchQuizzesAndScores();
    } catch (err) {
      alert(err.message);
      setActiveQuiz(null);
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

  // Formatting remaining time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    if (token) {
      fetchQuizzesAndScores();
    }
  }, [token]);

  // --- RENDERING ---

  // Logged-out credentials portal
  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-fadein">
        <div className="text-center mb-8">
          <span className="text-xs uppercase font-extrabold text-amber-500 tracking-widest block mb-2">
            {language === 'ta' ? 'அவிக்குரிய சபை தேர்வுகள்' : 'Spiritual Bible Quizzes'}
          </span>
          <h2 className={`font-serif font-bold text-3xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {language === 'ta' ? 'வேதாகம வினாடி வினா போர்டல்' : 'Bible Quiz & Knowledge Evaluation'}
          </h2>
          <p className={`text-sm max-w-xl mx-auto mt-2 ${isDark ? 'text-slate-400' : 'text-slate-650'}`}>
            {language === 'ta' 
              ? 'விளையாடுவதற்கு அணுகல் நற்சான்றிதழ்களைப் பெறவும் அல்லது உள்நுழைந்து உடனே தேர்வை எழுதவும்.' 
              : 'Request access credentials to your email, or sign in to take your Bible tests immediately.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Request Access Form */}
          <div className={`glass-panel p-6 border ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'} shadow-sm rounded-2xl`}>
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-5 flex items-center gap-2">
              <Mail className="w-5 h-5 text-amber-500" />
              <h3 className={`font-serif font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {language === 'ta' ? 'அணுகல் நற்சான்றிதழ்களைக் கோருங்கள்' : 'Request Access Credentials'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              {language === 'ta'
                ? 'வேதாகம வினாடி வினாவில் பங்கேற்க உங்கள் பெயர் மற்றும் மின்னஞ்சலை உள்ளிட்டு அணுகல் விவரங்களை மின்னஞ்சலில் பெறவும்.'
                : 'Enter your name and email to receive access credentials directly in your email inbox.'}
            </p>
            {requestSuccess ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs leading-relaxed mb-4">
                {requestSuccess}
              </div>
            ) : (
              <form onSubmit={handleRequestAccess} className="flex flex-col gap-4 text-left">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">
                    {language === 'ta' ? 'உங்கள் பெயர் *' : 'Your Name *'}
                  </label>
                  <input
                    type="text"
                    value={requestName}
                    onChange={(e) => setRequestName(e.target.value)}
                    placeholder={language === 'ta' ? 'பெயர்' : 'e.g. Maria'}
                    className="w-full bg-white text-slate-900 border border-slate-200 rounded p-2 text-xs focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">
                    {language === 'ta' ? 'மின்னஞ்சல் முகவரி *' : 'Email Address *'}
                  </label>
                  <input
                    type="email"
                    value={requestEmail}
                    onChange={(e) => setRequestEmail(e.target.value)}
                    placeholder="your.email@gmail.com"
                    className="w-full bg-white text-slate-950 border border-slate-200 rounded p-2 text-xs focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
                {requestError && (
                  <p className="text-red-500 text-xs mt-1">{requestError}</p>
                )}
                <button
                  type="submit"
                  disabled={requestLoading}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center gap-1 mt-2 cursor-pointer border-0"
                >
                  {requestLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                  {language === 'ta' ? 'நற்சான்றிதழ்களைக் கோருங்கள்' : 'Request Credentials'}
                </button>
              </form>
            )}
          </div>

          {/* Login Form */}
          <div className={`glass-panel p-6 border ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'} shadow-sm rounded-2xl`}>
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-5 flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-500" />
              <h3 className={`font-serif font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {language === 'ta' ? 'உள்நுழைய' : 'Login'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              {language === 'ta'
                ? 'ஏற்கனவே உள்ள உங்கள் பயனர் ஐடி/மின்னஞ்சல் மற்றும் கடவுச்சொல்லைப் பயன்படுத்தி உள்நுழையவும்.'
                : 'Already have a believer account? Log in with your email or Login ID.'}
            </p>
            <form onSubmit={handleQuizLogin} className="flex flex-col gap-4 text-left">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                  {language === 'ta' ? 'மின்னஞ்சல் அல்லது உள்நுழைவு ஐடி *' : 'Email or Login ID *'}
                </label>
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded p-2 text-xs focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                  {language === 'ta' ? 'கடவுச்சொல் *' : 'Password *'}
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded p-2 text-xs focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
              {loginError && (
                <p className="text-red-500 text-xs mt-1">{loginError}</p>
              )}
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center gap-1 mt-2 cursor-pointer border-0"
              >
                {loginLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                {language === 'ta' ? 'உள்நுழைக' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Scorecard view on submit complete
  if (gradedResult) {
    if (gradedResult.resultsReleased === false) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-12 animate-fadein text-center flex flex-col gap-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto text-3xl">
            ✓
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-1">
              {language === 'ta' ? 'தேர்வு சமர்ப்பிக்கப்பட்டது' : 'Test Submitted'}
            </span>
            <h2 className={`font-serif font-bold text-3xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {activeQuiz.title}
            </h2>
            <p className="text-sm text-slate-400 mt-3 max-w-md mx-auto leading-relaxed">
              {language === 'ta' 
                ? 'உங்கள் விடைத்தாள் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது. நிர்வாகி முடிவுகளை வெளியிட்ட பிறகு உங்கள் மதிப்பெண்களைக் காண முடியும்.' 
                : 'Your answers have been submitted successfully. You will be able to view your score and review correct answers once the administrator releases the results.'}
            </p>
          </div>

          <button
            onClick={() => {
              setActiveQuiz(null);
              setGradedResult(null);
              setIsReviewMode(false);
            }}
            className="mt-6 w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg cursor-pointer border-0"
          >
            Return to Dashboard
          </button>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-fadein text-center flex flex-col gap-6">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto text-3xl">
          🏆
        </div>
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block mb-1">
            {language === 'ta' ? 'தேர்வு முடிந்தது' : 'Test Completed'}
          </span>
          <h2 className={`font-serif font-bold text-3xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {activeQuiz.title}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'ta' ? 'உங்களுடைய மதிப்பெண் விபரங்கள் கீழே தரப்பட்டுள்ளன' : 'Here is your graded bible study scorecard'}
          </p>
        </div>

        <div className={`my-4 py-8 border-y flex justify-center items-center gap-8 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="text-center">
            <span className="text-slate-400 text-xs font-bold block uppercase tracking-wider">Correct Answers</span>
            <span className={`text-5xl font-black block mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {gradedResult.score} <span className="text-slate-500 text-3xl">/ {gradedResult.total}</span>
            </span>
          </div>
          <div className="w-px h-16 bg-slate-800"></div>
          <div className="text-center">
            <span className="text-slate-400 text-xs font-bold block uppercase tracking-wider">Accuracy Rating</span>
            <span className="text-5xl font-black text-amber-500 block mt-2">
              {gradedResult.percent}%
            </span>
          </div>
        </div>

        <div className="text-left max-h-96 overflow-y-auto pr-2 flex flex-col gap-4">
          <h4 className={`text-xs font-bold uppercase tracking-widest mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Question review checklist:
          </h4>
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
                  <span className="text-xs font-bold text-slate-400 block">
                    Question {index + 1}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    graded.is_correct ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {graded.is_correct ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                <p className={`text-sm font-medium mb-3 leading-relaxed ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {fullQuestionObj.question_text}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className={`p-2 rounded border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <span className="text-slate-500 font-bold block mb-0.5">Your Response</span>
                    <span className={`${graded.is_correct ? 'text-emerald-400' : 'text-red-400'} font-bold`}>
                      {graded.selected_option ? `${graded.selected_option}) ${fullQuestionObj[`option_${graded.selected_option.toLowerCase()}`]}` : 'Left Unanswered'}
                    </span>
                  </div>
                  <div className={`p-2 rounded border ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
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
            setIsReviewMode(false);
          }}
          className="mt-4 w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg cursor-pointer border-0"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Active quiz exam panel in session
  if (activeQuiz && quizQuestions.length > 0) {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    const selectedOption = userAnswers[currentQuestion.id] || '';
    const isMarkedForReview = reviewStatus[currentQuestion.id] || false;
    const timeString = formatTime(quizTimeLeft);

    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-fadein text-left">
        <div className="flex flex-col gap-6">
          <div className={`glass-panel p-6 border rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xl ${isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white'}`}>
            <div>
              <span className="text-amber-500 text-[10px] font-extrabold uppercase tracking-widest block mb-0.5">
                {isReviewMode ? 'Bible Study Test Review' : 'Spiritual Bible Test in Session'}
              </span>
              <h1 className={`font-serif font-bold text-2xl tracking-tight leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {activeQuiz.title}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {isReviewMode ? (
                <div className={`px-5 py-3 rounded-xl border flex items-center gap-2 ${
                  isDark ? 'border-emerald-500/20 bg-emerald-950/10 text-emerald-400' : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                }`}>
                  <BookOpen className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-extrabold uppercase tracking-wider">
                    Study Review Mode
                  </span>
                </div>
              ) : (
                <div className={`px-5 py-3 rounded-xl border flex items-center gap-2 ${
                  quizTimeLeft < 60 
                    ? 'border-red-500/50 bg-red-950/20 text-red-400 animate-pulse' 
                    : isDark ? 'border-slate-800 bg-slate-950 text-amber-500' : 'border-slate-200 bg-slate-100 text-amber-600'
                }`}>
                  <Clock className="w-5 h-5 shrink-0" />
                  <span className="text-xl font-black font-mono tracking-wider">
                    {timeString}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Question Viewport */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className={`glass-panel p-8 border rounded-xl shadow-xl min-h-[380px] flex flex-col justify-between ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white'}`}>
                <div>
                  <div className="flex justify-between items-center border-b border-slate-800/20 pb-3 mb-6">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Question {currentQuestionIndex + 1} of {quizQuestions.length}
                    </span>
                    {isMarkedForReview && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        Marked for Review
                      </span>
                    )}
                  </div>

                  <h3 className={`text-lg sm:text-xl font-medium mb-8 leading-relaxed ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {currentQuestion.question_text}
                  </h3>

                  <div className="flex flex-col gap-3">
                    {['A', 'B', 'C', 'D', 'E'].filter(opt => opt !== 'E' || !!currentQuestion.option_e).map(opt => {
                      const optText = currentQuestion[`option_${opt.toLowerCase()}`];
                      const isCorrect = currentQuestion.correct_option === opt;
                      
                      let btnClass = "";
                      if (isReviewMode) {
                        if (isCorrect) {
                          btnClass = "bg-emerald-500/10 border-emerald-500 text-emerald-500 font-bold cursor-default";
                        } else {
                          btnClass = isDark ? "bg-slate-950/20 border-slate-900 text-slate-500 cursor-default" : "bg-slate-50/50 border-slate-100 text-slate-400 cursor-default";
                        }
                      } else {
                        const isSelected = selectedOption === opt;
                        btnClass = isSelected 
                          ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-md font-bold cursor-pointer' 
                          : isDark ? 'bg-slate-950/30 border-slate-850 text-slate-350 hover:bg-slate-900/60 cursor-pointer' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer';
                      }
                      
                      return (
                        <button
                          key={opt}
                          type="button"
                          disabled={isReviewMode}
                          onClick={() => setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: opt }))}
                          className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-start gap-4 ${btnClass}`}
                        >
                          <span className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center font-bold text-xs ${
                            isReviewMode
                              ? isCorrect ? 'bg-emerald-50 text-slate-950' : 'bg-slate-200 text-slate-500 dark:bg-slate-850 dark:text-slate-600'
                              : selectedOption === opt ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-450'
                          }`}>
                            {opt}
                          </span>
                          <span className="flex-grow pt-0.5 leading-relaxed">{optText}</span>
                        </button>
                      );
                    })}
                  </div>

                  {isReviewMode && currentQuestion.reference_verse && (
                    <div className={`mt-4 p-3.5 rounded-lg border text-xs leading-relaxed flex items-center gap-2 ${
                      isDark ? 'bg-indigo-950/10 border-indigo-500/20 text-indigo-300' : 'bg-indigo-50 border-indigo-150 text-indigo-850'
                    }`}>
                      <span className="font-extrabold uppercase tracking-wider text-[10px]">Reference Verse:</span>
                      <strong>{currentQuestion.reference_verse}</strong>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center border-t border-slate-800/10 pt-6 mt-8">
                  <button
                    type="button"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850 rounded-lg text-xs font-bold transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    ← Previous
                  </button>

                  {isReviewMode ? (
                    <span className="text-xs font-semibold text-slate-400">
                      Reviewing Question {currentQuestionIndex + 1} of {quizQuestions.length}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleReview(currentQuestion.id)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                        isMarkedForReview 
                          ? 'bg-purple-600/20 border-purple-500 text-purple-400' 
                          : 'bg-transparent border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      ⭐ {isMarkedForReview ? 'Unmark Review' : 'Mark for Review'}
                    </button>
                  )}

                  {currentQuestionIndex < quizQuestions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold transition-all border-0 cursor-pointer"
                    >
                      Next Question →
                    </button>
                  ) : isReviewMode ? (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveQuiz(null);
                        setIsReviewMode(false);
                      }}
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-lg border-0 cursor-pointer"
                    >
                      Close Review
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSubmitQuiz(false)}
                      disabled={isSubmittingQuiz}
                      className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-lg border-0 cursor-pointer"
                    >
                      {isSubmittingQuiz ? 'Grading...' : 'Finish & Submit'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Circle Navigator */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className={`glass-panel p-6 border rounded-xl shadow-xl flex flex-col justify-between h-full ${isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white'}`}>
                <div>
                  <h4 className={`font-serif font-bold text-md mb-2 pb-2 border-b ${isDark ? 'border-slate-800 text-white' : 'border-slate-200 text-slate-900'}`}>
                    Bible Test Navigator
                  </h4>
                  <p className="text-[11px] text-slate-400 mb-6 leading-relaxed">
                    Click any question number circle to navigate instantly:
                  </p>

                  <div className="grid grid-cols-5 gap-3 mb-8 justify-items-center">
                    {quizQuestions.map((q, idx) => {
                      const isAns = !!userAnswers[q.id];
                      const isRev = !!reviewStatus[q.id];
                      const isCurrent = currentQuestionIndex === idx;

                      let circleClass = isDark ? "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-350";
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
                          className={`w-10 h-10 rounded-full font-mono text-xs font-bold border transition-all flex items-center justify-center cursor-pointer ${circleClass} ${
                            isCurrent ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-slate-950' : ''
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-col gap-2.5 border-t border-slate-800/10 pt-5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status Legend:</span>
                    <div className="flex items-center gap-3 text-xs text-slate-300">
                      <span className={`w-3.5 h-3.5 rounded-full border block ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}></span>
                      <span className={isDark ? 'text-slate-300' : 'text-slate-650'}>Unanswered</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-300">
                      <span className="w-3.5 h-3.5 rounded-full border border-emerald-500 bg-emerald-600 block"></span>
                      <span className={isDark ? 'text-slate-300' : 'text-slate-650'}>Answered</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-300">
                      <span className="w-3.5 h-3.5 rounded-full border border-purple-500 bg-purple-600 block"></span>
                      <span className={isDark ? 'text-slate-300' : 'text-slate-650'}>Marked for Review</span>
                    </div>
                  </div>
                </div>

                {isReviewMode ? (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveQuiz(null);
                      setIsReviewMode(false);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 text-slate-350 hover:bg-slate-700 hover:text-white transition-all py-3 rounded-xl font-bold text-xs mt-8 shadow-lg flex items-center justify-center gap-1 cursor-pointer"
                  >
                    Exit Review
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to end your test and submit your answers?")) {
                        handleSubmitQuiz(false);
                      }
                    }}
                    disabled={isSubmittingQuiz}
                    className="w-full bg-red-950/20 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-white transition-all py-3 rounded-xl font-bold text-xs mt-8 shadow-lg flex items-center justify-center gap-1 cursor-pointer"
                  >
                    🚩 Force Close & Submit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Believer Dashboard View
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fadein text-left">
      <div className="flex flex-col gap-8">
        {/* Welcome Banner */}
        <div className={`glass-panel p-6 border rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white'}`}>
          <div>
            <span className="text-amber-500 text-xs font-bold uppercase tracking-widest block mb-1">
              Bible Quiz Dashboard
            </span>
            <h1 className={`font-serif font-bold text-3xl tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Praise The Lord, {user.name}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'ta' ? 'உங்களுடைய வேத அறிவை வளர்த்துக்கொள்ள வினாடி வினாக்களில் பங்கேற்கவும்.' : 'Assess your biblical knowledge and view score records below.'}
            </p>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap w-full md:w-auto justify-end">
            {(user && (user.role === 'admin' || user.role === 'data_admin')) && (
              <>
                <input
                  type="file"
                  accept=".docx,.pdf"
                  onChange={handleImportFileChange}
                  className="hidden"
                  id="quiz-doc-import"
                  disabled={isImporting}
                />
                <label
                  htmlFor="quiz-doc-import"
                  className={`px-5 py-2.5 rounded-lg border text-xs uppercase tracking-wider font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                    isImporting
                      ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                      : isDark
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:text-white'
                      : 'border-amber-500/30 bg-amber-50 text-amber-700 hover:bg-amber-100'
                  }`}
                >
                  {isImporting ? 'Parsing...' : '📄 Import Quiz Document'}
                </label>
              </>
            )}

            <button 
              onClick={() => logout()}
              className="px-5 py-2.5 rounded-lg border border-red-500/30 bg-red-950/20 text-red-450 text-xs uppercase tracking-wider font-extrabold hover:bg-red-500/20 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              {language === 'ta' ? 'வெளியேறு' : 'Sign Out'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Scores History Ledger */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className={`glass-panel p-6 rounded-xl border shadow-xl ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-[#FAF7F0] border-[#D2C2A4]'}`}>
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 text-xl">
                🏆
              </div>
              <h3 className={`font-serif font-bold text-lg mb-1 ${isDark ? 'text-white' : 'text-[#0A1128]'}`}>
                {language === 'ta' ? 'மதிப்பெண் வரலாறு' : 'Your Bible Test Ledger'}
              </h3>
              <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                {language === 'ta' ? 'கடந்த கால தேர்வு மதிப்பெண்களை கண்காணிக்கும் பட்டியல்.' : 'Monitor your scores and track your study progression history.'}
              </p>

              <div className="flex flex-col gap-3">
                {scoresList.length === 0 ? (
                  <div className={`p-4 border rounded-lg text-center text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-slate-500' : 'bg-white border-[#D2C2A4]/60 text-slate-500'}`}>
                    No scores recorded yet. Complete a test to view milestones.
                  </div>
                ) : (
                  scoresList.map(score => (
                    <div key={score.id} className={`p-3.5 border rounded-lg flex justify-between items-center gap-2 text-xs ${isDark ? 'bg-slate-950/60 border-slate-850 text-slate-350' : 'bg-white border-[#D2C2A4]/60 text-slate-700'}`}>
                      <div>
                        <span className={`font-bold block truncate max-w-[140px] ${isDark ? 'text-white' : 'text-[#0A1128]'}`}>{score.quiz_title}</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          {new Date(score.completed_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-right">
                        {score.score !== null ? (
                          <>
                            <span className="text-sm font-black text-amber-500 block">
                              {score.score} / {score.total}
                            </span>
                            <span className="text-[9px] font-extrabold uppercase text-slate-400">
                              {((score.score / score.total) * 100).toFixed(0)}% score
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-sm font-bold text-amber-500 block">
                              {language === 'ta' ? 'முடிவுகள் நிலுவையில்' : 'Pending Release'}
                            </span>
                            <span className="text-[9px] font-extrabold uppercase text-slate-400">
                              {language === 'ta' ? 'நிர்வாகி ஒப்புதல்' : 'Awaiting Release'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quizzes Listings */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className={`glass-panel p-6 rounded-xl border shadow-xl min-h-[400px] ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h3 className={`font-serif font-bold text-xl mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {language === 'ta' ? 'அகில உலக வினாடி வினாக்கள்' : 'Available Bible Quizzes & Tests'}
              </h3>
              <p className={`text-xs mb-6 ${isDark ? 'text-slate-400' : 'text-slate-650'}`}>
                Assess your biblical insights and scripture knowledge. Timer starts instantly upon launching a test.
              </p>

              {quizzesLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                  <span className="text-xs text-slate-400">Syncing available quizzes...</span>
                </div>
              ) : quizzesList.length === 0 ? (
                <div className={`text-center py-20 border border-dashed rounded-xl ${isDark ? 'border-slate-800 bg-slate-950/20' : 'border-slate-200 bg-slate-50'}`}>
                  <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <p className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>No tests published currently</p>
                  <p className="text-xs text-slate-500 mt-1">Our Admin will publish new tests shortly.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {quizzesList.map(quiz => (
                    <div key={quiz.id} className={`p-5 border rounded-xl flex flex-col justify-between gap-4 ${isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            {quiz.question_count} MCQs
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {Math.round(quiz.duration_seconds / 60)} min limit
                          </span>
                        </div>
                        <h4 className={`font-serif font-bold text-md mt-3 leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {quiz.title}
                        </h4>
                        {quiz.reference_verse && quiz.results_released === 1 && (
                          <span className="block text-[10px] text-slate-500 mt-1.5">
                            📚 {language === 'ta' ? 'வேத வசனம்' : 'Reference Verse'}: <strong>{quiz.reference_verse}</strong>
                          </span>
                        )}
                      </div>

                      <div className={`pt-2 border-t flex items-center justify-between ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
                        {quiz.taken ? (
                          <div className="flex flex-col gap-2 w-full">
                            <div className="flex items-center justify-between w-full">
                              {quiz.results_released === 1 ? (
                                <span className="text-[11px] text-emerald-500 font-bold flex items-center gap-1">
                                  ✅ Grade: {quiz.score} / {quiz.total}
                                </span>
                              ) : (
                                <span className="text-[11px] text-amber-500 font-bold flex items-center gap-1">
                                  ⌛ {language === 'ta' ? 'முடிவுகள் நிலுவையில்' : 'Completed (Pending)'}
                                </span>
                              )}
                              <div className="flex gap-2">
                                {quiz.results_released === 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleTakeQuiz(quiz.id, true)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition-all cursor-pointer border-0 ${isDark ? 'bg-slate-850 text-slate-300 hover:bg-slate-800' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'}`}
                                  >
                                    Review
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleStartQuizPrompt(quiz.id)}
                                  className="px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all cursor-pointer border-0"
                                >
                                  Retake
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <span className="text-[10px] text-slate-500 font-bold uppercase">
                              Not Started
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStartQuizPrompt(quiz.id)}
                              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer border-0"
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
      </div>
      
      {showNamePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fadein">
          <div className={`glass-panel p-6 border w-full max-w-md shadow-2xl rounded-2xl text-left ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <h3 className={`font-serif font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {language === 'ta' ? 'தேர்வு எழுத உங்கள் பெயரை உறுதிப்படுத்தவும்' : 'Confirm Your Name'}
            </h3>
            <p className="text-xs text-slate-450 mb-4 leading-relaxed">
              {language === 'ta'
                ? 'இந்த தேர்வு முடிவில் உங்கள் பெயர் இந்த பெயரிலேயே சேமிக்கப்படும். தேவைப்பட்டால் மாற்றிக்கொள்ளலாம்.'
                : 'Please confirm the name under which your quiz results should be recorded. You can edit it if needed.'}
            </p>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                  {language === 'ta' ? 'தேர்வெழுதுபவர் பெயர் *' : 'Taker Name *'}
                </label>
                <input
                  type="text"
                  value={promptTakerName}
                  onChange={(e) => setPromptTakerName(e.target.value)}
                  placeholder="e.g. Maria"
                  className="w-full bg-white text-slate-900 border border-slate-200 rounded p-2 text-xs focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowNamePrompt(false)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    isDark ? 'border-slate-800 bg-transparent text-slate-450 hover:text-white' : 'border-slate-200 bg-transparent text-slate-550 hover:text-slate-850'
                  }`}
                >
                  {language === 'ta' ? 'ரத்துசெய்' : 'Cancel'}
                </button>
                <button
                  type="button"
                  disabled={!promptTakerName.trim()}
                  onClick={handleConfirmStartQuiz}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all cursor-pointer border-0 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {language === 'ta' ? 'தேர்வை தொடங்கு' : 'Confirm & Start'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal for parsed quiz document */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`glass-panel p-6 border w-full max-w-2xl shadow-2xl rounded-2xl text-left flex flex-col max-h-[90vh] ${
            isDark ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-900'
          }`}>
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 shrink-0">
              <h3 className="font-serif font-bold text-xl text-amber-500">
                📄 Preview Imported Quiz Questions
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Please review the parsed questions and configure the title before publishing.
              </p>
            </div>

            {/* Quiz Title field */}
            <div className="mb-4 shrink-0">
              <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                Quiz Title *
              </label>
              <input
                type="text"
                value={importTitle}
                onChange={(e) => setImportTitle(e.target.value)}
                placeholder="Enter quiz title..."
                className={`w-full p-2.5 rounded-lg text-sm focus:outline-none transition-colors border ${
                  isDark 
                    ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-500' 
                    : 'bg-white border-slate-200 text-slate-900 focus:border-amber-600'
                }`}
                required
              />
            </div>

            {/* Questions scroll view */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 mb-4">
              <span className="text-[10px] font-bold text-slate-450 block uppercase tracking-wider">
                Questions List ({importQuestions.length} parsed)
              </span>

              {importQuestions.map((q, idx) => (
                <div key={idx} className={`p-4 border rounded-xl flex flex-col gap-2.5 text-xs ${
                  isDark ? 'bg-slate-950/60 border-slate-850' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-1.5 font-bold">
                    <span className="text-amber-500">Question {idx + 1}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-450 text-[10px]">
                      Correct: Option {q.correct_option}
                    </span>
                  </div>

                  <p className="font-bold leading-relaxed">{q.question_text}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-medium text-slate-400 mt-1">
                    {q.option_a && <div className={q.correct_option === 'A' ? 'text-emerald-400 font-bold' : ''}>A: {q.option_a}</div>}
                    {q.option_b && <div className={q.correct_option === 'B' ? 'text-emerald-400 font-bold' : ''}>B: {q.option_b}</div>}
                    {q.option_c && <div className={q.correct_option === 'C' ? 'text-emerald-400 font-bold' : ''}>C: {q.option_c}</div>}
                    {q.option_d && <div className={q.correct_option === 'D' ? 'text-emerald-400 font-bold' : ''}>D: {q.option_d}</div>}
                    {q.option_e && <div className={q.correct_option === 'E' ? 'text-emerald-400 font-bold' : ''}>E: {q.option_e}</div>}
                  </div>

                  {q.reference_verse && (
                    <div className="text-[10px] text-amber-500 mt-1 font-semibold italic">
                      📖 Reference: {q.reference_verse}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {publishError && (
              <span className="text-xs font-bold text-red-500 block mb-3">{publishError}</span>
            )}

            {/* Modal actions */}
            <div className="flex justify-end gap-3 shrink-0 border-t border-slate-100 dark:border-slate-850 pt-3">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  isDark ? 'border-slate-800 bg-transparent text-slate-450 hover:text-white' : 'border-slate-200 bg-transparent text-slate-550 hover:text-slate-850'
                }`}
                disabled={isPublishing}
              >
                {language === 'ta' ? 'ரத்துசெய்' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isPublishing || !importTitle.trim()}
                onClick={handlePublishImportedQuiz}
                className="px-5 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-all cursor-pointer border-0 shadow-md flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed font-extrabold"
              >
                {isPublishing ? 'Publishing...' : '🚀 Publish Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;
