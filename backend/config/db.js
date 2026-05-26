const mysql = require('mysql2/promise');

const dbConfig = {
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '3306'),
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'agstc',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+00:00',
  connectTimeout: 10000
};

console.log(`[DB] Connecting to MySQL: host=${dbConfig.host} port=${dbConfig.port} user=${dbConfig.user} db=${dbConfig.database}`);

const pool = mysql.createPool(dbConfig);

pool.getConnection()
  .then(conn => {
    console.log('[DB] Connected to MySQL successfully.');
    conn.release();
  })
  .catch(err => {
    console.error(`[DB] MySQL connection FAILED: ${err.message}`);
    console.error(`[DB] Config used: host=${dbConfig.host} port=${dbConfig.port} user=${dbConfig.user} db=${dbConfig.database}`);
    console.error('[DB] If on Hostinger, make sure DB_HOST=localhost and the DB user has been granted access in hPanel > Databases > MySQL Databases.');
  });

// Returns array of rows
const allAsync = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

// Returns single row or undefined
const getAsync = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows[0] || undefined;
};

// Returns { lastID, changes }
const runAsync = async (sql, params = []) => {
  const [result] = await pool.execute(sql, params);
  return {
    lastID: result.insertId || 0,
    changes: result.affectedRows || 0
  };
};

const db = { allAsync, getAsync, runAsync, pool };
module.exports = db;
