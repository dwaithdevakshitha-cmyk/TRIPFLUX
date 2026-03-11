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
  const res = await pool.query("SELECT * FROM commissions");
  console.table(res.rows);
  
  const hierarchy = await pool.query("SELECT * FROM associate_hierarchy");
  console.log('Hierarchy:');
  console.table(hierarchy.rows);
  
  process.exit(0);
}

check();
