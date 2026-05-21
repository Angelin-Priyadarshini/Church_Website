const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/testimonies (Public - Approved only)
router.get('/', async (req, res) => {
  try {
    const testimonies = await db.allAsync(`SELECT * FROM testimonies WHERE status = 'Approved' ORDER BY created_at DESC`);
    res.json(testimonies);
  } catch (err) {
    console.error('Error fetching testimonies:', err);
    res.status(500).json({ error: 'Server error fetching testimonies.' });
  }
});

// GET /api/testimonies/all (Admin/Moderator - All requests)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const testimonies = await db.allAsync(`SELECT * FROM testimonies ORDER BY created_at DESC`);
    res.json(testimonies);
  } catch (err) {
    console.error('Error fetching all testimonies:', err);
    res.status(500).json({ error: 'Server error fetching moderation testimonies.' });
  }
});

// POST /api/testimonies (Public submission)
router.post('/', async (req, res) => {
  const { author_name, story_text, category, video_url } = req.body;

  if (!author_name || !story_text) {
    return res.status(400).json({ error: 'Author name and testimony story text are required.' });
  }

  try {
    const result = await db.runAsync(
      `INSERT INTO testimonies (author_name, story_text, category, video_url, status) VALUES (?, ?, ?, ?, ?)`,
      [author_name, story_text, category || 'General', video_url || '', 'Pending']
    );
    res.status(201).json({ 
      message: 'Thank you for sharing your story! It has been sent for administrative moderation.',
      testimonyId: result.lastID 
    });
  } catch (err) {
    console.error('Error submitting testimony:', err);
    res.status(500).json({ error: 'Server error submitting testimony.' });
  }
});

// PUT /api/testimonies/:id/status (Admin/Moderator approve/reject)
router.put('/:id/status', authenticateToken, async (req, res) => {
  const { status } = req.body;

  if (!['Approved', 'Pending', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid testimony status. Must be Approved, Pending, or Rejected.' });
  }

  try {
    const exists = await db.getAsync(`SELECT id FROM testimonies WHERE id = ?`, [req.params.id]);
    if (!exists) {
      return res.status(404).json({ error: 'Testimony not found.' });
    }

    await db.runAsync(`UPDATE testimonies SET status = ? WHERE id = ?`, [status, req.params.id]);
    res.json({ message: `Testimony successfully marked as ${status}.` });
  } catch (err) {
    console.error('Error updating testimony status:', err);
    res.status(500).json({ error: 'Server error updating testimony status.' });
  }
});

// DELETE /api/testimonies/:id (Admin delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const exists = await db.getAsync(`SELECT id FROM testimonies WHERE id = ?`, [req.params.id]);
    if (!exists) {
      return res.status(404).json({ error: 'Testimony not found.' });
    }
    await db.runAsync(`DELETE FROM testimonies WHERE id = ?`, [req.params.id]);
    res.json({ message: 'Testimony deleted successfully.' });
  } catch (err) {
    console.error('Error deleting testimony:', err);
    res.status(500).json({ error: 'Server error deleting testimony.' });
  }
});

module.exports = router;
