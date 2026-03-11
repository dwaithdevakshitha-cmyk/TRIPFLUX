const { Pool } = require('pg');

const devConfig = {
    host: '192.168.29.143',
    database: 'tripfluxdev',
    user: 'postgres',
    password: 'admin123',
    port: 5432
};

async function testQuery() {
    const pool = new Pool(devConfig);
    try {
        const query = `
        SELECT 
          package_id as db_id, 
          name as title, 
          category, 
          destination, 
          duration, 
          price, 
          description, 
          dates, 
          price_basis, 
          price_advance, 
          highlights, 
          image, 
          transport_type, 
          contact_phone, 
          contact_email, 
          features, 
          terms, 
          media_files, 
          itinerary, 
          custom_id,
          location,
          track
        FROM packages 
        WHERE status = 'active'
        ORDER BY package_id DESC
      `;
        const res = await pool.query(query);
        console.log('Query result count:', res.rows.length);
        if (res.rows.length > 0) {
            console.log('First row category:', res.rows[0].category);
        }
    } catch (err) {
        console.error('Query failed:', err.message);
    } finally {
        await pool.end();
    }
}
testQuery();
