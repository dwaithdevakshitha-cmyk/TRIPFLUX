const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'tripfluxdev',
  password: 'admin123',
  port: 5432,
});

async function exportData() {
  const tables = ['packages', 'associate_hierarchy', 'commission_levels', 'rank_levels', 'package_itinerary'];
  const data = {};

  for (const table of tables) {
    try {
      console.log(`Checking table: ${table}`);
      const res = await pool.query(`SELECT * FROM ${table}`);
      data[table] = res.rows;
      console.log(`Exported ${res.rows.length} rows from ${table}`);
    } catch (err) {
      console.error(`Error in table ${table}:`, err.message);
    }
  }

  require('fs').writeFileSync('tmp/exported_data.json', JSON.stringify(data, null, 2));
  process.exit(0);
}

exportData();
