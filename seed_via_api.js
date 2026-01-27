// Seed data via API
const API_URL = 'http://localhost:3001/api';

async function seed() {
    console.log('=== Seeding Data via API ===\n');

    // Step 1: Register a test user
    console.log('1. Registering test user...');
    const registerRes = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: 'testuser',
            phoneNumber: '0855400088',
            password: 'Password123'
        })
    });

    if (!registerRes.ok) {
        const err = await registerRes.text();
        if (err.includes('already exists')) {
            console.log('   User already exists, logging in instead...');
        } else {
            console.log('❌ Registration failed:', registerRes.status, err);
            return;
        }
    } else {
        console.log('✅ User registered!\n');
    }

    // Step 2: Login to get token
    console.log('2. Logging in...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            phoneNumber: '0855400088',
            password: 'Password123'
        })
    });

    if (!loginRes.ok) {
        console.log('❌ Login failed:', loginRes.status, await loginRes.text());
        return;
    }

    const { accessToken: token } = await loginRes.json();
    console.log('✅ Logged in!\n');

    // Step 3: Create a lottery round (if admin)
    console.log('3. Creating lottery round...');
    const roundRes = await fetch(`${API_URL}/lottery/round`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name: 'งวดวันที่ 16 ก.พ. 2569',
            drawDate: '2026-02-16',
            openSellingAt: '2026-01-01',
            closeSellingAt: '2026-02-15',
            status: 'Open'
        })
    });

    if (!roundRes.ok) {
        const errText = await roundRes.text();
        console.log('   Round creation response:', roundRes.status, errText.substring(0, 100));
    } else {
        const round = await roundRes.json();
        console.log('✅ Round created! ID:', round.id);

        // Add tickets
        console.log('\n4. Adding tickets...');
        const tickets = [];
        const popular = ['123456', '888888', '999999', '000001', '555555'];
        for (const num of popular) {
            tickets.push({ number: num, price: 80, setSize: 1 });
        }
        for (let i = 0; i < 20; i++) {
            const randomNum = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
            tickets.push({ number: randomNum, price: 80, setSize: 1 });
        }

        const ticketsRes = await fetch(`${API_URL}/lottery/tickets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                roundId: round.id,
                tickets: tickets
            })
        });

        if (!ticketsRes.ok) {
            console.log('❌ Failed to add tickets:', ticketsRes.status);
        } else {
            console.log('✅ Added', tickets.length, 'tickets\n');
        }
    }

    // Step 4: Verify search works
    console.log('5. Verifying ticket search...');
    const searchRes = await fetch(`${API_URL}/lottery/search?page=1&limit=5`);
    if (!searchRes.ok) {
        console.log('❌ Search failed:', searchRes.status);
    } else {
        const data = await searchRes.json();
        console.log('✅ Found', data.pagination?.total || data.data?.length || 0, 'tickets\n');
    }

    console.log('=== Seed Complete ===');
}

seed().catch(console.error);
