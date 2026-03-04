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
  const res = await pool.query("SELECT package_id, name, category, status FROM packages ORDER BY package_id DESC LIMIT 5");
  console.log(JSON.stringify(res.rows, null, 2));
  pool.end();
}
check();
