const db = require('./backend/config/db');

async function run() {
  try {
    const row = await db.getAsync(`SELECT * FROM services WHERE title LIKE '%ஆத்தும ஆதாயமே%'`);
    console.log('Video details:', JSON.stringify(row, null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
}

run();
