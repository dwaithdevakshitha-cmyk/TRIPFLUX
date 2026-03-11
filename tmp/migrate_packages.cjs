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

async function migrate() {
  try {
    console.log('Migrating packages table...');
    await pool.query(`
      ALTER TABLE packages 
      ADD COLUMN IF NOT EXISTS price_basis VARCHAR(100) DEFAULT 'Per Person',
      ADD COLUMN IF NOT EXISTS price_advance VARCHAR(100),
      ADD COLUMN IF NOT EXISTS highlights TEXT[],
      ADD COLUMN IF NOT EXISTS image TEXT,
      ADD COLUMN IF NOT EXISTS transport_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS contact_email VARCHAR(100),
      ADD COLUMN IF NOT EXISTS features TEXT[],
      ADD COLUMN IF NOT EXISTS terms TEXT[],
      ADD COLUMN IF NOT EXISTS media_files JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS itinerary JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS custom_id VARCHAR(50),
      ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Domestic';
    `);
    console.log('Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
