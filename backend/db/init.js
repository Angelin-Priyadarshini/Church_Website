const db = require('../config/db');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  console.log('Starting database initialization...');

  try {
    // 1. Create Tables
    await db.runAsync(`CREATE TABLE IF NOT EXISTS users (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      name TEXT NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      is_verified INTEGER DEFAULT 0,
      verification_code TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS services (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      youtube_video_id TEXT NOT NULL,
      category VARCHAR(255) DEFAULT 'Main Service',
      duration VARCHAR(50) DEFAULT '1:30:00',
      upload_date TEXT,
      preacher VARCHAR(255) DEFAULT 'Pastor Immanuel',
      view_count INTEGER DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS schedule (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      name TEXT NOT NULL,
      time TEXT NOT NULL,
      location TEXT NOT NULL,
      category TEXT NOT NULL,
      recurrence VARCHAR(50) NOT NULL DEFAULT 'Weekly'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS ministries (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      leader TEXT,
      schedule TEXT,
      category TEXT,
      image_url TEXT,
      gallery_urls TEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    try {
      await db.runAsync(`ALTER TABLE ministries ADD COLUMN gallery_urls TEXT`);
      console.log('Migrated ministries table: added gallery_urls column.');
    } catch (e) {
      // Column already exists, ignore
    }

    await db.runAsync(`CREATE TABLE IF NOT EXISTS prayers (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      request_text TEXT NOT NULL,
      category TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'Pending',
      is_anonymous INTEGER DEFAULT 0,
      user_id INTEGER DEFAULT NULL,
      is_answered INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    // Run Migrations for Users and Prayers columns
    try {
      await db.runAsync(`ALTER TABLE users ADD COLUMN is_verified INTEGER DEFAULT 0`);
      console.log('Migrated users table: added is_verified column.');
    } catch (e) {}
    try {
      await db.runAsync(`ALTER TABLE users ADD COLUMN verification_code TEXT`);
      console.log('Migrated users table: added verification_code column.');
    } catch (e) {}
    try {
      await db.runAsync(`ALTER TABLE prayers ADD COLUMN user_id INTEGER DEFAULT NULL`);
      console.log('Migrated prayers table: added user_id column.');
    } catch (e) {}
    try {
      await db.runAsync(`ALTER TABLE prayers ADD COLUMN is_answered INTEGER DEFAULT 0`);
      console.log('Migrated prayers table: added is_answered column.');
    } catch (e) {}

    // Ensure all pre-existing admin/moderator users are marked as verified
    try {
      await db.runAsync(`UPDATE users SET is_verified = 1 WHERE role IN ('admin', 'moderator')`);
    } catch (e) {}

    await db.runAsync(`CREATE TABLE IF NOT EXISTS events (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      location TEXT NOT NULL,
      image_url TEXT,
      capacity INTEGER DEFAULT 100
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS event_registrations (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      event_id INTEGER NOT NULL,
      attendee_name TEXT NOT NULL,
      attendee_email TEXT NOT NULL,
      attendee_phone TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(event_id) REFERENCES events(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS testimonies (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      author_name TEXT NOT NULL,
      story_text TEXT NOT NULL,
      category VARCHAR(100) DEFAULT 'General',
      video_url TEXT,
      status VARCHAR(50) DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS blog_devotionals (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author VARCHAR(255) DEFAULT 'Pastor Immanuel',
      category VARCHAR(255) DEFAULT 'Daily Promise',
      publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      read_time_minutes INTEGER DEFAULT 3
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS resources (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      file_url TEXT NOT NULL,
      file_type VARCHAR(50) DEFAULT 'PDF',
      download_count INTEGER DEFAULT 0,
      category VARCHAR(255) DEFAULT 'Bible Study'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS about_content (
      \`key\` VARCHAR(100) PRIMARY KEY,
      en_val TEXT NOT NULL,
      ta_val TEXT NOT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS inquiries (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT,
      message TEXT NOT NULL,
      response_text TEXT,
      is_answered INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    // 1.1 New Tables for Advanced Church Portal Features
    await db.runAsync(`CREATE TABLE IF NOT EXISTS quizzes (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      title TEXT NOT NULL,
      duration_seconds INT NOT NULL,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS questions (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      quiz_id INT NOT NULL,
      question_text TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct_option VARCHAR(10) NOT NULL,
      FOREIGN KEY(quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS quiz_scores (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      quiz_id INT NOT NULL,
      score INT NOT NULL,
      total INT NOT NULL,
      completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS newcomers (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      full_name TEXT NOT NULL,
      birthdate TEXT NOT NULL,
      relationship_status VARCHAR(50) NOT NULL,
      wedding_date TEXT,
      mobile TEXT NOT NULL,
      country_code VARCHAR(20) NOT NULL,
      gender VARCHAR(50) NOT NULL,
      location TEXT NOT NULL,
      preferred_language VARCHAR(50) NOT NULL,
      prayer_needs TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS believers (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      full_name TEXT NOT NULL,
      birthdate TEXT NOT NULL,
      relationship_status VARCHAR(50) NOT NULL,
      wedding_date TEXT,
      mobile TEXT NOT NULL,
      gender VARCHAR(50) NOT NULL,
      location TEXT NOT NULL,
      preferred_language VARCHAR(50) NOT NULL,
      age INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

    console.log('Tables created successfully. Seeding initial data...');

    // 2. Seed Users if empty
    const userCount = await db.getAsync(`SELECT COUNT(*) as count FROM users`);
    if (userCount.count === 0) {
      const adminHash = bcrypt.hashSync('password123', 10);
      const modHash = bcrypt.hashSync('password123', 10);
      
      await db.runAsync(`INSERT INTO users (name, email, password_hash, role, is_verified) VALUES (?, ?, ?, ?, ?)`, 
        ['Senior Pastor Tamilselvi', 'tamilselvimariappan@gmail.com', adminHash, 'admin', 1]
      );
      await db.runAsync(`INSERT INTO users (name, email, password_hash, role, is_verified) VALUES (?, ?, ?, ?, ?)`, 
        ['Prayer Coordinator Barathi', 'moderator@agstc.org', modHash, 'moderator', 1]
      );
      console.log('Users seeded successfully: Admin (tamilselvimariappan@gmail.com), Moderator (moderator@agstc.org)');
    } else {
      // Ensure tamilselvimariappan@gmail.com is present and promoted to admin
      const hasTamilAdmin = await db.getAsync(`SELECT * FROM users WHERE email = ?`, ['tamilselvimariappan@gmail.com']);
      if (!hasTamilAdmin) {
        const adminHash = bcrypt.hashSync('password123', 10);
        await db.runAsync(`INSERT INTO users (name, email, password_hash, role, is_verified) VALUES (?, ?, ?, ?, ?)`, 
          ['Senior Pastor Tamilselvi', 'tamilselvimariappan@gmail.com', adminHash, 'admin', 1]
        );
        console.log('Admin tamilselvimariappan@gmail.com seeded successfully.');
      } else {
        await db.runAsync(`UPDATE users SET role = 'admin', is_verified = 1 WHERE email = ?`, ['tamilselvimariappan@gmail.com']);
        console.log('Admin role ensured for tamilselvimariappan@gmail.com.');
      }
      
      // Enforce demotion of the old administrative seed email
      try {
        await db.runAsync(`UPDATE users SET role = 'user' WHERE email = ?`, ['admin@agstc.org']);
      } catch (e) {}
    }

    // Seed default testing accounts for Usher, Data Admin, and Believer if not already present
    const rolesToSeed = [
      { name: 'Default Usher', email: 'usher@agstc.org', role: 'usher' },
      { name: 'Default Data Admin', email: 'dataadmin@agstc.org', role: 'data_admin' },
      { name: 'Default Believer', email: 'believer@agstc.org', role: 'user' }
    ];

    for (const r of rolesToSeed) {
      const userExists = await db.getAsync(`SELECT * FROM users WHERE email = ?`, [r.email]);
      if (!userExists) {
        const passHash = bcrypt.hashSync('password123', 10);
        await db.runAsync(`INSERT INTO users (name, email, password_hash, role, is_verified) VALUES (?, ?, ?, ?, ?)`,
          [r.name, r.email, passHash, r.role, 1]
        );
        console.log(`Seeded testing user: ${r.name} (${r.email}) with role ${r.role}`);
      }
    }


    // 3. Seed Schedule (Reset and seed to ensure updates apply instantly on redeployment)
    await db.runAsync(`DELETE FROM schedule`);
    await db.runAsync(`INSERT INTO schedule (name, time, location, category, recurrence) VALUES (?, ?, ?, ?, ?)`,
      ['Sunday First Service', '06:45 AM - 08:30 AM', 'St. Martin\'s Anglican Church, Sharjah', 'Main Worship', 'Weekly']
    );
    await db.runAsync(`INSERT INTO schedule (name, time, location, category, recurrence) VALUES (?, ?, ?, ?, ?)`,
      ['Sunday Second Service', '09:00 AM - 10:45 AM', 'St. Martin\'s Anglican Church, Sharjah', 'Main Worship', 'Weekly']
    );
    await db.runAsync(`INSERT INTO schedule (name, time, location, category, recurrence) VALUES (?, ?, ?, ?, ?)`,
      ['Sunday School', '09:00 AM - 10:45 AM', 'St. Martin\'s Anglican Church, Sharjah', 'Sunday School', 'Weekly']
    );
    await db.runAsync(`INSERT INTO schedule (name, time, location, category, recurrence) VALUES (?, ?, ?, ?, ?)`,
      ['Sunday Youth Service', '11:15 AM - 12:45 PM', 'St. Martin\'s Anglican Church, Sharjah', 'Youth', 'Weekly']
    );
    await db.runAsync(`INSERT INTO schedule (name, time, location, category, recurrence) VALUES (?, ?, ?, ?, ?)`,
      ['Brothers & Sisters Meeting', '11:15 AM - 12:45 PM', 'St. Martin\'s Anglican Church, Sharjah', 'Fellowship', 'Monthly (2nd Sunday)']
    );
    await db.runAsync(`INSERT INTO schedule (name, time, location, category, recurrence) VALUES (?, ?, ?, ?, ?)`,
      ['Thursday Midweek Service', '08:30 PM - 09:55 PM', 'St. Martin\'s Anglican Church, Sharjah', 'Prayer Meeting', 'Weekly']
    );
    await db.runAsync(`INSERT INTO schedule (name, time, location, category, recurrence) VALUES (?, ?, ?, ?, ?)`,
      ['Saturday Fasting Prayer', '10:00 AM - 12:45 PM', 'St. Martin\'s Anglican Church, Sharjah', 'Prayer Meeting', 'Weekly']
    );
    console.log('Schedules successfully updated and seeded.');

    // 4. Seed Ministries if empty
    const minCount = await db.getAsync(`SELECT COUNT(*) as count FROM ministries`);
    if (minCount.count === 0) {
      const defaultMinistries = [
        {
          name: 'IT & Media Ministry',
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
          description: 'Providing dedicated bus shuttle routes completely free of cost across Sharjah and nearby centers, ensuring every member has safe, reliable transit to services.',
          leader: 'Bro. Stephen Raj',
          schedule: 'Every service transit',
          category: 'Logistics',
          image_url: '/images/banner13.jpg'
        },
        {
          name: 'Women\'s Ministry',
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
        ['12/02/26 | THURSDAY SERVICE | Worship: Bro. Babu | “Strength For a New Season”: Bro. Raskin', 'Thursday Service recording from Assemblies of God Sharjah Tamil Church. Bro. Raskin shares a powerful message on "Strength for a New Season". Worship led by Bro. Babu.', 'fBUkKrNagaE', 'Midweek Prayer', '1:48:15', '2026-02-12', 'Bro. Ruskin', 320]
      );
      await db.runAsync(`INSERT INTO services (title, description, youtube_video_id, category, duration, upload_date, preacher, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['08/2/26 | SUNDAY SERVICE | Worship: Bro.William | Seed and its Results : Rev.Andrew', 'Sunday Worship Service. Rev. Andrew preaches on "Seed and its Results". Worship led by Bro. William.', 'nNqM7otHQ1o', 'Sunday Service', '2:05:40', '2026-02-08', 'Rev. Andrew', 380]
      );
      await db.runAsync(`INSERT INTO services (title, description, youtube_video_id, category, duration, upload_date, preacher, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['05/02/26 | THURSDAY SERVICE | Worship: Br.Dinakar | “Doors only God can Open”: Br.Jeyaraj', 'Thursday Midweek Service at AGSTC. Br. Jeyaraj preaches on "Doors only God can Open". Worship led by Br. Dinakar.', 'YEgSpruVq2M', 'Midweek Prayer', '1:52:10', '2026-02-05', 'Br. Jeyaraj', 290]
      );
      await db.runAsync(`INSERT INTO services (title, description, youtube_video_id, category, duration, upload_date, preacher, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['01/2/26 | SUNDAY SERVICE | Wor: Pas.Andrew | 5 Steps for a victorious life of faith: Pas.Immanuel', 'Sunday Service recording. Senior Pastor Immanuel preaches on "5 Steps for a Victorious Life of Faith". Worship led by Pastor Andrew.', 'spzGzjM48lc', 'Sunday Service', '2:22:15', '2026-02-01', 'Pastor Immanuel', 510]
      );
      await db.runAsync(`INSERT INTO services (title, description, youtube_video_id, category, duration, upload_date, preacher, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['23/01/26 | Thursday | Worship: Bro. Augustin | Claiming God\'s Promise | Message: Pastor. Regilin', 'Thursday service recording from Assemblies of God Sharjah Tamil Church. Pastor Regilin shares a message on "Claiming God\'s Promise". Worship led by Bro. Augustin.', '_3Xy8ASnk3Y', 'Midweek Prayer', '2:10:00', '2026-01-23', 'Pastor Regilin', 430]
      );
      await db.runAsync(`INSERT INTO services (title, description, youtube_video_id, category, duration, upload_date, preacher, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['01/01/26 | NEW YEAR SERVICE | Worship: Bro. Qubert | Message | Pastor.Immanuel', 'New Year Day Special Service at AGSTC. Senior Pastor Immanuel shares the New Year promise and message. Worship led by Bro. Qubert.', 'R9RCFux4S7A', 'New Year Service', '2:45:00', '2026-01-01', 'Pastor Immanuel', 780]
      );
      await db.runAsync(`INSERT INTO services (title, description, youtube_video_id, category, duration, upload_date, preacher, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['28/12/25 | SUNDAY SERVICE | Worship: Bro. Durai | Title: Living in the Light | Pastor Immanuel', 'Sunday worship recording. Pastor Immanuel preaches on living in the light of the Lord. Worship led by Bro. Durai.', 'spzGzjM48lc', 'Sunday Service', '2:10:00', '2025-12-28', 'Pastor Immanuel', 420]
      );
      await db.runAsync(`INSERT INTO services (title, description, youtube_video_id, category, duration, upload_date, preacher, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['25/12/25 | CHRISTMAS SPECIAL SERVICE | Worship: Choir | Message: Pastor Immanuel', 'Christmas Service live recording from Assembly of God Sharjah Tamil Church. Special message on Christ our Hope by Pastor Immanuel.', 'R9RCFux4S7A', 'Christmas Service', '2:30:15', '2025-12-25', 'Pastor Immanuel', 690]
      );
      await db.runAsync(`INSERT INTO services (title, description, youtube_video_id, category, duration, upload_date, preacher, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['21/12/25 | SUNDAY SERVICE | Worship: Bro. Babu | Message: Sis. Mary Immanuel', 'Sunday Tamil Worship. Special message on the Grace of God by Sis. Mary Immanuel. Worship led by Bro. Babu.', '_3Xy8ASnk3Y', 'Sunday Service', '2:02:40', '2025-12-21', 'Sis. Mary Immanuel', 315]
      );
      await db.runAsync(`INSERT INTO services (title, description, youtube_video_id, category, duration, upload_date, preacher, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['14/12/25 | SUNDAY SERVICE | Worship: Bro. William | Message: Rev. Andrew', 'Sunday Service message by Rev. Andrew. Worship led by Bro. William.', 'nNqM7otHQ1o', 'Sunday Service', '1:58:30', '2025-12-14', 'Rev. Andrew', 335]
      );
      await db.runAsync(`INSERT INTO services (title, description, youtube_video_id, category, duration, upload_date, preacher, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['07/12/25 | SUNDAY SERVICE | Worship: Bro. Durai | Message: Asst. Past. Paulsamy', 'Sunday Tamil Service. Special message by Asst. Past. Paulsamy. Worship led by Bro. Durai.', 'H4gf7y5mvlM', 'Sunday Service', '2:05:00', '2025-12-07', 'Asst. Past. Paulsamy', 295]
      );
      await db.runAsync(`INSERT INTO services (title, description, youtube_video_id, category, duration, upload_date, preacher, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['30/11/25 | SUNDAY SERVICE | Worship: Bro. Augustin | Message: Pastor Regilin', 'Sunday worship recording. Pastor Regilin preaches a powerful sermon. Worship led by Bro. Augustin.', '_3Xy8ASnk3Y', 'Sunday Service', '2:08:45', '2025-11-30', 'Pastor Regilin', 280]
      );
      await db.runAsync(`INSERT INTO services (title, description, youtube_video_id, category, duration, upload_date, preacher, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['23/11/25 | SUNDAY SERVICE | Worship: Br. Dinakar | Message: Br. Jeyaraj', 'Sunday worship service recording. Br. Jeyaraj preaches on "Faith that Moves Mountains". Worship led by Br. Dinakar.', 'YEgSpruVq2M', 'Sunday Service', '1:55:00', '2025-11-23', 'Br. Jeyaraj', 260]
      );
      await db.runAsync(`INSERT INTO services (title, description, youtube_video_id, category, duration, upload_date, preacher, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['16/11/25 | SUNDAY SERVICE | Worship: Bro. Qubert | Message: Pastor Immanuel', 'Sunday worship service recording. Senior Pastor Immanuel preaches on "Walking with God". Worship led by Bro. Qubert.', 'spzGzjM48lc', 'Sunday Service', '2:12:30', '2025-11-16', 'Pastor Immanuel', 390]
      );
      await db.runAsync(`INSERT INTO services (title, description, youtube_video_id, category, duration, upload_date, preacher, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['09/11/25 | SUNDAY SERVICE | Worship: Bro. Durai | Message: Bro. Gunaseelan', 'Sunday Worship Service recording. Bro. Gunaseelan shares a powerful message on prayer and intercession. Worship led by Bro. Durai.', 'H4gf7y5mvlM', 'Sunday Service', '1:59:00', '2025-11-09', 'Bro. Gunaseelan', 310]
      );
      await db.runAsync(`INSERT INTO services (title, description, youtube_video_id, category, duration, upload_date, preacher, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['02/11/25 | SUNDAY SERVICE | Worship: Bro. William | Message: Rev. Andrew', 'Sunday Service live recording from Assemblies of God Sharjah Tamil Church. Special message by Rev. Andrew.', 'nNqM7otHQ1o', 'Sunday Service', '2:04:15', '2025-11-02', 'Rev. Andrew', 345]
      );
      await db.runAsync(`INSERT INTO services (title, description, youtube_video_id, category, duration, upload_date, preacher, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['26/10/25 | SUNDAY SERVICE | Worship: Bro. Babu | Message: Asst. Past. Paulsamy', 'Sunday Tamil Worship service. Message on "God\'s Unfailing Promises" by Asst. Past. Paulsamy.', 'fBUkKrNagaE', 'Sunday Service', '1:46:50', '2025-10-26', 'Asst. Past. Paulsamy', 275]
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

    // Seed Events if empty
    const eventCount = await db.getAsync(`SELECT COUNT(*) as count FROM events`);
    if (eventCount.count === 0) {
      await db.runAsync(`INSERT INTO events (title, description, date, time, location, image_url, capacity) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          'Pentecost Power Meeting (பெந்தெகொஸ்தே வல்லமை கூடுகை)',
          'An intense worship experience celebrating the outpouring of the Holy Spirit. Join us for a time of healing, deliverance, and spiritual re-firing. \n\nதூய ஆவியானவரின் அளவற்ற அபிஷேகத்தையும் வல்லமையையும் பெற்றுக்கொள்ளும் எழுப்புதல் மற்றும் விடுதலை கூடுகை. அனைவரும் கலந்து கொண்டு ஆசீர்வதிக்கப்படுங்கள்.',
          '2026-05-31',
          '06:30 PM - 09:30 PM',
          'Sharjah Worship Center Hall A',
          '/images/home-banner1.JPG',
          120
        ]
      );
      await db.runAsync(`INSERT INTO events (title, description, date, time, location, image_url, capacity) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          'Family Blessing Seminar (குடும்ப ஆசீர்வாத கருத்தரங்கு)',
          'A special seminar for couples and youth. Pastor Immanuel will share biblically grounded principles for fostering peaceful homes and strong marriages. \n\nதம்பதியர் மற்றும் வாலிபர்களுக்கான விசேஷ கருத்தரங்கு. சமாதானம் நிறைந்த குடும்பங்களையும் பலமான திருமண வாழ்க்கையையும் உருவாக்க போதகர் இம்மானுவேல் வேதப்பூர்வமான கருத்துக்களைப் பகிர்ந்து கொள்வார்.',
          '2026-06-07',
          '09:00 AM - 12:30 PM',
          'Sharjah Worship Center Hall A',
          '/images/pastor-immanuel.png',
          80
        ]
      );
      await db.runAsync(`INSERT INTO events (title, description, date, time, location, image_url, capacity) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          'Jeremiah Fasting Prayer Crusade',
          'A combined regional intercession assembly gathering intercessors from Sharjah, Ajman, and Umm Al Quwain to stand in the gap for our communities.',
          '2026-06-12',
          '08:00 PM - 10:30 PM',
          'Main Sanctuary Hall B, Sharjah',
          '/images/prayer.jpg',
          150
        ]
      );
      console.log('Default events seeded.');
    }

    // Explicitly guarantee RETREAT 2026 exists
    const retreatExists = await db.getAsync(`SELECT id FROM events WHERE title LIKE '%RETREAT 2026%'`);
    if (!retreatExists) {
      await db.runAsync(`INSERT INTO events (title, description, date, time, location, image_url, capacity) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          'RETREAT 2026 (ரிட்ரீட் 2026)',
          'Join us for an inspiring and spiritually enriching \'RETREAT 2026\' at the elegant St. Mary\'s Hall (St. Martin\'s Anglican Church Campus, Yarmook). We are deeply privileged to have our beloved Senior Pastor Immanuel share an empowering and timely message centered on the foundational Christian family values. Guided by scriptural wisdom, this seminar is designed to cultivate, fortify, and bless the family altar with love, mutual respect, faith, and El Shaddai\'s enduring grace. A delicious take-away lunch will be provided. Come with an expectant heart to be transformed and uplifted! \n\nஎங்கள் அன்பான தலைமை போதகர் இம்மானுவேல் அவர்களால் நடத்தப்படும் \'ரிட்ரீட் 2026\' சிறப்பு ஆராதனையில் பங்குபெற உங்களை அன்போடு அழைக்கிறோம். ஒரு கிறிஸ்தவ குடும்பத்தின் அடிப்படை விழுமியங்கள், தெய்வீக அன்பு, விசுவாசம் மற்றும் கர்த்தருடைய ஆச்சரியமான கிருபையைப் பற்றிய ஒரு எழுப்புதல் செய்தி இக்கூட்டத்தில் வல்லமையோடு பகிர்ந்து கொள்ளப்படும். எடுத்துச் செல்லும் சுவையான மதிய உணவு வழங்கப்படும். உங்கள் குடும்பத்தோடு வந்து தேவ ஆசீர்வாதத்தைப் பெற்றுக்கொள்ளுங்கள்!',
          '2026-05-27',
          '9:00 AM - 1:00 PM',
          'St. Mary\'s Hall, St. Martin\'s Anglican Church Campus, Yarmook',
          '/images/retreat-2026-flyer.jpg',
          450
        ]
      );
      console.log('RETREAT 2026 event successfully seeded.');
    }

    // 9. Seed Dynamic About Us Content if empty
    const aboutCount = await db.getAsync(`SELECT COUNT(*) as count FROM about_content`);
    if (aboutCount.count === 0) {
      const defaultAbout = [
        {
          key: 'aboutHeaderSub',
          en: 'Established by grace as a spiritual refuge for Tamil families in the UAE since 1996.',
          ta: '1996 முதல் ஐக்கிய அரபு அமீரகத்தில் வாழும் தமிழ் குடும்பங்களின் ஆவிக்குரிய புகலிடமாக தேவ கிருபையால் நிறுவப்பட்டது.'
        },
        {
          key: 'aboutTitle',
          en: 'Our Spiritual History',
          ta: 'எமது ஆவிக்குரிய சரித்திரம்'
        },
        {
          key: 'aboutPara1',
          en: 'Assemblies of God Sharjah Tamil Church (AGSTC) was founded with a divine burden to minister to the spiritual and social welfare of the Tamil expatriate workforce residing in Sharjah, Ajman, and nearby emirates.',
          ta: 'ஏஜி ஷார்ஜா தமிழ் சபையானது (AGSTC) ஷார்ஜா, அஜ்மான் மற்றும் அருகில் உள்ள எமிரேட்களில் வசிக்கும் தமிழ் உழைப்பாளர் மக்களின் ஆவிக்குரிய மற்றும் சமூக நலனுக்காக ஊழியங்களைச் செய்ய வேண்டும் என்ற தாளாத பாரத்தோடு துவங்கப்பட்டது.'
        },
        {
          key: 'aboutPara2',
          en: 'What started as a small home cell meeting has blossomed under the dedicated pastoral leadership of Pastor Immanuel into a thriving sanctuary where hundreds of brothers and sisters gather weekly. The church acts as a priestly bridge, providing active transport cells to bring remote labor camp residents into fellowship.',
          ta: 'ஒரு எளிய இல்ல ஜெபக் கூட்டமாகத் துவங்கப்பட்ட இந்த ஐக்கியம், தலைமை போதகர் இம்மானுவேல் அவர்களின் அர்ப்பணிப்புள்ள போதக பராமரிப்பின் கீழ், நூற்றுக்கணக்கான சகோதர சகோதரிகள் கூடி ஆராதிக்கும் ஒரு ஆசீர்வாதமான ஆலயமாக வளர்ந்துள்ளது. தூர முகாம்களில் வசிக்கும் தமிழ் தொழிலாளர்களை ஆராதனைக்கு அழைத்து வர பேருந்து ஊழியத்தின் மூலம் சபை ஒரு பாலமாக செயல்படுகிறது.'
        },
        {
          key: 'aboutMission',
          en: 'Our core mission is to establish peace, counsel, and gospel restoration for everyone walking through our doors.',
          ta: 'எங்கள் ஆலயத்தின் பிரதான நோக்கம் எமது கதவுகளைத் தட்டும் ஒவ்வொரு ஆத்துமாவிற்கும் சமாதானம், ஆவிக்குரிய ஆலோசனை மற்றும் கிறிஸ்துவின் அன்பினால் உண்டாகும் மறுவாழ்வை அளிப்பதே ஆகும்.'
        },
        {
          key: 'aboutImage',
          en: '/images/home-banner1.JPG',
          ta: '/images/home-banner1.JPG'
        },
        {
          key: 'pastorImage',
          en: '/images/pastor-immanuel.png',
          ta: '/images/pastor-immanuel.png'
        },
        {
          key: 'milestones',
          en: JSON.stringify([
            {"year": "1996", "titleEn": "Humble Beginnings", "titleTa": "எளிய ஆரம்பம்", "descEn": "Started as a weekly bilingually home fellowship in Sharjah, with a focus on supporting regional expatriate workers.", "descTa": "ஷார்ஜாவில் ஒரு எளிய இல்ல ஜெபக் கூட்டமாகத் தொடங்கப்பட்டு, தூரதேசத்தில் வாழும் உழைப்பாளர்களை ஆவிக்குரிய ரீதியில் ஆதரிப்பதை நோக்கமாகக் கொண்டு ஆரம்பிக்கப்பட்டது."},
            {"year": "2005", "titleEn": "Transport fleet launched", "titleTa": "போக்குவரத்து சேவை துவக்கம்", "descEn": "Purchased our first shuttle bus to fetch Tamil laborers completely free of charge from far-flung industrial camps.", "descTa": "தொழிலாளர்கள் எவ்வித சிரமமுமின்றி ஆராதனையில் கலந்து கொள்ள தூர முகாம்களில் இருந்து முற்றிலும் இலவசமாக அழைத்து வர முதல் பேருந்து வாங்கப்பட்டது."},
            {"year": "2016", "titleEn": "Regional Branch Network", "titleTa": "கிளை சபைகள் விரிவாக்கம்", "descEn": "Formally established satellite cell fellowships in Ajman and Umm Al Quwain, expanding weekly ministries.", "descTa": "அண்டை எமிரேட்களான அஜ்மான் மற்றும் உம் அல் குவைனில் முறையான கிளை சபை ஐக்கியங்கள் ஏற்படுத்தப்பட்டு வாராந்திர ஊழியங்கள் விரிவுபடுத்தப்பட்டன."}
          ]),
          ta: JSON.stringify([
            {"year": "1996", "titleEn": "Humble Beginnings", "titleTa": "எளிய ஆரம்பம்", "descEn": "Started as a weekly bilingually home fellowship in Sharjah, with a focus on supporting regional expatriate workers.", "descTa": "ஷார்ஜாவில் ஒரு எளிய இல்ல ஜெபக் கூட்டமாகத் தொடங்கப்பட்டு, தூரதேசத்தில் வாழும் உழைப்பாளர்களை ஆவிக்குரிய ரீதியில் ஆதரிப்பதை நோக்கமாகக் கொண்டு ஆரம்பிக்கப்பட்டது."},
            {"year": "2005", "titleEn": "Transport fleet launched", "titleTa": "போக்குவரத்து சேவை துவக்கம்", "descEn": "Purchased our first shuttle bus to fetch Tamil laborers completely free of charge from far-flung industrial camps.", "descTa": "தொழிலாளர்கள் எவ்வித சிரமமுமின்றி ஆராதனையில் கலந்து கொள்ள தூர முகாம்களில் இருந்து முற்றிலும் இலவசமாக அழைத்து வர முதல் பேருந்து வாங்கப்பட்டது."},
            {"year": "2016", "titleEn": "Regional Branch Network", "titleTa": "கிளை சபைகள் விரிவாக்கம்", "descEn": "Formally established satellite cell fellowships in Ajman and Umm Al Quwain, expanding weekly ministries.", "descTa": "அண்டை எமிரேட்களான அஜ்மான் மற்றும் உம் அல் குவைனில் முறையான கிளை சபை ஐக்கியங்கள் ஏற்படுத்தப்பட்டு வாராந்திர ஊழியங்கள் விரிவுபடுத்தப்பட்டன."}
          ])
        },
        {
          key: 'faithStatements',
          en: JSON.stringify([
            {"titleEn": "The Scriptures Inspired", "titleTa": "வேதவசனங்களின் தெய்வீக உத்வேகம்", "descEn": "The Bible is the inspired, infallible Word of God, a divine revelation and the authoritative rule of faith and conduct.", "descTa": "சத்திய வேதாகமம் தேவ ஆவியினால் அருளப்பட்டதும், தவறுகளற்றதும், விசுவாசத்திற்கும் ஜீவியத்திற்கும் அதிகாரம் கொண்ட தேவ வெளிப்பாடாகும்."},
            {"titleEn": "The One True God", "titleTa": "ஒரே மெய்யான தேவன்", "descEn": "The one true God has revealed Himself as the eternally self-existent \"I AM,\" the Creator of heaven and earth, manifested as Father, Son, and Holy Spirit.", "descTa": "ஒரே மெய்யான தேவன் தம்மை நித்திய சுயம்புவாகிய \"நான் இருக்கிறவராக இருக்கிறேன்\" என்றும், வானத்தையும் பூமியையும் படைத்த சிருஷ்டிகராகவும், பிதா, குமாரன், பரிசுத்த ஆவியாக வெளிப்படுத்தியுள்ளார்."},
            {"titleEn": "Salvation of Man", "titleTa": "மனிதனின் இரட்சிப்பு", "descEn": "Man's only hope of redemption is through the shed blood of Jesus Christ the Son of God, received by faith and repentance.", "descTa": "தேவ குமாரனாகிய இயேசு கிறிஸ்துவின் சிந்தப்பட்ட இரத்தத்தின் மூலமே மனிதனுக்கு மீட்பு உண்டு, இது விசுவாசத்தாலும் மனந்திரும்புதலாலும் பெறப்படுகிறது."},
            {"titleEn": "Baptism in the Holy Spirit", "titleTa": "பரிசுத்த ஆவியின் அபிஷேகம்", "descEn": "All believers are entitled to and should ardently expect the promise of the Father, the baptism in the Holy Spirit, which gives power for life and service.", "descTa": "விசுவாசிகள் அனைவரும் பிதாவின் வாக்குத்தத்தமாகிய பரிசுத்த ஆவியின் அபிஷேகத்தை ஆவலோடு எதிர்பார்க்க வேண்டும், இது கிறிஸ்தவ ஜீவியத்திற்கும் ஊழியத்திற்கும் வல்லமையளிக்கிறது."}
          ]),
          ta: JSON.stringify([
            {"titleEn": "The Scriptures Inspired", "titleTa": "வேதவசனங்களின் தெய்வீக உத்வேகம்", "descEn": "The Bible is the inspired, infallible Word of God, a divine revelation and the authoritative rule of faith and conduct.", "descTa": "சத்திய வேதாகமம் தேவ ஆவியினால் அருளப்பட்டதும், தவறுகளற்றதும், விசுவாசத்திற்கும் ஜீவியத்திற்கும் அதிகாரம் கொண்ட தேவ வெளிப்பாடாகும்."},
            {"titleEn": "The One True God", "titleTa": "ஒரே மெய்யான தேவன்", "descEn": "The one true God has revealed Himself as the eternally self-existent \"I AM,\" the Creator of heaven and earth, manifested as Father, Son, and Holy Spirit.", "descTa": "ஒரே மெய்யான தேவன் தம்மை நித்திய சுயம்புவாகிய \"நான் இருக்கிறவராக இருக்கிறேன்\" என்றும், வானத்தையும் பூமியையும் படைத்த சிருஷ்டிகராகவும், பிதா, குமாரன், பரிசுத்த ஆவியாக வெளிப்படுத்தியுள்ளார்."},
            {"titleEn": "Salvation of Man", "titleTa": "மனிதனின் இரட்சிப்பு", "descEn": "Man's only hope of redemption is through the shed blood of Jesus Christ the Son of God, received by faith and repentance.", "descTa": "தேவ குமாரனாகிய இயேசு கிறிஸ்துவின் சிந்தப்பட்ட இரத்தத்தின் மூலமே மனிதனுக்கு மீட்பு உண்டு, இது விசுவாசத்தாலும் மனந்திரும்புதலாலும் பெறப்படுகிறது."},
            {"titleEn": "Baptism in the Holy Spirit", "titleTa": "பரிசுத்த ஆவியின் அபிஷேகம்", "descEn": "All believers are entitled to and should ardently expect the promise of the Father, the baptism in the Holy Spirit, which gives power for life and service.", "descTa": "விசுவாசிகள் அனைவரும் பிதாவின் வாக்குத்தத்தமாகிய பரிசுத்த ஆவியின் அபிஷேகத்தை ஆவலோடு எதிர்பார்க்க வேண்டும், இது கிறிஸ்தவ ஜீவியத்திற்கும் ஊழியத்திற்கும் வல்லமையளிக்கிறது."}
          ])
        },
        {
          key: 'welcomeTitle',
          en: 'Welcome to AG Sharjah Tamil Church',
          ta: 'ஆலயத்திற்கு அன்புடன் வரவேற்கிறோம் - ஏஜி ஷார்ஜா தமிழ் சபை'
        },
        {
          key: 'welcomeSubtitle',
          en: 'A place of peace, comfort, and spiritual harmony. We invite you to experience the grace of God Shaddai in our bilingually fellowship.',
          ta: 'A place of peace, comfort, and spiritual harmony. We invite you to experience the grace of God Shaddai in our bilingually fellowship.'
        },
        {
          key: 'pastorName',
          en: 'Senior Pastor Immanuel',
          ta: 'தலைமை போதகர் இம்மானுவேல்'
        },
        {
          key: 'pastorMessageTitle',
          en: 'Pastoral Message',
          ta: 'போதகரின் செய்தி'
        },
        {
          key: 'pastorMessageText',
          en: 'We welcome you to this website in the most precious name of our Lord and savior Jesus Christ. Our Lord by His amazing grace has established AG Sharjah Tamil Church as a place of peace, comfort and harmony for His children who are residing away from their family and friends. Lord has blessed this Church as an instrument to spread the love of Christ amongst the people here, especially who belong to the Tamil community. AGSTC acts as a ladder through which we could reach greater heights in our spiritual life by growing in the knowledge of Christ, fellowshipping with Him and worshiping Him with an upright heart.',
          ta: 'நம்முடைய கர்த்தரும் இரட்சகருமாகிய இயேசு கிறிஸ்துவின் மகா பிரசன்னமுள்ள நாமத்தில் உங்களை இந்த இணையதளத்திற்கு அன்போடு வரவேற்கிறோம். நமது கர்த்தர் தமது ஆச்சரியமான கிருபையினால் ஏஜி ஷார்ஜா தமிழ் சபையை குடும்பங்களையும் நண்பர்களையும் பிரிந்து வாழும் தேவ பிள்ளைகளுக்கு ஒரு புகலிடமாகவும் சமாதானத்தின் இடமாகவும் ஏற்படுத்தியுள்ளார். கர்த்தர் இந்த சபையை குறிப்பாக தமிழ் மக்கள் மத்தியில் கிறிஸ்துவின் அன்பை பரப்புவதற்கான ஒரு கருவியாக ஆசீர்வதித்துள்ளார். கிறிஸ்துவின் அறிவிலும், அவரோடு ஐக்கியப்படுவதிலும், உத்தம இருதயத்தோடு அவரை ஆராதிப்பதிலும் நமது ஆவிக்குரிய வாழ்க்கையில் நாம் முன்னேற ஏஜிஎஸ்டிசி ஒரு ஏணியாக செயல்படுகிறது.'
        },
        {
          key: 'heroTitle1',
          en: 'Experience Spiritual Sanctuary',
          ta: 'தேவனுடைய மகிமையான பிரசன்னத்தை அநுபவியுங்கள்'
        },
        {
          key: 'heroSub1',
          en: 'A Tamil Assembly dedicated to deep spiritual grounding, active local cell fellowship, and sincere praise in Sharjah.',
          ta: 'இந்த ஞாயிற்றுக்கிழமை எங்களோடு கூடி ஆராதித்து, எல்லாக் புத்திக்கும் மேலான சமாதானத்தைப் பெற்றுக் கொள்ளுங்கள்.'
        },
        {
          key: 'heroTitle2',
          en: 'We Stand in Prayer With You',
          ta: 'ஒருமனப்பட்ட ஜெபத்தின் வல்லமை'
        },
        {
          key: 'heroSub2',
          en: 'The Jeremiah Ministry and Sister circles are interceding daily. Submit your prayer requests anonymously or publicly.',
          ta: 'உங்கள் ஜெப விண்ணப்பங்களை எங்களுக்கு அனுப்பி, எங்கள் ஜெபவீரர்களோடு இணைந்து ஜெபியுங்கள்.'
        },
        {
          key: 'heroTitle3',
          en: 'Weekly Fellowship Assemblies',
          ta: 'செழித்தோங்க நாட்டப்பட்டவர்கள்'
        },
        {
          key: 'heroSub3',
          en: 'Join our regional prayer groups and weekly services in Sharjah, Ajman, and Umm Al Quwain. Safe transport shuttles are provided.',
          ta: 'ஒவ்வொரு வயதினரையும் ஆவிக்குரிய ரீதியில் வளர்க்கும் எங்களின் துடிப்பான ஊழியங்களை கண்டறியுங்கள்.'
        },
        {
          key: 'aboutImages',
          en: JSON.stringify(['/images/home-banner1.JPG', '/images/prayer.jpg', '/images/banner1.jpg']),
          ta: JSON.stringify(['/images/home-banner1.JPG', '/images/prayer.jpg', '/images/banner1.jpg'])
        }
      ];

      for (const item of defaultAbout) {
        await db.runAsync(`INSERT INTO about_content (\`key\`, en_val, ta_val) VALUES (?, ?, ?)`,
          [item.key, item.en, item.ta]
        );
      }
      console.log('About us content seeded successfully.');
    } else {
      // Ensure milestones, faithStatements, and aboutImage exist for migrated existing databases
      const keysToCheck = [
        'aboutImage', 'pastorImage', 'milestones', 'faithStatements',
        'welcomeTitle', 'welcomeSubtitle', 'pastorName', 'pastorMessageTitle',
        'pastorMessageText', 'heroTitle1', 'heroSub1', 'heroTitle2', 'heroSub2',
        'heroTitle3', 'heroSub3', 'aboutImages'
      ];
      for (const key of keysToCheck) {
        const exists = await db.getAsync(`SELECT \`key\` FROM about_content WHERE \`key\` = ?`, [key]);
        if (!exists) {
          let enVal = '';
          let taVal = '';
          if (key === 'aboutImage') {
            enVal = '/images/home-banner1.JPG';
            taVal = '/images/home-banner1.JPG';
          } else if (key === 'pastorImage') {
            enVal = '/images/pastor-immanuel.png';
            taVal = '/images/pastor-immanuel.png';
          } else if (key === 'milestones') {
            enVal = JSON.stringify([
              {"year": "1996", "titleEn": "Humble Beginnings", "titleTa": "எளிய ஆரம்பம்", "descEn": "Started as a weekly bilingually home fellowship in Sharjah, with a focus on supporting regional expatriate workers.", "descTa": "ஷார்ஜாவில் ஒரு எளிய இல்ல ஜபக் கூட்டமாகத் தொடங்கப்பட்டு, தூரதேசத்தில் வாழும் உழைப்பாளர்களை ஆவிக்குரிய ரீதியில் ஆதரிப்பதை நோக்கமாகக் கொண்டு ஆரம்பிக்கப்பட்டது."},
              {"year": "2005", "titleEn": "Transport fleet launched", "titleTa": "போக்குவரத்து சேவை துவக்கம்", "descEn": "Purchased our first shuttle bus to fetch Tamil laborers completely free of charge from far-flung industrial camps.", "descTa": "தொழிலாளர்கள் எவ்வித சிரமமுமின்றி ஆராதனையில் கலந்து கொள்ள தூர முகாம்களில் இருந்து முற்றிலும் இலவசமாக அழைத்து வர முதல் பேருந்து வாங்கப்பட்டது."},
              {"year": "2016", "titleEn": "Regional Branch Network", "titleTa": "கிளை சபைகள் விரிவாக்கம்", "descEn": "Formally established satellite cell fellowships in Ajman and Umm Al Quwain, expanding weekly ministries.", "descTa": "அண்டை எமிரேட்களான அஜ்மான் மற்றும் உம் அல் குவைனில் முறையான கிளை சபை ஐக்கியங்கள் ஏற்படுத்தப்பட்டு வாராந்திர ஊழியங்கள் விரிவுபடுத்தப்பட்டன."}
            ]);
            taVal = enVal;
          } else if (key === 'faithStatements') {
            enVal = JSON.stringify([
              {"titleEn": "The Scriptures Inspired", "titleTa": "வேதவசனங்களின் தெய்வீக உத்வேகம்", "descEn": "The Bible is the inspired, infallible Word of God, a divine revelation and the authoritative rule of faith and conduct.", "descTa": "சத்திய வேதாகமம் தேவ ஆவியினால் அருளப்பட்டதும், தவறுகளற்றதும், விசுவாசத்திற்கும் ஜீவியத்திற்கும் அதிகாரம் கொண்ட தேவ வெளிப்பாடாகும்."},
              {"titleEn": "The One True God", "titleTa": "ஒரே மெய்யான தேவன்", "descEn": "The one true God has revealed Himself as the eternally self-existent \"I AM,\" the Creator of heaven and earth, manifested as Father, Son, and Holy Spirit.", "descTa": "ஒரே மெய்யான தேவன் தம்மை நித்திய சுயம்புவாகிய \"நான் இருக்கிறவராக இருக்கிறேன்\" என்றும், வானத்தையும் பூமியையும் படைத்த சிருஷ்டிகராகவும், பிதா, குமாரன், பரிசுத்த ஆவியாக வெளிப்படுத்தியுள்ளார்."},
              {"titleEn": "Salvation of Man", "titleTa": "மனிதனின் இரட்சிப்பு", "descEn": "Man's only hope of redemption is through the shed blood of Jesus Christ the Son of God, received by faith and repentance.", "descTa": "தேவ குமாரனாகிய இயேசு கிறிஸ்துவின் சிந்தப்பட்ட இரத்தத்தின் மூலமே மனிதனுக்கு மீட்பு உண்டு, இது விசுவாசத்தாலும் மனந்திரும்புதலாலும் பெறப்படுகிறது."},
              {"titleEn": "Baptism in the Holy Spirit", "titleTa": "பரிசுத்த ஆவியின் அபிஷேகம்", "descEn": "All believers are entitled to and should ardently expect the promise of the Father, the baptism in the Holy Spirit, which gives power for life and service.", "descTa": "விசுவாசிகள் அனைவரும் பிதாவின் வாக்குத்தத்தமாகிய பரிசுத்த ஆவியின் அபிஷேகத்தை ஆவலோடு எதிர்பார்க்க வேண்டும், இது கிறிஸ்தவ ஜீவியத்திற்கும் ஊழியத்திற்கும் வல்லமையளிக்கிறது."}
            ]);
            taVal = enVal;
          } else if (key === 'welcomeTitle') {
            enVal = 'Welcome to AG Sharjah Tamil Church';
            taVal = 'ஆலயத்திற்கு அன்புடன் வரவேற்கிறோம் - ஏஜி ஷார்ஜா தமிழ் சபை';
          } else if (key === 'welcomeSubtitle') {
            enVal = 'A place of peace, comfort, and spiritual harmony. We invite you to experience the grace of God Shaddai in our bilingually fellowship.';
            taVal = 'A place of peace, comfort, and spiritual harmony. We invite you to experience the grace of God Shaddai in our bilingually fellowship.';
          } else if (key === 'pastorName') {
            enVal = 'Senior Pastor Immanuel';
            taVal = 'தலைமை போதகர் இம்மானுவேல்';
          } else if (key === 'pastorMessageTitle') {
            enVal = 'Pastoral Message';
            taVal = 'போதகரின் செய்தி';
          } else if (key === 'pastorMessageText') {
            enVal = 'We welcome you to this website in the most precious name of our Lord and savior Jesus Christ. Our Lord by His amazing grace has established AG Sharjah Tamil Church as a place of peace, comfort and harmony for His children who are residing away from their family and friends. Lord has blessed this Church as an instrument to spread the love of Christ amongst the people here, especially who belong to the Tamil community. AGSTC acts as a ladder through which we could reach greater heights in our spiritual life by growing in the knowledge of Christ, fellowshipping with Him and worshiping Him with an upright heart.';
            taVal = 'நம்முடைய கர்த்தரும் இரட்சகருமாகிய இயேசு கிறிஸ்துவின் மகா பிரசன்னமுள்ள நாமத்தில் உங்களை இந்த இணையதளத்திற்கு அன்போடு வரவேற்கிறோம். நமது கர்த்தர் தமது ஆச்சரியமான கிருபையினால் ஏஜி ஷார்ஜா தமிழ் சபையை குடும்பங்களையும் நண்பர்களையும் பிரிந்து வாழும் தேவ பிள்ளைகளுக்கு ஒரு புகலிடமாகவும் சமாதானத்தின் இடமாகவும் ஏற்படுத்தியுள்ளார். கர்த்தர் இந்த சபையை குறிப்பாக தமிழ் மக்கள் மத்தியில் கிறிஸ்துவின் அன்பை பரப்புவதற்கான ஒரு கருவியாக ஆசீர்வதித்துள்ளார். கிறிஸ்துவின் அறிவிலும், அவரோடு ஐக்கியப்படுவதிலும், உத்தம இருதயத்தோடு அவரை ஆராதிப்பதிலும் நமது ஆவிக்குரிய வாழ்க்கையில் நாம் முன்னேற ஏஜிஎஸ்டிசி ஒரு ஏணியாக செயல்படுகிறது.';
          } else if (key === 'heroTitle1') {
            enVal = 'Experience Spiritual Sanctuary';
            taVal = 'தேவனுடைய மகிமையான பிரசன்னத்தை அநுபவியுங்கள்';
          } else if (key === 'heroSub1') {
            enVal = 'A Tamil Assembly dedicated to deep spiritual grounding, active local cell fellowship, and sincere praise in Sharjah.';
            taVal = 'இந்த ஞாயிற்றுக்கிழமை எங்களோடு கூடி ஆராதித்து, எல்லாக் புத்திக்கும் மேலான சமாதானத்தைப் பெற்றுக் கொள்ளுங்கள்.';
          } else if (key === 'heroTitle2') {
            enVal = 'We Stand in Prayer With You';
            taVal = 'ஒருமனப்பட்ட ஜெபத்தின் வல்லமை';
          } else if (key === 'heroSub2') {
            enVal = 'The Jeremiah Ministry and Sister circles are interceding daily. Submit your prayer requests anonymously or publicly.';
            taVal = 'உங்கள் ஜெப விண்ணப்பங்களை எங்களுக்கு அனுப்பி, எங்கள் ஜெபவீரர்களோடு இணைந்து ஜெபியுங்கள்.';
          } else if (key === 'heroTitle3') {
            enVal = 'Weekly Fellowship Assemblies';
            taVal = 'செழித்தோங்க நாட்டப்பட்டவர்கள்';
          } else if (key === 'heroSub3') {
            enVal = 'Join our regional prayer groups and weekly services in Sharjah, Ajman, and Umm Al Quwain. Safe transport shuttles are provided.';
            taVal = 'ஒவ்வொரு வயதினரையும் ஆவிக்குரிய ரீதியில் வளர்க்கும் எங்களின் துடிப்பான ஊழியங்களை கண்டறியுங்கள்.';
          } else if (key === 'aboutImages') {
            enVal = JSON.stringify(['/images/home-banner1.JPG', '/images/prayer.jpg', '/images/banner1.jpg']);
            taVal = enVal;
          }
          await db.runAsync(`INSERT INTO about_content (\`key\`, en_val, ta_val) VALUES (?, ?, ?)`, [key, enVal, taVal]);
        }
      }
    }

    // RUN MIGRATIONS & CLEANUP ACTIONS FOR EXISTING DATABASES
    console.log('Running startup cleanup & migration scripts...');
    
    // 1. Purge regional cell services and ministries
    await db.runAsync(`DELETE FROM schedule WHERE name LIKE '%Ajman%' OR name LIKE '%Umm Al Quwain%' OR name LIKE '%UAQ%' OR location LIKE '%Ajman%' OR location LIKE '%Umm Al Quwain%'`);
    await db.runAsync(`DELETE FROM ministries WHERE name LIKE '%Ajman%' OR name LIKE '%Umm Al Quwain%' OR name LIKE '%UMM-AL-QUWAIN%'`);
    
    // 2. Rename Audio & Video Ministry to IT & Media Ministry bilingually
    await db.runAsync(`UPDATE ministries SET name = 'IT & Media Ministry', description = 'Technical stewards orchestrating live streaming broadcasts, acoustics, video recording, and post-production logic to publish sermons on the YouTube channel.' WHERE name = 'Audio & Video Ministry'`);
    
    // 3. Remove regional references from other ministry descriptions
    await db.runAsync(`UPDATE ministries SET description = 'Providing dedicated bus shuttle routes completely free of cost across Sharjah and nearby centers, ensuring every member has safe, reliable transit to services.' WHERE name = 'Transport Ministry'`);
    
    // 4. Update Fasting Prayer and other events description regional mentions
    await db.runAsync(`UPDATE events SET description = 'A combined regional intercession assembly gathering intercessors across Sharjah and neighboring emirates to stand in the gap for our communities.' WHERE title LIKE '%Jeremiah Fasting Prayer Crusade%'`);
    
    // 5. Update about content regional references
    await db.runAsync(`UPDATE about_content SET en_val = 'Assemblies of God Sharjah Tamil Church (AGSTC) was founded with a divine burden to minister to the spiritual and social welfare of the Tamil expatriate workforce residing in Sharjah and nearby emirates.', ta_val = 'ஏஜி ஷார்ஜா தமிழ் சபையானது (AGSTC) ஷார்ஜா மற்றும் அருகில் உள்ள எமிரேட்களில் வசிக்கும் தமிழ் உழைப்பாளர் மக்களின் ஆவிக்குரிய மற்றும் சமூக நலனுக்காக ஊழியங்களைச் செய்ய வேண்டும் என்ற தாளாத பாரத்தோடு துவங்கப்பட்டது.' WHERE \`key\` = 'aboutPara1'`);
    
    const updatedMilestonesJson = JSON.stringify([
      {"year": "1996", "titleEn": "Humble Beginnings", "titleTa": "எளிய ஆரம்பம்", "descEn": "Started as a weekly bilingually home fellowship in Sharjah, with a focus on supporting regional expatriate workers.", "descTa": "ஷார்ஜாவில் ஒரு எளிய இல்ல ஜேபக் கூட்டமாகத் தொடங்கப்பட்டு, தூரதேசத்தில் வாழும் உழைப்பாளர்களை ஆவிக்குரிய ரீதியில் ஆதரிப்பதை நோக்கமாகக் கொண்டு ஆரம்பிக்கப்பட்டது."},
      {"year": "2005", "titleEn": "Transport fleet launched", "titleTa": "போக்குவரத்து சேவை துவக்கம்", "descEn": "Purchased our first shuttle bus to fetch Tamil laborers completely free of charge from far-flung industrial camps.", "descTa": "தொழிலாளர்கள் எவ்வித சிரமமுமின்றி ஆராதனையில் கலந்து கொள்ள தூர முகாம்களில் இருந்து முற்றிலும் இலவசமாக அழைத்து வர முதல் பேருந்து வாங்கப்பட்டது."},
      {"year": "2016", "titleEn": "Expanded Cell Fellowships", "titleTa": "வீட்டு ஐக்கியங்கள் விரிவாக்கம்", "descEn": "Formally established regional cell fellowships to expand weekly home ministries across neighboring communities.", "descTa": "அண்டை பகுதிகளில் முறையான வாராந்திர வீட்டு ஐக்கியங்கள் மற்றும் ஜெபக் குழுக்கள் ஏற்படுத்தப்பட்டு ஊழியங்கள் விரிவுபடுத்தப்பட்டன."}
    ]);
    await db.runAsync(`UPDATE about_content SET en_val = ?, ta_val = ? WHERE \`key\` = 'milestones'`, [updatedMilestonesJson, updatedMilestonesJson]);
    
    await db.runAsync(`UPDATE about_content SET en_val = 'Join our regional prayer groups and weekly services in Sharjah. Safe transport shuttles are provided.', ta_val = 'ஷார்ஜாவில் நடைபெறும் எங்களது வாராந்திர ஆராதனைகள் மற்றும் ஜெபக் கூட்டங்களில் இணைந்து கொள்ளுங்கள். இலவச போக்குவரத்து வசதியுண்டு.' WHERE \`key\` = 'heroSub3'`);

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
