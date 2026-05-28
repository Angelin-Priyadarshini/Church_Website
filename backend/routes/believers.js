const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Auth validation: Data Admin or Admin only
function requireDataAdminOrAbove(req, res, next) {
  if (req.user.role !== 'admin' && req.user.role !== 'data_admin') {
    return res.status(403).json({ error: 'Access denied. Data Admin or Admin role required.' });
  }
  next();
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Helper to check if a date string (YYYY-MM-DD) falls in the next 7 days (ignoring year)
function isDateInUpcomingWeek(dateStr) {
  if (!dateStr) return false;
  // Support both YYYY-MM-DD and MM-DD-YYYY or other formats
  const cleanStr = dateStr.split('T')[0];
  const parts = cleanStr.split('-');
  if (parts.length < 3) return false;

  let year, month, day;
  // Attempt to parse standard YYYY-MM-DD
  if (parts[0].length === 4) {
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    day = parseInt(parts[2], 10);
  } else {
    // Fallback: assume DD-MM-YYYY or MM-DD-YYYY, search for DD and MM
    month = parseInt(parts[1], 10);
    day = parseInt(parts[0], 10);
  }

  if (isNaN(month) || isNaN(day)) return false;

  const today = new Date();
  
  // Check next 7 days
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date();
    checkDate.setDate(today.getDate() + i);
    if ((checkDate.getMonth() + 1) === month && checkDate.getDate() === day) {
      return true;
    }
  }
  return false;
}

// Helper to calculate age from birthdate YYYY-MM-DD
function calculateAge(birthdateStr) {
  if (!birthdateStr) return 0;
  const cleanStr = birthdateStr.split('T')[0];
  const parts = cleanStr.split('-');
  if (parts.length < 3) return 0;
  
  let birthYear;
  if (parts[0].length === 4) {
    birthYear = parseInt(parts[0], 10);
  } else if (parts[2].length === 4) {
    birthYear = parseInt(parts[2], 10);
  } else {
    return 30; // fallback default
  }

  const currentYear = new Date().getFullYear();
  return currentYear - birthYear;
}

// POST /api/believers/import - Batch upload believers spreadsheet parsed in client
router.post('/import', authenticateToken, requireDataAdminOrAbove, async (req, res) => {
  const { believers } = req.body;

  if (!believers || !Array.isArray(believers)) {
    return res.status(400).json({ error: 'Roster of believers array is required.' });
  }

  try {
    // 1. Wipe the believers table
    await db.runAsync(`DELETE FROM believers`);

    // 2. Batch insert new records
    for (const b of believers) {
      const name = b.full_name || b['Full Name'] || b.name || '';
      const bdate = b.birthdate || b['Birthdate'] || '';
      const relStatus = b.relationship_status || b['Relationship Status'] || 'Single';
      const wdate = (relStatus.toLowerCase() === 'married') ? (b.wedding_date || b['Wedding Date'] || null) : null;
      const mob = b.mobile || b['Mobile'] || '';
      const gend = b.gender || b['Gender'] || 'Male';
      const loc = b.location || b['Location'] || 'Sharjah';
      const lang = b.preferred_language || b['Preferred Language'] || 'English';
      
      const parsedAge = b.age ? parseInt(b.age, 10) : calculateAge(bdate);

      if (!name || !bdate) continue; // skip invalid records

      await db.runAsync(`
        INSERT INTO believers (
          full_name, birthdate, relationship_status, wedding_date, 
          mobile, gender, location, preferred_language, age
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, bdate, relStatus, wdate, mob, gend, loc, lang, parsedAge]
      );
    }

    res.json({ message: `Roster synchronized successfully! ${believers.length} believers cataloged.` });
  } catch (err) {
    console.error('Error importing believers:', err);
    res.status(500).json({ error: 'Server error during batch roster sync.' });
  }
});

// GET /api/believers/analysis - Perform dashboard calculations
router.get('/analysis', authenticateToken, requireDataAdminOrAbove, async (req, res) => {
  try {
    const list = await db.allAsync(`SELECT * FROM believers ORDER BY full_name ASC`);

    const upcomingBirthdays = [];
    const upcomingAnniversaries = [];

    const ageGroups = {
      Children: 0, // <13
      Youth: 0,    // 13-25
      Adults: 0,   // 26-60
      Seniors: 0   // >60
    };

    const locationCounts = {};
    const birthdayWeeks = {};

    list.forEach(b => {
      // 1. Check Birthdays
      if (isDateInUpcomingWeek(b.birthdate)) {
        upcomingBirthdays.push(b);
      }

      // 2. Check Anniversaries
      if (b.relationship_status.toLowerCase() === 'married' && isDateInUpcomingWeek(b.wedding_date)) {
        upcomingAnniversaries.push(b);
      }

      // 3. Age Group Statistics
      const age = b.age || calculateAge(b.birthdate);
      if (age < 13) ageGroups.Children++;
      else if (age <= 25) ageGroups.Youth++;
      else if (age <= 60) ageGroups.Adults++;
      else ageGroups.Seniors++;

      // 4. Location counts
      const loc = (b.location || 'Sharjah').trim();
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;

      // 5. Birthday week groupings
      if (b.birthdate) {
        const cleanStr = b.birthdate.split('T')[0];
        const parts = cleanStr.split('-');
        if (parts.length >= 3) {
          let month, day;
          if (parts[0].length === 4) {
            month = parseInt(parts[1], 10);
            day = parseInt(parts[2], 10);
          } else {
            month = parseInt(parts[1], 10);
            day = parseInt(parts[0], 10);
          }

          if (!isNaN(month) && !isNaN(day) && month >= 1 && month <= 12) {
            let week = 'Week 4';
            if (day <= 7) week = 'Week 1';
            else if (day <= 14) week = 'Week 2';
            else if (day <= 21) week = 'Week 3';
            
            const weekLabel = `${monthNames[month - 1]} - ${week}`;
            birthdayWeeks[weekLabel] = (birthdayWeeks[weekLabel] || 0) + 1;
          }
        }
      }
    });

    res.json({
      totalCount: list.length,
      upcomingBirthdays,
      upcomingAnniversaries,
      ageGroups,
      locations: locationCounts,
      birthdayWeeks,
      allBelievers: list
    });
  } catch (err) {
    console.error('Error fetching believers analysis:', err);
    res.status(500).json({ error: 'Server error generating roster analysis.' });
  }
});

module.exports = router;
