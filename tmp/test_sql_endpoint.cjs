const fetch = require('node-fetch');

async function testSqlEndpoint() {
    const query = 'SELECT * FROM packages WHERE status = \'active\' LIMIT 1';
    try {
        const response = await fetch('http://localhost:3001/api/sql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, params: [] })
        });
        const data = await response.json();
        console.log('SQL Endpoint response for 1 row:');
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Fetch failed:', err.message);
    }
}
testSqlEndpoint();
