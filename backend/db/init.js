const db = require('../config/db');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  console.log('Starting database initialization...');

  try {
    // 1. Create Tables
    await db.runAsync(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      youtube_video_id TEXT NOT NULL,
      category TEXT DEFAULT 'Main Service',
      duration TEXT DEFAULT '1:30:00',
      upload_date TEXT,
      preacher TEXT DEFAULT 'Pastor Immanuel',
      view_count INTEGER DEFAULT 0
    )`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS schedule (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      time TEXT NOT NULL,
      location TEXT NOT NULL,
      category TEXT NOT NULL,
      recurrence TEXT NOT NULL DEFAULT 'Weekly'
    )`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS ministries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      leader TEXT,
      schedule TEXT,
      category TEXT,
      image_url TEXT
    )`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS prayers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      request_text TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT DEFAULT 'Pending',
      is_anonymous INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      location TEXT NOT NULL,
      image_url TEXT,
      capacity INTEGER DEFAULT 100
    )`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS event_registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      attendee_name TEXT NOT NULL,
      attendee_email TEXT NOT NULL,
      attendee_phone TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(event_id) REFERENCES events(id)
    )`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS testimonies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author_name TEXT NOT NULL,
      story_text TEXT NOT NULL,
      category TEXT DEFAULT 'General',
      video_url TEXT,
      status TEXT DEFAULT 'Pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS blog_devotionals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author TEXT DEFAULT 'Pastor Immanuel',
      category TEXT DEFAULT 'Daily Promise',
      publish_date TEXT DEFAULT CURRENT_TIMESTAMP,
      read_time_minutes INTEGER DEFAULT 3
    )`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      file_url TEXT NOT NULL,
      file_type TEXT DEFAULT 'PDF',
      download_count INTEGER DEFAULT 0,
      category TEXT DEFAULT 'Bible Study'
    )`);

    console.log('Tables created successfully. Seeding initial data...');

    // 2. Seed Users if empty
    const userCount = await db.getAsync(`SELECT COUNT(*) as count FROM users`);
    if (userCount.count === 0) {
      const adminHash = bcrypt.hashSync('password123', 10);
      const modHash = bcrypt.hashSync('password123', 10);
      
      await db.runAsync(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`, 
        ['Senior Pastor Immanuel', 'admin@agstc.org', adminHash, 'admin']
      );
      await db.runAsync(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`, 
        ['Prayer Coordinator Barathi', 'moderator@agstc.org', modHash, 'moderator']
      );
      console.log('Users seeded successfully: Admin (admin@agstc.org), Moderator (moderator@agstc.org)');
    }

    // 3. Seed Schedule if empty
    const schedCount = await db.getAsync(`SELECT COUNT(*) as count FROM schedule`);
    if (schedCount.count === 0) {
      await db.runAsync(`INSERT INTO schedule (name, time, location, category, recurrence) VALUES (?, ?, ?, ?, ?)`,
        ['Sunday Tamil Service', '09:00 AM - 11:30 AM', 'Main Worship Hall, Sharjah', 'Main Worship', 'Weekly']
      );
      await db.runAsync(`INSERT INTO schedule (name, time, location, category, recurrence) VALUES (?, ?, ?, ?, ?)`,
        ['Sunday Youth Meeting', '04:30 PM - 06:30 PM', 'Fellowship Room, Sharjah', 'Youth', 'Weekly']
      );
      await db.runAsync(`INSERT INTO schedule (name, time, location, category, recurrence) VALUES (?, ?, ?, ?, ?)`,
        ['Tuesday Sisters Fellowship', '10:00 AM - 12:00 PM', 'Sharjah Chapel Hall', 'Women', 'Weekly']
      );
      await db.runAsync(`INSERT INTO schedule (name, time, location, category, recurrence) VALUES (?, ?, ?, ?, ?)`,
        ['Friday Midweek Power Prayer', '08:00 PM - 10:00 PM', 'Main Worship Hall, Sharjah', 'Prayer Meeting', 'Weekly']
      );
      await db.runAsync(`INSERT INTO schedule (name, time, location, category, recurrence) VALUES (?, ?, ?, ?, ?)`,
        ['Ajman Home Fellowship', '07:30 PM - 09:30 PM', 'Ajman Cell Center', 'Fellowship', 'Weekly']
      );
      console.log('Schedules seeded successfully.');
    }

    // 4. Seed Ministries if empty
    const minCount = await db.getAsync(`SELECT COUNT(*) as count FROM ministries`);
    if (minCount.count === 0) {
      const defaultMinistries = [
        {
          name: 'Ajman Ministry',
          description: 'A thriving satellite cell fellowship and prayer network in the emirate of Ajman, supporting regional families with targeted pastoral care and regular home fellowships.',
          leader: 'Bro. Selvakumar',
          schedule: 'Saturdays at 7:30 PM',
          category: 'Regional',
          image_url: '/images/banner1.jpg'
        },
        {
          name: 'Audio & Video Ministry',
          description: 'Technical stewards orchestrating live streaming broadcasts, acoustics, video recording, and post-production logic to publish sermons on the YouTube channel.',
          leader: 'Bro. David Raj',
          schedule: 'Every service',
          category: 'Technical Support',
          image_url: '/images/video-home.jpg'
        },
        {
          name: 'Children Ministry',
          description: 'Nurturing the youngest children of the AGSTC church through structured Tamil Sunday School, scripture memorisation, and interactive bible lesson workshops.',
          leader: 'Sis. Rachel Grace',
          schedule: 'Sundays at 9:30 AM',
          category: 'Youth & Education',
          image_url: '/images/banner10.jpg'
        },
        {
          name: 'Choir Ministry',
          description: 'Elevating congregational worship through spiritually rich and musically precise Tamil devotional hymns, regular choir practices, and leading Sunday praise.',
          leader: 'Sis. Kiruba Immanuel',
          schedule: 'Fridays at 6:30 PM (Practice)',
          category: 'Worship Arts',
          image_url: '/images/banner5.jpg'
        },
        {
          name: 'Counselling Ministry',
          description: 'Providing confidential, biblically sound advice and psychological encouragement for individuals, couples, and youths walking through various life storms.',
          leader: 'Pastor Immanuel',
          schedule: 'By Appointment',
          category: 'Pastoral Care',
          image_url: '/images/banner12.jpg'
        },
        {
          name: 'Jeremiah Ministry',
          description: 'A devoted group of intercessors acting as prayer walls, committing to constant fasts and prayer chains to intercede for the church, global needs, and families.',
          leader: 'Bro. Gunaseelan',
          schedule: 'Daily chains',
          category: 'Prayer Core',
          image_url: '/images/prayer.jpg'
        },
        {
          name: 'Mens Ministry',
          description: 'Uniting brothers to grow as spiritual leaders in their homes, businesses, and the wider Sharjah community, featuring regular breakfasts and study workshops.',
          leader: 'Bro. Paul Durai',
          schedule: 'Last Saturday at 8:00 AM',
          category: 'Fellowship',
          image_url: '/images/banner14.jpg'
        },
        {
          name: 'Transport Ministry',
          description: 'Providing dedicated bus shuttle routes completely free of cost across Sharjah, Ajman, and nearby centers, ensuring every member has safe, reliable transit to services.',
          leader: 'Bro. Stephen Raj',
          schedule: 'Every service transit',
          category: 'Logistics',
          image_url: '/images/banner13.jpg'
        },
        {
          name: 'UMM-AL-QUWAIN Ministry',
          description: 'Active outreach prayer groups and weekly fellowships serving the Tamil community residing in the emirate of Umm Al Quwain, ensuring they are plugged in.',
          leader: 'Bro. Joshua George',
          schedule: 'Thursdays at 8:00 PM',
          category: 'Regional',
          image_url: '/images/banner2.jpg'
        },
        {
          name: 'Women’s Ministry',
          description: 'Empowering sisters through intense prayer circles, home-to-home visitations, charitable outreach, and the weekly Tuesday Sisters Fellowship.',
          leader: 'Sis. Mary Immanuel',
          schedule: 'Tuesdays at 10:00 AM',
          category: 'Fellowship',
          image_url: '/images/banner20.jpg'
        }
      ];

      for (const min of defaultMinistries) {
        await db.runAsync(`INSERT INTO ministries (name, description, leader, schedule, category, image_url) VALUES (?, ?, ?, ?, ?, ?)`,
          [min.name, min.description, min.leader, min.schedule, min.category, min.image_url]
        );
      }
      console.log('10 Ministries seeded successfully.');
    }

    // 5. Seed Services (YouTube Sermon caches) if empty
    const servCount = await db.getAsync(`SELECT COUNT(*) as count FROM services`);
    if (servCount.count === 0) {
      await db.runAsync(`INSERT INTO services (title, description, youtube_video_id, category, duration, upload_date, preacher, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['15/2/26 | SUNDAY SERVICE | Worship: Bro.Durai | PERFECT PEACE : Asst.Past.Paulsamy', 'Sunday Service live recording from Assemblies of God Sharjah Tamil Church. Special message on Perfect Peace by Asst. Past. Paulsamy, with worship led by Bro. Durai.', 'H4gf7y5mvlM', 'Sunday Service', '2:15:30', '2026-02-15', 'Asst. Past. Paulsamy', 450]
      );
      await db.runAsync(`INSERT INTO services (title, description, youtube_video_id, category, duration, upload_date, preacher, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['12/02/26 | THURSDAY SERVICE | Worship: Bro. Babu | “Strength For a New Season”: Bro. Raskin', 'Thursday Service recording from Assemblies of God Sharjah Tamil Church. Bro. Raskin shares a powerful message on "Strength for a New Season". Worship led by Bro. Babu.', 'fBUkKrNagaE', 'Thursday Service', '1:48:15', '2026-02-12', 'Bro. Raskin', 320]
      );
      await db.runAsync(`INSERT INTO services (title, description, youtube_video_id, category, duration, upload_date, preacher, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['08/2/26 | SUNDAY SERVICE | Worship: Bro.William | Seed and its Results : Rev.Andrew', 'Sunday Worship Service. Rev. Andrew preaches on "Seed and its Results". Worship led by Bro. William.', 'nNqM7otHQ1o', 'Sunday Service', '2:05:40', '2026-02-08', 'Rev. Andrew', 380]
      );
      await db.runAsync(`INSERT INTO services (title, description, youtube_video_id, category, duration, upload_date, preacher, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['05/02/26 | THURSDAY SERVICE | Worship: Br.Dinakar | “Doors only God can Open”: Br.Jeyaraj', 'Thursday Midweek Service at AGSTC. Br. Jeyaraj preaches on "Doors only God can Open". Worship led by Br. Dinakar.', 'YEgSpruVq2M', 'Thursday Service', '1:52:10', '2026-02-05', 'Br. Jeyaraj', 290]
      );
      await db.runAsync(`INSERT INTO services (title, description, youtube_video_id, category, duration, upload_date, preacher, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['01/2/26 | SUNDAY SERVICE | Wor: Pas.Andrew | 5 Steps for a victorious life of faith: Pas.Immanuel', 'Sunday Service recording. Senior Pastor Immanuel preaches on "5 Steps for a Victorious Life of Faith". Worship led by Pastor Andrew.', 'spzGzjM48lc', 'Sunday Service', '2:22:15', '2026-02-01', 'Pastor Immanuel', 510]
      );
      await db.runAsync(`INSERT INTO services (title, description, youtube_video_id, category, duration, upload_date, preacher, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['23/01/26 | Thursday | Worship: Bro. Augustin | Claiming God\'s Promise | Message: Pastor. Regilin', 'Thursday service recording from Assemblies of God Sharjah Tamil Church. Pastor Regilin shares a message on "Claiming God\'s Promise". Worship led by Bro. Augustin.', '_3Xy8ASnk3Y', 'Thursday Service', '2:10:00', '2026-01-23', 'Pastor Regilin', 430]
      );
      await db.runAsync(`INSERT INTO services (title, description, youtube_video_id, category, duration, upload_date, preacher, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['01/01/26 | NEW YEAR SERVICE | Worship: Bro. Qubert | Message | Pastor.Immanuel', 'New Year Day Special Service at AGSTC. Senior Pastor Immanuel shares the New Year promise and message. Worship led by Bro. Qubert.', 'R9RCFux4S7A', 'New Year Service', '2:45:00', '2026-01-01', 'Pastor Immanuel', 780]
      );
      console.log('Sermon videos seeded.');
    }

    // 6. Seed Testimonies if empty
    const testCount = await db.getAsync(`SELECT COUNT(*) as count FROM testimonies`);
    if (testCount.count === 0) {
      await db.runAsync(`INSERT INTO testimonies (author_name, story_text, category, status) VALUES (?, ?, ?, ?)`,
        ['Bro. Rajkumar', 'After moving to Sharjah and feeling completely isolated, I stepped into AGSTC. The Transport ministry safely brought me in, and the church became my second family. Today, I am deeply blessed spiritually.', 'Transformation', 'Approved']
      );
      await db.runAsync(`INSERT INTO testimonies (author_name, story_text, category, status) VALUES (?, ?, ?, ?)`,
        ['Sis. Priyadarshini', 'I was diagnosed with chronic thyroid complications. Through the continuous prayers of the Tuesday Sisters Fellowship and Jeremiah intercessors, my recent lab tests came back 100% clear. Glory to God!', 'Healing', 'Approved']
      );
      await db.runAsync(`INSERT INTO testimonies (author_name, story_text, category, status) VALUES (?, ?, ?, ?)`,
        ['Bro. John Kennedy', 'I faced heavy financial debts in my UAE logistics venture. Through the counseling and prayers of the church pastors, God restored my business lines, and we signed new contracts last month.', 'Provision', 'Approved']
      );
      console.log('Testimonies seeded.');
    }

    // 7. Seed Devotionals if empty
    const blogCount = await db.getAsync(`SELECT COUNT(*) as count FROM blog_devotionals`);
    if (blogCount.count === 0) {
      await db.runAsync(`INSERT INTO blog_devotionals (title, content, author, category, read_time_minutes) VALUES (?, ?, ?, ?, ?)`,
        [
          'The Promise of Shaddai Security', 
          '\"He who dwells in the secret place of the Most High shall abide under the shadow of the Almighty.\" (Psalm 91:1). In this transient world, especially as many of us live far from our native towns, the shadow of El Shaddai represents absolute protection. The shadow covers us from heat, protects us from spiritual attacks, and wraps us in comfort. Dwell in His presence today through heartfelt prayer, knowing your steps are secure.',
          'Pastor Immanuel', 
          'Daily Promise', 
          4
        ]
      );
      await db.runAsync(`INSERT INTO blog_devotionals (title, content, author, category, read_time_minutes) VALUES (?, ?, ?, ?, ?)`,
        [
          'The Power of Intercession', 
          'Standing in the gap for another is one of the highest priestly privileges a Christian has. Through the Jeremiah ministry, we have seen massive spiritual breakthroughs. When we lift others, our own burdens dissolve in the grace of Christ. Make it a goal to intercede for at least one sibling in faith today.',
          'Bro. Gunaseelan', 
          'Spiritual Growth', 
          3
        ]
      );
      console.log('Devotionals seeded.');
    }

    // 8. Seed Downloadable Resources if empty
    const resCount = await db.getAsync(`SELECT COUNT(*) as count FROM resources`);
    if (resCount.count === 0) {
      await db.runAsync(`INSERT INTO resources (title, description, file_url, file_type, download_count, category) VALUES (?, ?, ?, ?, ?, ?)`,
        ['Alvin Kids Magazine - April 2011', 'Interactive bible lessons, spiritual stories, and puzzle activities for children.', '/resources/Alvin-kids-105-April-2011.pdf', 'PDF', 145, 'Children Corner']
      );
      await db.runAsync(`INSERT INTO resources (title, description, file_url, file_type, download_count, category) VALUES (?, ?, ?, ?, ?, ?)`,
        ['Alvin Kids Magazine - May 2011', 'Spiritual lessons, coloring prompts, and children quiz worksheets.', '/resources/Alvin-kids-106-May2011.PDF', 'PDF', 92, 'Children Corner']
      );
      await db.runAsync(`INSERT INTO resources (title, description, file_url, file_type, download_count, category) VALUES (?, ?, ?, ?, ?, ?)`,
        ['AG Sharjah Devotional Guide - Jan 2011', 'Daily scripture reflections and prayer topics guide for family altars.', '/resources/jan2011.pdf', 'PDF', 204, 'Bible Study']
      );
      await db.runAsync(`INSERT INTO resources (title, description, file_url, file_type, download_count, category) VALUES (?, ?, ?, ?, ?, ?)`,
        ['AG Sharjah Devotional Guide - March 2011', 'Scripture reading guide, fasts devotionals, and prayer points.', '/resources/March _2011_00a03d6c-b047-42a1-9b38-c16c35cdf367.pdf', 'PDF', 88, 'Bible Study']
      );
      await db.runAsync(`INSERT INTO resources (title, description, file_url, file_type, download_count, category) VALUES (?, ?, ?, ?, ?, ?)`,
        ['AG Sharjah Devotional Guide - April 2011', 'Easter season reflection readings and daily devotionals guide.', '/resources/April_2011_6414a890-0e8c-4a2c-baf4-bacf5a1a949b.pdf', 'PDF', 110, 'Bible Study']
      );
      console.log('Download resources seeded.');
    }

    console.log('Database initialization and seeding completed successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
