const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'agstc_church',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

console.log(`Connected to MySQL database: ${process.env.DB_NAME || 'agstc_church'} @ ${process.env.DB_HOST || 'localhost'}`);

const db = {};

db.allAsync = async (sql, params = []) => {
  const [rows] = await promisePool.execute(sql, params);
  return rows;
};

db.getAsync = async (sql, params = []) => {
  const [rows] = await promisePool.execute(sql, params);
  return rows[0] || null;
};

db.runAsync = async (sql, params = []) => {
  const [result] = await promisePool.execute(sql, params);
  return { lastID: result.insertId, changes: result.affectedRows };
};

module.exports = db;
