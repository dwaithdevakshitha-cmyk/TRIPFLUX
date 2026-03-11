const { Pool } = require('pg');

const devConfig = { host: '192.168.29.143', database: 'tripfluxdev', user: 'postgres', password: 'admin123', port: 5432 };
const prodConfig = { host: 'pg-dbins-dev.c3ii8s888to9.eu-north-1.rds.amazonaws.com', database: 'tripflux_db', user: 'postgres', password: 'Dwaithdev123', port: 5432, ssl: { rejectUnauthorized: false } };

async function compareTables() {
    const devPool = new Pool(devConfig);
    const prodPool = new Pool(prodConfig);

    try {
        const tables = ['commission_levels', 'rank_levels', 'packages', 'package_itinerary'];
        for (const table of tables) {
            console.log(`\n--- Comparing table: ${table} ---`);
            const devCols = await devPool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table}'`);
            const prodCols = await prodPool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table}'`);

            const devColNames = devCols.rows.map(r => r.column_name).sort();
            const prodColNames = prodCols.rows.map(r => r.column_name).sort();

            console.log(`Dev columns:  ${devColNames.join(', ')}`);
            console.log(`Prod columns: ${prodColNames.join(', ')}`);

            const extraInDev = devColNames.filter(x => !prodColNames.includes(x));
            const extraInProd = prodColNames.filter(x => !devColNames.includes(x));

            if (extraInDev.length > 0) console.log(`[!] Extra in Dev:  ${extraInDev.join(', ')}`);
            if (extraInProd.length > 0) console.log(`[!] Extra in Prod: ${extraInProd.join(', ')}`);
            if (extraInDev.length === 0 && extraInProd.length === 0) console.log('Columns match perfectly.');
        }
    } finally {
        await devPool.end(); await prodPool.end();
    }
}
compareTables();
