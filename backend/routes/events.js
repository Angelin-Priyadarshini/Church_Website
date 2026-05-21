const express = require('express');
const router = Router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/events (All upcoming events)
router.get('/', async (req, res) => {
  try {
    const events = await db.allAsync(`SELECT * FROM events ORDER BY date ASC`);
    
    // Append actual registration counts
    for (const event of events) {
      const regCount = await db.getAsync(`SELECT COUNT(*) as count FROM event_registrations WHERE event_id = ?`, [event.id]);
      event.registeredCount = regCount.count || 0;
    }
    
    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Server error fetching events list.' });
  }
});

// GET /api/events/:id (Fetch single event, includes attendee roster if admin)
router.get('/:id', async (req, res) => {
  try {
    const event = await db.getAsync(`SELECT * FROM events WHERE id = ?`, [req.params.id]);
    if (!event) {
      return res.status(404).json({ error: 'Calendar event not found.' });
    }

    const regCount = await db.getAsync(`SELECT COUNT(*) as count FROM event_registrations WHERE event_id = ?`, [event.id]);
    event.registeredCount = regCount.count || 0;

    // Optional: Attach roster for authorized users (Admin/Moderator)
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      // If token is validated, attach registration roster
      const token = authHeader.split(' ')[1];
      try {
        const jwt = require('jsonwebtoken');
        const { JWT_SECRET } = require('../middleware/auth');
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role === 'admin' || decoded.role === 'moderator') {
          const roster = await db.allAsync(
            `SELECT id, attendee_name, attendee_email, attendee_phone, created_at FROM event_registrations WHERE event_id = ? ORDER BY created_at DESC`,
            [event.id]
          );
          event.roster = roster;
        }
      } catch (err) {
        // Carry on without roster if token invalid
      }
    }

    res.json(event);
  } catch (err) {
    console.error('Error fetching event details:', err);
    res.status(500).json({ error: 'Server error fetching event details.' });
  }
});

// POST /api/events (Admin create)
router.post('/', authenticateToken, async (req, res) => {
  const { title, description, date, time, location, image_url, capacity } = req.body;

  if (!title || !date || !time || !location) {
    return res.status(400).json({ error: 'Title, date, time and location are required.' });
  }

  try {
    const result = await db.runAsync(
      `INSERT INTO events (title, description, date, time, location, image_url, capacity) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, date, time, location, image_url || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800', capacity || 100]
    );
    res.status(201).json({ message: 'Event successfully created', eventId: result.lastID });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: 'Server error creating event.' });
  }
});

// POST /api/events/:id/register (Public/User sign up)
router.post('/:id/register', async (req, res) => {
  const { attendee_name, attendee_email, attendee_phone } = req.body;

  if (!attendee_name || !attendee_email) {
    return res.status(400).json({ error: 'Name and email are required for registration.' });
  }

  try {
    const event = await db.getAsync(`SELECT * FROM events WHERE id = ?`, [req.params.id]);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    // Check capacity limits
    const currentReg = await db.getAsync(`SELECT COUNT(*) as count FROM event_registrations WHERE event_id = ?`, [event.id]);
    if (currentReg.count >= event.capacity) {
      return res.status(400).json({ error: 'Sorry, this event has already reached full capacity.' });
    }

    // Insert registration
    await db.runAsync(
      `INSERT INTO event_registrations (event_id, attendee_name, attendee_email, attendee_phone) VALUES (?, ?, ?, ?)`,
      [event.id, attendee_name, attendee_email, attendee_phone || '']
    );

    console.log(`[SMTP Mailer Mock]: Booking confirmed for ${attendee_name} at ${event.title}. Receipt sent to ${attendee_email}`);

    res.status(201).json({ 
      message: `Successfully registered for ${event.title}! An automated confirmation was sent to your email.` 
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// DELETE /api/events/:id (Admin delete event)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const exists = await db.getAsync(`SELECT id FROM events WHERE id = ?`, [req.params.id]);
    if (!exists) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    // Delete registrations first
    await db.runAsync(`DELETE FROM event_registrations WHERE event_id = ?`, [req.params.id]);
    await db.runAsync(`DELETE FROM events WHERE id = ?`, [req.params.id]);
    res.json({ message: 'Event and associated registrations deleted successfully.' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ error: 'Server error deleting event.' });
  }
});

module.exports = router;
