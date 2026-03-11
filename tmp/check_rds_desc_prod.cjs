const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false
    },
});

async function check() {
    try {
        const res = await pool.query('SELECT COUNT(*) FROM signature_tours');
        console.log('Signature Tours Count:', res.rows[0].count);

        if (res.rows[0].count > 0) {
            const samples = await pool.query('SELECT title, description FROM signature_tours WHERE description IS NOT NULL LIMIT 5');
            console.log('Sample Signature Tours with Descriptions:', JSON.stringify(samples.rows, null, 2));
        }

        const pkgRes = await pool.query('SELECT COUNT(*) FROM packages WHERE description IS NOT NULL AND description != \'\'');
        console.log('RDS Packages with Descriptions:', pkgRes.rows[0].count);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
