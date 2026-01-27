// Debug My Orders endpoint
const API_URL = 'http://localhost:3001/api';

async function debugOrders() {
    console.log('=== Debug My Orders ===\n');

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

    // Get My Orders
    console.log('2. Fetching My Orders...');
    const res = await fetch(`${API_URL}/order/my-orders`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    console.log(`Status: ${res.status}`);
    const text = await res.text();
    console.log(`Response: ${text}`);
}

debugOrders().catch(console.error);
