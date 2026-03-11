const { Pool } = require('pg');

const prodConfig = {
    host: 'pg-dbins-dev.c3ii8s888to9.eu-north-1.rds.amazonaws.com',
    database: 'tripflux_db',
    user: 'postgres',
    password: 'Dwaithdev123',
    port: 5432,
    ssl: { rejectUnauthorized: false }
};

async function checkItineraries() {
    const pool = new Pool(prodConfig);
    try {
        const query = `
            SELECT package_id, day_number, COUNT(*) as count, ARRAY_AGG(itinerary_id) as ids
            FROM package_itinerary
            GROUP BY package_id, day_number
            HAVING COUNT(*) > 1
        `;
        const res = await pool.query(query);
        console.log('Duplicate daily itineraries in Production:');
        console.table(res.rows);
    } catch (err) {
        console.error('Itinerary check failed:', err.message);
    } finally {
        await pool.end();
    }
}
checkItineraries();
