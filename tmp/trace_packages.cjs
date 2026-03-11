const http = require('http');

async function executeSql(query, params = []) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ query, params });
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/sql',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve(JSON.parse(body)));
        });
        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}

async function testGetPackages() {
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
    try {
        const rows = await executeSql(query);
        console.log('Got rows:', rows.length);
        if (rows.length > 0) {
            const mapped = rows.map((row) => ({
                ...row,
                id: row.custom_id || row.db_id.toString(),
                price: typeof row.price === 'number' ? `₹${row.price.toLocaleString('en-IN')}` : row.price,
                highlights: row.highlights || [],
                features: row.features || [],
                terms: row.terms || [],
                mediaFiles: row.media_files || [],
                itinerary: row.itinerary || []
            }));
            console.log('First mapped item category:', mapped[0].category);
            console.log('Categories present:', [...new Set(mapped.map(t => t.category))]);
            console.log('Filtered Pilgrimage count:', mapped.filter(t => t.category === 'Pilgrimage' || t.category === 'Temple').length);
        }
    } catch (err) {
        console.error(err);
    }
}

testGetPackages();
