const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function check() {
  try {
    const res = await pool.query("SELECT * FROM commission_levels");
    console.log(res.rows);
  } catch (err) {
    console.error(err.message);
  } finally {
    await pool.end();
  }
}
check();
