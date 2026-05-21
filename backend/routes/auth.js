const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

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

// POST /api/auth/register (Admin creating users)
router.post('/register', authenticateToken, async (req, res) => {
  const { name, email, password, role } = req.body;

  // Only admins can create other users/moderators
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Only administrators can register new accounts.' });
  }

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const existingUser = await db.getAsync(`SELECT id FROM users WHERE email = ?`, [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    await db.runAsync(
      `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      [name, email, passwordHash, role]
    );

    res.status(201).json({ message: `Successfully registered ${role} user: ${name}` });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during user creation.' });
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
