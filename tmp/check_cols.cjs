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

async function check() {
  try {
    const colCheck = await pool.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'login_details'");
    console.table(colCheck.rows);
    process.exit(0);
  } catch (err) {
    console.error('Database query error:', err);
    process.exit(1);
  }
}

check();
