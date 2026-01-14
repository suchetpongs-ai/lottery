const BASE_URL = 'http://localhost:3001';

async function run() {
    try {
        console.log('🚀 Starting System Verification...');

        // 1. Register
        console.log('\n📝 1. Registering User...');
        const registerRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'testverifier',
                phoneNumber: '0999999999',
                password: 'password123'
            })
        });
        const registerData = await registerRes.json();
        console.log('   Response:', registerRes.status, registerData);

        // 2. Login
        console.log('\n🔑 2. Logging in...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phoneNumber: '0999999999',
                password: 'password123'
            })
        });
        const loginData = await loginRes.json();
        console.log('   Response:', loginRes.status);

        if (!loginData.accessToken) {
            throw new Error('Login failed, no token returned');
        }
        const token = loginData.accessToken;
        console.log('   Token received');

        // 3. Create Round
        console.log('\n📅 3. Creating Round...');
        const roundRes = await fetch(`${BASE_URL}/lottery/round`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                drawDate: '2026-03-01',
                openSellingAt: '2026-02-01'
            })
        });
        const roundData = await roundRes.json();
        console.log('   Response:', roundRes.status, roundData);
        const roundId = roundData.id;

        // 4. Create Tickets
        console.log('\n🎫 4. Adding Tickets...');
        const ticketRes = await fetch(`${BASE_URL}/lottery/tickets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                roundId: roundId,
                tickets: [
                    { number: '111111', price: 80, setSize: 1 },
                    { number: '222222', price: 80, setSize: 1 },
                    { number: '333333', price: 80, setSize: 1 }
                ]
            })
        });
        const ticketData = await ticketRes.json();
        console.log('   Response:', ticketRes.status, ticketData);

        // 5. Search
        console.log('\n🔍 5. Searching Tickets...');
        const searchRes = await fetch(`${BASE_URL}/lottery/search?number=111111`, {
            method: 'GET'
        });
        const searchData = await searchRes.json();
        console.log('   Found tickets:', searchData.data.length);
        if (searchData.data.length === 0) throw new Error('Search failed');

        const ticketId = searchData.data[0].id;

        // 6. Checkout
        console.log('\n🛒 6. Checking out...');
        const checkoutRes = await fetch(`${BASE_URL}/order/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                ticketIds: [Number(ticketId)] // Ensure number type
            })
        });
        const checkoutData = await checkoutRes.json();
        console.log('   Response:', checkoutRes.status, checkoutData);

        if (checkoutRes.status !== 201) throw new Error('Checkout failed');

        console.log('\n✅ System Verification Completed Successfully!');

    } catch (error) {
        console.error('\n❌ Verification Failed:', error);
        process.exit(1);
    }
}

run();
