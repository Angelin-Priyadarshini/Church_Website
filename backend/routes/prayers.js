const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

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

// POST /api/prayers (Public submission)
router.post('/', async (req, res) => {
  const { name, email, phone, request_text, category, is_anonymous } = req.body;

  if (!request_text || !category) {
    return res.status(400).json({ error: 'Prayer request text and category are required.' });
  }

  // Handle anonymous fields
  const parsedName = is_anonymous ? 'Anonymous' : (name || 'Anonymous');
  const parsedEmail = is_anonymous ? 'anonymous@agstc.org' : (email || 'anonymous@agstc.org');

  try {
    const result = await db.runAsync(
      `INSERT INTO prayers (name, email, phone, request_text, category, is_anonymous, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [parsedName, parsedEmail, phone || '', request_text, category, is_anonymous ? 1 : 0, 'Pending']
    );

    // Mock Email/SMS notifications to the Pastor/Prayer team
    console.log(`[SMTP Mailer Mock]: Notification sent to prayerteam@agstc.org for request ID: ${result.lastID}`);
    if (!is_anonymous && email) {
      console.log(`[SMTP Mailer Mock]: Automated receipt confirmation sent to requester: ${email}`);
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

    await db.runAsync(`UPDATE prayers SET status = ? WHERE id = ?`, [status, req.params.id]);
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
