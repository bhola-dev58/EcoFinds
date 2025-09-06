const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const initDatabase = async () => {
  // Connect to MySQL without specifying database first
  const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    console.log('🔄 Connecting to MySQL server...');
    
    // Read SQL file
    const sqlPath = path.join(__dirname, 'init-database.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('🔄 Creating database and tables...');
    
    // Execute SQL
    await new Promise((resolve, reject) => {
      connection.query(sql, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
    
    console.log('✅ Database initialized successfully!');
    console.log('✅ Tables created with sample data');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    connection.end();
    console.log('📦 Database connection closed');
  }
};

// Run if called directly
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;
