const { Pool } = require('pg');

const devConfig = {
    host: '192.168.29.143',
    database: 'tripfluxdev',
    user: 'postgres',
    password: 'admin123',
    port: 5432
};

async function checkStatus() {
    const pool = new Pool(devConfig);
    try {
        const res = await pool.query('SELECT status, COUNT(*) FROM packages GROUP BY status');
        console.log('Package Status in Development:');
        console.table(res.rows);
    } finally {
        await pool.end();
    }
}
checkStatus();
