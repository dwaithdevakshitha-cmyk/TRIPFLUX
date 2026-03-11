const { Client } = require('pg');

async function checkLocalDescriptions() {
    const client = new Client({
        user: 'postgres',
        password: 'admin123',
        host: '192.168.29.143',
        database: 'tripfluxdev',
        port: 5432
    });

    try {
        await client.connect();
        // Also check if there's any other column that might store descriptions
        const schemaRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'packages'
    `);
        console.log('Columns in local packages table:', schemaRes.rows.map(r => r.column_name).join(', '));

        const res = await client.query('SELECT name, description, itinerary FROM packages');
        const hasDesc = res.rows.filter(r => r.description && r.description.trim() !== '');

        console.log(`Found ${hasDesc.length} packages with non-empty descriptions.`);
        if (hasDesc.length > 0) {
            console.log('Sample matches:');
            console.log(JSON.stringify(hasDesc.slice(0, 3), null, 2));
        } else {
            console.log('No descriptions found in "description" column locally.');
            // Check if itinerary entries have long descriptions
            const hasItineraryDesc = res.rows.filter(r => r.itinerary && r.itinerary.length > 100);
            console.log(`Found ${hasItineraryDesc.length} packages with long itinerary data.`);
        }

        await client.end();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkLocalDescriptions();
