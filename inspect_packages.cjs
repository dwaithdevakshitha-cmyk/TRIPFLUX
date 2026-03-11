const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function check() {
    try {
        const res = await pool.query("SELECT * FROM packages");
        console.log("Packages count:", res.rowCount);
        console.log(res.rows.map(r => ({ id: r.package_id, name: r.name })));
    } catch (err) {
        console.error(err.message);
    } finally {
        await pool.end();
    }
}
check();
