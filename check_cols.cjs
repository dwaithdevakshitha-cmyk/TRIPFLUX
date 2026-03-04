const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function checkCols() {
  const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'login_details'");
  console.log(res.rows);
  pool.end();
}
checkCols();
