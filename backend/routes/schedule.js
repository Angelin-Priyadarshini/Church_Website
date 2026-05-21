const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/schedule
router.get('/', async (req, res) => {
  try {
    const schedules = await db.allAsync(`SELECT * FROM schedule`);
    res.json(schedules);
  } catch (err) {
    console.error('Error fetching schedules:', err);
    res.status(500).json({ error: 'Server error fetching schedules.' });
  }
});

// POST /api/schedule (Admin create)
router.post('/', authenticateToken, async (req, res) => {
  const { name, time, location, category, recurrence } = req.body;

  if (!name || !time || !location || !category) {
    return res.status(400).json({ error: 'Name, time, location and category are required.' });
  }

  try {
    const result = await db.runAsync(
      `INSERT INTO schedule (name, time, location, category, recurrence) VALUES (?, ?, ?, ?, ?)`,
      [name, time, location, category, recurrence || 'Weekly']
    );
    res.status(201).json({ message: 'Schedule entry created successfully', scheduleId: result.lastID });
  } catch (err) {
    console.error('Error creating schedule:', err);
    res.status(500).json({ error: 'Server error creating schedule.' });
  }
});

// PUT /api/schedule/:id (Admin update)
router.put('/:id', authenticateToken, async (req, res) => {
  const { name, time, location, category, recurrence } = req.body;

  try {
    const exists = await db.getAsync(`SELECT id FROM schedule WHERE id = ?`, [req.params.id]);
    if (!exists) {
      return res.status(404).json({ error: 'Schedule entry not found.' });
    }

    await db.runAsync(
      `UPDATE schedule SET name = ?, time = ?, location = ?, category = ?, recurrence = ? WHERE id = ?`,
      [name, time, location, category, recurrence, req.params.id]
    );

    res.json({ message: 'Schedule entry updated successfully.' });
  } catch (err) {
    console.error('Error updating schedule:', err);
    res.status(500).json({ error: 'Server error updating schedule.' });
  }
});

// DELETE /api/schedule/:id (Admin delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const exists = await db.getAsync(`SELECT id FROM schedule WHERE id = ?`, [req.params.id]);
    if (!exists) {
      return res.status(404).json({ error: 'Schedule entry not found.' });
    }
    await db.runAsync(`DELETE FROM schedule WHERE id = ?`, [req.params.id]);
    res.json({ message: 'Schedule entry deleted successfully.' });
  } catch (err) {
    console.error('Error deleting schedule:', err);
    res.status(500).json({ error: 'Server error deleting schedule.' });
  }
});

module.exports = router;
