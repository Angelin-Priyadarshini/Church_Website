const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

// GET /api/prayers (Admin/Moderator viewing of requests)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const prayers = await db.allAsync(`SELECT * FROM prayers ORDER BY created_at DESC`);
    res.json(prayers);
  } catch (err) {
    console.error('Error fetching prayer requests:', err);
    res.status(500).json({ error: 'Server error fetching prayer requests.' });
  }
});

// GET /api/prayers/my-requests (Fetch logged-in believer's requests)
router.get('/my-requests', authenticateToken, async (req, res) => {
  try {
    const prayers = await db.allAsync(
      `SELECT * FROM prayers WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(prayers);
  } catch (err) {
    console.error('Error fetching my prayer requests:', err);
    res.status(500).json({ error: 'Server error fetching your prayer requests.' });
  }
});

// POST /api/prayers (Public or registered believer submission)
router.post('/', async (req, res) => {
  const { name, email, phone, request_text, category, is_anonymous } = req.body;

  if (!request_text || !category) {
    return res.status(400).json({ error: 'Prayer request text and category are required.' });
  }

  // Parse token optionally
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  let loggedInUser = null;

  if (token) {
    try {
      loggedInUser = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      // Treat as public guest submission
    }
  }

  // Handle anonymous fields
  let parsedName = is_anonymous ? 'Anonymous' : (name || 'Anonymous');
  let parsedEmail = is_anonymous ? 'anonymous@agstc.org' : (email || 'anonymous@agstc.org');
  let associatedUserId = null;

  if (loggedInUser) {
    associatedUserId = loggedInUser.id;
    if (!is_anonymous) {
      parsedName = loggedInUser.name;
      parsedEmail = loggedInUser.email;
    }
  }

  try {
    const result = await db.runAsync(
      `INSERT INTO prayers (name, email, phone, request_text, category, is_anonymous, status, user_id, is_answered) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        parsedName, 
        parsedEmail, 
        phone || '', 
        request_text, 
        category, 
        is_anonymous ? 1 : 0, 
        'Pending', 
        associatedUserId, 
        0
      ]
    );

    // Mock Email/SMS notifications to the Pastor/Prayer team
    console.log(`[SMTP Mailer Mock]: Notification sent to prayerteam@agstc.org for request ID: ${result.lastID}`);
    if (!is_anonymous && parsedEmail && !parsedEmail.includes('anonymous@')) {
      console.log(`[SMTP Mailer Mock]: Automated receipt confirmation sent to requester: ${parsedEmail}`);
    }

    res.status(201).json({ 
      message: 'Prayer request submitted successfully. The intercessors team is standing with you.', 
      requestId: result.lastID 
    });
  } catch (err) {
    console.error('Error submitting prayer request:', err);
    res.status(500).json({ error: 'Server error submitting prayer request.' });
  }
});

// PATCH /api/prayers/:id/answered (Toggle answered state)
router.patch('/:id/answered', authenticateToken, async (req, res) => {
  const { is_answered } = req.body;

  if (is_answered === undefined) {
    return res.status(400).json({ error: 'is_answered field is required.' });
  }

  try {
    const prayer = await db.getAsync(`SELECT * FROM prayers WHERE id = ?`, [req.params.id]);
    if (!prayer) {
      return res.status(404).json({ error: 'Prayer request not found.' });
    }

    // Ensure user owns this prayer request, unless they are admin or moderator
    if (prayer.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({ error: 'Access denied. You can only update your own prayer requests.' });
    }

    const newStatus = is_answered ? 'Answered' : 'Pending';

    await db.runAsync(
      `UPDATE prayers SET is_answered = ?, status = ? WHERE id = ?`,
      [is_answered ? 1 : 0, newStatus, req.params.id]
    );

    res.json({ 
      message: 'Prayer request answered status updated successfully.',
      is_answered: !!is_answered,
      status: newStatus
    });
  } catch (err) {
    console.error('Error updating answered status:', err);
    res.status(500).json({ error: 'Server error updating answered status.' });
  }
});

// PUT /api/prayers/:id/status (Admin/Moderator mark as Prayed / Answered)
router.put('/:id/status', authenticateToken, async (req, res) => {
  const { status } = req.body;

  if (!['Pending', 'Prayed', 'Answered'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status state. Must be Pending, Prayed, or Answered.' });
  }

  try {
    const exists = await db.getAsync(`SELECT id FROM prayers WHERE id = ?`, [req.params.id]);
    if (!exists) {
      return res.status(404).json({ error: 'Prayer request not found.' });
    }

    const isAnswered = status === 'Answered' ? 1 : 0;

    await db.runAsync(`UPDATE prayers SET status = ?, is_answered = ? WHERE id = ?`, [status, isAnswered, req.params.id]);
    res.json({ message: `Prayer request status updated to ${status}.` });
  } catch (err) {
    console.error('Error updating prayer status:', err);
    res.status(500).json({ error: 'Server error updating prayer status.' });
  }
});

// DELETE /api/prayers/:id (Admin delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const exists = await db.getAsync(`SELECT id FROM prayers WHERE id = ?`, [req.params.id]);
    if (!exists) {
      return res.status(404).json({ error: 'Prayer request not found.' });
    }
    await db.runAsync(`DELETE FROM prayers WHERE id = ?`, [req.params.id]);
    res.json({ message: 'Prayer request deleted successfully.' });
  } catch (err) {
    console.error('Error deleting prayer request:', err);
    res.status(500).json({ error: 'Server error deleting prayer request.' });
  }
});

module.exports = router;
