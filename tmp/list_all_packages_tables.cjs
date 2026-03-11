const { Client } = require('pg');

async function listPackagesTables() {
    const client = new Client({
        user: 'postgres',
        password: 'admin123',
        host: '192.168.29.143',
        database: 'tripfluxdev',
        port: 5432
    });

    try {
        await client.connect();
        const res = await client.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_name = 'packages'");
        console.log('Packages tables:', JSON.stringify(res.rows, null, 2));
        await client.end();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

listPackagesTables();
