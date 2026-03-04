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

async function testReferralAndUsers() {
    try {
        const clients = await pool.query('SELECT * FROM login_details');
        console.log('Login Details:', clients.rows);

        const promos = await pool.query('SELECT * FROM promo_codes');
        console.log('Promo Codes:', promos.rows);

        const refs = await pool.query('SELECT * FROM referrals');
        console.log('Referrals:', refs.rows);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

testReferralAndUsers();
