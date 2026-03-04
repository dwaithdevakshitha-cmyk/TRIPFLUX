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
    // 1. Get all associates
    const associatesRes = await pool.query("SELECT user_id, first_name, last_name, date_of_birth FROM login_details WHERE role = 'associate'");
    console.log(`Found ${associatesRes.rows.length} associates.`);

    for (const assoc of associatesRes.rows) {
      // 2. Check if already has a code
      const existingRes = await pool.query("SELECT * FROM promo_codes WHERE associate_id = $1", [assoc.user_id]);
      
      if (existingRes.rows.length === 0) {
        // 3. Generate code: First name + unique identifier (last 4 of DOB or user_id)
        const firstName = (assoc.first_name || 'ASSOC').toUpperCase().replace(/[^A-Z0-9]/g, '');
        
        let uniqueSuffix = assoc.user_id;
        if (assoc.date_of_birth) {
           // Try to get last digits of DOB year or day if available
           const dobStr = String(assoc.date_of_birth);
           uniqueSuffix = dobStr.slice(-2) + assoc.user_id;
        }

        const code = `${firstName}${uniqueSuffix}`;
        
        console.log(`Generating code ${code} for associate ${assoc.first_name} ${assoc.last_name || ''} (ID: ${assoc.user_id})`);
        
        await pool.query(
          "INSERT INTO promo_codes (code, associate_id, status, created_at) VALUES ($1, $2, $3, $4)",
          [code, assoc.user_id, 'active', new Date()]
        );
      } else {
        console.log(`Associate (ID: ${assoc.user_id}) already has a promo code: ${existingRes.rows[0].code}`);
      }
    }
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
