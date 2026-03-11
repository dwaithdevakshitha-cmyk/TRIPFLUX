const http = require('http');

const data = JSON.stringify({
    query: 'SELECT category, COUNT(*) FROM packages GROUP BY category',
    params: []
});

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
    res.on('end', () => {
        console.log('Response Status:', res.statusCode);
        console.log('Response Body:', body);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
