const { Pool } = require('pg');

const prodConfig = {
    host: 'pg-dbins-dev.c3ii8s888to9.eu-north-1.rds.amazonaws.com',
    database: 'tripflux_db',
    user: 'postgres',
    password: 'Dwaithdev123',
    port: 5432,
    ssl: { rejectUnauthorized: false }
};

async function updateSchema() {
    const pool = new Pool(prodConfig);
    try {
        console.log('Updating production schema...');
        await pool.query('ALTER TABLE packages ADD COLUMN IF NOT EXISTS location TEXT');
        await pool.query('ALTER TABLE packages ADD COLUMN IF NOT EXISTS track TEXT');
        await pool.query('ALTER TABLE packages ADD COLUMN IF NOT EXISTS activity_description TEXT');
        console.log('Schema updated successfully.');
    } catch (err) {
        console.error('Failed to update schema:', err.message);
    } finally {
        await pool.end();
    }
}
updateSchema();
