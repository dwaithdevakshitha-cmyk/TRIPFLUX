const http = require('http');

async function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const postData = body ? JSON.stringify(body) : '';
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (body) options.headers['Content-Length'] = Buffer.byteLength(postData);

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
                catch (e) { resolve({ status: res.statusCode, body: data }); }
            });
        });
        req.on('error', (e) => reject(e));
        if (body) req.write(postData);
        req.end();
    });
}

async function debugCommissions() {
    const ts = Date.now();
    console.log('--- DEBUGGING COMMISSIONS ---');

    // 1. Create Parent Associate
    const p1 = await request('POST', '/api/register', {
        firstName: 'P1', lastName: 'Assoc', email: `p1_${ts}@example.com`,
        phone: '8000000001', password: 'P', role: 'associate', dateOfBirth: '1980-01-01'
    });
    console.log('P1 (Parent) created:', p1.status, p1.body.user_id, 'Promo:', p1.body.promo_code);

    // 2. Create Child Associate referred by P1
    const c1 = await request('POST', '/api/register', {
        firstName: 'C1', lastName: 'Assoc', email: `c1_${ts}@example.com`,
        phone: '8000000002', password: 'P', role: 'associate', dateOfBirth: '1980-01-01',
        referralCode: p1.body.promo_code
    });
    console.log('C1 (Child) created:', c1.status, c1.body.user_id, 'Promo:', c1.body.promo_code);

    // 3. Check Hierarchy
    const hierarchy = await request('POST', '/api/sql', {
        query: `SELECT * FROM associate_hierarchy WHERE associate_id = ${c1.body.user_id}`,
        params: []
    });
    console.log('Hierarchy for C1:', hierarchy.body);

    // 4. Create User referred by C1
    const u1 = await request('POST', '/api/register', {
        firstName: 'U1', lastName: 'User', email: `u1_${ts}@example.com`,
        phone: '8000000003', password: 'P', role: 'user',
        referralCode: c1.body.promo_code
    });
    console.log('U1 (User) created:', u1.status, u1.body.user_id);

    // 5. Book tour for U1
    const booking = await request('POST', '/api/bookings', {
        userId: u1.body.user_id,
        userEmail: u1.body.email,
        packageId: 63, // Correct ID from DB
        travelDate: '2026-12-31',
        totalAmount: 10000,
        passengers: [{ name: 'Test', age: 25, gender: 'M' }]
    });
    console.log('Booking Status:', booking.status);
    if (booking.status === 201) {
        console.log('Booking Associate ID:', booking.body.booking.associate_id);

        const comms = await request('POST', '/api/sql', {
            query: `SELECT * FROM commissions WHERE booking_id = ${booking.body.booking.booking_id}`,
            params: []
        });
        console.log('Commissions for booking:', comms.body);
    }
}

debugCommissions();
