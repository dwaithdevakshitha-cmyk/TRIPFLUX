const { Client } = require('pg');

const prodConfig = {
    host: 'pg-dbins-dev.c3ii8s888to9.eu-north-1.rds.amazonaws.com',
    user: 'postgres',
    password: 'Dwaithdev123',
    port: 5432,
    database: 'postgres', // Default db
    ssl: {
        rejectUnauthorized: false
    }
};

async function checkDatabases() {
    const client = new Client(prodConfig);
    try {
        await client.connect();
        const res = await client.query('SELECT datname FROM pg_database');
        console.log('Available databases on production RDS:');
        res.rows.forEach(row => console.log(`- ${row.datname}`));
    } catch (err) {
        console.error('Error listing databases:', err);
    } finally {
        await client.end();
    }
}

checkDatabases();
