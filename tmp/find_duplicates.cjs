const { Pool } = require('pg');

const prodConfig = {
    host: 'pg-dbins-dev.c3ii8s888to9.eu-north-1.rds.amazonaws.com',
    database: 'tripflux_db',
    user: 'postgres',
    password: 'Dwaithdev123',
    port: 5432,
    ssl: { rejectUnauthorized: false }
};

async function findDuplicates() {
    const pool = new Pool(prodConfig);
    try {
        const query = `
            SELECT name, category, COUNT(*) as count, ARRAY_AGG(package_id) as ids
            FROM packages
            WHERE category = 'International'
            GROUP BY name, category
            HAVING COUNT(*) > 1
        `;
        const res = await pool.query(query);
        console.log('Duplicate International Packages in Production:');
        console.table(res.rows);
    } catch (err) {
        console.error('Error finding duplicates:', err.message);
    } finally {
        await pool.end();
    }
}
findDuplicates();
