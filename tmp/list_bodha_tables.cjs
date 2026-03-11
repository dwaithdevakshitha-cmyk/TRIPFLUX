const { Client } = require('pg');

async function listBodhaTables() {
    const client = new Client({
        user: 'postgres',
        password: 'admin123',
        host: '192.168.29.143',
        database: 'bodhaai',
        port: 5432
    });

    try {
        await client.connect();
        const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables in bodhaai:', res.rows.map(r => r.table_name).join(', '));
        await client.end();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

listBodhaTables();
