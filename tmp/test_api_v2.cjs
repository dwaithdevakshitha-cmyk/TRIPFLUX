async function testApi() {
    try {
        const resA = await fetch('http://localhost:3001/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: 'Assoc',
                lastName: 'A',
                email: 'assoc' + Date.now() + '@example.com',
                phone: '1234567890',
                password: 'password123',
                role: 'associate'
            })
        });

        const assoc = await resA.json();
        console.log('Created Associate:', assoc);

        const resU = await fetch('http://localhost:3001/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: 'RefUser',
                lastName: 'U',
                email: 'user' + Date.now() + '@example.com',
                phone: '0987654321',
                password: 'password123',
                role: 'user',
                referralCode: assoc.associate_id
            })
        });

        const user = await resU.json();
        console.log('Created RefUser:', user);
    } catch (e) {
        console.error('Fetch Failed', e.message);
    }
}

testApi();
