const db = require('../config/db');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  console.log('Starting database initialization...');

  try {
    // 1. Create Tables (MySQL syntax)
    await db.runAsync(`CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      is_verified TINYINT(1) DEFAULT 0,
      verification_code VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS services (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      youtube_video_id VARCHAR(255) NOT NULL,
      category VARCHAR(255) DEFAULT 'Main Service',
      duration VARCHAR(50) DEFAULT '1:30:00',
      upload_date VARCHAR(50),
      preacher VARCHAR(255) DEFAULT 'Pastor Immanuel',
      view_count INT DEFAULT 0
    )`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS schedule (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      time VARCHAR(255) NOT NULL,
      location VARCHAR(500) NOT NULL,
      category VARCHAR(255) NOT NULL,
      recurrence VARCHAR(255) NOT NULL DEFAULT 'Weekly'
    )`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS ministries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      leader VARCHAR(255),
      schedule VARCHAR(255),
      category VARCHAR(255),
      image_url VARCHAR(500),
      gallery_urls TEXT
    )`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS prayers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      request_text TEXT NOT NULL,
      category VARCHAR(255) NOT NULL,
      status VARCHAR(50) DEFAULT 'Pending',
      is_anonymous TINYINT(1) DEFAULT 0,
      user_id INT DEFAULT NULL,
      is_answered TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      date VARCHAR(50) NOT NULL,
      time VARCHAR(100) NOT NULL,
      location VARCHAR(500) NOT NULL,
      image_url VARCHAR(500),
      capacity INT DEFAULT 100
    )`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS event_registrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_id INT NOT NULL,
      attendee_name VARCHAR(255) NOT NULL,
      attendee_email VARCHAR(255) NOT NULL,
      attendee_phone VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id)
    )`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS testimonies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      author_name VARCHAR(255) NOT NULL,
      story_text TEXT NOT NULL,
      category VARCHAR(255) DEFAULT 'General',
      video_url VARCHAR(500),
      status VARCHAR(50) DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS blog_devotionals (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      content TEXT NOT NULL,
      author VARCHAR(255) DEFAULT 'Pastor Immanuel',
      category VARCHAR(255) DEFAULT 'Daily Promise',
      publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      read_time_minutes INT DEFAULT 3
    )`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS resources (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      file_url VARCHAR(500) NOT NULL,
      file_type VARCHAR(50) DEFAULT 'PDF',
      download_count INT DEFAULT 0,
      category VARCHAR(255) DEFAULT 'Bible Study'
    )`);

    await db.runAsync(`CREATE TABLE IF NOT EXISTS about_content (
      \`key\` VARCHAR(255) PRIMARY KEY,
      en_val TEXT NOT NULL,
      ta_val TEXT NOT NULL
    )`);

    console.log('Tables created successfully. Seeding initial data...');

    // 2. Seed Users if empty
    const userCount = await db.getAsync(`SELECT COUNT(*) as count FROM users`);
    if (userCount.count === 0) {
      const adminHash = bcrypt.hashSync('password123', 10);
      const modHash = bcrypt.hashSync('password123', 10);
      
      await db.runAsync(`INSERT INTO users (name, email, password_hash, role, is_verified) VALUES (?, ?, ?, ?, ?)`, 
        ['Senior Pastor Immanuel', 'admin@agstc.org', adminHash, 'admin', 1]
      );
      await db.runAsync(`INSERT INTO users (name, email, password_hash, role, is_verified) VALUES (?, ?, ?, ?, ?)`, 
        ['Prayer Coordinator Barathi', 'moderator@agstc.org', modHash, 'moderator', 1]
      );
      console.log('Users seeded successfully: Admin (admin@agstc.org), Moderator (moderator@agstc.org)');
    }

    // Ensure all pre-existing admin/moderator users are marked as verified
    try {
      await db.runAsync(`UPDATE users SET is_verified = 1 WHERE role IN ('admin', 'moderator')`);
    } catch (e) {}

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
    await db.runAsync(`INSERT INTO schedule (name, time, location, category, recurrence) VALUES (?, ?, ?, ?, ?)`,
      ['Umm Al Quwain Service', '08:30 PM - 10:00 PM', 'Umm Al Quwain Industrial District', 'Fellowship', 'Weekly']
    );
    console.log('Schedules successfully updated and seeded.');

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
          name: 'Women\u2019s Ministry',
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
        ['12/02/26 | THURSDAY SERVICE | Worship: Bro. Babu | "Strength For a New Season": Bro. Raskin', 'Thursday Service recording from Assemblies of God Sharjah Tamil Church. Bro. Raskin shares a powerful message on "Strength for a New Season". Worship led by Bro. Babu.', 'fBUkKrNagaE', 'Midweek Prayer', '1:48:15', '2026-02-12', 'Bro. Ruskin', 320]
      );
      await db.runAsync(`INSERT INTO services (title, description, youtube_video_id, category, duration, upload_date, preacher, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['08/2/26 | SUNDAY SERVICE | Worship: Bro.William | Seed and its Results : Rev.Andrew', 'Sunday Worship Service. Rev. Andrew preaches on "Seed and its Results". Worship led by Bro. William.', 'nNqM7otHQ1o', 'Sunday Service', '2:05:40', '2026-02-08', 'Rev. Andrew', 380]
      );
      await db.runAsync(`INSERT INTO services (title, description, youtube_video_id, category, duration, upload_date, preacher, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['05/02/26 | THURSDAY SERVICE | Worship: Br.Dinakar | "Doors only God can Open": Br.Jeyaraj', 'Thursday Midweek Service at AGSTC. Br. Jeyaraj preaches on "Doors only God can Open". Worship led by Br. Dinakar.', 'YEgSpruVq2M', 'Midweek Prayer', '1:52:10', '2026-02-05', 'Br. Jeyaraj', 290]
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
          '"He who dwells in the secret place of the Most High shall abide under the shadow of the Almighty." (Psalm 91:1). In this transient world, especially as many of us live far from our native towns, the shadow of El Shaddai represents absolute protection. The shadow covers us from heat, protects us from spiritual attacks, and wraps us in comfort. Dwell in His presence today through heartfelt prayer, knowing your steps are secure.',
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

    // 9. Seed Dynamic About Us Content if empty
    const aboutCount = await db.getAsync('SELECT COUNT(*) as count FROM about_content');
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
          key: 'milestones',
          en: JSON.stringify([
            {"year": "1996", "titleEn": "Humble Beginnings", "titleTa": "\u0b8e\u0bb3\u0bbf\u0baf \u0b86\u0bb0\u0bae\u0bcd\u0baa\u0bae\u0bcd", "descEn": "Started as a weekly bilingually home fellowship in Sharjah, with a focus on supporting regional expatriate workers.", "descTa": "\u0bb7\u0bbe\u0bb0\u0bcd\u0b9c\u0bbe\u0bb5\u0bbf\u0bb2\u0bcd \u0b92\u0bb0\u0bc1 \u0b8e\u0bb3\u0bbf\u0baf \u0b87\u0bb2\u0bcd\u0bb2 \u0b9c\u0bc6\u0baa\u0b95\u0bcd \u0b95\u0bc2\u0b9f\u0bcd\u0b9f\u0bae\u0bbe\u0b95\u0ba4\u0bcd \u0ba4\u0bca\u0b9f\u0b99\u0bcd\u0b95\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f\u0bc1, \u0ba4\u0bc2\u0bb0\u0ba4\u0bc7\u0b9a\u0ba4\u0bcd\u0ba4\u0bbf\u0bb2\u0bcd \u0bb5\u0bbe\u0bb4\u0bc1\u0bae\u0bcd \u0b89\u0bb4\u0bc8\u0baa\u0bcd\u0baa\u0bbe\u0bb3\u0bb0\u0bcd\u0b95\u0bb3\u0bc8 \u0b86\u0bb5\u0bbf\u0b95\u0bcd\u0b95\u0bc1\u0bb0\u0bbf\u0baf \u0bb0\u0bc0\u0ba4\u0bbf\u0baf\u0bbf\u0bb2\u0bcd \u0b86\u0ba4\u0bb0\u0bbf\u0baa\u0bcd\u0baa\u0ba4\u0bc8 \u0ba8\u0bcb\u0b95\u0bcd\u0b95\u0bae\u0bbe\u0b95\u0b95\u0bcd \u0b95\u0bca\u0ba3\u0bcd\u0b9f\u0bc1 \u0b86\u0bb0\u0bae\u0bcd\u0baa\u0bbf\u0b95\u0bcd\u0b95\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f\u0ba4\u0bc1."},
            {"year": "2005", "titleEn": "Transport fleet launched", "titleTa": "\u0baa\u0bcb\u0b95\u0bcd\u0b95\u0bc1\u0bb5\u0bb0\u0ba4\u0bcd\u0ba4\u0bc1 \u0b9a\u0bc7\u0bb5\u0bc8 \u0ba4\u0bc1\u0bb5\u0b95\u0bcd\u0b95\u0bae\u0bcd", "descEn": "Purchased our first shuttle bus to fetch Tamil laborers completely free of charge from far-flung industrial camps.", "descTa": "\u0ba4\u0bca\u0bb4\u0bbf\u0bb2\u0bbe\u0bb3\u0bb0\u0bcd\u0b95\u0bb3\u0bcd \u0b8e\u0bb5\u0bcd\u0bb5\u0bbf\u0ba4 \u0b9a\u0bbf\u0bb0\u0bae\u0bae\u0bc1\u0bae\u0bbf\u0ba9\u0bcd\u0bb1\u0bbf \u0b86\u0bb0\u0bbe\u0ba4\u0ba9\u0bc8\u0baf\u0bbf\u0bb2\u0bcd \u0b95\u0bb2\u0ba8\u0bcd\u0ba4\u0bc1 \u0b95\u0bca\u0bb3\u0bcd\u0bb3 \u0ba4\u0bc2\u0bb0 \u0bae\u0bc1\u0b95\u0bbe\u0bae\u0bcd\u0b95\u0bb3\u0bbf\u0bb2\u0bcd \u0b87\u0bb0\u0bc1\u0ba8\u0bcd\u0ba4\u0bc1 \u0bae\u0bc1\u0bb1\u0bcd\u0bb1\u0bbf\u0bb2\u0bc1\u0bae\u0bcd \u0b87\u0bb2\u0bb5\u0b9a\u0bae\u0bbe\u0b95 \u0b85\u0bb4\u0bc8\u0ba4\u0bcd\u0ba4\u0bc1 \u0bb5\u0bb0 \u0bae\u0bc1\u0ba4\u0bb2\u0bcd \u0baa\u0bc7\u0bb0\u0bc1\u0ba8\u0bcd\u0ba4\u0bc1 \u0bb5\u0bbe\u0b99\u0bcd\u0b95\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f\u0ba4\u0bc1."},
            {"year": "2016", "titleEn": "Regional Branch Network", "titleTa": "\u0b95\u0bbf\u0bb3\u0bc8 \u0b9a\u0baa\u0bc8\u0b95\u0bb3\u0bcd \u0bb5\u0bbf\u0bb0\u0bbf\u0bb5\u0bbe\u0b95\u0bcd\u0b95\u0bae\u0bcd", "descEn": "Formally established satellite cell fellowships in Ajman and Umm Al Quwain, expanding weekly ministries.", "descTa": "\u0b85\u0ba3\u0bcd\u0b9f\u0bc8 \u0b8e\u0bae\u0bbf\u0bb0\u0bc7\u0b9f\u0bcd\u0b95\u0bb3\u0bbe\u0ba9 \u0b85\u0b9c\u0bcd\u0bae\u0bbe\u0ba9\u0bcd \u0bae\u0bb1\u0bcd\u0bb1\u0bc1\u0bae\u0bcd \u0b89\u0bae\u0bcd \u0b85\u0bb2\u0bcd \u0b95\u0bc1\u0bb5\u0bc8\u0ba9\u0bbf\u0bb2\u0bcd \u0bae\u0bc1\u0bb1\u0bc8\u0baf\u0bbe\u0ba9 \u0b95\u0bbf\u0bb3\u0bc8 \u0b9a\u0baa\u0bc8 \u0b90\u0b95\u0bcd\u0b95\u0bbf\u0baf\u0b99\u0bcd\u0b95\u0bb3\u0bcd \u0b8f\u0bb1\u0bcd\u0baa\u0b9f\u0bc1\u0ba4\u0bcd\u0ba4\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f\u0bc1 \u0bb5\u0bbe\u0bb0\u0bbe\u0ba8\u0bcd\u0ba4\u0bbf\u0bb0 \u0b8a\u0bb4\u0bbf\u0baf\u0b99\u0bcd\u0b95\u0bb3\u0bcd \u0bb5\u0bbf\u0bb0\u0bbf\u0bb5\u0bc1\u0baa\u0b9f\u0bc1\u0ba4\u0bcd\u0ba4\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f\u0ba9."}
          ]),
          ta: JSON.stringify([
            {"year": "1996", "titleEn": "Humble Beginnings", "titleTa": "\u0b8e\u0bb3\u0bbf\u0baf \u0b86\u0bb0\u0bae\u0bcd\u0baa\u0bae\u0bcd", "descEn": "Started as a weekly bilingually home fellowship in Sharjah, with a focus on supporting regional expatriate workers.", "descTa": "\u0bb7\u0bbe\u0bb0\u0bcd\u0b9c\u0bbe\u0bb5\u0bbf\u0bb2\u0bcd \u0b92\u0bb0\u0bc1 \u0b8e\u0bb3\u0bbf\u0baf \u0b87\u0bb2\u0bcd\u0bb2 \u0b9c\u0bc6\u0baa\u0b95\u0bcd \u0b95\u0bc2\u0b9f\u0bcd\u0b9f\u0bae\u0bbe\u0b95\u0ba4\u0bcd \u0ba4\u0bca\u0b9f\u0b99\u0bcd\u0b95\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f\u0bc1, \u0ba4\u0bc2\u0bb0\u0ba4\u0bc7\u0b9a\u0ba4\u0bcd\u0ba4\u0bbf\u0bb2\u0bcd \u0bb5\u0bbe\u0bb4\u0bc1\u0bae\u0bcd \u0b89\u0bb4\u0bc8\u0baa\u0bcd\u0baa\u0bbe\u0bb3\u0bb0\u0bcd\u0b95\u0bb3\u0bc8 \u0b86\u0bb5\u0bbf\u0b95\u0bcd\u0b95\u0bc1\u0bb0\u0bbf\u0baf \u0bb0\u0bc0\u0ba4\u0bbf\u0baf\u0bbf\u0bb2\u0bcd \u0b86\u0ba4\u0bb0\u0bbf\u0baa\u0bcd\u0baa\u0ba4\u0bc8 \u0ba8\u0bcb\u0b95\u0bcd\u0b95\u0bae\u0bbe\u0b95\u0b95\u0bcd \u0b95\u0bca\u0ba3\u0bcd\u0b9f\u0bc1 \u0b86\u0bb0\u0bae\u0bcd\u0baa\u0bbf\u0b95\u0bcd\u0b95\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f\u0ba4\u0bc1."},
            {"year": "2005", "titleEn": "Transport fleet launched", "titleTa": "\u0baa\u0bcb\u0b95\u0bcd\u0b95\u0bc1\u0bb5\u0bb0\u0ba4\u0bcd\u0ba4\u0bc1 \u0b9a\u0bc7\u0bb5\u0bc8 \u0ba4\u0bc1\u0bb5\u0b95\u0bcd\u0b95\u0bae\u0bcd", "descEn": "Purchased our first shuttle bus to fetch Tamil laborers completely free of charge from far-flung industrial camps.", "descTa": "\u0ba4\u0bca\u0bb4\u0bbf\u0bb2\u0bbe\u0bb3\u0bb0\u0bcd\u0b95\u0bb3\u0bcd \u0b8e\u0bb5\u0bcd\u0bb5\u0bbf\u0ba4 \u0b9a\u0bbf\u0bb0\u0bae\u0bae\u0bc1\u0bae\u0bbf\u0ba9\u0bcd\u0bb1\u0bbf \u0b86\u0bb0\u0bbe\u0ba4\u0ba9\u0bc8\u0baf\u0bbf\u0bb2\u0bcd \u0b95\u0bb2\u0ba8\u0bcd\u0ba4\u0bc1 \u0b95\u0bca\u0bb3\u0bcd\u0bb3 \u0ba4\u0bc2\u0bb0 \u0bae\u0bc1\u0b95\u0bbe\u0bae\u0bcd\u0b95\u0bb3\u0bbf\u0bb2\u0bcd \u0b87\u0bb0\u0bc1\u0ba8\u0bcd\u0ba4\u0bc1 \u0bae\u0bc1\u0bb1\u0bcd\u0bb1\u0bbf\u0bb2\u0bc1\u0bae\u0bcd \u0b87\u0bb2\u0bb5\u0b9a\u0bae\u0bbe\u0b95 \u0b85\u0bb4\u0bc8\u0ba4\u0bcd\u0ba4\u0bc1 \u0bb5\u0bb0 \u0bae\u0bc1\u0ba4\u0bb2\u0bcd \u0baa\u0bc7\u0bb0\u0bc1\u0ba8\u0bcd\u0ba4\u0bc1 \u0bb5\u0bbe\u0b99\u0bcd\u0b95\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f\u0ba4\u0bc1."},
            {"year": "2016", "titleEn": "Regional Branch Network", "titleTa": "\u0b95\u0bbf\u0bb3\u0bc8 \u0b9a\u0baa\u0bc8\u0b95\u0bb3\u0bcd \u0bb5\u0bbf\u0bb0\u0bbf\u0bb5\u0bbe\u0b95\u0bcd\u0b95\u0bae\u0bcd", "descEn": "Formally established satellite cell fellowships in Ajman and Umm Al Quwain, expanding weekly ministries.", "descTa": "\u0b85\u0ba3\u0bcd\u0b9f\u0bc8 \u0b8e\u0bae\u0bbf\u0bb0\u0bc7\u0b9f\u0bcd\u0b95\u0bb3\u0bbe\u0ba9 \u0b85\u0b9c\u0bcd\u0bae\u0bbe\u0ba9\u0bcd \u0bae\u0bb1\u0bcd\u0bb1\u0bc1\u0bae\u0bcd \u0b89\u0bae\u0bcd \u0b85\u0bb2\u0bcd \u0b95\u0bc1\u0bb5\u0bc8\u0ba9\u0bbf\u0bb2\u0bcd \u0bae\u0bc1\u0bb1\u0bc8\u0baf\u0bbe\u0ba9 \u0b95\u0bbf\u0bb3\u0bc8 \u0b9a\u0baa\u0bc8 \u0b90\u0b95\u0bcd\u0b95\u0bbf\u0baf\u0b99\u0bcd\u0b95\u0bb3\u0bcd \u0b8f\u0bb1\u0bcd\u0baa\u0b9f\u0bc1\u0ba4\u0bcd\u0ba4\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f\u0bc1 \u0bb5\u0bbe\u0bb0\u0bbe\u0ba8\u0bcd\u0ba4\u0bbf\u0bb0 \u0b8a\u0bb4\u0bbf\u0baf\u0b99\u0bcd\u0b95\u0bb3\u0bcd \u0bb5\u0bbf\u0bb0\u0bbf\u0bb5\u0bc1\u0baa\u0b9f\u0bc1\u0ba4\u0bcd\u0ba4\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f\u0ba9."}
          ])
        },
        {
          key: 'faithStatements',
          en: JSON.stringify([
            {"titleEn": "The Scriptures Inspired", "titleTa": "\u0bb5\u0bc7\u0ba4\u0bb5\u0b9a\u0ba9\u0b99\u0bcd\u0b95\u0bb3\u0bbf\u0ba9\u0bcd \u0ba4\u0bc6\u0baf\u0bcd\u0bb5\u0bc0\u0b95 \u0b89\u0ba4\u0bcd\u0bb5\u0bc7\u0b95\u0bae\u0bcd", "descEn": "The Bible is the inspired, infallible Word of God, a divine revelation and the authoritative rule of faith and conduct.", "descTa": "\u0b9a\u0ba4\u0bcd\u0ba4\u0bbf\u0baf \u0bb5\u0bc7\u0ba4\u0bbe\u0b95\u0bae\u0bae\u0bcd \u0ba4\u0bc7\u0bb5 \u0b86\u0bb5\u0bbf\u0baf\u0bbf\u0ba9\u0bbe\u0bb2\u0bcd \u0b85\u0bb0\u0bc1\u0bb3\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f\u0ba4\u0bc1\u0bae\u0bcd, \u0ba4\u0bb5\u0bb1\u0bc1\u0b95\u0bb3\u0bb1\u0bcd\u0bb1\u0ba4\u0bc1\u0bae\u0bcd, \u0bb5\u0bbf\u0b9a\u0bc1\u0bb5\u0bbe\u0b9a\u0ba4\u0bcd\u0ba4\u0bbf\u0bb1\u0bcd\u0b95\u0bc1\u0bae\u0bcd \u0b9c\u0bc0\u0bb5\u0bbf\u0baf\u0ba4\u0bcd\u0ba4\u0bbf\u0bb1\u0bcd\u0b95\u0bc1\u0bae\u0bcd \u0b85\u0ba4\u0bbf\u0b95\u0bbe\u0bb0\u0bae\u0bcd \u0b95\u0bca\u0ba3\u0bcd\u0b9f \u0ba4\u0bc7\u0bb5 \u0bb5\u0bc6\u0bb3\u0bbf\u0baa\u0bcd\u0baa\u0bbe\u0b9f\u0bbe\u0b95\u0bc1\u0bae\u0bcd."},
            {"titleEn": "The One True God", "titleTa": "\u0b92\u0bb0\u0bc7 \u0bae\u0bc6\u0baf\u0bcd\u0baf\u0bbe\u0ba9 \u0ba4\u0bc7\u0bb5\u0ba9\u0bcd", "descEn": "The one true God has revealed Himself as the eternally self-existent \"I AM,\" the Creator of heaven and earth, manifested as Father, Son, and Holy Spirit.", "descTa": "\u0b92\u0bb0\u0bc7 \u0bae\u0bc6\u0baf\u0bcd\u0baf\u0bbe\u0ba9 \u0ba4\u0bc7\u0bb5\u0ba9\u0bcd \u0ba4\u0bae\u0bcd\u0bae\u0bc8 \u0ba8\u0bbf\u0ba4\u0bcd\u0ba4\u0bbf\u0baf \u0b9a\u0bc1\u0baf\u0bae\u0bcd\u0baa\u0bc1\u0bb5\u0bbe\u0b95\u0bbf\u0baf \"\u0ba8\u0bbe\u0ba9\u0bcd \u0b87\u0bb0\u0bc1\u0b95\u0bcd\u0b95\u0bbf\u0bb1\u0bb5\u0bb0\u0bbe\u0b95 \u0b87\u0bb0\u0bc1\u0b95\u0bcd\u0b95\u0bbf\u0bb1\u0bc7\u0ba9\u0bcd\" \u0b8e\u0ba9\u0bcd\u0bb1\u0bc1\u0bae\u0bcd, \u0bb5\u0bbe\u0ba9\u0ba4\u0bcd\u0ba4\u0bc8\u0baf\u0bc1\u0bae\u0bcd \u0baa\u0bc2\u0bae\u0bbf\u0baf\u0bc8\u0baf\u0bc1\u0bae\u0bcd \u0baa\u0b9f\u0bc8\u0ba4\u0bcd\u0ba4 \u0b9a\u0bbf\u0bb0\u0bc1\u0bb7\u0bcd\u0b9f\u0bbf\u0b95\u0bb0\u0bbe\u0b95\u0bb5\u0bc1\u0bae\u0bcd, \u0baa\u0bbf\u0ba4\u0bbe, \u0b95\u0bc1\u0bae\u0bbe\u0bb0\u0ba9\u0bcd, \u0baa\u0bb0\u0bbf\u0b9a\u0bc1\u0ba4\u0bcd\u0ba4 \u0b86\u0bb5\u0bbf\u0baf\u0bbe\u0b95 \u0bb5\u0bc6\u0bb3\u0bbf\u0baa\u0bcd\u0baa\u0b9f\u0bc1\u0ba4\u0bcd\u0ba4\u0bbf\u0baf\u0bc1\u0bb3\u0bcd\u0bb3\u0bbe\u0bb0\u0bcd."},
            {"titleEn": "Salvation of Man", "titleTa": "\u0bae\u0ba9\u0bbf\u0ba4\u0ba9\u0bbf\u0ba9\u0bcd \u0b87\u0bb0\u0b9f\u0bcd\u0b9a\u0bbf\u0baa\u0bcd\u0baa\u0bc1", "descEn": "Man's only hope of redemption is through the shed blood of Jesus Christ the Son of God, received by faith and repentance.", "descTa": "\u0ba4\u0bc7\u0bb5 \u0b95\u0bc1\u0bae\u0bbe\u0bb0\u0ba9\u0bbe\u0b95\u0bbf\u0baf \u0b87\u0baf\u0bc7\u0b9a\u0bc1 \u0b95\u0bbf\u0bb1\u0bbf\u0bb8\u0bcd\u0ba4\u0bc1\u0bb5\u0bbf\u0ba9\u0bcd \u0b9a\u0bbf\u0ba8\u0bcd\u0ba4\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f \u0b87\u0bb0\u0ba4\u0bcd\u0ba4\u0ba4\u0bcd\u0ba4\u0bbf\u0ba9\u0bcd \u0bae\u0bc2\u0bb2\u0bae\u0bc7 \u0bae\u0ba9\u0bbf\u0ba4\u0ba9\u0bc1\u0b95\u0bcd\u0b95\u0bc1 \u0bae\u0bc0\u0b9f\u0bcd\u0baa\u0bc1 \u0b89\u0ba3\u0bcd\u0b9f\u0bc1, \u0b87\u0ba4\u0bc1 \u0bb5\u0bbf\u0b9a\u0bc1\u0bb5\u0bbe\u0b9a\u0ba4\u0bcd\u0ba4\u0bbe\u0bb2\u0bc1\u0bae\u0bcd \u0bae\u0ba9\u0ba8\u0bcd\u0ba4\u0bbf\u0bb0\u0bc1\u0bae\u0bcd\u0baa\u0bc1\u0ba4\u0bb2\u0bbe\u0bb2\u0bc1\u0bae\u0bcd \u0baa\u0bc6\u0bb1\u0baa\u0bcd\u0baa\u0b9f\u0bc1\u0b95\u0bbf\u0bb1\u0ba4\u0bc1."},
            {"titleEn": "Baptism in the Holy Spirit", "titleTa": "\u0baa\u0bb0\u0bbf\u0b9a\u0bc1\u0ba4\u0bcd\u0ba4 \u0b86\u0bb5\u0bbf\u0baf\u0bbf\u0ba9\u0bcd \u0b85\u0baa\u0bbf\u0bb7\u0bc7\u0b95\u0bae\u0bcd", "descEn": "All believers are entitled to and should ardently expect the promise of the Father, the baptism in the Holy Spirit, which gives power for life and service.", "descTa": "\u0bb5\u0bbf\u0b9a\u0bc1\u0bb5\u0bbe\u0b9a\u0bbf\u0b95\u0bb3\u0bcd \u0b85\u0ba9\u0bc8\u0bb5\u0bb0\u0bc1\u0bae\u0bcd \u0baa\u0bbf\u0ba4\u0bbe\u0bb5\u0bbf\u0ba9\u0bcd \u0bb5\u0bbe\u0b95\u0bcd\u0b95\u0bc1\u0ba4\u0bcd\u0ba4\u0ba4\u0bcd\u0ba4\u0bae\u0bbe\u0b95\u0bbf\u0baf \u0baa\u0bb0\u0bbf\u0b9a\u0bc1\u0ba4\u0bcd\u0ba4 \u0b86\u0bb5\u0bbf\u0baf\u0bbf\u0ba9\u0bcd \u0b85\u0baa\u0bbf\u0bb7\u0bc7\u0b95\u0ba4\u0bcd\u0ba4\u0bc8 \u0b86\u0bb5\u0bb2\u0bcb\u0b9f\u0bc1 \u0b8e\u0ba4\u0bbf\u0bb0\u0bcd\u0baa\u0bbe\u0bb0\u0bcd\u0b95\u0bcd\u0b95 \u0bb5\u0bc7\u0ba3\u0bcd\u0b9f\u0bc1\u0bae\u0bcd, \u0b87\u0ba4\u0bc1 \u0b95\u0bbf\u0bb1\u0bbf\u0bb8\u0bcd\u0ba4\u0bb5 \u0b9c\u0bc0\u0bb5\u0bbf\u0baf\u0ba4\u0bcd\u0ba4\u0bbf\u0bb1\u0bcd\u0b95\u0bc1\u0bae\u0bcd \u0b8a\u0bb4\u0bbf\u0baf\u0ba4\u0bcd\u0ba4\u0bbf\u0bb1\u0bcd\u0b95\u0bc1\u0bae\u0bcd \u0bb5\u0bb2\u0bcd\u0bb2\u0bae\u0bc8\u0baf\u0bb3\u0bbf\u0b95\u0bcd\u0b95\u0bbf\u0bb1\u0ba4\u0bc1."}
          ]),
          ta: JSON.stringify([
            {"titleEn": "The Scriptures Inspired", "titleTa": "\u0bb5\u0bc7\u0ba4\u0bb5\u0b9a\u0ba9\u0b99\u0bcd\u0b95\u0bb3\u0bbf\u0ba9\u0bcd \u0ba4\u0bc6\u0baf\u0bcd\u0bb5\u0bc0\u0b95 \u0b89\u0ba4\u0bcd\u0bb5\u0bc7\u0b95\u0bae\u0bcd", "descEn": "The Bible is the inspired, infallible Word of God, a divine revelation and the authoritative rule of faith and conduct.", "descTa": "\u0b9a\u0ba4\u0bcd\u0ba4\u0bbf\u0baf \u0bb5\u0bc7\u0ba4\u0bbe\u0b95\u0bae\u0bae\u0bcd \u0ba4\u0bc7\u0bb5 \u0b86\u0bb5\u0bbf\u0baf\u0bbf\u0ba9\u0bbe\u0bb2\u0bcd \u0b85\u0bb0\u0bc1\u0bb3\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f\u0ba4\u0bc1\u0bae\u0bcd, \u0ba4\u0bb5\u0bb1\u0bc1\u0b95\u0bb3\u0bb1\u0bcd\u0bb1\u0ba4\u0bc1\u0bae\u0bcd, \u0bb5\u0bbf\u0b9a\u0bc1\u0bb5\u0bbe\u0b9a\u0ba4\u0bcd\u0ba4\u0bbf\u0bb1\u0bcd\u0b95\u0bc1\u0bae\u0bcd \u0b9c\u0bc0\u0bb5\u0bbf\u0baf\u0ba4\u0bcd\u0ba4\u0bbf\u0bb1\u0bcd\u0b95\u0bc1\u0bae\u0bcd \u0b85\u0ba4\u0bbf\u0b95\u0bbe\u0bb0\u0bae\u0bcd \u0b95\u0bca\u0ba3\u0bcd\u0b9f \u0ba4\u0bc7\u0bb5 \u0bb5\u0bc6\u0bb3\u0bbf\u0baa\u0bcd\u0baa\u0bbe\u0b9f\u0bbe\u0b95\u0bc1\u0bae\u0bcd."},
            {"titleEn": "The One True God", "titleTa": "\u0b92\u0bb0\u0bc7 \u0bae\u0bc6\u0baf\u0bcd\u0baf\u0bbe\u0ba9 \u0ba4\u0bc7\u0bb5\u0ba9\u0bcd", "descEn": "The one true God has revealed Himself as the eternally self-existent \"I AM,\" the Creator of heaven and earth, manifested as Father, Son, and Holy Spirit.", "descTa": "\u0b92\u0bb0\u0bc7 \u0bae\u0bc6\u0baf\u0bcd\u0baf\u0bbe\u0ba9 \u0ba4\u0bc7\u0bb5\u0ba9\u0bcd \u0ba4\u0bae\u0bcd\u0bae\u0bc8 \u0ba8\u0bbf\u0ba4\u0bcd\u0ba4\u0bbf\u0baf \u0b9a\u0bc1\u0baf\u0bae\u0bcd\u0baa\u0bc1\u0bb5\u0bbe\u0b95\u0bbf\u0baf \"\u0ba8\u0bbe\u0ba9\u0bcd \u0b87\u0bb0\u0bc1\u0b95\u0bcd\u0b95\u0bbf\u0bb1\u0bb5\u0bb0\u0bbe\u0b95 \u0b87\u0bb0\u0bc1\u0b95\u0bcd\u0b95\u0bbf\u0bb1\u0bc7\u0ba9\u0bcd\" \u0b8e\u0ba9\u0bcd\u0bb1\u0bc1\u0bae\u0bcd, \u0bb5\u0bbe\u0ba9\u0ba4\u0bcd\u0ba4\u0bc8\u0baf\u0bc1\u0bae\u0bcd \u0baa\u0bc2\u0bae\u0bbf\u0baf\u0bc8\u0baf\u0bc1\u0bae\u0bcd \u0baa\u0b9f\u0bc8\u0ba4\u0bcd\u0ba4 \u0b9a\u0bbf\u0bb0\u0bc1\u0bb7\u0bcd\u0b9f\u0bbf\u0b95\u0bb0\u0bbe\u0b95\u0bb5\u0bc1\u0bae\u0bcd, \u0baa\u0bbf\u0ba4\u0bbe, \u0b95\u0bc1\u0bae\u0bbe\u0bb0\u0ba9\u0bcd, \u0baa\u0bb0\u0bbf\u0b9a\u0bc1\u0ba4\u0bcd\u0ba4 \u0b86\u0bb5\u0bbf\u0baf\u0bbe\u0b95 \u0bb5\u0bc6\u0bb3\u0bbf\u0baa\u0bcd\u0baa\u0b9f\u0bc1\u0ba4\u0bcd\u0ba4\u0bbf\u0baf\u0bc1\u0bb3\u0bcd\u0bb3\u0bbe\u0bb0\u0bcd."},
            {"titleEn": "Salvation of Man", "titleTa": "\u0bae\u0ba9\u0bbf\u0ba4\u0ba9\u0bbf\u0ba9\u0bcd \u0b87\u0bb0\u0b9f\u0bcd\u0b9a\u0bbf\u0baa\u0bcd\u0baa\u0bc1", "descEn": "Man's only hope of redemption is through the shed blood of Jesus Christ the Son of God, received by faith and repentance.", "descTa": "\u0ba4\u0bc7\u0bb5 \u0b95\u0bc1\u0bae\u0bbe\u0bb0\u0ba9\u0bbe\u0b95\u0bbf\u0baf \u0b87\u0baf\u0bc7\u0b9a\u0bc1 \u0b95\u0bbf\u0bb1\u0bbf\u0bb8\u0bcd\u0ba4\u0bc1\u0bb5\u0bbf\u0ba9\u0bcd \u0b9a\u0bbf\u0ba8\u0bcd\u0ba4\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f \u0b87\u0bb0\u0ba4\u0bcd\u0ba4\u0ba4\u0bcd\u0ba4\u0bbf\u0ba9\u0bcd \u0bae\u0bc2\u0bb2\u0bae\u0bc7 \u0bae\u0ba9\u0bbf\u0ba4\u0ba9\u0bc1\u0b95\u0bcd\u0b95\u0bc1 \u0bae\u0bc0\u0b9f\u0bcd\u0baa\u0bc1 \u0b89\u0ba3\u0bcd\u0b9f\u0bc1, \u0b87\u0ba4\u0bc1 \u0bb5\u0bbf\u0b9a\u0bc1\u0bb5\u0bbe\u0b9a\u0ba4\u0bcd\u0ba4\u0bbe\u0bb2\u0bc1\u0bae\u0bcd \u0bae\u0ba9\u0ba8\u0bcd\u0ba4\u0bbf\u0bb0\u0bc1\u0bae\u0bcd\u0baa\u0bc1\u0ba4\u0bb2\u0bbe\u0bb2\u0bc1\u0bae\u0bcd \u0baa\u0bc6\u0bb1\u0baa\u0bcd\u0baa\u0b9f\u0bc1\u0b95\u0bbf\u0bb1\u0ba4\u0bc1."},
            {"titleEn": "Baptism in the Holy Spirit", "titleTa": "\u0baa\u0bb0\u0bbf\u0b9a\u0bc1\u0ba4\u0bcd\u0ba4 \u0b86\u0bb5\u0bbf\u0baf\u0bbf\u0ba9\u0bcd \u0b85\u0baa\u0bbf\u0bb7\u0bc7\u0b95\u0bae\u0bcd", "descEn": "All believers are entitled to and should ardently expect the promise of the Father, the baptism in the Holy Spirit, which gives power for life and service.", "descTa": "\u0bb5\u0bbf\u0b9a\u0bc1\u0bb5\u0bbe\u0b9a\u0bbf\u0b95\u0bb3\u0bcd \u0b85\u0ba9\u0bc8\u0bb5\u0bb0\u0bc1\u0bae\u0bcd \u0baa\u0bbf\u0ba4\u0bbe\u0bb5\u0bbf\u0ba9\u0bcd \u0bb5\u0bbe\u0b95\u0bcd\u0b95\u0bc1\u0ba4\u0bcd\u0ba4\u0ba4\u0bcd\u0ba4\u0bae\u0bbe\u0b95\u0bbf\u0baf \u0baa\u0bb0\u0bbf\u0b9a\u0bc1\u0ba4\u0bcd\u0ba4 \u0b86\u0bb5\u0bbf\u0baf\u0bbf\u0ba9\u0bcd \u0b85\u0baa\u0bbf\u0bb7\u0bc7\u0b95\u0ba4\u0bcd\u0ba4\u0bc8 \u0b86\u0bb5\u0bb2\u0bcb\u0b9f\u0bc1 \u0b8e\u0ba4\u0bbf\u0bb0\u0bcd\u0baa\u0bbe\u0bb0\u0bcd\u0b95\u0bcd\u0b95 \u0bb5\u0bc7\u0ba3\u0bcd\u0b9f\u0bc1\u0bae\u0bcd, \u0b87\u0ba4\u0bc1 \u0b95\u0bbf\u0bb1\u0bbf\u0bb8\u0bcd\u0ba4\u0bb5 \u0b9c\u0bc0\u0bb5\u0bbf\u0baf\u0ba4\u0bcd\u0ba4\u0bbf\u0bb1\u0bcd\u0b95\u0bc1\u0bae\u0bcd \u0b8a\u0bb4\u0bbf\u0baf\u0ba4\u0bcd\u0ba4\u0bbf\u0bb1\u0bcd\u0b95\u0bc1\u0bae\u0bcd \u0bb5\u0bb2\u0bcd\u0bb2\u0bae\u0bc8\u0baf\u0bb3\u0bbf\u0b95\u0bcd\u0b95\u0bbf\u0bb1\u0ba4\u0bc1."}
          ])
        }
      ];

      for (const item of defaultAbout) {
        await db.runAsync('INSERT INTO about_content (`key`, en_val, ta_val) VALUES (?, ?, ?)',
          [item.key, item.en, item.ta]
        );
      }
      console.log('About us content seeded successfully.');
    } else {
      const keysToCheck = ['aboutImage', 'milestones', 'faithStatements'];
      for (const key of keysToCheck) {
        const exists = await db.getAsync('SELECT `key` FROM about_content WHERE `key` = ?', [key]);
        if (!exists) {
          let enVal = '';
          let taVal = '';
          if (key === 'aboutImage') {
            enVal = '/images/home-banner1.JPG';
            taVal = '/images/home-banner1.JPG';
          } else if (key === 'milestones') {
            enVal = JSON.stringify([
              {"year": "1996", "titleEn": "Humble Beginnings", "titleTa": "\u0b8e\u0bb3\u0bbf\u0baf \u0b86\u0bb0\u0bae\u0bcd\u0baa\u0bae\u0bcd", "descEn": "Started as a weekly bilingually home fellowship in Sharjah, with a focus on supporting regional expatriate workers.", "descTa": "\u0bb7\u0bbe\u0bb0\u0bcd\u0b9c\u0bbe\u0bb5\u0bbf\u0bb2\u0bcd \u0b92\u0bb0\u0bc1 \u0b8e\u0bb3\u0bbf\u0baf \u0b87\u0bb2\u0bcd\u0bb2 \u0b9c\u0baa\u0b95\u0bcd \u0b95\u0bc2\u0b9f\u0bcd\u0b9f\u0bae\u0bbe\u0b95\u0ba4\u0bcd \u0ba4\u0bca\u0b9f\u0b99\u0bcd\u0b95\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f\u0bc1, \u0ba4\u0bc2\u0bb0\u0ba4\u0bc7\u0b9a\u0ba4\u0bcd\u0ba4\u0bbf\u0bb2\u0bcd \u0bb5\u0bbe\u0bb4\u0bc1\u0bae\u0bcd \u0b89\u0bb4\u0bc8\u0baa\u0bcd\u0baa\u0bbe\u0bb3\u0bb0\u0bcd\u0b95\u0bb3\u0bc8 \u0b86\u0bb5\u0bbf\u0b95\u0bcd\u0b95\u0bc1\u0bb0\u0bbf\u0baf \u0bb0\u0bc0\u0ba4\u0bbf\u0baf\u0bbf\u0bb2\u0bcd \u0b86\u0ba4\u0bb0\u0bbf\u0baa\u0bcd\u0baa\u0ba4\u0bc8 \u0ba8\u0bcb\u0b95\u0bcd\u0b95\u0bae\u0bbe\u0b95\u0b95\u0bcd \u0b95\u0bca\u0ba3\u0bcd\u0b9f\u0bc1 \u0b86\u0bb0\u0bae\u0bcd\u0baa\u0bbf\u0b95\u0bcd\u0b95\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f\u0ba4\u0bc1."},
              {"year": "2005", "titleEn": "Transport fleet launched", "titleTa": "\u0baa\u0bcb\u0b95\u0bcd\u0b95\u0bc1\u0bb5\u0bb0\u0ba4\u0bcd\u0ba4\u0bc1 \u0b9a\u0bc7\u0bb5\u0bc8 \u0ba4\u0bc1\u0bb5\u0b95\u0bcd\u0b95\u0bae\u0bcd", "descEn": "Purchased our first shuttle bus to fetch Tamil laborers completely free of charge from far-flung industrial camps.", "descTa": "\u0ba4\u0bca\u0bb4\u0bbf\u0bb2\u0bbe\u0bb3\u0bb0\u0bcd\u0b95\u0bb3\u0bcd \u0b8e\u0bb5\u0bcd\u0bb5\u0bbf\u0ba4 \u0b9a\u0bbf\u0bb0\u0bae\u0bae\u0bc1\u0bae\u0bbf\u0ba9\u0bcd\u0bb1\u0bbf \u0b86\u0bb0\u0bbe\u0ba4\u0ba9\u0bc8\u0baf\u0bbf\u0bb2\u0bcd \u0b95\u0bb2\u0ba8\u0bcd\u0ba4\u0bc1 \u0b95\u0bca\u0bb3\u0bcd\u0bb3 \u0ba4\u0bc2\u0bb0 \u0bae\u0bc1\u0b95\u0bbe\u0bae\u0bcd\u0b95\u0bb3\u0bbf\u0bb2\u0bcd \u0b87\u0bb0\u0bc1\u0ba8\u0bcd\u0ba4\u0bc1 \u0bae\u0bc1\u0bb1\u0bcd\u0bb1\u0bbf\u0bb2\u0bc1\u0bae\u0bcd \u0b87\u0bb2\u0bb5\u0b9a\u0bae\u0bbe\u0b95 \u0b85\u0bb4\u0bc8\u0ba4\u0bcd\u0ba4\u0bc1 \u0bb5\u0bb0 \u0bae\u0bc1\u0ba4\u0bb2\u0bcd \u0baa\u0bc7\u0bb0\u0bc1\u0ba8\u0bcd\u0ba4\u0bc1 \u0bb5\u0bbe\u0b99\u0bcd\u0b95\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f\u0ba4\u0bc1."},
              {"year": "2016", "titleEn": "Regional Branch Network", "titleTa": "\u0b95\u0bbf\u0bb3\u0bc8 \u0b9a\u0baa\u0bc8\u0b95\u0bb3\u0bcd \u0bb5\u0bbf\u0bb0\u0bbf\u0bb5\u0bbe\u0b95\u0bcd\u0b95\u0bae\u0bcd", "descEn": "Formally established satellite cell fellowships in Ajman and Umm Al Quwain, expanding weekly ministries.", "descTa": "\u0b85\u0ba3\u0bcd\u0b9f\u0bc8 \u0b8e\u0bae\u0bbf\u0bb0\u0bc7\u0b9f\u0bcd\u0b95\u0bb3\u0bbe\u0ba9 \u0b85\u0b9c\u0bcd\u0bae\u0bbe\u0ba9\u0bcd \u0bae\u0bb1\u0bcd\u0bb1\u0bc1\u0bae\u0bcd \u0b89\u0bae\u0bcd \u0b85\u0bb2\u0bcd \u0b95\u0bc1\u0bb5\u0bc8\u0ba9\u0bbf\u0bb2\u0bcd \u0bae\u0bc1\u0bb1\u0bc8\u0baf\u0bbe\u0ba9 \u0b95\u0bbf\u0bb3\u0bc8 \u0b9a\u0baa\u0bc8 \u0b90\u0b95\u0bcd\u0b95\u0bbf\u0baf\u0b99\u0bcd\u0b95\u0bb3\u0bcd \u0b8f\u0bb1\u0bcd\u0baa\u0b9f\u0bc1\u0ba4\u0bcd\u0ba4\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f\u0bc1 \u0bb5\u0bbe\u0bb0\u0bbe\u0ba8\u0bcd\u0ba4\u0bbf\u0bb0 \u0b8a\u0bb4\u0bbf\u0baf\u0b99\u0bcd\u0b95\u0bb3\u0bcd \u0bb5\u0bbf\u0bb0\u0bbf\u0bb5\u0bc1\u0baa\u0b9f\u0bc1\u0ba4\u0bcd\u0ba4\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f\u0ba9."}
            ]);
            taVal = enVal;
          } else if (key === 'faithStatements') {
            enVal = JSON.stringify([
              {"titleEn": "The Scriptures Inspired", "titleTa": "\u0bb5\u0bc7\u0ba4\u0bb5\u0b9a\u0ba9\u0b99\u0bcd\u0b95\u0bb3\u0bbf\u0ba9\u0bcd \u0ba4\u0bc6\u0baf\u0bcd\u0bb5\u0bc0\u0b95 \u0b89\u0ba4\u0bcd\u0bb5\u0bc7\u0b95\u0bae\u0bcd", "descEn": "The Bible is the inspired, infallible Word of God, a divine revelation and the authoritative rule of faith and conduct.", "descTa": "\u0b9a\u0ba4\u0bcd\u0ba4\u0bbf\u0baf \u0bb5\u0bc7\u0ba4\u0bbe\u0b95\u0bae\u0bae\u0bcd \u0ba4\u0bc7\u0bb5 \u0b86\u0bb5\u0bbf\u0baf\u0bbf\u0ba9\u0bbe\u0bb2\u0bcd \u0b85\u0bb0\u0bc1\u0bb3\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f\u0ba4\u0bc1\u0bae\u0bcd, \u0ba4\u0bb5\u0bb1\u0bc1\u0b95\u0bb3\u0bb1\u0bcd\u0bb1\u0ba4\u0bc1\u0bae\u0bcd, \u0bb5\u0bbf\u0b9a\u0bc1\u0bb5\u0bbe\u0b9a\u0ba4\u0bcd\u0ba4\u0bbf\u0bb1\u0bcd\u0b95\u0bc1\u0bae\u0bcd \u0b9c\u0bc0\u0bb5\u0bbf\u0baf\u0ba4\u0bcd\u0ba4\u0bbf\u0bb1\u0bcd\u0b95\u0bc1\u0bae\u0bcd \u0b85\u0ba4\u0bbf\u0b95\u0bbe\u0bb0\u0bae\u0bcd \u0b95\u0bca\u0ba3\u0bcd\u0b9f \u0ba4\u0bc7\u0bb5 \u0bb5\u0bc6\u0bb3\u0bbf\u0baa\u0bcd\u0baa\u0bbe\u0b9f\u0bbe\u0b95\u0bc1\u0bae\u0bcd."},
              {"titleEn": "The One True God", "titleTa": "\u0b92\u0bb0\u0bc7 \u0bae\u0bc6\u0baf\u0bcd\u0baf\u0bbe\u0ba9 \u0ba4\u0bc7\u0bb5\u0ba9\u0bcd", "descEn": "The one true God has revealed Himself as the eternally self-existent \"I AM,\" the Creator of heaven and earth, manifested as Father, Son, and Holy Spirit.", "descTa": "\u0b92\u0bb0\u0bc7 \u0bae\u0bc6\u0baf\u0bcd\u0baf\u0bbe\u0ba9 \u0ba4\u0bc7\u0bb5\u0ba9\u0bcd \u0ba4\u0bae\u0bcd\u0bae\u0bc8 \u0ba8\u0bbf\u0ba4\u0bcd\u0ba4\u0bbf\u0baf \u0b9a\u0bc1\u0baf\u0bae\u0bcd\u0baa\u0bc1\u0bb5\u0bbe\u0b95\u0bbf\u0baf \"\u0ba8\u0bbe\u0ba9\u0bcd \u0b87\u0bb0\u0bc1\u0b95\u0bcd\u0b95\u0bbf\u0bb1\u0bb5\u0bb0\u0bbe\u0b95 \u0b87\u0bb0\u0bc1\u0b95\u0bcd\u0b95\u0bbf\u0bb1\u0bc7\u0ba9\u0bcd\" \u0b8e\u0ba9\u0bcd\u0bb1\u0bc1\u0bae\u0bcd, \u0bb5\u0bbe\u0ba9\u0ba4\u0bcd\u0ba4\u0bc8\u0baf\u0bc1\u0bae\u0bcd \u0baa\u0bc2\u0bae\u0bbf\u0baf\u0bc8\u0baf\u0bc1\u0bae\u0bcd \u0baa\u0b9f\u0bc8\u0ba4\u0bcd\u0ba4 \u0b9a\u0bbf\u0bb0\u0bc1\u0bb7\u0bcd\u0b9f\u0bbf\u0b95\u0bb0\u0bbe\u0b95\u0bb5\u0bc1\u0bae\u0bcd, \u0baa\u0bbf\u0ba4\u0bbe, \u0b95\u0bc1\u0bae\u0bbe\u0bb0\u0ba9\u0bcd, \u0baa\u0bb0\u0bbf\u0b9a\u0bc1\u0ba4\u0bcd\u0ba4 \u0b86\u0bb5\u0bbf\u0baf\u0bbe\u0b95 \u0bb5\u0bc6\u0bb3\u0bbf\u0baa\u0bcd\u0baa\u0b9f\u0bc1\u0ba4\u0bcd\u0ba4\u0bbf\u0baf\u0bc1\u0bb3\u0bcd\u0bb3\u0bbe\u0bb0\u0bcd."},
              {"titleEn": "Salvation of Man", "titleTa": "\u0bae\u0ba9\u0bbf\u0ba4\u0ba9\u0bbf\u0ba9\u0bcd \u0b87\u0bb0\u0b9f\u0bcd\u0b9a\u0bbf\u0baa\u0bcd\u0baa\u0bc1", "descEn": "Man's only hope of redemption is through the shed blood of Jesus Christ the Son of God, received by faith and repentance.", "descTa": "\u0ba4\u0bc7\u0bb5 \u0b95\u0bc1\u0bae\u0bbe\u0bb0\u0ba9\u0bbe\u0b95\u0bbf\u0baf \u0b87\u0baf\u0bc7\u0b9a\u0bc1 \u0b95\u0bbf\u0bb1\u0bbf\u0bb8\u0bcd\u0ba4\u0bc1\u0bb5\u0bbf\u0ba9\u0bcd \u0b9a\u0bbf\u0ba8\u0bcd\u0ba4\u0baa\u0bcd\u0baa\u0b9f\u0bcd\u0b9f \u0b87\u0bb0\u0ba4\u0bcd\u0ba4\u0ba4\u0bcd\u0ba4\u0bbf\u0ba9\u0bcd \u0bae\u0bc2\u0bb2\u0bae\u0bc7 \u0bae\u0ba9\u0bbf\u0ba4\u0ba9\u0bc1\u0b95\u0bcd\u0b95\u0bc1 \u0bae\u0bc0\u0b9f\u0bcd\u0baa\u0bc1 \u0b89\u0ba3\u0bcd\u0b9f\u0bc1, \u0b87\u0ba4\u0bc1 \u0bb5\u0bbf\u0b9a\u0bc1\u0bb5\u0bbe\u0b9a\u0ba4\u0bcd\u0ba4\u0bbe\u0bb2\u0bc1\u0bae\u0bcd \u0bae\u0ba9\u0ba8\u0bcd\u0ba4\u0bbf\u0bb0\u0bc1\u0bae\u0bcd\u0baa\u0bc1\u0ba4\u0bb2\u0bbe\u0bb2\u0bc1\u0bae\u0bcd \u0baa\u0bc6\u0bb1\u0baa\u0bcd\u0baa\u0b9f\u0bc1\u0b95\u0bbf\u0bb1\u0ba4\u0bc1."},
              {"titleEn": "Baptism in the Holy Spirit", "titleTa": "\u0baa\u0bb0\u0bbf\u0b9a\u0bc1\u0ba4\u0bcd\u0ba4 \u0b86\u0bb5\u0bbf\u0baf\u0bbf\u0ba9\u0bcd \u0b85\u0baa\u0bbf\u0bb7\u0bc7\u0b95\u0bae\u0bcd", "descEn": "All believers are entitled to and should ardently expect the promise of the Father, the baptism in the Holy Spirit, which gives power for life and service.", "descTa": "\u0bb5\u0bbf\u0b9a\u0bc1\u0bb5\u0bbe\u0b9a\u0bbf\u0b95\u0bb3\u0bcd \u0b85\u0ba9\u0bc8\u0bb5\u0bb0\u0bc1\u0bae\u0bcd \u0baa\u0bbf\u0ba4\u0bbe\u0bb5\u0bbf\u0ba9\u0bcd \u0bb5\u0bbe\u0b95\u0bcd\u0b95\u0bc1\u0ba4\u0bcd\u0ba4\u0ba4\u0bcd\u0ba4\u0bae\u0bbe\u0b95\u0bbf\u0baf \u0baa\u0bb0\u0bbf\u0b9a\u0bc1\u0ba4\u0bcd\u0ba4 \u0b86\u0bb5\u0bbf\u0baf\u0bbf\u0ba9\u0bcd \u0b85\u0baa\u0bbf\u0bb7\u0bc7\u0b95\u0ba4\u0bcd\u0ba4\u0bc8 \u0b86\u0bb5\u0bb2\u0bcb\u0b9f\u0bc1 \u0b8e\u0ba4\u0bbf\u0bb0\u0bcd\u0baa\u0bbe\u0bb0\u0bcd\u0b95\u0bcd\u0b95 \u0bb5\u0bc7\u0ba3\u0bcd\u0b9f\u0bc1\u0bae\u0bcd, \u0b87\u0ba4\u0bc1 \u0b95\u0bbf\u0bb1\u0bbf\u0bb8\u0bcd\u0ba4\u0bb5 \u0b9c\u0bc0\u0bb5\u0bbf\u0baf\u0ba4\u0bcd\u0ba4\u0bbf\u0bb1\u0bcd\u0b95\u0bc1\u0bae\u0bcd \u0b8a\u0bb4\u0bbf\u0baf\u0ba4\u0bcd\u0ba4\u0bbf\u0bb1\u0bcd\u0b95\u0bc1\u0bae\u0bcd \u0bb5\u0bb2\u0bcd\u0bb2\u0bae\u0bc8\u0baf\u0bb3\u0bbf\u0b95\u0bcd\u0b95\u0bbf\u0bb1\u0ba4\u0bc1."}
            ]);
            taVal = enVal;
          }
          await db.runAsync('INSERT INTO about_content (`key`, en_val, ta_val) VALUES (?, ?, ?)', [key, enVal, taVal]);
        }
      }
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
