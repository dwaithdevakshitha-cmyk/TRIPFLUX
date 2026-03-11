const fs = require('fs');

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
    // If the data is empty or an error, return empty array
    if (!data || data.error) {
        return [];
    }
    return data;
  } catch (err) {
    console.error(`Fetch error for query: ${q}`, err.message);
    return [];
  }
}

async function exportData() {
  // Use a smaller set of tables as requested by the user
  const tables = ['packages', 'associate_hierarchy', 'commission_levels', 'rank_levels', 'package_itinerary'];
  const data = {};

  for (const table of tables) {
    console.log(`Exporting table: ${table}`);
    const rows = await doQuery(`SELECT * FROM ${table}`);
    data[table] = rows;
    console.log(`Exported ${rows.length} rows from ${table}`);
  }

  fs.writeFileSync('tmp/exported_data.json', JSON.stringify(data, null, 2));
  console.log('Export complete. File saved to tmp/exported_data.json');
  process.exit(0);
}

exportData();
