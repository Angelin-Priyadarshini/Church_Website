const mysql = require('mysql2/promise');

const env = process.env;
const getEnv = (...names) => {
  for (const name of names) {
    const value = env[name];
    if (value && value.trim() !== '') return value.trim();
  }
  return undefined;
};

const dbConfig = {
  host:     getEnv('DB_HOST', 'MYSQL_HOST', 'MYSQLHOST') || 'localhost',
  port:     parseInt(getEnv('DB_PORT', 'MYSQL_PORT', 'MYSQLPORT') || '3306', 10),
  user:     getEnv('DB_USER', 'MYSQL_USER', 'MYSQLUSER') || 'root',
  password: getEnv('DB_PASSWORD', 'MYSQL_PASSWORD', 'MYSQLPASSWORD') || '',
  database: getEnv('DB_NAME', 'DB_DATABASE', 'MYSQL_DATABASE', 'MYSQLDATABASE') || 'agstc',
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

const publicConfig = {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database
};

const db = { allAsync, getAsync, runAsync, pool, config: publicConfig };
module.exports = db;
