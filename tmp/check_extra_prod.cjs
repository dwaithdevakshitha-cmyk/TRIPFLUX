const { Pool } = require('pg');

const prodConfig = {
    host: 'pg-dbins-dev.c3ii8s888to9.eu-north-1.rds.amazonaws.com',
    database: 'tripflux_db',
    user: 'postgres',
    password: 'Dwaithdev123',
    port: 5432,
    ssl: { rejectUnauthorized: false }
};

async function checkExtra() {
    const pool = new Pool(prodConfig);
    try {
        const res = await pool.query("SELECT package_id, name, category, created_at FROM packages ORDER BY created_at DESC LIMIT 10");
        console.log('Latest packages in Production:');
        console.table(res.rows);
    } finally {
        await pool.end();
    }
}
checkExtra();
