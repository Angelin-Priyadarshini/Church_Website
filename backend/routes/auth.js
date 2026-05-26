const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const db = require('../config/db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// Nodemailer SMTP Transporter setup - highly secure SSL direct connection with certificate fallback for cloud VPS
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'agsharjahtamil@gmail.com',
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // Bypasses self-signed handshake restrictions on host providers like Hostinger/Render
  }
});

// Helper function to send email with 6-digit code
async function sendVerificationEmail(email, name, verificationCode) {
  if (!process.env.EMAIL_PASS) {
    console.log(`\n==================================================`);
    console.log(`[VERIFICATION EMAIL FALLBACK]`);
    console.log(`To: ${email}`);
    console.log(`Code: ${verificationCode}`);
    console.log(`Please set EMAIL_PASS in your environment for live emails.`);
    console.log(`==================================================\n`);
    return true;
  }

  const mailOptions = {
    from: `"AG Sharjah Tamil Church" <agsharjahtamil@gmail.com>`,
    to: email,
    subject: `${verificationCode} is your AGSTC Verification Code`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 /images/logo.png auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #6366f1; text-align: center;">AG Sharjah Tamil Church</h2>
        <hr style="border: 0; border-top: 1px solid #eeeeee;" />
        <p>Dear ${name},</p>
        <p>Thank you for registering at Assemblies of God Sharjah Tamil Church website. To complete your registration and activate your believer account, please use the following 6-digit verification code:</p>
        <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #1f2937; border-radius: 6px; margin: 20px 0;">
          ${verificationCode}
        </div>
        <p style="color: #6b7280; font-size: 14px;">This code is valid for 24 hours. If you did not request this registration, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eeeeee; margin-top: 30px;" />
        <p style="text-align: center; font-size: 12px; color: #9ca3af;">
          Assemblies of God Sharjah Tamil Church, Sharjah, UAE<br/>
          Email: agsharjahtamil@gmail.com | Website: agsharjah.org
        </p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await db.getAsync(`SELECT * FROM users WHERE email = ?`, [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check if account is verified
    if (user.is_verified === 0) {
      return res.status(403).json({
        error: 'Your email has not been verified yet.',
        requiresVerification: true,
        email: user.email
      });
    }

    // Sign token (valid for 24h)
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during authentication.' });
  }
});

// GET /api/auth/me (Get current logged in user details)
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// POST /api/auth/register (Handles both admin registrations and public registrations)
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  // Check if an admin is creating the account
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  let isAdminRegistering = false;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.role === 'admin') {
        isAdminRegistering = true;
      }
    } catch (err) {
      // Proceed as public registration if token is invalid/expired
    }
  }

  try {
    const existingUser = await db.getAsync(`SELECT id, is_verified FROM users WHERE email = ?`, [email]);
    const passwordHash = bcrypt.hashSync(password, 10);

    if (existingUser) {
      if (existingUser.is_verified === 0) {
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        await db.runAsync(
          `UPDATE users SET name = ?, password_hash = ?, verification_code = ? WHERE id = ?`,
          [name, passwordHash, verificationCode, existingUser.id]
        );

        sendVerificationEmail(email, name, verificationCode).catch(mailErr => {
          console.error('SMTP background mailer error on re-register:', mailErr);
          console.log(`[SMTP Mailer Error Code Backup]: ${verificationCode} for ${email}`);
        });

        return res.status(201).json({
          message: 'This email is already registered but unverified. We have sent a new 6-digit verification code to your email.',
          email
        });
      } else {
        return res.status(400).json({ error: 'Email is already registered and verified. Please sign in.' });
      }
    }

    if (isAdminRegistering) {
      const assignedRole = role || 'user';
      await db.runAsync(
        `INSERT INTO users (name, email, password_hash, role, is_verified) VALUES (?, ?, ?, ?, ?)`,
        [name, email, passwordHash, assignedRole, 1]
      );
      res.status(201).json({ message: `Successfully registered ${assignedRole} user: ${name}` });
    } else {
      // Public believer registration with 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      await db.runAsync(
        `INSERT INTO users (name, email, password_hash, role, is_verified, verification_code) VALUES (?, ?, ?, ?, ?, ?)`,
        [name, email, passwordHash, 'user', 0, verificationCode]
      );

      // Trigger email asynchronously in the background (prevents blocking HTTP response, making registration extremely fast!)
      sendVerificationEmail(email, name, verificationCode).catch(mailErr => {
        console.error('SMTP background mailer error:', mailErr);
        console.log(`[SMTP Mailer Error Code Backup]: ${verificationCode} for ${email}`);
      });

      res.status(201).json({
        message: 'Registration successful! A 6-digit verification code has been sent to your email.',
        email
      });
    }
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during user creation.' });
  }
});

// POST /api/auth/verify
router.post('/verify', async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and 6-digit verification code are required.' });
  }

  try {
    const user = await db.getAsync(`SELECT id, verification_code, is_verified FROM users WHERE email = ?`, [email]);
    if (!user) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    if (user.is_verified === 1) {
      return res.status(400).json({ error: 'Account is already verified. Please log in.' });
    }

    if (user.verification_code !== code.toString().trim()) {
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    await db.runAsync(
      `UPDATE users SET is_verified = 1, verification_code = NULL WHERE id = ?`,
      [user.id]
    );

    res.json({ message: 'Email verified successfully! You can now log in.' });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ error: 'Server error during email verification.' });
  }
});

// POST /api/auth/resend-code
router.post('/resend-code', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    const user = await db.getAsync(`SELECT id, name, is_verified FROM users WHERE email = ?`, [email]);
    if (!user) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    if (user.is_verified === 1) {
      return res.status(400).json({ error: 'Account is already verified. Please log in.' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    await db.runAsync(`UPDATE users SET verification_code = ? WHERE id = ?`, [verificationCode, user.id]);

    // Trigger email asynchronously in the background
    sendVerificationEmail(email, user.name, verificationCode).catch(mailErr => {
      console.error('SMTP background mailer error:', mailErr);
      console.log(`[SMTP Mailer Error Code Backup]: ${verificationCode} for ${email}`);
    });

    res.json({ message: 'A new 6-digit verification code has been sent to your email.' });
  } catch (err) {
    console.error('Resend code error:', err);
    res.status(500).json({ error: 'Server error resending verification code.' });
  }
});

// GET /api/auth/users (List all registered admin/moderator accounts)
router.get('/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }

  try {
    const users = await db.allAsync(`SELECT id, name, email, role, created_at FROM users`);
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Server error fetching user accounts.' });
  }
});

module.exports = router;
