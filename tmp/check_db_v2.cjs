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
    const tableCheck = await pool.query("SELECT count(*) FROM information_schema.tables WHERE table_name = 'login_details'");
    console.log('Table login_details exists count:', tableCheck.rows[0].count);
    
    if (parseInt(tableCheck.rows[0].count) > 0) {
        const res = await pool.query('SELECT user_id, email, first_name, role FROM login_details ORDER BY created_at DESC LIMIT 5');
        console.log('Last 5 users:');
        console.table(res.rows);
    } else {
        console.log('Table login_details does NOT exist!');
    }
    process.exit(0);
  } catch (err) {
    console.error('Database query error:', err);
    process.exit(1);
  }
}

check();
