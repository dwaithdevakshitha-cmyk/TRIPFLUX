const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function addColumns() {
    try {
        await pool.query("ALTER TABLE packages ADD COLUMN IF NOT EXISTS dates VARCHAR(100)");
        await pool.query("ALTER TABLE packages ADD COLUMN IF NOT EXISTS travel_type VARCHAR(50) DEFAULT 'flight'");
        console.log('Columns added successfully.');
    } catch (err) {
        console.error('Error adding columns:', err);
    } finally {
        await pool.end();
    }
}

addColumns();
