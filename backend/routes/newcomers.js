const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Middleware to authorize usher, data_admin, and admin roles
function requireUsherOrAbove(req, res, next) {
  const allowed = ['admin', 'data_admin', 'usher'];
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied. Authorized roles only.' });
  }
  next();
}

// POST /api/newcomers - Register a newcomer (Usher or above only)
router.post('/', authenticateToken, requireUsherOrAbove, async (req, res) => {
  const {
    full_name,
    birthdate,
    relationship_status,
    wedding_date,
    mobile,
    country_code,
    gender,
    location,
    preferred_language,
    prayer_needs
  } = req.body;

  if (!full_name || !birthdate || !relationship_status || !mobile || !country_code || !gender || !location || !preferred_language) {
    return res.status(400).json({ error: 'All core fields are required. Please fill in the registration form completely.' });
  }

  // Double check conditional wedding date rule
  const actualWeddingDate = relationship_status.toLowerCase() === 'married' ? wedding_date : null;

  try {
    await db.runAsync(`
      INSERT INTO newcomers (
        full_name, birthdate, relationship_status, wedding_date, 
        mobile, country_code, gender, location, 
        preferred_language, prayer_needs
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        full_name, birthdate, relationship_status, actualWeddingDate,
        mobile, country_code, gender, location,
        preferred_language, prayer_needs || ''
      ]
    );

    res.status(201).json({ message: 'Newcomer registered successfully! Recorded in church database.' });
  } catch (err) {
    console.error('Error inserting newcomer:', err);
    res.status(500).json({ error: 'Server error saving newcomer information.' });
  }
});

// GET /api/newcomers - Retrieve list of newcomers (Usher or above only)
router.get('/', authenticateToken, requireUsherOrAbove, async (req, res) => {
  try {
    const newcomers = await db.allAsync(`SELECT * FROM newcomers ORDER BY id DESC`);
    res.json(newcomers);
  } catch (err) {
    console.error('Error listing newcomers:', err);
    res.status(500).json({ error: 'Server error listing newcomers.' });
  }
});

module.exports = router;
