const { Pool } = require('pg');

const devConfig = {
    host: '192.168.29.143',
    database: 'tripfluxdev',
    user: 'postgres',
    password: 'admin123',
    port: 5432
};

async function checkSpaces() {
    const pool = new Pool(devConfig);
    try {
        const res = await pool.query("SELECT category, length(category), quote_literal(category) FROM packages LIMIT 5");
        console.log('Category check with quotes:');
        console.table(res.rows);
    } finally {
        await pool.end();
    }
}
checkSpaces();
