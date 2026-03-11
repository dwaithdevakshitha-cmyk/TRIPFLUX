const { Client } = require('pg');

async function checkLocalDB() {
    const dbs = ['tripfluxdev', 'tripflux', 'postgres', 'bodhaai'];
    const results = {};

    for (const db of dbs) {
        console.log(`Checking database: ${db}`);
        const client = new Client({
            user: 'postgres',
            password: 'admin123',
            host: 'localhost',
            database: db,
            port: 5432
        });

        try {
            await client.connect();

            // First check if packages table exists
            const tableCheck = await client.query("SELECT 1 FROM information_schema.tables WHERE table_name = 'packages'");
            if (tableCheck.rowCount === 0) {
                console.log(`  - No 'packages' table found in ${db}`);
                await client.end();
                continue;
            }

            const res = await client.query("SELECT name, description, activity_description FROM packages WHERE (description IS NOT NULL AND description != '') OR (activity_description IS NOT NULL AND activity_description != '')");
            console.log(`  - Found ${res.rows.length} packages with descriptions in ${db}`);

            if (res.rows.length > 0) {
                results[db] = res.rows;
                console.log('Sample data found!');
            }

            await client.end();
        } catch (e) {
            console.log(`  - Error checking ${db}: ${e.message}`);
        }
    }

    if (Object.keys(results).length > 0) {
        console.log('\n--- SUMMARY OF DESCRIPTIONS FOUND ---');
        console.log(JSON.stringify(results, null, 2));
    } else {
        console.log('\nNo descriptions found in any local database in the known columns.');
    }
}

checkLocalDB();
