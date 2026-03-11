const { Pool } = require('pg');

const devConfig = {
    host: '192.168.29.143',
    database: 'tripfluxdev',
    user: 'postgres',
    password: 'admin123',
    port: 5432
};

async function findDevDuplicates() {
    const pool = new Pool(devConfig);
    try {
        const query = `
            SELECT name, category, COUNT(*) as count, ARRAY_AGG(package_id) as ids
            FROM packages
            WHERE category = 'International'
            GROUP BY name, category
            HAVING COUNT(*) > 1
        `;
        const res = await pool.query(query);
        console.log('Duplicate International Packages in Development:');
        console.table(res.rows);
    } catch (err) {
        console.error('Error finding dev duplicates:', err.message);
    } finally {
        await pool.end();
    }
}
findDevDuplicates();
