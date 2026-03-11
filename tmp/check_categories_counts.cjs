const { Pool } = require('pg');

const devConfig = {
    host: '192.168.29.143',
    database: 'tripfluxdev',
    user: 'postgres',
    password: 'admin123',
    port: 5432
};

async function checkCategories() {
    const pool = new Pool(devConfig);
    try {
        const res = await pool.query('SELECT category, COUNT(*) FROM packages GROUP BY category');
        console.log('Package Categories in Development:');
        console.table(res.rows);
    } finally {
        await pool.end();
    }
}
checkCategories();
