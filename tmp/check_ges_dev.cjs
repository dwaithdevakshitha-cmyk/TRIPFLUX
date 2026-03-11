const { Client } = require('pg');

async function findInGesDev() {
    const client = new Client({
        user: 'postgres',
        password: 'admin123',
        host: '192.168.29.143',
        database: 'ges_dev',
        port: 5432
    });

    try {
        await client.connect();
        const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables in ges_dev:', res.rows.map(r => r.table_name).join(', '));

        const pkgCheck = await client.query("SELECT 1 FROM information_schema.tables WHERE table_name = 'packages'");
        if (pkgCheck.rows.length > 0) {
            const data = await client.query("SELECT COUNT(*) FROM packages WHERE description IS NOT NULL AND description != ''");
            console.log(`Packages with descriptions in ges_dev: ${data.rows[0].count}`);
        }
        await client.end();
    } catch (err) {
        console.log(`Error checking ges_dev: ${err.message}`);
    }
}

findInGesDev();
