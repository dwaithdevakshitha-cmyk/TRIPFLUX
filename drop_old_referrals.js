import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function run() {
    try {
        await pool.query(`DROP TABLE IF EXISTS referrals CASCADE;`);
        console.log('Old referrals table dropped successfully.');
    } catch (error) {
        console.error('Failed to drop old referrals table:', error);
    } finally {
        await pool.end();
    }
}

run();
