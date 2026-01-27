const API_URL = 'http://localhost:3001/api';

async function closeRound() {
    console.log('=== Closing Round 1 ===\n');

    // Login
    console.log('1. Logging in...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            phoneNumber: '0855400088',
            password: 'Password123'
        })
    });

    if (!loginRes.ok) {
        console.log('❌ Login failed:', loginRes.status);
        return;
    }

    const { accessToken: token } = await loginRes.json();
    console.log('✅ Logged in!\n');

    // Close Round 1
    console.log('2. Closing Round 1...');
    const closeRes = await fetch(`${API_URL}/lottery/round/1/close`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (closeRes.ok) {
        console.log('✅ Round 1 Closed!');
    } else {
        const text = await closeRes.text();
        console.log(`⚠️ Failed to close Round 1: ${closeRes.status} ${text}`);
    }
}

closeRound().catch(console.error);
