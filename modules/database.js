const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, '..', 'project-database.db');
const SQL_SCRIPT_PATH = path.join(__dirname, '..', 'SQL', 'project-database-init-script.sql');

// Create a new database connection
const db = new sqlite3.Database(DB_PATH);

// Read the SQL script file
const sqlScript = fs.readFileSync(SQL_SCRIPT_PATH, 'utf8');

// Execute the SQL script
db.serialize(() => {
  db.exec(sqlScript, (err) => {
    if (err) {
      console.error('Failed to execute the SQL script:', err);
    } else {
      console.log('SQL script executed successfully');
    }

    // Close the database connection
    db.close();
  });
});