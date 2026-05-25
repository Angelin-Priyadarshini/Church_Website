const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/resources (List resource files)
router.get('/', async (req, res) => {
  const { category } = req.query;
  let sql = `SELECT * FROM resources`;
  const params = [];

  if (category) {
    sql += ` WHERE category = ?`;
    params.push(category);
  }
  sql += ` ORDER BY download_count DESC`;

  try {
    const files = await db.allAsync(sql, params);
    res.json(files);
  } catch (err) {
    console.error('Error fetching resources:', err);
    res.status(500).json({ error: 'Server error fetching study resources.' });
  }
});

// POST /api/resources/:id/download (Increment download count)
router.post('/:id/download', async (req, res) => {
  try {
    const exists = await db.getAsync(`SELECT id FROM resources WHERE id = ?`, [req.params.id]);
    if (!exists) {
      return res.status(404).json({ error: 'Resource not found.' });
    }

    await db.runAsync(`UPDATE resources SET download_count = download_count + 1 WHERE id = ?`, [req.params.id]);
    res.json({ message: 'Download counter incremented.' });
  } catch (err) {
    console.error('Error incrementing download:', err);
    res.status(500).json({ error: 'Server error logging resource download.' });
  }
});

// POST /api/resources (Admin upload meta)
router.post('/', authenticateToken, async (req, res) => {
  const { title, description, file_url, file_type, category } = req.body;

  if (!title || !file_url) {
    return res.status(400).json({ error: 'Title and file path url are required.' });
  }

  try {
    const result = await db.runAsync(
      `INSERT INTO resources (title, description, file_url, file_type, category, download_count) VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, file_url, file_type || 'PDF', category || 'Bible Study', 0]
    );
    res.status(201).json({ message: 'Study resource successfully cataloged', resourceId: result.lastID });
  } catch (err) {
    console.error('Error uploading resource meta:', err);
    res.status(500).json({ error: 'Server error uploading resource metadata.' });
  }
});

// PUT /api/resources/:id (Admin update resource)
router.put('/:id', authenticateToken, async (req, res) => {
  const { title, description, file_url, file_type, category } = req.body;

  if (!title || !file_url) {
    return res.status(400).json({ error: 'Title and file path url are required.' });
  }

  try {
    const exists = await db.getAsync(`SELECT id FROM resources WHERE id = ?`, [req.params.id]);
    if (!exists) {
      return res.status(404).json({ error: 'Resource not found.' });
    }

    await db.runAsync(
      `UPDATE resources SET title = ?, description = ?, file_url = ?, file_type = ?, category = ? WHERE id = ?`,
      [title, description, file_url, file_type || 'PDF', category || 'Bible Study', req.params.id]
    );

    res.json({ message: 'Study resource updated successfully.' });
  } catch (err) {
    console.error('Error updating resource:', err);
    res.status(500).json({ error: 'Server error updating study resource.' });
  }
});

// DELETE /api/resources/:id (Admin delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const exists = await db.getAsync(`SELECT id FROM resources WHERE id = ?`, [req.params.id]);
    if (!exists) {
      return res.status(404).json({ error: 'Resource not found.' });
    }
    await db.runAsync(`DELETE FROM resources WHERE id = ?`, [req.params.id]);
    res.json({ message: 'Study resource deleted successfully.' });
  } catch (err) {
    console.error('Error deleting resource:', err);
    res.status(500).json({ error: 'Server error deleting study resource.' });
  }
});

module.exports = router;
