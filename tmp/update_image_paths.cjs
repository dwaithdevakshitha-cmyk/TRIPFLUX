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

const updates = [
  { name: 'Tirupati', image: '/assets/images/thirupathi.jpg' },
  { name: 'SINGAPORE & MALAYSIA SPECIAL', image: '/assets/images/Malaysians-1.webp' },
  { name: 'AMARNATH YATRA SPECIAL', image: '/assets/images/amarnath.jpg' },
  { name: 'TAMIL NADU SPECIAL PACKAGE', image: '/assets/images/tamilnadu.jpg' },
  { name: 'KASHI SPECIAL PACKAGE', image: '/assets/images/kashi3.jpg' },
  { name: 'CHARDHAM SPECIAL PACKAGE', image: '/assets/images/Kedarnath.jpg' } // Using Kedarnath as the hero image for Chardham as requested/relevant
];

async function update() {
  try {
    for (const item of updates) {
      console.log(`Updating ${item.name} to use ${item.image}...`);
      await pool.query(
        "UPDATE packages SET image = $1 WHERE name = $2",
        [item.image, item.name]
      );
    }
    console.log('Update successful!');
    process.exit(0);
  } catch (err) {
    console.error('Update failed:', err);
    process.exit(1);
  }
}

update();
