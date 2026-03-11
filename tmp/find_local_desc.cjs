const { Client } = require('pg');

async function findDescriptions() {
    const client = new Client({
        user: 'postgres',
        password: 'admin123',
        host: '192.168.29.143',
        database: 'tripfluxdev',
        port: 5432
    });

    try {
        await client.connect();
        // Fetch all records from the packages table and look for descriptions in multiple possible columns
        const res = await client.query('SELECT name, description, activity_description, itinerary FROM packages');

        const results = res.rows.map(row => {
            let source = null;
            let text = null;

            if (row.description && row.description.trim() !== '') {
                source = 'description';
                text = row.description;
            } else if (row.activity_description && row.activity_description.trim() !== '') {
                source = 'activity_description';
                text = row.activity_description;
            } else if (row.itinerary) {
                // Look for itinerary day descriptions
                try {
                    const itinerary = typeof row.itinerary === 'string' ? JSON.parse(row.itinerary) : row.itinerary;
                    if (Array.isArray(itinerary) && itinerary.length > 0) {
                        // Check if any activity has a reasonably long description
                        for (const day of itinerary) {
                            if (day.activities && Array.isArray(day.activities)) {
                                for (const act of day.activities) {
                                    if (act.description && act.description.length > 30) {
                                        source = 'itinerary (day ' + day.day + ')';
                                        text = act.description;
                                        break;
                                    }
                                }
                            }
                            if (source) break;
                        }
                    }
                } catch (e) { }
            }

            return { name: row.name, source, text: text ? text.substring(0, 50) + '...' : null };
        }).filter(r => r.source !== null);

        console.log(`Found ${results.length} packages with some form of description.`);
        console.log(JSON.stringify(results, null, 2));

        await client.end();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

findDescriptions();
