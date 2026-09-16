const mysql = require('mysql2/promise');
const path = require('path');

const env = process.env;
const getEnv = (...names) => {
  for (const name of names) {
    const value = env[name];
    if (value && value.trim() !== '') return value.trim();
  }
  return undefined;
};

// SQLite configuration
const sqliteDbPath = path.join(__dirname, '..', 'db.sqlite');
let sqliteDb;
let isSqlite = false;

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
  connectTimeout: 4000 // 4 seconds short timeout for faster local fallback
};

let pool;
let mysqlConnected = false;

// We will export helper functions that check whether we are using MySQL or SQLite
let dbReadyResolve;
const dbReadyPromise = new Promise((resolve) => {
  dbReadyResolve = resolve;
});

function cleanSqlForSqlite(sql) {
  let s = sql;
  // Strip MySQL table options:
  s = s.replace(/ENGINE\s*=\s*\w+/gi, '');
  s = s.replace(/DEFAULT\s+CHARSET\s*=\s*\w+/gi, '');
  s = s.replace(/COLLATE\s*=\s*[\w_]+/gi, '');
  s = s.replace(/CHARACTER\s+SET\s*=\s*\w+/gi, '');
  // Clean up trailing commas/parentheses
  s = s.replace(/\s*,\s*\)/g, ')');
  // Convert AUTO_INCREMENT
  s = s.replace(/(\bINT\b|\bINTEGER\b)\s+NOT\s+NULL\s+AUTO_INCREMENT\s+PRIMARY\s+KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT');
  s = s.replace(/(\bINT\b|\bINTEGER\b)\s+AUTO_INCREMENT\s+PRIMARY\s+KEY/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT');
  return s;
}

const allAsync = async (sql, params = []) => {
  await dbReadyPromise;
  if (isSqlite) {
    return new Promise((resolve, reject) => {
      sqliteDb.all(cleanSqlForSqlite(sql), params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  } else {
    const [rows] = await pool.execute(sql, params);
    return rows;
  }
};

const getAsync = async (sql, params = []) => {
  await dbReadyPromise;
  if (isSqlite) {
    return new Promise((resolve, reject) => {
      sqliteDb.get(cleanSqlForSqlite(sql), params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  } else {
    const [rows] = await pool.execute(sql, params);
    return rows[0] || undefined;
  }
};

const runAsync = async (sql, params = []) => {
  await dbReadyPromise;
  if (isSqlite) {
    return new Promise((resolve, reject) => {
      sqliteDb.run(cleanSqlForSqlite(sql), params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  } else {
    const [result] = await pool.execute(sql, params);
    return {
      lastID: result.insertId || 0,
      changes: result.affectedRows || 0
    };
  }
};

// Initialize SQLite fallback
function initSqlite() {
  const sqlite3 = require('sqlite3').verbose();
  isSqlite = true;
  console.log(`[DB] SQLite Mode Active. Database file: ${sqliteDbPath}`);
  sqliteDb = new sqlite3.Database(sqliteDbPath, (err) => {
    if (err) {
      console.error(`[DB] SQLite connection FAILED: ${err.message}`);
    } else {
      console.log('[DB] Connected to SQLite successfully.');
    }
    if (dbReadyResolve) {
      dbReadyResolve();
      dbReadyResolve = null;
    }
  });
}

// Try connecting to MySQL
const forceSqlite = getEnv('DB_DIALECT') === 'sqlite' || getEnv('DB_USER') === 'root' || !getEnv('DB_PASSWORD');

if (forceSqlite) {
  initSqlite();
} else {
  console.log(`[DB] Connecting to MySQL: host=${dbConfig.host} port=${dbConfig.port} user=${dbConfig.user} db=${dbConfig.database}`);
  try {
    pool = mysql.createPool(dbConfig);
    
    pool.getConnection()
      .then(conn => {
        console.log('[DB] Connected to MySQL successfully.');
        mysqlConnected = true;
        conn.release();
        if (dbReadyResolve) {
          dbReadyResolve();
          dbReadyResolve = null;
        }
      })
      .catch(err => {
        console.error(`[DB] MySQL connection FAILED: ${err.message}`);
        initSqlite();
      });
  } catch (err) {
    console.error(`[DB] Failed to create MySQL pool: ${err.message}`);
    initSqlite();
  }
}

const publicConfig = {
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  database: dbConfig.database
};

const db = {
  allAsync,
  getAsync,
  runAsync,
  get pool() {
    if (isSqlite) {
      return {
        execute: async (sql, params = []) => {
          const rows = await allAsync(sql, params);
          return [rows];
        },
        getConnection: async () => {
          return { release: () => {} };
        }
      };
    }
    return pool;
  },
  config: publicConfig
};

module.exports = db;
