// Debug ticket creation
const API_URL = 'http://localhost:3001/api';

async function debug() {
    console.log('=== Debug Ticket Creation ===\n');

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

    // Create single ticket
    console.log('2. Creating single ticket...');
    const ticketsRes = await fetch(`${API_URL}/lottery/tickets`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            roundId: 1,
            tickets: [{ number: '123456', price: 80, setSize: 1 }]
        })
    });

    console.log('Status:', ticketsRes.status);
    const text = await ticketsRes.text();
    console.log('Response:', text);
}

debug().catch(console.error);
