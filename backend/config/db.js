const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// On Render, use the persistent disk mount path so data survives redeploys.
// Locally and on other hosts, fall back to the backend root directory.
const dbPath = process.env.NODE_ENV === 'production' && fs.existsSync('/data')
  ? '/data/church.db'
  : path.resolve(__dirname, '../church.db');

const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

console.log('Connected to SQLite database at:', dbPath);

// Async-compatible wrappers so all existing code works unchanged
// better-sqlite3 uses spread params (...params) not array params
db.allAsync = (sql, params = []) => {
  try {
    const rows = db.prepare(sql).all(...params);
    return Promise.resolve(rows);
  } catch (err) {
    return Promise.reject(err);
  }
};

db.getAsync = (sql, params = []) => {
  try {
    const row = db.prepare(sql).get(...params);
    return Promise.resolve(row);
  } catch (err) {
    return Promise.reject(err);
  }
};

db.runAsync = (sql, params = []) => {
  try {
    const result = db.prepare(sql).run(...params);
    return Promise.resolve({ lastID: result.lastInsertRowid, changes: result.changes });
  } catch (err) {
    return Promise.reject(err);
  }
};

module.exports = db;
