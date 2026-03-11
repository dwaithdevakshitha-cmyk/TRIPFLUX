const { Pool } = require('pg');

const prodConfig = {
    host: 'pg-dbins-dev.c3ii8s888to9.eu-north-1.rds.amazonaws.com',
    database: 'tripflux_db',
    user: 'postgres',
    password: 'Dwaithdev123',
    port: 5432,
    ssl: { rejectUnauthorized: false }
};

async function deduplicate() {
    const pool = new Pool(prodConfig);
    try {
        console.log('Cleaning up duplicate International packages in Production...');
        const query = `
            DELETE FROM packages 
            WHERE category = 'International' 
            AND package_id NOT IN (
                SELECT MAX(package_id)
                FROM packages
                WHERE category = 'International'
                GROUP BY name
            )
        `;
        const res = await pool.query(query);
        console.log(`Successfully removed ${res.rowCount} duplicate packages.`);
    } catch (err) {
        console.error('Deduplication failed:', err.message);
    } finally {
        await pool.end();
    }
}
deduplicate();
