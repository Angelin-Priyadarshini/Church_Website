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

// Root check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'AGSTC Church Rest API online and running!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`Server actively listening at: http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop.`);
  console.log(`====================================================`);
});
