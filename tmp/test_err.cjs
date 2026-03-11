const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'tripfluxdev',
  password: 'admin123',
  port: 5432,
});

async function test() {
  try {
    const res = await pool.query('SELECT 1');
    console.log('Connected to localhost');
  } catch (err) {
    console.error('ERROR MESSAGE START');
    console.error(err);
    console.error('ERROR MESSAGE END');
  }
  process.exit(0);
}

test();
