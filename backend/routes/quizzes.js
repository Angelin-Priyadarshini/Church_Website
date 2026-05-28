const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// SMTP Transporter setup matching auth.js
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'agsharjahtamil@gmail.com',
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

  const mailOptions = {
    from: `"AG Sharjah Tamil Church" <agsharjahtamil@gmail.com>`,
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

// POST /api/quizzes - Create Quiz and Questions (Data Admin / Admin only)
router.post('/', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'data_admin') {
    return res.status(403).json({ error: 'Access denied. Data Admin or Admin role required.' });
  }

  const { title, questions } = req.body;

  if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'Quiz title and an array of questions are required.' });
  }

  // Calculate timer: 30 seconds per question
  const duration_seconds = questions.length * 30;

  try {
    // 1. Create the quiz entry
    const quizResult = await db.runAsync(
      `INSERT INTO quizzes (title, duration_seconds, created_by) VALUES (?, ?, ?)`,
      [title, duration_seconds, req.user.id]
    );
    const quizId = quizResult.insertId;

    // 2. Create question entries
    for (const q of questions) {
      if (!q.question_text || !q.option_a || !q.option_b || !q.option_c || !q.option_d || !q.correct_option) {
        return res.status(400).json({ error: 'All questions must have text, options A-D, and correct_option.' });
      }
      await db.runAsync(
        `INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [quizId, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option.toUpperCase()]
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

    const result = quizzes.map(q => {
      const attempt = scoreMap[q.id];
      return {
        ...q,
        taken: !!attempt,
        score: attempt ? attempt.score : null,
        total: attempt ? attempt.total : null,
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
      SELECT s.*, q.title as quiz_title
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

    // Fetch questions but DO NOT select the correct_option if the user has NOT completed it
    let questions;
    if (alreadyTaken) {
      // If taken, they can view correct answers for study purposes
      questions = await db.allAsync(
        `SELECT id, question_text, option_a, option_b, option_c, option_d, correct_option FROM questions WHERE quiz_id = ? ORDER BY id ASC`,
        [id]
      );
    } else {
      // If not taken yet, hide correct option
      questions = await db.allAsync(
        `SELECT id, question_text, option_a, option_b, option_c, option_d FROM questions WHERE quiz_id = ? ORDER BY id ASC`,
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
  const { answers } = req.body; // Expecting object array: [{ question_id: 1, selected_option: 'A' }]

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Selected answers array is required.' });
  }

  try {
    const quiz = await db.getAsync(`SELECT id FROM quizzes WHERE id = ?`, [id]);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    // Check if user has already taken it
    const alreadyTaken = await db.getAsync(`SELECT id FROM quiz_scores WHERE user_id = ? AND quiz_id = ?`, [req.user.id, id]);
    if (alreadyTaken) {
      return res.status(400).json({ error: 'You have already completed this test and scores have been locked.' });
    }

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

    // Save score to database
    await db.runAsync(
      `INSERT INTO quiz_scores (user_id, quiz_id, score, total) VALUES (?, ?, ?, ?)`,
      [req.user.id, id, score, questionCount]
    );

    res.json({
      message: 'Test graded successfully!',
      score,
      total: questionCount,
      percent: parseFloat(((score / questionCount) * 100).toFixed(1)),
      gradedAnswers
    });
  } catch (err) {
    console.error('Error submitting quiz answers:', err);
    res.status(500).json({ error: 'Server error grading test.' });
  }
});

module.exports = router;
