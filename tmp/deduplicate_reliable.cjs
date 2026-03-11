const { Pool } = require('pg');

const prodConfig = {
    host: 'pg-dbins-dev.c3ii8s888to9.eu-north-1.rds.amazonaws.com',
    database: 'tripflux_db',
    user: 'postgres',
    password: 'Dwaithdev123',
    port: 5432,
    ssl: { rejectUnauthorized: false }
};

async function deduplicateReliably() {
    const pool = new Pool(prodConfig);
    try {
        console.log('Fetching duplicates...');
        const res = await pool.query(`
            SELECT name, status, ARRAY_AGG(package_id ORDER BY package_id DESC) as ids
            FROM packages
            WHERE category = 'International'
            GROUP BY name, status
            HAVING COUNT(*) > 1
        `);

        if (res.rows.length === 0) {
            console.log('No duplicates found.');
            return;
        }

        for (const row of res.rows) {
            const canonicalId = row.ids[0];
            const duplicateIds = row.ids.slice(1);
            console.log(`- processing "${row.name}": keeping ID ${canonicalId}, removing IDs [${duplicateIds.join(', ')}]`);

            // Re-point foreign keys
            await pool.query('UPDATE package_itinerary SET package_id = $1 WHERE package_id = ANY($2)', [canonicalId, duplicateIds]);
            await pool.query('UPDATE bookings SET package_id = $1 WHERE package_id = ANY($2)', [canonicalId, duplicateIds]);

            // Final delete
            await pool.query('DELETE FROM packages WHERE package_id = ANY($1)', [duplicateIds]);
        }
        console.log('Deduplication completed successfully.');
    } catch (err) {
        console.error('Deduplication failed:', err.message);
    } finally {
        await pool.end();
    }
}
deduplicateReliably();
