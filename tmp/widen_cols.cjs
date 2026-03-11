const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('/certs/global-bundle.pem').toString(),
  },
});

async function widen() {
  try {
    console.log('Widening columns...');
    await pool.query(`
      ALTER TABLE packages 
      ALTER COLUMN dates TYPE TEXT,
      ALTER COLUMN destination TYPE VARCHAR(255),
      ALTER COLUMN duration TYPE VARCHAR(255),
      ALTER COLUMN category TYPE VARCHAR(255);
    `);
    console.log('Columns widened successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Widen failed:', err);
    process.exit(1);
  }
}

widen();
