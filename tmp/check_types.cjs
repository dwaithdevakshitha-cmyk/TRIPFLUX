const { Pool } = require('pg');

const devConfig = { host: '192.168.29.143', database: 'tripfluxdev', user: 'postgres', password: 'admin123', port: 5432 };
const prodConfig = { host: 'pg-dbins-dev.c3ii8s888to9.eu-north-1.rds.amazonaws.com', database: 'tripflux_db', user: 'postgres', password: 'Dwaithdev123', port: 5432, ssl: { rejectUnauthorized: false } };

async function checkTypes() {
    const devPool = new Pool(devConfig);
    const prodPool = new Pool(prodConfig);

    try {
        const table = 'packages';
        const columns = ['highlights', 'features', 'terms', 'media_files', 'itinerary'];

        console.log(`\n--- Data Type Check for ${table} ---`);
        for (const col of columns) {
            const devRes = await devPool.query(`SELECT data_type, udt_name FROM information_schema.columns WHERE table_name = '${table}' AND column_name = '${col}'`);
            const prodRes = await prodPool.query(`SELECT data_type, udt_name FROM information_schema.columns WHERE table_name = '${table}' AND column_name = '${col}'`);

            if (devRes.rows[0]) {
                console.log(`${col}: Dev=${devRes.rows[0].data_type}(${devRes.rows[0].udt_name}) | Prod=${prodRes.rows[0]?.data_type}(${prodRes.rows[0]?.udt_name})`);
            }
        }
    } finally {
        await devPool.end(); await prodPool.end();
    }
}
checkTypes();
