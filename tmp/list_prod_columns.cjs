const { Pool } = require('pg');

const prodConfig = {
    host: 'pg-dbins-dev.c3ii8s888to9.eu-north-1.rds.amazonaws.com',
    database: 'tripflux_db',
    user: 'postgres',
    password: 'Dwaithdev123',
    port: 5432,
    ssl: { rejectUnauthorized: false }
};

async function checkProdColumns() {
    const pool = new Pool(prodConfig);
    try {
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'packages'");
        console.log('Columns in production packages table:');
        console.table(res.rows);
    } finally {
        await pool.end();
    }
}
checkProdColumns();
