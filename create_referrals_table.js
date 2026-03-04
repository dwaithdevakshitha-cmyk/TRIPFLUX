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
        await pool.query(`
      CREATE TABLE IF NOT EXISTS referrals (
        referral_id SERIAL PRIMARY KEY,
        referrer_id INT REFERENCES login_details(user_id),
        referred_user_id INT REFERENCES login_details(user_id),
        referral_type VARCHAR(20) CHECK (referral_type IN ('user','associate')),
        promo_code VARCHAR(50),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log('Referrals table created successfully.');
    } catch (error) {
        console.error('Failed to create referrals table:', error);
    } finally {
        await pool.end();
    }
}

run();
