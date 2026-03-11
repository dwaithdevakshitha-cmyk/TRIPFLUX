const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function checkSignatureNames() {
    try {
        const res = await pool.query("SELECT title FROM signature_tours");
        console.log('Signature tours:');
        res.rows.forEach(r => console.log(`'${r.title}'`));
    } catch (err) {
        console.error('Error checking names:', err);
    } finally {
        await pool.end();
    }
}

checkSignatureNames();
