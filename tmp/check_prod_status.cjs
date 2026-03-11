const { Pool } = require('pg');

const prodConfig = {
    host: 'pg-dbins-dev.c3ii8s888to9.eu-north-1.rds.amazonaws.com',
    database: 'tripflux_db',
    user: 'postgres',
    password: 'Dwaithdev123',
    port: 5432,
    ssl: { rejectUnauthorized: false }
};

async function checkStatus() {
    const pool = new Pool(prodConfig);
    try {
        const res = await pool.query("SELECT status, COUNT(*) FROM packages GROUP BY status");
        console.log('Package Status in Production:');
        console.table(res.rows);
    } finally {
        await pool.end();
    }
}
checkStatus();
