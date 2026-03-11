const { Pool } = require('pg');

const prodConfig = {
    host: 'pg-dbins-dev.c3ii8s888to9.eu-north-1.rds.amazonaws.com',
    database: 'tripflux_db',
    user: 'postgres',
    password: 'Dwaithdev123',
    port: 5432,
    ssl: { rejectUnauthorized: false }
};

async function cleanItineraries() {
    const pool = new Pool(prodConfig);
    try {
        console.log('Cleaning up duplicate itineraries in Production...');
        const query = `
            DELETE FROM package_itinerary
            WHERE itinerary_id NOT IN (
                SELECT MAX(itinerary_id)
                FROM package_itinerary
                GROUP BY package_id, day_number
            )
        `;
        const res = await pool.query(query);
        console.log(`Successfully removed ${res.rowCount} duplicate itinerary rows.`);
    } catch (err) {
        console.error('Itinerary cleanup failed:', err.message);
    } finally {
        await pool.end();
    }
}
cleanItineraries();
