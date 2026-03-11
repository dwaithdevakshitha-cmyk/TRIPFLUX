const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function findFlexibleDates() {
    try {
        const res = await pool.query("SELECT name FROM packages WHERE dates IS NULL OR dates = '2025 Flexible'");
        console.log('Packages with 2025 Flexible dates or empty dates:');
        res.rows.forEach(r => console.log(`- ${r.name}`));
    } catch (err) {
        console.error('Error fetching packages:', err);
    } finally {
        await pool.end();
    }
}

findFlexibleDates();
