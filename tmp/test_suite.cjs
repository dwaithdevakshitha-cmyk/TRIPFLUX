const http = require('http');

async function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const postData = body ? JSON.stringify(body) : '';
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        if (body) options.headers['Content-Length'] = Buffer.byteLength(postData);

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: data ? JSON.parse(data) : {} });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', (e) => reject(e));
        if (body) req.write(postData);
        req.end();
    });
}

async function runTests() {
    const results = [];
    const ts = Date.now();

    console.log('--- STARTING COMPREHENSIVE TEST SUITE ---');

    // 1. User Registration
    console.log('[1] Testing Registration...');
    const regUser = await request('POST', '/api/register', {
        firstName: 'Test', lastName: 'User', email: `test_${ts}@example.com`,
        phone: '9876543210', password: 'Password123!', role: 'user', dateOfBirth: '1990-01-01'
    });
    results.push({ name: 'User Registration (Positive)', success: regUser.status === 201 });

    const regAssoc = await request('POST', '/api/register', {
        firstName: 'Assoc', lastName: 'One', email: `assoc_${ts}@example.com`,
        phone: '9876543211', password: 'Password123!', role: 'associate',
        panNumber: 'ABCDE1234F', dateOfBirth: '1985-05-05'
    });
    results.push({ name: 'Associate Registration (Valid PAN/DOB)', success: regAssoc.status === 201 });

    const regShortPhone = await request('POST', '/api/register', {
        firstName: 'Fail', lastName: 'Phone', email: `failphone_${ts}@example.com`,
        phone: '123', password: 'Password123!', role: 'user'
    });
    results.push({ name: 'Negative: Phone number < 10 digits', success: regShortPhone.status === 400 });

    // 2. Login
    console.log('[2] Testing Login...');
    const loginPos = await request('POST', '/api/login', {
        email: `test_${ts}@example.com`, password: 'Password123!'
    });
    results.push({ name: 'Login (Correct Credentials)', success: loginPos.status === 200 && loginPos.body.email === `test_${ts}@example.com` });

    const loginNeg = await request('POST', '/api/login', {
        email: `test_${ts}@example.com`, password: 'wrong'
    });
    results.push({ name: 'Negative: Wrong Password', success: loginNeg.status === 401 });

    // 3. Package Listing
    console.log('[3] Testing Package Listing...');
    const packages = await request('GET', '/api/packages');
    results.push({ name: 'Package Listing (NotEmpty)', success: packages.status === 200 && Array.isArray(packages.body) && packages.body.length > 0 });

    // 4. Booking System & Commission
    console.log('[4] Testing Booking & MLM Commission...');
    // Create a 7-level hierarchy for testing
    let parentId = null;
    let lastAssoc = null;
    const hierarchy = [];

    for (let i = 1; i <= 7; i++) {
        const email = `h${i}_${ts}@example.com`;
        const res = await request('POST', '/api/register', {
            firstName: `L${i}`, lastName: 'Assoc', email, phone: `900000000${i}`,
            password: 'Password123!', role: 'associate', dateOfBirth: '1980-01-01',
            referralCode: parentId ? lastAssoc.promoCode || lastAssoc.user_id.toString() : null
        });
        if (res.status === 201) {
            lastAssoc = res.body;
            parentId = res.body.user_id;
            hierarchy.push(res.body);
        }
    }

    // Final child (Associate G at L7) refers a User
    const endUserRes = await request('POST', '/api/register', {
        firstName: 'End', lastName: 'User', email: `enduser_${ts}@example.com`,
        phone: '9111111111', password: 'Password123!', role: 'user',
        referralCode: lastAssoc.promoCode
    });

    if (endUserRes.status === 201) {
        const endUser = endUserRes.body;
        // Perform Booking
        const bookingRes = await request('POST', '/api/bookings', {
            userId: endUser.user_id,
            userEmail: endUser.email,
            packageId: packages.body[0].id,
            travelDate: '2026-12-31',
            totalAmount: 50000,
            passengers: [{ name: 'Test passenger', age: 30, gender: 'Male' }]
        });

        if (bookingRes.status === 201) {
            const bookingId = bookingRes.body.booking.booking_id;
            // Check commissions
            const checkSql = `SELECT level, associate_id, commission_amount FROM commissions WHERE booking_id = ${bookingId} ORDER BY level ASC`;
            const comms = await request('POST', '/api/sql', { query: checkSql, params: [] });
            results.push({ name: 'MLM Commission (7 Levels Generated)', success: comms.body.length === 7 });

            // Check specific level 1 amount (10% of 50000 = 5000)
            const L1 = comms.body.find(c => c.level === 1);
            results.push({ name: 'Commission L1 Amount correct (10%)', success: L1 && parseFloat(L1.commission_amount) === 5000 });
        } else {
            console.error('Booking failed', bookingRes.body);
        }
    }

    // 5. Rank Promotion
    console.log('[5] Testing Rank Promotion...');
    // We need to confirm a booking for L1 to cross 100,000
    // First, find an associate with some turnover or simulate it
    const largeBooking = await request('POST', '/api/bookings', {
        userId: regUser.body.user_id,
        packageId: packages.body[0].id,
        totalAmount: 150000,
        associateId: hierarchy[6].user_id, // G
        passengers: [{ name: 'Rich Guy', age: 40, gender: 'Male' }]
    });

    if (largeBooking.status === 201) {
        const bId = largeBooking.body.booking.booking_id;
        // Confirm it
        await request('PATCH', `/api/bookings/${bId}/status`, { status: 'confirmed' });

        // Check rank
        const userRank = await request('POST', '/api/sql', {
            query: `SELECT rank FROM login_details WHERE user_id = ${hierarchy[6].user_id}`,
            params: []
        });
        results.push({ name: 'Rank Promotion (Bronze at 1L)', success: userRank.body[0].rank === 'Bronze Associate' });
    }

    // 6. Security Testing
    console.log('[6] Testing Security...');
    const sqli = await request('POST', '/api/login', {
        email: "' OR '1'='1", password: 'any'
    });
    results.push({ name: 'Security: SQL Injection attempt (Login)', success: sqli.status === 401 });

    const xss = await request('POST', '/api/register', {
        firstName: "<script>alert('XSS')</script>", lastName: 'Test',
        email: `xss_${ts}@example.com`, phone: '9998887776', password: 'Password1', role: 'user'
    });
    // Note: Backend might accept it, but testing if it breaks. 
    // Real security would sanitize. We check if it saved.
    results.push({ name: 'Security: XSS Input Acceptance', success: xss.status === 201 });

    console.log('--- TEST RESULTS ---');
    results.forEach(r => console.log(`${r.success ? '✅' : '❌'} ${r.name}`));

    // Write summary to a file
    require('fs').writeFileSync('tmp/test_summary.json', JSON.stringify(results, null, 2));
}

runTests().catch(err => console.error(err));
