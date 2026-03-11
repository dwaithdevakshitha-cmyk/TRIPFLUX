const { Pool } = require('pg');

const devConfig = {
    host: '192.168.29.143',
    database: 'tripfluxdev',
    user: 'postgres',
    password: 'admin123',
    port: 5432
};

async function checkColumns() {
    const pool = new Pool(devConfig);
    try {
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'packages'");
        console.log('Columns in packages table:');
        console.table(res.rows);
    } finally {
        await pool.end();
    }
}
checkColumns();
