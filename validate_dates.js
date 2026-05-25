const db = require('./backend/config/db');

async function run() {
  try {
    const services = await db.allAsync(`SELECT id, title, upload_date, view_count, preacher FROM services ORDER BY upload_date DESC LIMIT 50`);
    console.log('Top 50 services sorted by upload_date DESC:');
    services.forEach((s, i) => {
      console.log(`${i+1}. [ID: ${s.id}] [Date: ${s.upload_date}] - ${s.title}`);
    });
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

run();
