async function doQuery(q) {
  try {
    const r = await fetch('http://localhost:3001/api/sql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q })
    });
    const data = await r.json();
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
    if (rows && !rows.error) {
        data[table] = rows;
        console.log(`Exported ${rows.length} rows from ${table}`);
    } else {
        console.error(`Error in table ${table}:`, rows ? rows.error : 'Unknown error');
        data[table] = [];
    }
  }

  const fs = require('fs');
  fs.writeFileSync('tmp/exported_data.json', JSON.stringify(data, null, 2));
  console.log('Export complete. File saved to tmp/exported_data.json');
  process.exit(0);
}

exportData();
