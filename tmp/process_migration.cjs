const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('/certs/global-bundle.pem').toString(),
  },
});

async function migrate() {
  try {
    const data = JSON.parse(fs.readFileSync('exported_data.json'));
    console.log('--- STARTING MIGRATION ---');

    // 1. Migrate Commission Levels
    if (data.commission_levels) {
      console.log(`Migrating ${data.commission_levels.length} commission levels...`);
      for (const row of data.commission_levels) {
        await pool.query(
          `INSERT INTO commission_levels (level, percentage) 
           VALUES ($1, $2) 
           ON CONFLICT (level) DO UPDATE SET percentage = EXCLUDED.percentage`,
          [row.level, row.percentage]
        );
      }
    }

    // 2. Migrate Rank Levels
    if (data.rank_levels) {
      console.log(`Migrating ${data.rank_levels.length} rank levels...`);
      for (const row of data.rank_levels) {
        await pool.query(
          `INSERT INTO rank_levels (rank_name, turnover_required, level_order) 
           VALUES ($1, $2, $3) 
           ON CONFLICT (rank_name) DO UPDATE SET turnover_required = EXCLUDED.turnover_required, level_order = EXCLUDED.level_order`,
          [row.rank_name, row.turnover_required, row.level_order]
        );
      }
    }

    // 3. Migrate Packages
    if (data.packages) {
      console.log(`Migrating ${data.packages.length} packages...`);
      for (const pkg of data.packages) {
        const query = `
          INSERT INTO packages (
            name, destination, duration, price, description, status, category, dates, 
            price_basis, price_advance, highlights, image, transport_type, 
            contact_phone, contact_email, features, terms, media_files, itinerary, custom_id, travel_type
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
          ) ON CONFLICT DO NOTHING
        `;
        const params = [
          pkg.name, pkg.destination, pkg.duration, pkg.price, pkg.description, pkg.status, 
          pkg.category, pkg.dates, pkg.price_basis, pkg.price_advance, 
          pkg.highlights, pkg.image, pkg.transport_type, pkg.contact_phone, 
          pkg.contact_email, pkg.features, pkg.terms, 
          JSON.stringify(pkg.media_files || []), 
          JSON.stringify(pkg.itinerary || []), 
          pkg.custom_id, pkg.travel_type
        ];
        await pool.query(query, params);
      }
    }

    console.log('--- MIGRATION COMPLETE ---');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
