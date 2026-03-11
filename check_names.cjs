const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function checkNames() {
    try {
        const res = await pool.query("SELECT name FROM packages");
        console.log('Existing packages:');
        res.rows.forEach(r => console.log(`'${r.name}'`));
    } catch (err) {
        console.error('Error checking names:', err);
    } finally {
        await pool.end();
    }
}

checkNames();
