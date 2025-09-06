const mysql = require('mysql2');

// Create connection pool for better performance
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', // XAMPP default is empty password
  database: process.env.DB_NAME || 'ecofinds',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// Get promise-based connection
const promisePool = pool.promise();

// Test connection function
const testConnection = async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log('✅ MySQL connected as id ' + connection.threadId);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    return false;
  }
};

module.exports = {
  pool,
  promisePool,
  testConnection,
  getConnection: () => promisePool.getConnection()
};
