const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/blog (All devotionals)
router.get('/', async (req, res) => {
  const { category } = req.query;
  let sql = `SELECT * FROM blog_devotionals`;
  const params = [];

  if (category) {
    sql += ` WHERE category = ?`;
    params.push(category);
  }
  sql += ` ORDER BY publish_date DESC`;

  try {
    const posts = await db.allAsync(sql, params);
    res.json(posts);
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({ error: 'Server error fetching devotionals.' });
  }
});

// GET /api/blog/:id
router.get('/:id', async (req, res) => {
  try {
    const post = await db.getAsync(`SELECT * FROM blog_devotionals WHERE id = ?`, [req.params.id]);
    if (!post) {
      return res.status(404).json({ error: 'Devotional not found.' });
    }
    res.json(post);
  } catch (err) {
    console.error('Error fetching blog post:', err);
    res.status(500).json({ error: 'Server error fetching devotional.' });
  }
});

// POST /api/blog (Admin create)
router.post('/', authenticateToken, async (req, res) => {
  const { title, content, author, category, read_time_minutes } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  try {
    const result = await db.runAsync(
      `INSERT INTO blog_devotionals (title, content, author, category, read_time_minutes) VALUES (?, ?, ?, ?, ?)`,
      [title, content, author || 'Pastor Immanuel', category || 'Daily Promise', read_time_minutes || 3]
    );
    res.status(201).json({ message: 'Devotional post published successfully', postId: result.lastID });
  } catch (err) {
    console.error('Error creating blog post:', err);
    res.status(500).json({ error: 'Server error creating devotional.' });
  }
});

// PUT /api/blog/:id (Admin edit)
router.put('/:id', authenticateToken, async (req, res) => {
  const { title, content, author, category, read_time_minutes } = req.body;

  try {
    const exists = await db.getAsync(`SELECT id FROM blog_devotionals WHERE id = ?`, [req.params.id]);
    if (!exists) {
      return res.status(404).json({ error: 'Devotional not found.' });
    }

    await db.runAsync(
      `UPDATE blog_devotionals SET title = ?, content = ?, author = ?, category = ?, read_time_minutes = ? WHERE id = ?`,
      [title, content, author, category, read_time_minutes, req.params.id]
    );
    res.json({ message: 'Devotional updated successfully.' });
  } catch (err) {
    console.error('Error updating blog post:', err);
    res.status(500).json({ error: 'Server error updating devotional.' });
  }
});

// DELETE /api/blog/:id (Admin delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const exists = await db.getAsync(`SELECT id FROM blog_devotionals WHERE id = ?`, [req.params.id]);
    if (!exists) {
      return res.status(404).json({ error: 'Devotional not found.' });
    }
    await db.runAsync(`DELETE FROM blog_devotionals WHERE id = ?`, [req.params.id]);
    res.json({ message: 'Devotional deleted successfully.' });
  } catch (err) {
    console.error('Error deleting blog post:', err);
    res.status(500).json({ error: 'Server error deleting devotional.' });
  }
});

module.exports = router;
