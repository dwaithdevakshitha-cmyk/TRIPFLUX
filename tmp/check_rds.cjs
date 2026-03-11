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

async function run() {
  const users = await pool.query('SELECT user_id, email, role, first_name FROM login_details');
  console.table(users.rows);
  
  const pkgs = await pool.query('SELECT package_id, name FROM packages');
  console.log('Packages:');
  console.table(pkgs.rows);

  process.exit(0);
}

run();
