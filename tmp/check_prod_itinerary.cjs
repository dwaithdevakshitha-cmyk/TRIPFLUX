const { Pool } = require('pg');

const prodConfig = {
    host: 'pg-dbins-dev.c3ii8s888to9.eu-north-1.rds.amazonaws.com',
    database: 'tripflux_db',
    user: 'postgres',
    password: 'Dwaithdev123',
    port: 5432,
    ssl: { rejectUnauthorized: false }
};

async function checkItinerary() {
    const pool = new Pool(prodConfig);
    try {
        const res = await pool.query("SELECT itinerary FROM packages WHERE category = 'Pilgrimage' LIMIT 1");
        console.log('Itinerary in Production:');
        console.log(JSON.stringify(res.rows[0], null, 2));
    } finally {
        await pool.end();
    }
}
checkItinerary();
