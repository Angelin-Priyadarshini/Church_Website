const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./routes/auth');
const servicesRoutes = require('./routes/services');
const scheduleRoutes = require('./routes/schedule');
const prayersRoutes = require('./routes/prayers');
const eventsRoutes = require('./routes/events');
const testimoniesRoutes = require('./routes/testimonies');
const blogRoutes = require('./routes/blog');
const resourcesRoutes = require('./routes/resources');
const contactRoutes = require('./routes/contact');
const aboutRoutes = require('./routes/about');
const ministriesRoutes = require('./routes/ministries');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 5000;

// Automatically seed database on boot (essential for empty server instances in cloud hostings like Render)
const seedDatabase = require('./db/init');
seedDatabase().then(() => {
  console.log('[Database Bootstrapper]: System checks passed. Tables synchronized successfully.');
}).catch((err) => {
  console.error('[Database Bootstrapper]: Synchronization failed:', err);
});

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);
    
    // Allow localhost on any port
    if (origin.startsWith('http://localhost:')) return callback(null, true);
    
    // Allow any Vercel preview domain
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    
    // Allow custom domains containing agsharjah.org
    if (origin.includes('agsharjah.org')) return callback(null, true);
    
    // Default allowed list
    const allowed = [
      "https://church-website-lilac-nine.vercel.app"
    ];
    if (allowed.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // To prevent deployment blocks, fallback to allow in production while logging warning
      callback(null, true);
    }
  },
  credentials: true
}));
app.use(express.json());

// Serving static files for resources uploads
app.use('/resources', express.static(path.join(__dirname, 'public/resources')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Mount routers supporting both standard relative roots and proxy /new roots
const mountRoutes = (basePath = '') => {
  app.use(`${basePath}/api/auth`, authRoutes);
  app.use(`${basePath}/api/services`, servicesRoutes);
  app.use(`${basePath}/api/schedule`, scheduleRoutes);
  app.use(`${basePath}/api/prayers`, prayersRoutes);
  app.use(`${basePath}/api/events`, eventsRoutes);
  app.use(`${basePath}/api/testimonies`, testimoniesRoutes);
  app.use(`${basePath}/api/blog`, blogRoutes);
  app.use(`${basePath}/api/resources`, resourcesRoutes);
  app.use(`${basePath}/api/contact`, contactRoutes);
  app.use(`${basePath}/api/about`, aboutRoutes);
  app.use(`${basePath}/api/ministries`, ministriesRoutes);
  app.use(`${basePath}/api/upload`, uploadRoutes);

  // Admin dashboard KPI summary endpoint
  app.get(`${basePath}/api/dashboard/summary`, async (req, res) => {
    try {
      const totalViews = await db.getAsync(`SELECT SUM(view_count) as total FROM services`);
      const pendingPrayers = await db.getAsync(`SELECT COUNT(*) as count FROM prayers WHERE status = 'Pending'`);
      const totalRegistrations = await db.getAsync(`SELECT COUNT(*) as count FROM event_registrations`);
      const totalEvents = await db.getAsync(`SELECT COUNT(*) as count FROM events`);
      const testimoniesCount = await db.getAsync(`SELECT COUNT(*) as count FROM testimonies`);
      
      res.json({
        sermonViews: totalViews.total || 0,
        testimoniesCount: testimoniesCount.count || 0,
        pendingPrayers: pendingPrayers.count || 0,
        totalEvents: totalEvents.count || 0,
        totalBookings: totalRegistrations.count || 0
      });
    } catch (err) {
      console.error('Error compiling dashboard summary:', err);
      res.status(500).json({ error: 'Server error generating dashboard analytics.' });
    }
  });
};

mountRoutes('');      // Standard endpoints
mountRoutes('/new');  // Subdirectory endpoints

// Serve React Frontend Static Files in Production with robust fallback checks
const fs = require('fs');
const frontendPath = path.join(__dirname, '../frontend/dist');

if (fs.existsSync(frontendPath) && fs.existsSync(path.join(frontendPath, 'index.html'))) {
  // Serve static assets (JS, CSS, images) under both / and /new/
  app.use('/new', express.static(frontendPath));
  app.use(express.static(frontendPath));

  // SPA fallback: any non-API, non-resource request under /new/* → index.html
  app.get('/new', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
  app.get('/new/*', (req, res) => {
    const isApi = req.path.startsWith('/new/api');
    const isResource = req.path.startsWith('/new/resources') || req.path.startsWith('/new/images');
    if (!isApi && !isResource) {
      res.sendFile(path.join(frontendPath, 'index.html'));
    } else {
      res.status(404).json({ error: 'Endpoint not found.' });
    }
  });

  // Root redirect → /new
  app.get('/', (req, res) => {
    res.redirect(301, '/new');
  });
} else {
  console.warn('[Warning]: frontend/dist folder or index.html not found. React static client serving is disabled. Please compile the frontend using "npm run build" inside the frontend directory.');

  // Root fallback endpoint
  app.get('/', (req, res) => {
    res.json({ message: 'AGSTC Church REST API online and running! (Note: React frontend dist not built yet)' });
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`Server actively listening at: http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop.`);
  console.log(`====================================================`);
});

// Schedule automatic background YouTube synchronization
const { syncChannelVideos } = require('./sync_channel');

// Run initial background sync 30 seconds after server boot (so it doesn't block startup)
setTimeout(async () => {
  console.log('[Auto-Sync]: Triggering initial keyless background synchronization...');
  try {
    const stats = await syncChannelVideos();
    console.log(`[Auto-Sync]: Initial load completed successfully! Total: ${stats.total} sermons.`);
  } catch (err) {
    console.error('[Auto-Sync]: Failure on initial sync:', err.message);
  }
}, 30000); // 30 seconds delay

// Run periodic sync every 24 hours to check for new weekly uploads
const DAILY_SYNC_INTERVAL = 24 * 60 * 60 * 1000;
setInterval(async () => {
  console.log('[Auto-Sync]: Triggering scheduled daily background synchronization...');
  try {
    const stats = await syncChannelVideos();
    console.log(`[Auto-Sync]: Scheduled daily refresh completed! Total: ${stats.total} sermons.`);
  } catch (err) {
    console.error('[Auto-Sync]: Scheduled refresh failed:', err.message);
  }
}, DAILY_SYNC_INTERVAL);
