const { Client } = require('pg');

async function findDescriptions() {
    const configs = [
        { host: 'localhost', database: 'tripfluxdev' },
        { host: '192.168.29.143', database: 'tripfluxdev' },
        { host: 'localhost', database: 'postgres' },
        { host: '192.168.29.143', database: 'postgres' }
    ];

    for (const config of configs) {
        console.log(`Checking ${config.host}/${config.database}...`);
        const client = new Client({
            user: 'postgres',
            password: 'admin123',
            host: config.host,
            database: config.database,
            port: 5432
        });

        try {
            await client.connect();
            const res = await client.query("SELECT name, description, activity_description FROM packages WHERE (description IS NOT NULL AND description != '') OR (activity_description IS NOT NULL AND activity_description != '')");
            console.log(`  - Found ${res.rows.length} rows.`);
            if (res.rows.length > 0) {
                console.log(JSON.stringify(res.rows, null, 2));
            }
            await client.end();
        } catch (err) {
            console.log(`  - Error: ${err.message}`);
        }
    }
}

findDescriptions();
