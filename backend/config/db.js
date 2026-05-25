const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// On Render, use the persistent disk mount path so data survives redeploys.
// Locally and on other hosts, fall back to the backend root directory.
const dbPath = process.env.NODE_ENV === 'production' && require('fs').existsSync('/data')
  ? '/data/church.db'
  : path.resolve(__dirname, '../church.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Could not connect to SQLite database:', err);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Helper wrappers to support async/await promises
db.allAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

db.getAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

db.runAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

module.exports = db;
