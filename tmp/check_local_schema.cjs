const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '192.168.29.143',
  database: 'tripfluxdev',
  password: 'admin123',
  port: 5432,
});

async function checkPackages() {
  try {
    const res = await pool.query("SELECT * FROM packages LIMIT 1");
    console.log('Sample Package:', JSON.stringify(res.rows[0], null, 2));
    
    const cols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'packages'");
    console.log('Package Columns:', cols.rows.map(c => c.column_name));
    
    // Check if there are other tables...
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Available Tables:', tables.rows.map(t => t.table_name));
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}

checkPackages();
