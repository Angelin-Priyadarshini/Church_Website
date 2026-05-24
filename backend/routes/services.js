const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/services (list cached services with filters)
router.get('/', async (req, res) => {
  const { search, category, preacher, sort, limit } = req.query;
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
    sql += ` ORDER BY upload_date ASC, id DESC`;
  } else if (sort === 'popular') {
    sql += ` ORDER BY view_count DESC, upload_date DESC`;
  } else {
    sql += ` ORDER BY upload_date DESC, id ASC`;
  }

  if (limit) {
    const parsedLimit = parseInt(limit, 10);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      sql += ` LIMIT ?`;
      params.push(parsedLimit);
    }
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

function removeWorshipSection(title) {
  const match = title.match(/\b(WORSHIP|WOR:|WOR\.|WORSIP)\b/i);
  if (!match) return title;
  
  const startIdx = title.indexOf(match[0]);
  const sub = title.substring(startIdx + match[0].length);
  
  const dividers = ['|', '-', '~'];
  const andMatch = sub.match(/\b(and|&)\b/i);
  if (andMatch) {
    dividers.push(andMatch[0]);
  }
  
  const colonCount = (sub.match(/:/g) || []).length;
  if (colonCount >= 1) {
    const firstColonIdx = sub.indexOf(':');
    dividers.push(sub.substring(firstColonIdx, firstColonIdx + 1));
  }
  
  let minIdx = -1;
  dividers.forEach(d => {
    const idx = sub.indexOf(d);
    if (idx !== -1 && (minIdx === -1 || idx < minIdx)) {
      minIdx = idx;
    }
  });
  
  if (minIdx !== -1) {
    return title.substring(0, startIdx) + title.substring(startIdx + match[0].length + minIdx);
  } else {
    return title.substring(0, startIdx);
  }
}

// Automatically classify sermons based on title keywords
function classifySermon(title) {
  const t = title.toUpperCase();
  let category = 'Sunday Service';

  if (t.includes('NEW YEAR') || t.includes('புத்தாண்டு') || t.includes('YEAR END')) {
    category = 'New Year Service';
  } else if (t.includes('CHRISTMAS') || t.includes('கிறிஸ்துமஸ்') || t.includes('அன்பின் விருந்து')) {
    category = 'Christmas Service';
  } else if (t.includes('GOOD FRIDAY') || t.includes('EASTER') || t.includes('உயிர்த்தெழுதல்')) {
    category = 'Good Friday & Easter';
  } else if (t.includes('VBS') || t.includes('CHILDREN') || t.includes('KIDS') || t.includes('QUIZ') || t.includes('MEMORY VERSE') || t.includes('சிறுவர்')) {
    category = 'Youth & Children';
  } else if (t.includes('YOUTH') || t.includes('வாலிபர்') || t.includes('இளைஞர்')) {
    category = 'Youth & Children';
  } else if (t.includes('SISTERS') || t.includes('சகோதரிகள்') || t.includes('பெண்கள்') || t.includes('WOMEN') || t.includes('FELLOWSHIP')) {
    category = 'Sisters Fellowship';
  } else if (t.includes('RETREAT') || t.includes('SPECIAL MEETING') || t.includes('SPECIAL SERVICE') || t.includes('FAMILY SEMINAR') || t.includes('CONFERENCE') || t.includes('கூட்டம்') || t.includes('விசேஷ')) {
    category = 'Retreats & Special';
  } else if (t.includes('FASTING') || t.includes('FASTNG') || t.includes('உபவாச') || t.includes('ALL NIGHT PRAYER') || t.includes('இரவு ஜெபம்')) {
    category = 'Fasting Prayer';
  } else if (t.includes('THURSDAY') || t.includes('MIDWEEK') || t.includes('MID WEEK') || t.includes('MID-WEEK') || t.includes('MONDAY') || t.includes('TUESDAY') || t.includes('WEDNESDAY') || t.includes('FRIDAY') || t.includes('SATURDAY') || t.includes('WEEKDAY') || t.includes('திங்கள்') || t.includes('செவ்வாய்') || t.includes('புதன்') || t.includes('வியாழன்') || t.includes('வெள்ளி') || t.includes('சனி') || t.includes('ஜெபம்') || t.includes('PRAYER CELL') || t.includes('COTTAGE') || t.includes('HOUSE PRAYER')) {
    category = 'Midweek Prayer';
  } else if (t.includes('SING SONG') || t.includes('பாடல்கள்')) {
    category = 'Special Programs';
  }

  // Preacher section extraction using our new elegant removeWorshipSection
  const preachTitle = removeWorshipSection(title);
  const pt = preachTitle.toUpperCase();

  // Find all matching preachers and choose the one closest to the end (largest index)
  const preacherCandidates = [
    { name: 'Rev. Andrew', keywords: ['ANDREW', 'ஆண்ட்ரூ'] },
    { name: 'Asst. Past. Paulsamy', keywords: ['PAULSAMY', 'பால்சாமி'] },
    { name: 'Bro. Ruskin', keywords: ['RUSKIN', 'RASKIN', 'ரஸ்கின்'] },
    { name: 'Sis. Mary Immanuel', keywords: ['MARY', 'மேரி'] },
    { name: 'Bro. Babu', keywords: ['BABU', 'பாபு'] },
    { name: 'Bro. Durai', keywords: ['DURAI', 'துரை'] },
    { name: 'Pastor Regilin', keywords: ['REGILIN', 'ரெஜிலின்'] },
    { name: 'Bro. Gunaseelan', keywords: ['GUNASEELAN', 'குணசீலன்'] },
    { name: 'Br. Jeyaraj', keywords: ['JEYARAJ', 'ஜெயராஜ்'] },
    { name: 'Br. Dinakar', keywords: ['DINAKAR', 'தினகர்'] },
    { name: 'Bro. Qubert', keywords: ['QUBERT', 'க்யூபர்ட்'] },
    { name: 'Bro. Augustine Jebakumar', keywords: ['JEBAKUMAR', 'ஜெபகுமார்'] },
    { name: 'Bro. Augustin', keywords: ['AUGUSTIN', 'AUGUSTINE', 'அகஸ்டின்'] },
    { name: 'Bro. Wesley', keywords: ['WESLEY', 'வெஸ்லி'] },
    { name: 'Bro. Moses', keywords: ['MOSES', 'மோசே'] },
    { name: 'Bro. Benny', keywords: ['BENNY', 'பென்னி'] }
  ];

  let bestPreacher = 'Pastor Immanuel';
  let maxIndex = -1;

  preacherCandidates.forEach(candidate => {
    // Prevent guest preacher Bro. Augustine Jebakumar from matching local Bro. Augustin
    if (candidate.name === 'Bro. Augustin' && (pt.includes('JEBAKUMAR') || pt.includes('ஜெபகுமார்'))) {
      return;
    }
    candidate.keywords.forEach(keyword => {
      const idx = pt.lastIndexOf(keyword);
      if (idx > maxIndex) {
        maxIndex = idx;
        bestPreacher = candidate.name;
      }
    });
  });

  return { category, preacher: bestPreacher };
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
      // 2. FALLBACK SYNC: Run our high-performance keyless YouTube crawler (sync_channel.js)
      console.log('[Sync Controller]: Running keyless YouTube channel crawler...');
      const { syncChannelVideos } = require('../sync_channel');
      const crawlStats = await syncChannelVideos();
      
      return res.json({
        message: 'Full keyless historical synchronization completed successfully.',
        isFullSync: true,
        videosSyncedCount: crawlStats.inserted,
        videosUpdatedCount: crawlStats.updated,
        totalCachedVideos: crawlStats.total
      });
    }
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
