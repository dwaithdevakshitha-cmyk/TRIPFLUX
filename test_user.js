import fetch from 'node-fetch';

async function testApi() {
    try {
        const resU = await fetch('http://localhost:3001/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: 'TestUser',
                lastName: 'RefBy4',
                email: 'test_user_' + Date.now() + '@example.com',
                phone: '1010101010',
                password: 'password123',
                role: 'user',
                referralCode: '4'
            })
        });

        const user = await resU.json();
        console.log('Created RefUser:', user);
    } catch (e) {
        console.error('Fetch Failed', e.message);
    }
}

testApi();
