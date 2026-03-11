const { Pool } = require('pg');

const prodConfig = {
    host: 'pg-dbins-dev.c3ii8s888to9.eu-north-1.rds.amazonaws.com',
    database: 'tripflux_db',
    user: 'postgres',
    password: 'Dwaithdev123',
    port: 5432,
    ssl: { rejectUnauthorized: false }
};

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

async function testProdMapping() {
    const pool = new Pool(prodConfig);
    try {
        const res = await pool.query(query);
        const rows = res.rows;
        console.log('Production rows fetched:', rows.length);

        const mapped = rows.map((row) => ({
            ...row,
            id: row.custom_id || (row.db_id ? row.db_id.toString() : 'unknown'),
            price: typeof row.price === 'number' ? `₹${row.price.toLocaleString('en-IN')}` : row.price,
            highlights: row.highlights || [],
            features: row.features || [],
            terms: row.terms || [],
            mediaFiles: row.media_files || [],
            itinerary: row.itinerary || []
        }));

        console.log('Sample Mapped Item:');
        console.log(JSON.stringify(mapped[0], (key, value) => key === 'itinerary' ? '[itinerary]' : value, 2));

        const pCount = mapped.filter(t => t.category === 'Pilgrimage' || t.category === 'Temple').length;
        const iCount = mapped.filter(t => t.category === 'International').length;
        const dCount = mapped.filter(t => t.category === 'Domestic').length;

        console.log(`Counts -> Pilgrimage: ${pCount}, International: ${iCount}, Domestic: ${dCount}`);

    } catch (err) {
        console.error('Mapping test failed:', err.message);
    } finally {
        await pool.end();
    }
}
testProdMapping();
