const { Client } = require('pg');

async function countDescriptions() {
    const client = new Client({
        user: 'postgres',
        password: 'admin123',
        host: '192.168.29.143',
        database: 'tripfluxdev',
        port: 5432
    });

    try {
        await client.connect();
        const res = await client.query("SELECT COUNT(*) FROM packages WHERE description IS NOT NULL AND description != ''");
        console.log('Count of non-empty descriptions:', res.rows[0].count);

        if (parseInt(res.rows[0].count) > 0) {
            const samples = await client.query("SELECT name, description FROM packages WHERE description IS NOT NULL AND description != '' LIMIT 5");
            console.log('Sample descriptions:', JSON.stringify(samples.rows, null, 2));
        }
        await client.end();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

countDescriptions();
