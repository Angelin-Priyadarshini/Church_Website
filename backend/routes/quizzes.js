const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const path = require('path');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// SMTP Transporter setup matching auth.js
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || 'agsharjahtamil@gmail.com',
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Helper function to send email notification to a believer about a new test
async function sendNewTestEmail(email, name, testTitle, questionCount, durationMinutes) {
  if (!process.env.EMAIL_PASS) {
    console.log(`\n==================================================`);
    console.log(`[NEW TEST EMAIL FALLBACK]`);
    console.log(`To: ${email}`);
    console.log(`Subject: New Test uploaded! - ${testTitle}`);
    console.log(`Body: Hello ${name}, a new test "${testTitle}" has been uploaded by the Data Admin. It has ${questionCount} questions and a timer of ${durationMinutes} minutes.`);
    console.log(`==================================================\n`);
    return true;
  }

  const emailUser = process.env.EMAIL_USER || 'agsharjahtamil@gmail.com';
  const mailOptions = {
    from: `"AG Sharjah Tamil Church" <${emailUser}>`,
    to: email,
    subject: `New Test Uploaded: ${testTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #6366f1; text-align: center;">Assemblies of God Sharjah Tamil Church</h2>
        <h3 style="color: #4b5563; text-align: center;">New Spiritual Growth Quiz Available!</h3>
        <hr style="border: 0; border-top: 1px solid #eeeeee;" />
        <p>Dear ${name},</p>
        <p>A new test has been uploaded by our Data Admin to help you evaluate your bible knowledge and grow spiritually.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h4 style="margin: 0 0 10px 0; color: #111827;">${testTitle}</h4>
          <p style="margin: 0 0 5px 0; font-size: 14px; color: #4b5563;"><strong>Questions:</strong> ${questionCount}</p>
          <p style="margin: 0; font-size: 14px; color: #4b5563;"><strong>Time Limit:</strong> ${durationMinutes} minutes (${questionCount * 30} seconds)</p>
        </div>

        <p>Log in to your believer dashboard to take the test and view your results instantly!</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="https://agsharjah.org/new/admin" style="background-color: #f59e0b; color: #111827; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Take the Quiz Now</a>
        </div>

        <hr style="border: 0; border-top: 1px solid #eeeeee; margin-top: 30px;" />
        <p style="text-align: center; font-size: 12px; color: #9ca3af;">
          Assemblies of God Sharjah Tamil Church, Sharjah, UAE<br/>
          Email: agsharjahtamil@gmail.com | Website: agsharjah.org
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error(`Failed to send new test email to ${email}:`, err.message);
  }
}

// POST /api/quizzes - Create Quiz and Questions (Admin only)
router.post('/', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }

  const { title, questions, reference_verse, seconds_per_question } = req.body;

  if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'Quiz title and an array of questions are required.' });
  }

  // Calculate timer: custom seconds per question (defaults to 30)
  const secPerQ = parseInt(seconds_per_question) || 30;
  const duration_seconds = questions.length * secPerQ;

  try {
    // 1. Create the quiz entry
    const quizResult = await db.runAsync(
      `INSERT INTO quizzes (title, reference_verse, duration_seconds, created_by) VALUES (?, ?, ?, ?)`,
      [title, reference_verse || null, duration_seconds, req.user.id]
    );
    const quizId = quizResult.lastID;

    // 2. Create question entries
    for (const q of questions) {
      if (!q.question_text || !q.option_a || !q.option_b || !q.option_c || !q.option_d || !q.correct_option) {
        return res.status(400).json({ error: 'All questions must have text, options A-D, and correct_option.' });
      }
      await db.runAsync(
        `INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, option_e, correct_option, reference_verse) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [quizId, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.option_e || null, q.correct_option.toUpperCase(), q.reference_verse || null]
      );
    }

    // 3. Notify all registered verified believers asynchronously via email
    const believers = await db.allAsync(`SELECT name, email FROM users WHERE role = 'user' AND is_verified = 1`);
    const durationMinutes = (duration_seconds / 60).toFixed(1);

    // Run emails in the background so it doesn't block the API response
    setTimeout(async () => {
      console.log(`[Email Campaign]: Sending email notifications for new quiz: "${title}" to ${believers.length} believers.`);
      for (const believer of believers) {
        await sendNewTestEmail(believer.email, believer.name, title, questions.length, durationMinutes);
      }
      console.log(`[Email Campaign]: All new quiz notifications dispatched.`);
    }, 100);

    res.status(201).json({
      message: 'Quiz uploaded successfully and believers notified!',
      quizId,
      title,
      duration_seconds,
      questionCount: questions.length
    });
  } catch (err) {
    console.error('Error creating quiz:', err);
    res.status(500).json({ error: 'Server error creating quiz.' });
  }
});

// GET /api/quizzes - List all quizzes with total questions and check if taken
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Get all quizzes
    const quizzes = await db.allAsync(`
      SELECT q.*, COUNT(qs.id) as question_count 
      FROM quizzes q
      LEFT JOIN questions qs ON q.id = qs.quiz_id
      GROUP BY q.id
      ORDER BY q.id DESC
    `);

    // Fetch user's scores to see if they've taken each quiz
    const userScores = await db.allAsync(
      `SELECT quiz_id, score, total, completed_at FROM quiz_scores WHERE user_id = ?`,
      [req.user.id]
    );

    // Map taken info
    const scoreMap = {};
    userScores.forEach(s => {
      scoreMap[s.quiz_id] = { score: s.score, total: s.total, completed_at: s.completed_at };
    });

    const isAdmin = req.user.role === 'admin';
    const result = quizzes.map(q => {
      const attempt = scoreMap[q.id];
      const released = q.results_released === 1;
      return {
        ...q,
        reference_verse: (released || isAdmin) ? q.reference_verse : null,
        taken: !!attempt,
        score: (attempt && released) ? attempt.score : null,
        total: (attempt && released) ? attempt.total : null,
        completed_at: attempt ? attempt.completed_at : null
      };
    });

    res.json(result);
  } catch (err) {
    console.error('Error listing quizzes:', err);
    res.status(500).json({ error: 'Server error listing quizzes.' });
  }
});

// GET /api/quizzes/my-scores - Get all score records for the user
router.get('/my-scores', authenticateToken, async (req, res) => {
  try {
    const scores = await db.allAsync(`
      SELECT s.id, s.user_id, s.quiz_id, s.completed_at, q.title as quiz_title, q.results_released,
             CASE WHEN q.results_released = 1 THEN s.score ELSE NULL END as score,
             CASE WHEN q.results_released = 1 THEN s.total ELSE NULL END as total
      FROM quiz_scores s
      JOIN quizzes q ON s.quiz_id = q.id
      WHERE s.user_id = ?
      ORDER BY s.id DESC
    `, [req.user.id]);

    res.json(scores);
  } catch (err) {
    console.error('Error fetching scores:', err);
    res.status(500).json({ error: 'Server error fetching score history.' });
  }
});

// GET /api/quizzes/:id - Get specific quiz + questions (correct options HIDDEN for security)
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const quiz = await db.getAsync(`SELECT * FROM quizzes WHERE id = ?`, [id]);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    // Check if user already took this test to prevent double taking unless required
    const alreadyTaken = await db.getAsync(`SELECT id FROM quiz_scores WHERE user_id = ? AND quiz_id = ?`, [req.user.id, id]);

    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && quiz.results_released !== 1) {
      quiz.reference_verse = null;
    }

    // Only show answers if admin OR if reviewing after completing a test with released results
    const isReview = req.query.mode === 'review';
    const showAnswers = isAdmin || (isReview && alreadyTaken && quiz.results_released === 1);

    // Fetch questions but DO NOT select correct_option or reference_verse unless answers are allowed to be shown
    let questions;
    if (showAnswers) {
      // If admin, or taken and results released, they can view correct answers and question-level reference verses
      questions = await db.allAsync(
        `SELECT id, question_text, option_a, option_b, option_c, option_d, option_e, correct_option, reference_verse FROM questions WHERE quiz_id = ? ORDER BY id ASC`,
        [id]
      );
    } else {
      // If not taken yet, or results are not released, hide correct option and reference verse
      questions = await db.allAsync(
        `SELECT id, question_text, option_a, option_b, option_c, option_d, option_e FROM questions WHERE quiz_id = ? ORDER BY id ASC`,
        [id]
      );
    }

    res.json({
      quiz,
      alreadyTaken: !!alreadyTaken,
      questions
    });
  } catch (err) {
    console.error('Error getting quiz:', err);
    res.status(500).json({ error: 'Server error fetching quiz details.' });
  }
});

// POST /api/quizzes/:id/submit - Grade and record quiz submission
router.post('/:id/submit', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { answers, name } = req.body; // Expecting object array: [{ question_id: 1, selected_option: 'A' }], name: 'confirmed_name'

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Selected answers array is required.' });
  }

  try {
    const quiz = await db.getAsync(`SELECT id, results_released FROM quizzes WHERE id = ?`, [id]);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    // Update user name in DB if name is provided/changed
    if (name && name.trim()) {
      await db.runAsync(`UPDATE users SET name = ? WHERE id = ?`, [name.trim(), req.user.id]);
    }

    // Delete any existing scores for this user and quiz to allow retaking and updating score
    await db.runAsync(`DELETE FROM quiz_scores WHERE user_id = ? AND quiz_id = ?`, [req.user.id, id]);

    // Fetch correct options
    const questions = await db.allAsync(
      `SELECT id, correct_option FROM questions WHERE quiz_id = ? ORDER BY id ASC`,
      [id]
    );

    const questionCount = questions.length;
    let score = 0;

    // Create mapping of correct options
    const correctMap = {};
    questions.forEach(q => {
      correctMap[q.id] = q.correct_option.trim().toUpperCase();
    });

    const gradedAnswers = answers.map(ans => {
      const correctOpt = correctMap[ans.question_id];
      const selectedOpt = (ans.selected_option || '').trim().toUpperCase();
      const isCorrect = correctOpt === selectedOpt;

      if (isCorrect) score++;

      return {
        question_id: ans.question_id,
        selected_option: selectedOpt,
        correct_option: correctOpt,
        is_correct: isCorrect
      };
    });

    // Handle questions that were left unanswered in the submission
    questions.forEach(q => {
      const wasAnswered = answers.some(ans => ans.question_id === q.id);
      if (!wasAnswered) {
        gradedAnswers.push({
          question_id: q.id,
          selected_option: '',
          correct_option: correctMap[q.id],
          is_correct: false
        });
      }
    });

    const resultsReleased = quiz ? quiz.results_released === 1 : false;

    // Save score to database
    await db.runAsync(
      `INSERT INTO quiz_scores (user_id, quiz_id, score, total) VALUES (?, ?, ?, ?)`,
      [req.user.id, id, score, questionCount]
    );

    if (resultsReleased) {
      res.json({
        message: 'Test graded successfully!',
        score,
        total: questionCount,
        percent: parseFloat(((score / questionCount) * 100).toFixed(1)),
        gradedAnswers,
        resultsReleased: true
      });
    } else {
      res.json({
        message: 'Test submitted and graded successfully! Results will be released later by the admin.',
        resultsReleased: false
      });
    }
  } catch (err) {
    console.error('Error submitting quiz answers:', err);
    res.status(500).json({ error: 'Server error grading test.' });
  }
});

function generateRandomLoginId() {
  return 'AGS' + Math.floor(1000 + Math.random() * 9000);
}

function generateRandomPassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pass = '';
  for (let i = 0; i < 8; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

// POST /api/quizzes/request-access - Guest access request
router.post('/request-access', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  try {
    const existingUser = await db.getAsync(`SELECT * FROM users WHERE email = ?`, [email]);
    let login_id;
    let password = generateRandomPassword();
    const passwordHash = bcrypt.hashSync(password, 10);

    if (existingUser) {
      if (existingUser.role !== 'user') {
        return res.status(403).json({ error: 'This email is associated with an administrative account. Please log in using the main portal.' });
      }
      login_id = existingUser.login_id || generateRandomLoginId();
      await db.runAsync(
        `UPDATE users SET name = ?, login_id = ?, password_hash = ?, is_verified = 1 WHERE id = ?`,
        [name, login_id, passwordHash, existingUser.id]
      );
    } else {
      let unique = false;
      while (!unique) {
        login_id = generateRandomLoginId();
        const check = await db.getAsync(`SELECT id FROM users WHERE login_id = ?`, [login_id]);
        if (!check) unique = true;
      }
      await db.runAsync(
        `INSERT INTO users (name, email, login_id, password_hash, role, is_verified) VALUES (?, ?, ?, ?, 'user', 1)`,
        [name, email, login_id, passwordHash]
      );
    }

    if (!process.env.EMAIL_PASS) {
      console.log(`\n==================================================`);
      console.log(`[QUIZ ACCESS EMAIL FALLBACK]`);
      console.log(`To: ${email}`);
      console.log(`Name: ${name}`);
      console.log(`Login ID: ${login_id}`);
      console.log(`Password: ${password}`);
      console.log(`Please set EMAIL_PASS in your environment for live emails.`);
      console.log(`==================================================\n`);
    } else {
      const emailUser = process.env.EMAIL_USER || 'agsharjahtamil@gmail.com';
      const mailOptions = {
        from: `"AG Sharjah Tamil Church" <${emailUser}>`,
        to: email,
        subject: 'Your Bible Quiz Access Credentials',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #6366f1; text-align: center;">Assemblies of God Sharjah Tamil Church</h2>
            <h3 style="color: #4b5563; text-align: center;">Your Bible Quiz Credentials</h3>
            <hr style="border: 0; border-top: 1px solid #eeeeee;" />
            <p>Dear ${name},</p>
            <p>Thank you for registering to take our bible quizzes. Here are your credentials to log in and take your quizzes:</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0 0 10px 0; font-size: 16px; color: #111827;"><strong>Login ID (Username):</strong> ${login_id}</p>
              <p style="margin: 0; font-size: 16px; color: #111827;"><strong>Password:</strong> ${password}</p>
            </div>

            <p>Please navigate to the Resources page and select the Bible Quiz tab to log in and begin.</p>

            <hr style="border: 0; border-top: 1px solid #eeeeee; margin-top: 30px;" />
            <p style="text-align: center; font-size: 12px; color: #9ca3af;">
              Assemblies of God Sharjah Tamil Church, Sharjah, UAE
            </p>
          </div>
        `
      };
      await transporter.sendMail(mailOptions);
    }

    res.json({
      message: 'Access credentials generated and sent to your email.',
      login_id
    });
  } catch (err) {
    console.error('Error requesting quiz access:', err);
    res.status(500).json({ error: 'Server error generating credentials.' });
  }
});

// POST /api/quizzes/fast-access - Disabled for security (guests must request email credentials)
router.post('/fast-access', (req, res) => {
  res.status(403).json({ error: 'Fast access is disabled. Please request access credentials via email.' });
});

// POST /api/quizzes/:id/release-results - Admin release quiz results
router.post('/:id/release-results', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }

  const { id } = req.params;

  try {
    const quiz = await db.getAsync(`SELECT * FROM quizzes WHERE id = ?`, [id]);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    await db.runAsync(`UPDATE quizzes SET results_released = 1 WHERE id = ?`, [id]);

    const questions = await db.allAsync(
      `SELECT id, question_text, option_a, option_b, option_c, option_d, option_e, correct_option, reference_verse FROM questions WHERE quiz_id = ? ORDER BY id ASC`,
      [id]
    );

    const participants = await db.allAsync(
      `SELECT u.name, u.email, s.score, s.total FROM quiz_scores s JOIN users u ON s.user_id = u.id WHERE s.quiz_id = ?`,
      [id]
    );

    console.log(`[Release Results]: Releasing results for "${quiz.title}" to ${participants.length} participants.`);

    for (const p of participants) {
      if (!process.env.EMAIL_PASS) {
        console.log(`\n==================================================`);
        console.log(`[QUIZ RESULTS EMAIL FALLBACK]`);
        console.log(`To: ${p.email}`);
        console.log(`Subject: Results Released: ${quiz.title}`);
        console.log(`Body: Hello ${p.name}, the results for ${quiz.title} have been released. Your score: ${p.score}/${p.total}. Reference Verse: ${quiz.reference_verse || 'N/A'}`);
        console.log(`==================================================\n`);
      } else {
        const qListHtml = questions.map((q, idx) => `
          <div style="margin-bottom: 15px; padding: 10px; border-bottom: 1px dashed #e2e8f0;">
            <p style="font-weight: bold; margin: 0 0 5px 0;">Q${idx + 1}. ${q.question_text}</p>
            <ul style="margin: 0; padding-left: 20px; list-style-type: none;">
              <li style="${q.correct_option === 'A' ? 'color: #059669; font-weight: bold;' : ''}">A) ${q.option_a}</li>
              <li style="${q.correct_option === 'B' ? 'color: #059669; font-weight: bold;' : ''}">B) ${q.option_b}</li>
              <li style="${q.correct_option === 'C' ? 'color: #059669; font-weight: bold;' : ''}">C) ${q.option_c}</li>
              <li style="${q.correct_option === 'D' ? 'color: #059669; font-weight: bold;' : ''}">D) ${q.option_d}</li>
              ${q.option_e ? `<li style="${q.correct_option === 'E' ? 'color: #059669; font-weight: bold;' : ''}">E) ${q.option_e}</li>` : ''}
            </ul>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #059669;"><strong>Correct Answer: ${q.correct_option}</strong></p>
            ${q.reference_verse ? `<p style="margin: 3px 0 0 0; font-size: 12px; color: #4b5563;"><strong>Reference Verse:</strong> ${q.reference_verse}</p>` : ''}
          </div>
        `).join('');

        const emailUser = process.env.EMAIL_USER || 'agsharjahtamil@gmail.com';
        const mailOptions = {
          from: `"AG Sharjah Tamil Church" <${emailUser}>`,
          to: p.email,
          subject: `Quiz Results Released: ${quiz.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
              <h2 style="color: #6366f1; text-align: center;">Assemblies of God Sharjah Tamil Church</h2>
              <h3 style="color: #4b5563; text-align: center;">Quiz Results & Answer Key</h3>
              <hr style="border: 0; border-top: 1px solid #eeeeee;" />
              <p>Dear ${p.name},</p>
              <p>The results for the quiz <strong>"${quiz.title}"</strong> have been officially released by the Admin.</p>
              
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #10b981;">
                <p style="margin: 0 0 5px 0; font-size: 15px;"><strong>Your Score:</strong> ${p.score} / ${p.total} (${((p.score / p.total) * 100).toFixed(1)}%)</p>
                <p style="margin: 0; font-size: 15px;"><strong>Reference Verse:</strong> ${quiz.reference_verse || 'None'}</p>
              </div>

              <h4 style="color: #4b5563; margin-top: 25px;">Official Answer Key:</h4>
              <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb;">
                ${qListHtml}
              </div>

              <hr style="border: 0; border-top: 1px solid #eeeeee; margin-top: 30px;" />
              <p style="text-align: center; font-size: 12px; color: #9ca3af;">
                Assemblies of God Sharjah Tamil Church, Sharjah, UAE
              </p>
            </div>
          `
        };
        await transporter.sendMail(mailOptions);
      }
    }

    res.json({ message: 'Quiz results released and emails dispatched successfully!' });
  } catch (err) {
    console.error('Error releasing quiz results:', err);
    res.status(500).json({ error: 'Server error releasing results.' });
  }
});

// Helper to parse Quiz questions from raw text
const parseQuizText = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const questions = [];
  let currentQuestion = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if it's an option (A, B, C, D, or E)
    const optMatch = line.match(/^\s*([A-E])[\.\)\s]+(.*)/i);
    if (optMatch) {
      if (currentQuestion) {
        const optLetter = optMatch[1].toUpperCase();
        const optText = optMatch[2].trim();
        currentQuestion[`option_${optLetter.toLowerCase()}`] = optText;
      }
      continue;
    }

    // Check if it's the correct answer
    const ansMatch = line.match(/^(?:correct\s*answer|correct\s*option|correct|answer)\s*[:\-=\s]*([A-E])/i);
    if (ansMatch) {
      if (currentQuestion) {
        currentQuestion.correct_option = ansMatch[1].toUpperCase();
      }
      continue;
    }

    // Check if it's a reference verse
    const refMatch = line.match(/^(?:reference\s*verse|reference|verse)\s*[:\-=\s]*(.*)/i);
    if (refMatch) {
      if (currentQuestion) {
        currentQuestion.reference_verse = refMatch[1].trim();
      }
      continue;
    }

    // Check if it's a new question (e.g. "1. Question text", "Question 1", etc.)
    const qMatch = line.match(/^(?:q(?:uestion)?\.?\s*)?(\d+)[\.:\s]+(.*)/i);
    if (qMatch) {
      if (currentQuestion) {
        questions.push(currentQuestion);
      }
      currentQuestion = {
        question_text: qMatch[2].trim(),
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        option_e: '',
        correct_option: 'A',
        reference_verse: ''
      };
      continue;
    }

    // If it doesn't match anything and we have a current question, it could be continuation of question text
    if (currentQuestion) {
      if (!currentQuestion.option_a && !currentQuestion.option_b) {
        currentQuestion.question_text += ' ' + line;
      }
    } else {
      currentQuestion = {
        question_text: line,
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        option_e: '',
        correct_option: 'A',
        reference_verse: ''
      };
    }
  }

  if (currentQuestion) {
    questions.push(currentQuestion);
  }

  return questions.filter(q => q.question_text && (q.option_a || q.option_b));
};

// POST /api/quizzes/parse-document - Parse DOCX or PDF quiz questions
router.post('/parse-document', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }

  const { fileName, base64Data } = req.body;

  if (!fileName || !base64Data) {
    return res.status(400).json({ error: 'fileName and base64Data are required.' });
  }

  try {
    const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
    let fileBuffer;
    let extension = path.extname(fileName).toLowerCase();

    if (matches) {
      fileBuffer = Buffer.from(matches[2], 'base64');
    } else {
      fileBuffer = Buffer.from(base64Data, 'base64');
    }

    let extractedText = '';

    if (extension === '.docx') {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      extractedText = result.value;
    } else if (extension === '.pdf') {
      const pdfParse = require('pdf-parse');
      const parser = new pdfParse.PDFParse(new Uint8Array(fileBuffer));
      const result = await parser.getText();
      extractedText = result.text;
    } else {
      return res.status(400).json({ error: 'Unsupported file format. Please upload a .docx or .pdf file.' });
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ error: 'The uploaded file contains no text.' });
    }

    const parsedQuestions = parseQuizText(extractedText);

    res.json({
      message: 'File parsed successfully!',
      questionsCount: parsedQuestions.length,
      questions: parsedQuestions
    });
  } catch (err) {
    console.error('Error parsing document:', err);
    res.status(500).json({ error: 'Server error parsing the document file.' });
  }
});

module.exports = router;
