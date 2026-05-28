const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Memory cache for sermons
let servicesCache = {};

function clearServicesCache() {
  servicesCache = {};
  console.log('[Cache] Services memory cache cleared.');
}

// GET /api/services (list cached services with filters)
router.get('/', async (req, res) => {
  const cacheKey = JSON.stringify(req.query);
  if (servicesCache[cacheKey]) {
    console.log('[Cache] Serving services from memory cache.');
    return res.json(servicesCache[cacheKey]);
  }

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
    sql += ` ORDER BY (upload_date IS NULL), upload_date ASC, id ASC`;
  } else if (sort === 'popular') {
    sql += ` ORDER BY view_count DESC, (upload_date IS NULL), upload_date DESC`;
  } else {
    sql += ` ORDER BY (upload_date IS NULL), upload_date DESC, id DESC`;
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
    servicesCache[cacheKey] = services; // Cache the response
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
    clearServicesCache();
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

// Convert relative time string or return raw YYYY-MM-DD directly
function parseRelativeDate(relativeStr) {
  if (!relativeStr) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(relativeStr)) {
    return relativeStr;
  }
  const now = new Date();
  const text = relativeStr.toLowerCase();
  const numberMatch = text.match(/(\d+)/);
  const val = numberMatch ? parseInt(numberMatch[1], 10) : 1;
  
  if (text.includes('day')) {
    now.setDate(now.getDate() - val);
    return now.toISOString().split('T')[0];
  } else if (text.includes('week')) {
    now.setDate(now.getDate() - (val * 7));
    return now.toISOString().split('T')[0];
  } else if (text.includes('hour') || text.includes('minute') || text.includes('second')) {
    return now.toISOString().split('T')[0];
  }
  // months/years ago — can't reliably guess, return null
  return null;
}

// Advanced date parsing from title, with relative date fallback
function parseDateFromTitle(title, relativeDateText) {
  let cleanTitle = title.replace(/\s*([\/\.\-])\s*/g, '$1');
  
  // Format 1: DD/MM/YY or DD/MM/YYYY or DD.MM.YY or DD.MM.YYYY or DD-MM-YY or DD-MM-YYYY
  const dateRegex = /\b(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{2,4})\b/;
  const match = cleanTitle.match(dateRegex);
  if (match) {
    let day = parseInt(match[1], 10);
    let month = parseInt(match[2], 10);
    let year = parseInt(match[3], 10);
    
    if (year < 100) {
      year = 2000 + year;
    }
    
    if (year > 2030) {
      if (String(year).endsWith('24')) year = 2024;
      else if (String(year).endsWith('25')) year = 2025;
      else if (String(year).endsWith('26')) year = 2026;
    }
    
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 2000 && year <= 2030) {
      const pad = (num) => String(num).padStart(2, '0');
      return `${year}-${pad(month)}-${pad(day)}`;
    }
  }

  // Format 1b: DD.MMYYYY (like 18.072024)
  const noSepRegex = /\b(\d{1,2})[\/\.\-](\d{1,2})(\d{4})\b/;
  const noSepMatch = cleanTitle.match(noSepRegex);
  if (noSepMatch) {
    let day = parseInt(noSepMatch[1], 10);
    let month = parseInt(noSepMatch[2], 10);
    let year = parseInt(noSepMatch[3], 10);
    
    if (year > 2030) {
      if (String(year).endsWith('24')) year = 2024;
      else if (String(year).endsWith('25')) year = 2025;
      else if (String(year).endsWith('26')) year = 2026;
    }

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 2000 && year <= 2030) {
      const pad = (num) => String(num).padStart(2, '0');
      return `${year}-${pad(month)}-${pad(day)}`;
    }
  }

  // Format 1c: DD MM YYYY or DD MM YY (spaces)
  const spaceRegex = /\b(\d{1,2})\s+(\d{1,2})\s+(\d{2,4})\b/;
  const spaceMatch = cleanTitle.match(spaceRegex);
  if (spaceMatch) {
    let day = parseInt(spaceMatch[1], 10);
    let month = parseInt(spaceMatch[2], 10);
    let year = parseInt(spaceMatch[3], 10);
    
    if (year < 100) {
      year = 2000 + year;
    }
    
    if (year > 2030) {
      if (String(year).endsWith('24')) year = 2024;
      else if (String(year).endsWith('25')) year = 2025;
      else if (String(year).endsWith('26')) year = 2026;
    }

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 2000 && year <= 2030) {
      const pad = (num) => String(num).padStart(2, '0');
      return `${year}-${pad(month)}-${pad(day)}`;
    }
  }
  
  // Format 2: e.g. "30th March 2020" or "14th Feb 20"
  const textDateRegex = /\b(\d{1,2})(st|nd|rd|th)?\s+([A-Za-z]+)\s*,?\s*(\d{2,4})\b/;
  const textMatch = title.match(textDateRegex);
  if (textMatch) {
    let day = parseInt(textMatch[1], 10);
    let monthStr = textMatch[3].substring(0, 3).toLowerCase();
    let year = parseInt(textMatch[4], 10);
    if (year < 100) {
      year = 2000 + year;
    }
    const months = {
      jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
      jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
    };
    let month = months[monthStr];
    if (month && day >= 1 && day <= 31 && year >= 2000 && year <= 2030) {
      const pad = (num) => String(num).padStart(2, '0');
      return `${year}-${pad(month)}-${pad(day)}`;
    }
  }

  // Format 2b: e.g. "September 2016" or "September, 2016" or "Sept 2016"
  const monthYearRegex = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*,?\s*(\d{4})\b/i;
  const monthYearMatch = cleanTitle.match(monthYearRegex);
  if (monthYearMatch) {
    let monthStr = monthYearMatch[1].substring(0, 3).toLowerCase();
    let year = parseInt(monthYearMatch[2], 10);
    const months = {
      jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
      jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12
    };
    let month = months[monthStr];
    if (month && year >= 2000 && year <= 2030) {
      const pad = (num) => String(num).padStart(2, '0');
      return `${year}-${pad(month)}-01`;
    }
  }

  return parseRelativeDate(relativeDateText);
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
    { name: 'Bro. William', keywords: ['WILLIAM', 'வில்லியம்'] },
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
  try {
    console.log('[Sync Controller]: Running YouTube channel synchronization...');
    const { syncChannelVideos } = require('../sync_channel');
    const crawlStats = await syncChannelVideos();
    
    // Invalidate memory cache
    clearServicesCache();

    return res.json({
      message: 'YouTube synchronization completed successfully.',
      isFullSync: true,
      videosSyncedCount: crawlStats.inserted,
      videosUpdatedCount: crawlStats.updated,
      totalCachedVideos: crawlStats.total
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

    // Invalidate memory cache
    clearServicesCache();

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

    // Invalidate memory cache
    clearServicesCache();

    res.json({ message: 'Sermon deleted successfully.' });
  } catch (err) {
    console.error('Error deleting sermon:', err);
    res.status(500).json({ error: 'Server error deleting sermon.' });
  }
});

module.exports = router;
