const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/services (list cached services with filters)
router.get('/', async (req, res) => {
  const { search, category, preacher, sort } = req.query;
  let sql = `SELECT * FROM services WHERE 1=1`;
  const params = [];

  if (search) {
    sql += ` AND (title LIKE ? OR description LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  if (category) {
    sql += ` AND category = ?`;
    params.push(category);
  }

  if (preacher) {
    sql += ` AND preacher = ?`;
    params.push(preacher);
  }

  if (sort === 'oldest') {
    sql += ` ORDER BY upload_date ASC`;
  } else if (sort === 'popular') {
    sql += ` ORDER BY view_count DESC`;
  } else {
    sql += ` ORDER BY upload_date DESC`;
  }

  try {
    const services = await db.allAsync(sql, params);
    res.json(services);
  } catch (err) {
    console.error('Error fetching services:', err);
    res.status(500).json({ error: 'Server error fetching sermon videos.' });
  }
});

// GET /api/services/:id
router.get('/:id', async (req, res) => {
  try {
    const service = await db.getAsync(`SELECT * FROM services WHERE id = ?`, [req.params.id]);
    if (!service) {
      return res.status(404).json({ error: 'Sermon service video not found.' });
    }
    // Increment view count locally
    await db.runAsync(`UPDATE services SET view_count = view_count + 1 WHERE id = ?`, [req.params.id]);
    service.view_count += 1;
    res.json(service);
  } catch (err) {
    console.error('Error fetching single service:', err);
    res.status(500).json({ error: 'Server error fetching sermon details.' });
  }
});

// POST /api/services/sync (Sync with YouTube - Admin/Moderator locked)
router.post('/sync', authenticateToken, async (req, res) => {
  console.log('Triggering sync with channel: @AGSHARJAHTAMILCHURCH');
  
  try {
    // Simulated live updates representing latest uploads from Assemblies of God Sharjah Tamil Church YouTube
    const newVideos = [
      {
        title: '18/1/26 | SUNDAY SERVICE | Worship: Bro. Durai | When God Calls: Rev. Andrew',
        description: 'Sunday Worship Service live recording from Assemblies of God Sharjah Tamil Church. Rev. Andrew preaches on "When God Calls". Worship led by Bro. Durai.',
        youtube_video_id: 'pRUBl8hbfWM',
        category: 'Sunday Service',
        duration: '2:12:30',
        upload_date: '2026-01-18',
        preacher: 'Rev. Andrew'
      },
      {
        title: '15/1/26 | Thursday | Worship: Bro. Babu | Receiving God\'s promise: Bro. Ruskin',
        description: 'Thursday Midweek Service live recording from Assemblies of God Sharjah Tamil Church. Bro. Ruskin shares a message on "Receiving God\'s Promise". Worship led by Bro. Babu.',
        youtube_video_id: 'NKqyCflwV_Y',
        category: 'Thursday Service',
        duration: '1:50:00',
        upload_date: '2026-01-15',
        preacher: 'Bro. Ruskin'
      }
    ];

    let syncCount = 0;
    for (const video of newVideos) {
      // Check if already cached
      const exists = await db.getAsync(`SELECT id FROM services WHERE youtube_video_id = ?`, [video.youtube_video_id]);
      if (!exists) {
        await db.runAsync(
          `INSERT INTO services (title, description, youtube_video_id, category, duration, upload_date, preacher, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [video.title, video.description, video.youtube_video_id, video.category, video.duration, video.upload_date, video.preacher, 150]
        );
        syncCount++;
      }
    }

    res.json({
      message: 'Sync completed successfully.',
      channel: '@AGSHARJAHTAMILCHURCH',
      videosSyncedCount: syncCount,
      totalCachedVideos: (await db.getAsync(`SELECT COUNT(*) as count FROM services`)).count
    });
  } catch (err) {
    console.error('Sync failure:', err);
    res.status(500).json({ error: 'Server error during YouTube channel synchronization.' });
  }
});

// POST /api/services (Admin manual add sermon)
router.post('/', authenticateToken, async (req, res) => {
  const { title, description, youtube_video_id, category, duration, upload_date, preacher } = req.body;

  if (!title || !youtube_video_id) {
    return res.status(400).json({ error: 'Title and YouTube video ID are required.' });
  }

  try {
    const result = await db.runAsync(
      `INSERT INTO services (title, description, youtube_video_id, category, duration, upload_date, preacher) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, youtube_video_id, category || 'Sunday Service', duration || '1:30:00', upload_date || new Date().toISOString().split('T')[0], preacher || 'Pastor Immanuel']
    );
    res.status(201).json({ message: 'Sermon created successfully', serviceId: result.lastID });
  } catch (err) {
    console.error('Error creating sermon:', err);
    res.status(500).json({ error: 'Server error creating sermon entry.' });
  }
});

// DELETE /api/services/:id (Admin delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const exists = await db.getAsync(`SELECT id FROM services WHERE id = ?`, [req.params.id]);
    if (!exists) {
      return res.status(404).json({ error: 'Sermon not found.' });
    }
    await db.runAsync(`DELETE FROM services WHERE id = ?`, [req.params.id]);
    res.json({ message: 'Sermon deleted successfully.' });
  } catch (err) {
    console.error('Error deleting sermon:', err);
    res.status(500).json({ error: 'Server error deleting sermon.' });
  }
});

module.exports = router;
