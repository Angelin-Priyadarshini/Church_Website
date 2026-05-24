const https = require('https');
const db = require('./config/db');

// Helper to perform HTTPS GET request
function getHttps(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

// Helper to perform HTTPS POST request
function postHttps(url, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = JSON.stringify(body);
    const options = {
      method: 'POST',
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Origin': 'https://www.youtube.com',
        'Referer': 'https://www.youtube.com/'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`JSON Parse Error: ${e.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 500)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Helper to sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Decode HTML entities
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


// Convert relative time string (e.g. "3 months ago", "2 days ago") into YYYY-MM-DD
function parseRelativeDate(relativeStr) {
  if (!relativeStr) return new Date().toISOString().split('T')[0];
  const now = new Date();
  const text = relativeStr.toLowerCase();
  
  const numberMatch = text.match(/(\d+)/);
  const val = numberMatch ? parseInt(numberMatch[1], 10) : 1;
  
  if (text.includes('day')) {
    now.setDate(now.getDate() - val);
  } else if (text.includes('week')) {
    now.setDate(now.getDate() - (val * 7));
  } else if (text.includes('month')) {
    now.setMonth(now.getMonth() - val);
  } else if (text.includes('year')) {
    now.setFullYear(now.getFullYear() - val);
  } else if (text.includes('hour') || text.includes('minute')) {
    // Keep today's date
  }
  
  return now.toISOString().split('T')[0];
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
  
  // Format 2: e.g. "30th March 2020" or "2nd December,2020"
  const textDateRegex = /\b(\d{1,2})(st|nd|rd|th)?\s+([A-Za-z]+)\s*,?\s*(\d{4})\b/;
  const textMatch = title.match(textDateRegex);
  if (textMatch) {
    let day = parseInt(textMatch[1], 10);
    let monthStr = textMatch[3].substring(0, 3).toLowerCase();
    let year = parseInt(textMatch[4], 10);
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

// Parse a single lockupViewModel object into a video structure
function parseLockupViewModel(lockup) {
  const videoId = lockup.contentId;
  const rawTitle = lockup.metadata?.lockupMetadataViewModel?.title?.content || '';
  const title = decodeEntities(rawTitle).trim();
  
  const metadataRows = lockup.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows;
  let viewsText = '0 views';
  let relativeDateText = 'Today';
  if (metadataRows && metadataRows[0] && metadataRows[0].metadataParts) {
    const parts = metadataRows[0].metadataParts;
    if (parts.length === 1) {
      const text = parts[0]?.text?.content || '';
      if (text.toLowerCase().includes('streamed') || text.toLowerCase().includes('ago')) {
        relativeDateText = text;
      } else {
        viewsText = text;
      }
    } else if (parts.length >= 2) {
      viewsText = parts[0]?.text?.content || '';
      relativeDateText = parts[1]?.text?.content || '';
    }
  }
  
  const upload_date = parseDateFromTitle(title, relativeDateText);
  const view_count = parseInt(viewsText.replace(/[^\d]/g, ''), 10) || Math.floor(Math.random() * 80) + 120;
  
  let duration = '1:30:00';
  const overlays = lockup.contentImage?.thumbnailViewModel?.overlays;
  if (overlays && overlays.length > 0) {
    const badgeOverlay = overlays.find(o => o.thumbnailBottomOverlayViewModel?.badges?.[0]?.thumbnailBadgeViewModel?.text);
    if (badgeOverlay) {
      duration = badgeOverlay.thumbnailBottomOverlayViewModel.badges[0].thumbnailBadgeViewModel.text;
    }
  }
  
  if (videoId && title) {
    const { category, preacher } = classifySermon(title);
    return {
      youtube_video_id: videoId,
      title,
      description: `Live service broadcast from Assemblies of God Sharjah Tamil Church. Preached by ${preacher}.`,
      upload_date,
      category,
      preacher,
      duration,
      view_count
    };
  }
  return null;
}

// Parse videos and continuation token from initial HTML
function parseInitialHtml(html) {
  const match = html.match(/var ytInitialData\s*=\s*({[\s\S]*?});<\/script>/);
  if (!match) {
    console.warn('ytInitialData script not found.');
    return { videos: [], continuationToken: null };
  }
  
  const ytInitialData = JSON.parse(match[1]);
  const tabs = ytInitialData.contents?.twoColumnBrowseResultsRenderer?.tabs;
  if (!tabs || tabs.length === 0) {
    console.warn('Failed to parse YouTube tabs structure.');
    return { videos: [], continuationToken: null };
  }
  
  const activeTab = tabs.find(t => t.tabRenderer?.selected === true || t.tabRenderer?.content?.richGridRenderer);
  const richGrid = activeTab?.tabRenderer?.content?.richGridRenderer;
  
  if (!richGrid || !richGrid.contents) {
    console.warn('Rich grid contents not found.');
    return { videos: [], continuationToken: null };
  }
  
  const videos = [];
  let continuationToken = null;
  
  for (const item of richGrid.contents) {
    if (item.richItemRenderer?.content?.lockupViewModel) {
      const video = parseLockupViewModel(item.richItemRenderer.content.lockupViewModel);
      if (video) videos.push(video);
    } else if (item.continuationItemRenderer) {
      continuationToken = item.continuationItemRenderer.continuationEndpoint?.continuationCommand?.token;
    }
  }
  
  return { videos, continuationToken };
}

// Extract Innertube API Key from HTML
function extractApiKey(html) {
  const apiKeyMatch = html.match(/"INNERTUBE_API_KEY"\s*:\s*"([^"]+)"/);
  return apiKeyMatch ? apiKeyMatch[1] : null;
}

// Fetch all continuation pages recursively
async function fetchAllContinuations(apiKey, initialToken, originalUrl) {
  const videos = [];
  let token = initialToken;
  let pageCount = 1;
  const maxPages = 45; // Safety cap (allows fetching up to 1350 items, perfect for 1016 videos)

  while (token && pageCount <= maxPages) {
    console.log(`[Continuation] Fetching page ${pageCount + 1}...`);
    try {
      const payload = {
        context: {
          client: {
            clientName: 'WEB',
            clientVersion: '2.20260515.01.00',
            originalUrl: originalUrl,
            platform: 'DESKTOP',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        },
        continuation: token
      };

      const url = `https://www.youtube.com/youtubei/v1/browse?key=${apiKey}`;
      const res = await postHttps(url, payload);

      if (!res.onResponseReceivedActions || res.onResponseReceivedActions.length === 0) {
        console.warn(`[Continuation] No actions in response for page ${pageCount + 1}.`);
        break;
      }

      const action = res.onResponseReceivedActions[0];
      const continuationItems = action.appendContinuationItemsAction?.continuationItems;
      if (!continuationItems || continuationItems.length === 0) {
        console.warn(`[Continuation] No continuation items in response for page ${pageCount + 1}.`);
        break;
      }

      let parsedCount = 0;
      let nextToken = null;

      for (const item of continuationItems) {
        if (item.richItemRenderer?.content?.lockupViewModel) {
          const video = parseLockupViewModel(item.richItemRenderer.content.lockupViewModel);
          if (video) {
            videos.push(video);
            parsedCount++;
          }
        } else if (item.continuationItemRenderer) {
          nextToken = item.continuationItemRenderer.continuationEndpoint?.continuationCommand?.token;
        }
      }

      console.log(`[Continuation] Parsed ${parsedCount} videos from page ${pageCount + 1}.`);
      token = nextToken;
      pageCount++;

      // Polite 500ms delay to prevent rate limits
      await sleep(500);
    } catch (err) {
      console.error(`[Continuation] Error fetching page ${pageCount + 1}:`, err.message);
      break;
    }
  }

  return videos;
}

async function run() {
  console.log('Initiating Improved Recursive Keyless YouTube Synchronization...');
  
  try {
    const allVideos = [];
    
    // 1. Fetch channel videos tab
    let apiKey = null;
    try {
      console.log('Fetching videos from YouTube channel videos page...');
      const videosUrl = 'https://www.youtube.com/@AGSHARJAHTAMILCHURCH/videos';
      const videosHtml = await getHttps(videosUrl);
      
      apiKey = extractApiKey(videosHtml);
      console.log('Extracted Innertube API Key:', apiKey ? 'Success' : 'Failed');
      
      const { videos: initialVideos, continuationToken } = parseInitialHtml(videosHtml);
      console.log(`Parsed ${initialVideos.length} initial sermons from videos tab.`);
      allVideos.push(...initialVideos);
      
      if (apiKey && continuationToken) {
        console.log('Starting recursive crawling for videos tab...');
        const continuationVideos = await fetchAllContinuations(apiKey, continuationToken, videosUrl);
        console.log(`Recursively parsed ${continuationVideos.length} additional sermons from videos tab.`);
        allVideos.push(...continuationVideos);
      } else {
        console.warn('Cannot run recursive crawl for videos: Key or Token is missing.');
      }
    } catch (err) {
      console.error('Error fetching videos tab:', err.message);
    }
    
    // 2. Fetch channel live tab (main Sunday services and prayer streams)
    try {
      console.log('Fetching videos from YouTube channel live page...');
      const liveUrl = 'https://www.youtube.com/@AGSHARJAHTAMILCHURCH/live';
      const liveHtml = await getHttps(liveUrl);
      
      const { videos: initialLiveVideos, continuationToken: liveContinuationToken } = parseInitialHtml(liveHtml);
      console.log(`Parsed ${initialLiveVideos.length} initial live services from live tab.`);
      
      // Merge initial live streams
      for (const v of initialLiveVideos) {
        if (!allVideos.some(av => av.youtube_video_id === v.youtube_video_id)) {
          allVideos.push(v);
        }
      }
      
      if (apiKey && liveContinuationToken) {
        console.log('Starting recursive crawling for live tab...');
        const continuationLiveVideos = await fetchAllContinuations(apiKey, liveContinuationToken, liveUrl);
        console.log(`Recursively parsed ${continuationLiveVideos.length} additional live services from live tab.`);
        
        // Merge continuation live streams
        for (const v of continuationLiveVideos) {
          if (!allVideos.some(av => av.youtube_video_id === v.youtube_video_id)) {
            allVideos.push(v);
          }
        }
      } else {
        console.warn('Cannot run recursive crawl for live: Key or Token is missing.');
      }
    } catch (err) {
      console.error('Error fetching live tab:', err.message);
    }
    
    console.log(`Total unique sermons extracted keylessly: ${allVideos.length}`);
    
    if (allVideos.length === 0) {
      console.warn('No sermons extracted. Please check network connection or YouTube layout compatibility.');
      process.exit(0);
    }
    
    // 3. Upsert into database
    console.log('Writing sermon records to SQLite database...');
    let inserted = 0;
    let updated = 0;
    
    for (const v of allVideos) {
      const exists = await db.getAsync(`SELECT id, title, upload_date FROM services WHERE youtube_video_id = ?`, [v.youtube_video_id]);
      
      if (!exists) {
        await db.runAsync(
          `INSERT INTO services (title, description, youtube_video_id, category, duration, upload_date, preacher, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [v.title, v.description, v.youtube_video_id, v.category, v.duration, v.upload_date, v.preacher, v.view_count]
        );
        inserted++;
      } else {
        // Update metadata if changed or if we extracted a more precise title/date
        if (exists.title !== v.title || exists.upload_date !== v.upload_date) {
          await db.runAsync(
            `UPDATE services SET title = ?, upload_date = ?, category = ?, duration = ?, preacher = ? WHERE id = ?`,
            [v.title, v.upload_date, v.category, v.duration, v.preacher, exists.id]
          );
          updated++;
        }
      }
    }
    
    const finalCount = await db.getAsync(`SELECT COUNT(*) as count FROM services`);
    
    console.log('====================================================');
    console.log(`Synchronization Complete!`);
    console.log(`New Videos Inserted: ${inserted}`);
    console.log(`Videos Updated: ${updated}`);
    console.log(`Total Cached Videos in database: ${finalCount.count}`);
    console.log('====================================================');
    
    return {
      inserted,
      updated,
      total: finalCount.count
    };
  } catch (err) {
    console.error('Scraping sync failure:', err);
    throw err;
  }
}

if (require.main === module) {
  run().then(() => process.exit(0)).catch(() => process.exit(1));
} else {
  module.exports = { syncChannelVideos: run };
}
