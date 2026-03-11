const fetch = require('node-fetch');

const API_URL = 'http://localhost:3001/api/sql';

async function doQuery(q) {
  try {
    const r = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q })
    });
    const data = await r.json();
    if (!r.ok) {
        console.error(`Error for query: ${q}`, data);
        return [];
    }
    return data;
  } catch (err) {
    console.error(`Fetch error for query: ${q}`, err.message);
    return [];
  }
}

async function exportData() {
  const tables = ['packages', 'associate_hierarchy', 'commission_levels', 'rank_levels', 'package_itinerary'];
  const data = {};

  for (const table of tables) {
    console.log(`Exporting table: ${table}`);
    const rows = await doQuery(`SELECT * FROM ${table}`);
    data[table] = rows;
    console.log(`Exported ${rows.length} rows from ${table}`);
  }

  require('fs').writeFileSync('tmp/exported_data.json', JSON.stringify(data, null, 2));
  process.exit(0);
}

exportData();
