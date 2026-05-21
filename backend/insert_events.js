const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, './church.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to database', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database at:', dbPath);
  
  db.serialize(() => {
    db.get(`SELECT COUNT(*) as count FROM events`, [], (err, row) => {
      if (err) {
        console.error('Error querying events count:', err);
        db.close();
        process.exit(1);
      }
      
      if (row.count === 0) {
        const stmt = db.prepare(`INSERT INTO events (title, description, date, time, location, image_url, capacity) VALUES (?, ?, ?, ?, ?, ?, ?)`);
        
        stmt.run(
          'Pentecost Power Meeting (பெந்தெகொஸ்தே வல்லமை கூடுகை)',
          'An intense worship experience celebrating the outpouring of the Holy Spirit. Join us for a time of healing, deliverance, and spiritual re-firing.',
          '2026-05-31',
          '06:30 PM - 09:30 PM',
          'Sharjah Worship Center Hall A',
          '/images/home-banner1.JPG',
          120
        );
        
        stmt.run(
          'Family Blessing Seminar (குடும்ப ஆசீர்வாத கருத்தரங்கு)',
          'A special seminar for couples and youth. Pastor Immanuel will share biblically grounded principles for fostering peaceful homes and strong marriages.',
          '2026-06-07',
          '09:00 AM - 12:30 PM',
          'Sharjah Worship Center Hall A',
          '/images/pastor-immanuel.png',
          80
        );
        
        stmt.run(
          'Jeremiah Fasting Prayer Crusade',
          'A combined regional intercession assembly gathering intercessors from Sharjah, Ajman, and Umm Al Quwain to stand in the gap for our communities.',
          '2026-06-12',
          '08:00 PM - 10:30 PM',
          'Main Sanctuary Hall B, Sharjah',
          '/images/prayer.jpg',
          150
        );
        
        stmt.finalize(() => {
          console.log('Upcoming events seeded successfully!');
          db.close();
        });
      } else {
        console.log('Events table already contains records. Skipping seed.');
        db.close();
      }
    });
  });
});
