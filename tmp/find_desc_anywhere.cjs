const { Client } = require('pg');

async function findTableAnywhere() {
    const configs = [
        { host: '192.168.29.143', database: 'postgres' },
        { host: '192.168.29.143', database: 'tripfluxdev' }
    ];

    for (const config of configs) {
        console.log(`Searching ALL tables in ${config.host}/${config.database}...`);
        const client = new Client({
            user: 'postgres',
            password: 'admin123',
            host: config.host,
            database: config.database,
            port: 5432
        });

        try {
            await client.connect();
            const res = await client.query(`
            SELECT table_schema, table_name, column_name 
            FROM information_schema.columns 
            WHERE column_name = 'description' 
            AND table_schema NOT IN ('information_schema', 'pg_catalog')
        `);

            for (const row of res.rows) {
                const data = await client.query(`SELECT COUNT(*) FROM ${row.table_schema}.${row.table_name} WHERE description IS NOT NULL AND description != ''`);
                console.log(`  - Match: ${row.table_schema}.${row.table_name} HAS ${data.rows[0].count} descriptions.`);
                if (parseInt(data.rows[0].count) > 0) {
                    const samples = await client.query(`SELECT name, description FROM ${row.table_schema}.${row.table_name} WHERE description IS NOT NULL AND description != '' LIMIT 1`);
                    console.log(`    SAMPLE: ${samples.rows[0].description}`);
                }
            }
            await client.end();
        } catch (err) {
            console.log(`  - Error: ${err.message}`);
        }
    }
}

findTableAnywhere();
