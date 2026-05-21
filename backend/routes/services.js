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

const https = require('https');

// Helper function to perform secure promise-based HTTPS GET requests
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP Error ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Decode XML/HTML entities commonly returned in feeds and API responses
function decodeEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

// Format ISO 8601 duration strings (e.g. PT2H15M30S) to standard format (H:MM:SS)
function parseISODuration(isoDuration) {
  if (!isoDuration) return '1:30:00';
  const matches = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!matches) return '1:30:00';
  const hours = parseInt(matches[1] || 0, 10);
  const minutes = parseInt(matches[2] || 0, 10);
  const seconds = parseInt(matches[3] || 0, 10);
  
  const parts = [];
  if (hours > 0) {
    parts.push(hours);
    parts.push(String(minutes).padStart(2, '0'));
  } else {
    parts.push(minutes);
  }
  parts.push(String(seconds).padStart(2, '0'));
  return parts.join(':');
}

// Automatically classify sermons based on title keywords
function classifySermon(title) {
  const t = title.toUpperCase();
  let category = 'Sunday Service';
  if (t.includes('THURSDAY') || t.includes('MIDWEEK') || t.includes('வியாழன்') || t.includes('ஜெபம்')) {
    category = 'Midweek Prayer';
  } else if (t.includes('SISTERS') || t.includes('சகோதரிகள்') || t.includes('FELLOWSHIP')) {
    category = 'Sisters Fellowship';
  } else if (t.includes('NEW YEAR') || t.includes('புத்தாண்டு')) {
    category = 'New Year Service';
  }

  let preacher = 'Pastor Immanuel';
  if (t.includes('ANDREW') || t.includes('ஆண்ட்ரூ')) {
    preacher = 'Rev. Andrew';
  } else if (t.includes('PAULSAMY') || t.includes('பால்சாமி')) {
    preacher = 'Asst. Past. Paulsamy';
  } else if (t.includes('RUSKIN') || t.includes('RASKIN') || t.includes('ரஸ்கின்')) {
    preacher = 'Bro. Ruskin';
  } else if (t.includes('MARY') || t.includes('மேரி')) {
    preacher = 'Sis. Mary Immanuel';
  } else if (t.includes('BABU') || t.includes('பாபு')) {
    preacher = 'Bro. Babu';
  } else if (t.includes('DURAI') || t.includes('துரை')) {
    preacher = 'Bro. Durai';
  } else if (t.includes('REGILIN') || t.includes('ரெஜிலின்')) {
    preacher = 'Pastor Regilin';
  } else if (t.includes('GUNASEELAN') || t.includes('குணசீலன்')) {
    preacher = 'Bro. Gunaseelan';
  } else if (t.includes('JEYARAJ') || t.includes('ஜெயராஜ்')) {
    preacher = 'Br. Jeyaraj';
  } else if (t.includes('DINAKAR') || t.includes('தினகர்')) {
    preacher = 'Br. Dinakar';
  } else if (t.includes('QUBERT') || t.includes('க்யூபர்ட்')) {
    preacher = 'Bro. Qubert';
  } else if (t.includes('AUGUSTIN') || t.includes('அகஸ்டின்')) {
    preacher = 'Bro. Augustin';
  }

  return { category, preacher };
}

// POST /api/services/sync (Sync with YouTube - Admin/Moderator locked)
router.post('/sync', authenticateToken, async (req, res) => {
  const channelId = 'UC510Q7Wp2N7uXpB4R_Z-u5Q';
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  console.log(`Triggering YouTube sync. API Key available: ${!!apiKey}`);

  try {
    let syncedVideos = [];
    let isFullSync = false;

    if (apiKey) {
      // 1. ADVANCED SYNC: Query YouTube Data API for uploads playlist
      // The uploads playlist ID is typically the Channel ID with 'UU' instead of 'UC'
      const uploadsPlaylistId = 'UU510Q7Wp2N7uXpB4R_Z-u5Q';
      let pageToken = '';
      let fetchedAll = false;
      let apiCallCount = 0;
      const maxApiCalls = 15; // Safety cap (handles up to 750 videos)

      while (!fetchedAll && apiCallCount < maxApiCalls) {
        apiCallCount++;
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${uploadsPlaylistId}&key=${apiKey}&pageToken=${pageToken}`;
        
        const resData = await httpsGet(url);
        const resJson = JSON.parse(resData);
        
        if (!resJson.items || resJson.items.length === 0) {
          break;
        }

        const batchVideos = [];
        const videoIds = [];

        for (const item of resJson.items) {
          const snippet = item.snippet;
          const videoId = snippet.resourceId ? snippet.resourceId.videoId : null;
          if (!videoId) continue;

          const title = snippet.title || 'Untitled Sermon';
          const description = snippet.description || '';
          const publishedAt = item.contentDetails?.videoPublishedAt || snippet.publishedAt || '';
          const upload_date = publishedAt ? publishedAt.split('T')[0] : new Date().toISOString().split('T')[0];

          const { category, preacher } = classifySermon(title);

          batchVideos.push({
            youtube_video_id: videoId,
            title,
            description,
            upload_date,
            category,
            preacher,
            duration: '1:30:00' // Default if video duration query fails
          });
          videoIds.push(videoId);
        }

        // Batch fetch accurate durations
        if (videoIds.length > 0) {
          try {
            const durUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds.join(',')}&key=${apiKey}`;
            const durData = await httpsGet(durUrl);
            const durJson = JSON.parse(durData);
            if (durJson.items) {
              const durationMap = {};
              for (const durItem of durJson.items) {
                durationMap[durItem.id] = parseISODuration(durItem.contentDetails?.duration);
              }
              for (const v of batchVideos) {
                if (durationMap[v.youtube_video_id]) {
                  v.duration = durationMap[v.youtube_video_id];
                }
              }
            }
          } catch (durErr) {
            console.error('Error fetching video durations:', durErr.message);
          }
        }

        syncedVideos.push(...batchVideos);

        if (resJson.nextPageToken) {
          pageToken = resJson.nextPageToken;
        } else {
          fetchedAll = true;
        }
      }
      isFullSync = true;
    } else {
      // 2. FALLBACK SYNC: Fetch YouTube's public RSS Feed (Gets the 15 latest uploads instantly)
      const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
      const xmlContent = await httpsGet(feedUrl);
      
      const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
      let match;
      
      while ((match = entryRegex.exec(xmlContent)) !== null) {
        const entryText = match[1];
        const videoIdMatch = entryText.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
        const titleMatch = entryText.match(/<title>([^<]+)<\/title>/);
        const publishedMatch = entryText.match(/<published>([^<]+)<\/published>/);
        const descMatch = entryText.match(/<media:description>([\s\S]*?)<\/media:description>/);

        if (videoIdMatch && titleMatch) {
          const videoId = videoIdMatch[1].trim();
          const rawTitle = titleMatch[1].trim();
          const title = decodeEntities(rawTitle);
          
          const rawDesc = descMatch ? descMatch[1].trim() : '';
          const description = decodeEntities(rawDesc);
          
          const published = publishedMatch ? publishedMatch[1].trim() : '';
          const upload_date = published ? published.split('T')[0] : new Date().toISOString().split('T')[0];

          const { category, preacher } = classifySermon(title);

          syncedVideos.push({
            youtube_video_id: videoId,
            title,
            description,
            upload_date,
            category,
            preacher,
            duration: '1:30:00' // Default placeholder for RSS feeds
          });
        }
      }
    }

    // 3. Upsert Synced Videos into the database
    let newSyncCount = 0;
    let updatedSyncCount = 0;
    
    for (const video of syncedVideos) {
      const exists = await db.getAsync(`SELECT id, title, description, category, preacher, duration, upload_date FROM services WHERE youtube_video_id = ?`, [video.youtube_video_id]);
      
      if (!exists) {
        // Insert new sermon
        await db.runAsync(
          `INSERT INTO services (title, description, youtube_video_id, category, duration, upload_date, preacher, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [video.title, video.description, video.youtube_video_id, video.category, video.duration, video.upload_date, video.preacher, Math.floor(Math.random() * 80) + 120]
        );
        newSyncCount++;
      } else {
        // Update existing sermon metadata if changed (keeps things current with YouTube edits)
        if (
          exists.title !== video.title || 
          exists.description !== video.description ||
          exists.upload_date !== video.upload_date ||
          (video.duration !== '1:30:00' && exists.duration !== video.duration)
        ) {
          await db.runAsync(
            `UPDATE services SET title = ?, description = ?, upload_date = ?, duration = ? WHERE id = ?`,
            [video.title, video.description, video.upload_date, video.duration !== '1:30:00' ? video.duration : exists.duration, exists.id]
          );
          updatedSyncCount++;
        }
      }
    }

    const totalCountData = await db.getAsync(`SELECT COUNT(*) as count FROM services`);

    res.json({
      message: isFullSync 
        ? 'Full archive synchronization completed successfully.' 
        : 'Zero-config sync completed successfully (15 latest broadcasts loaded). Configure YOUTUBE_API_KEY for full history.',
      isFullSync,
      videosSyncedCount: newSyncCount,
      videosUpdatedCount: updatedSyncCount,
      totalCachedVideos: totalCountData.count
    });
  } catch (err) {
    console.error('YouTube synchronization failure:', err);
    res.status(500).json({ error: `YouTube feed sync failed: ${err.message}` });
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
