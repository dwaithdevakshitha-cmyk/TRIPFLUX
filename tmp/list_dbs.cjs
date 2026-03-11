const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres', // Default to postgres
  password: 'admin123',
  port: 5432,
});

async function listDbs() {
  try {
    const res = await pool.query('SELECT datname FROM pg_database WHERE datistemplate = false');
    console.table(res.rows);
  } catch (err) {
    console.error('List DB Error:', err.message);
  }
  process.exit(0);
}

listDbs();
