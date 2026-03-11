const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const sql = `
UPDATE packages 
SET dates='2026-01-27, 2026-02-27, 2026-03-27, 2026-04-27, 2026-05-27, 2026-06-27, 2026-07-27, 2026-08-27, 2026-09-27, 2026-10-27, 2026-11-27, 2026-12-27'
WHERE name='KERALA SPECIAL PACKAGE'
`;

async function updateKerala() {
    try {
        const res = await pool.query(sql);
        console.log(`Successfully updated Kerala Special Package dates. Rows affected: ${res.rowCount}`);
    } catch (err) {
        console.error('Error updating:', err);
    } finally {
        await pool.end();
    }
}

updateKerala();
