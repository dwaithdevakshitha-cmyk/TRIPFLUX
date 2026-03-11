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

async function runTests() {
  try {
    console.log('--- STARTING BACKEND TESTS ---');
    
    // 1. Get Packages
    const pkgs = await pool.query('SELECT * FROM packages WHERE status = $1', ['active']);
    console.log(`Test 1 (Packages): Found ${pkgs.rows.length} active packages.`);
    
    // 2. Test Associate Registration
    const assocEmail = `assoc_${Date.now()}@test.com`;
    // We'll simulate the API call logic since we want to test the actual register endpoint
    console.log('Test 2: Need to test /api/register via curl next...');
    
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

runTests();
