const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function run() {
    try {
        console.log('🚀 Starting Ticket Locking Verification...');

        // 1. Setup: Login/Register to get Token
        // Assuming we rely on existing user or create one
        let token;
        try {
            // First check if user exists by trying login
            try {
                const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
                    phoneNumber: '0999999999',
                    password: 'password123'
                });
                token = loginRes.data.accessToken;
                console.log('✅ Logged in existing user');
            } catch (loginError) {
                // If login fails, try register
                console.log('Login failed, registering new user...');
                const regRes = await axios.post(`${BASE_URL}/auth/register`, {
                    username: 'locktester',
                    phoneNumber: '0999999999',
                    password: 'password123'
                });
                // Then login
                const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
                    phoneNumber: '0999999999',
                    password: 'password123'
                });
                token = loginRes.data.accessToken;
                console.log('✅ Registered and logged in');
            }
        } catch (e) {
            console.error('Authentication failed:', e.message);
            if (e.response) console.error(e.response.data);
            return;
        }

        // 2. Find an available ticket
        let ticket;
        try {
            const searchRes = await axios.get(`${BASE_URL}/lottery/search?page=1&limit=1`);
            if (!searchRes.data.data || searchRes.data.data.length === 0) {
                // Try create round/ticket if none exist? No, too complex. Just warn.
                throw new Error('No tickets available to test. Please seed data first.');
            }
            ticket = searchRes.data.data[0];
            console.log(`🎫 Found available ticket: ID ${ticket.id} (${ticket.number})`);
        } catch (e) {
            console.error('Failed to find ticket:', e.message);
            return;
        }

        // 3. Attempt Concurrent Checkout
        console.log('\n⚡ Sending 2 concurrent checkout requests for same ticket...');

        const checkoutPayload = { ticketIds: [Number(ticket.id)] };
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const req1 = axios.post(`${BASE_URL}/order/checkout`, checkoutPayload, config);
        const req2 = axios.post(`${BASE_URL}/order/checkout`, checkoutPayload, config);

        // Capture both results regardless of success/fail
        const results = await Promise.allSettled([req1, req2]);

        const fulfilled = results.filter(r => r.status === 'fulfilled');
        const rejected = results.filter(r => r.status === 'rejected');

        console.log(`\nResults: ${fulfilled.length} Success, ${rejected.length} Failed`);

        if (fulfilled.length === 1 && rejected.length === 1) {
            console.log('\n✅ PASS: Ticket Locking Verified!');
            console.log('   One request succeeded (Order Created)');
            console.log('   One request failed (Blocked by Lock)');
            console.log('   Rejected Reason:', rejected[0].reason.response?.data?.message || rejected[0].reason.message);
        } else if (fulfilled.length === 2) {
            console.error('\n❌ FAIL: Double Spend! Both requests succeeded.');
        } else {
            console.log('\n⚠️ Inconclusive: Both failed or unexpected error.');
            rejected.forEach((r, i) => {
                console.log(`   Error ${i + 1}:`, r.reason.response?.data?.message || r.reason.message);
            });
        }

    } catch (error) {
        console.error('\n❌ Unexpected Error:', error.message);
    }
}

run();
