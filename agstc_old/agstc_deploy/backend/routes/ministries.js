const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/ministries
router.get('/', async (req, res) => {
  try {
    const ministries = await db.allAsync(`SELECT * FROM ministries ORDER BY name ASC`);
    res.json(ministries);
  } catch (err) {
    console.error('Error fetching ministries:', err);
    res.status(500).json({ error: 'Server error fetching ministries.' });
  }
});

// GET /api/ministries/:id
router.get('/:id', async (req, res) => {
  try {
    const ministry = await db.getAsync(`SELECT * FROM ministries WHERE id = ?`, [req.params.id]);
    if (!ministry) {
      return res.status(404).json({ error: 'Ministry not found.' });
    }
    res.json(ministry);
  } catch (err) {
    console.error('Error fetching ministry details:', err);
    res.status(500).json({ error: 'Server error fetching ministry details.' });
  }
});

// POST /api/ministries (Admin create)
router.post('/', authenticateToken, async (req, res) => {
  const { name, description, leader, schedule, category, image_url, gallery_urls } = req.body;

  if (!name || !description) {
    return res.status(400).json({ error: 'Name and description are required.' });
  }

  try {
    const result = await db.runAsync(
      `INSERT INTO ministries (name, description, leader, schedule, category, image_url, gallery_urls) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, description, leader || '', schedule || '', category || '', image_url || '/images/banner1.jpg', gallery_urls || '[]']
    );
    res.status(201).json({ message: 'Ministry created successfully', ministryId: result.lastID });
  } catch (err) {
    console.error('Error creating ministry:', err);
    res.status(500).json({ error: 'Server error creating ministry.' });
  }
});

// PUT /api/ministries/:id (Admin update)
router.put('/:id', authenticateToken, async (req, res) => {
  const { name, description, leader, schedule, category, image_url, gallery_urls } = req.body;

  if (!name || !description) {
    return res.status(400).json({ error: 'Name and description are required.' });
  }

  try {
    const exists = await db.getAsync(`SELECT id FROM ministries WHERE id = ?`, [req.params.id]);
    if (!exists) {
      return res.status(404).json({ error: 'Ministry not found.' });
    }

    await db.runAsync(
      `UPDATE ministries SET name = ?, description = ?, leader = ?, schedule = ?, category = ?, image_url = ?, gallery_urls = ? WHERE id = ?`,
      [name, description, leader || '', schedule || '', category || '', image_url || '/images/banner1.jpg', gallery_urls || '[]', req.params.id]
    );

    res.json({ message: 'Ministry updated successfully.' });
  } catch (err) {
    console.error('Error updating ministry:', err);
    res.status(500).json({ error: 'Server error updating ministry.' });
  }
});

// DELETE /api/ministries/:id (Admin delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const exists = await db.getAsync(`SELECT id FROM ministries WHERE id = ?`, [req.params.id]);
    if (!exists) {
      return res.status(404).json({ error: 'Ministry not found.' });
    }

    await db.runAsync(`DELETE FROM ministries WHERE id = ?`, [req.params.id]);
    res.json({ message: 'Ministry deleted successfully.' });
  } catch (err) {
    console.error('Error deleting ministry:', err);
    res.status(500).json({ error: 'Server error deleting ministry.' });
  }
});

module.exports = router;
