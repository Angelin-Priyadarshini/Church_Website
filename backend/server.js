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
  origin: ["http://localhost:5173", "https://church-website-lilac-nine.vercel.app"]
}));
app.use(express.json());

// Serving static files for resources uploads
app.use('/resources', express.static(path.join(__dirname, 'public/resources')));

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/prayers', prayersRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/testimonies', testimoniesRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/contact', contactRoutes);

// Dynamic Ministries route directly inside server.js for simplicity and performance
app.get('/api/ministries', async (req, res) => {
  try {
    const ministries = await db.allAsync(`SELECT * FROM ministries ORDER BY name ASC`);
    res.json(ministries);
  } catch (err) {
    console.error('Error fetching ministries:', err);
    res.status(500).json({ error: 'Server error fetching ministries.' });
  }
});

// Get single ministry details by ID
app.get('/api/ministries/:id', async (req, res) => {
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

// Admin dashboard KPI summary endpoint directly inside server.js
app.get('/api/dashboard/summary', async (req, res) => {
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

// Serve React Frontend Static Files in Production
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// Route wildcard: Route all non-API and non-resource requests to the React SPA index.html
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/resources')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  } else {
    res.status(404).json({ error: 'Endpoint not found.' });
  }
});

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
