const db = require('./backend/config/db');

async function run() {
  try {
    const rows = await db.allAsync(`SELECT id, title, upload_date, view_count FROM services WHERE upload_date = '2026-05-21'`);
    console.log(`Found ${rows.length} records with date 2026-05-21:`);
    rows.forEach((s, i) => {
      console.log(`${i+1}. [ID: ${s.id}] - ${s.title}`);
    });
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

run();
