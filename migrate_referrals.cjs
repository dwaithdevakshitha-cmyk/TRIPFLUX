const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function migrate() {
  try {
    // 1. First, we need to map existing string referrer_ids to actual logic_details.user_id
    // Some might look like "refr123", some might be "ASC12345"
    // So let's temporary add a new column for the integer ID
    console.log("Adding temporary column new_referrer_id...");
    await pool.query('ALTER TABLE referrals ADD COLUMN IF NOT EXISTS new_referrer_id INT');

    console.log("Updating new_referrer_id based on strings...");
    // 1. Try matching "refr" prefix
    await pool.query(`
      UPDATE referrals
      SET new_referrer_id = CAST(REPLACE(referrer_id, 'refr', '') AS INT)
      WHERE referrer_id LIKE 'refr%'
    `);

    // 2. Try matching associate_id or custom_user_id (e.g. ASC12345)
    await pool.query(`
      UPDATE referrals r
      SET new_referrer_id = l.user_id
      FROM login_details l
      WHERE r.referrer_id = l.associate_id OR r.referrer_id = l.custom_user_id
      AND r.new_referrer_id IS NULL
    `);

    // 3. For any others, if referrer_id is purely numeric string
    await pool.query(`
      UPDATE referrals
      SET new_referrer_id = CAST(referrer_id AS INT)
      WHERE referrer_id ~ '^\\d+$' AND new_referrer_id IS NULL
    `);

    // Remove foreign key if it existed, though there usually isn't one on the string col
    // Update the column type. But since we have a new_referrer_id, we can drop the old one
    // and rename the new one.
    console.log("Replacing old string column with integer column...");
    await pool.query('ALTER TABLE referrals DROP COLUMN referrer_id');
    await pool.query('ALTER TABLE referrals RENAME COLUMN new_referrer_id TO referrer_id');

    // Add back the reference
    console.log("Adding foreign key reference...");
    await pool.query('ALTER TABLE referrals ADD CONSTRAINT fk_referrer_user_id FOREIGN KEY (referrer_id) REFERENCES login_details(user_id)');

    console.log("Migration complete!");
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

migrate();
