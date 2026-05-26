const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/about
router.get('/', async (req, res) => {
  try {
    const rows = await db.allAsync('SELECT `key`, en_val, ta_val FROM about_content');
    const formatted = {
      en: {},
      ta: {}
    };

    rows.forEach(row => {
      formatted.en[row.key] = row.en_val;
      formatted.ta[row.key] = row.ta_val;
    });

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching about us content:', err);
    res.status(500).json({ error: 'Server error fetching about us content.' });
  }
});

// PUT /api/about (Admin update)
router.put('/', authenticateToken, async (req, res) => {
  const { en, ta } = req.body;

  if (!en || !ta) {
    return res.status(400).json({ error: 'English (en) and Tamil (ta) translations are required.' });
  }

  try {
    // Gather all unique keys from both translations
    const keys = Array.from(new Set([...Object.keys(en), ...Object.keys(ta)]));

    for (const key of keys) {
      const en_val = en[key] || '';
      const ta_val = ta[key] || '';

      await db.runAsync(
        'INSERT INTO about_content (`key`, en_val, ta_val) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE en_val = VALUES(en_val), ta_val = VALUES(ta_val)',
        [key, en_val, ta_val]
      );
    }

    res.json({ message: 'About us content updated successfully.' });
  } catch (err) {
    console.error('Error updating about us content:', err);
    res.status(500).json({ error: 'Server error updating about us content.' });
  }
});

module.exports = router;
