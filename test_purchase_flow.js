// Test the complete purchase flow via API
const API_URL = 'http://localhost:3001/api';

async function testPurchaseFlow() {
    console.log('=== Testing Lottery Purchase Flow ===\n');

    // Step 1: Login
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
        console.log('❌ Login failed:', loginRes.status, await loginRes.text());
        return;
    }

    const loginData = await loginRes.json();
    const token = loginData.accessToken;
    console.log('✅ Login successful!\n');

    // Step 2: Get current round info
    console.log('2. Getting current round...');
    const roundRes = await fetch(`${API_URL}/lottery/round/current`);

    if (!roundRes.ok) {
        console.log('❌ Failed to get current round:', roundRes.status);
    } else {
        const roundData = await roundRes.json();
        console.log('✅ Current Round:', roundData.id, '-', roundData.name, '\n');
    }

    // Step 3: Search for available tickets
    console.log('3. Searching for available tickets...');
    const searchRes = await fetch(`${API_URL}/lottery/search?page=1&limit=10`);

    if (!searchRes.ok) {
        console.log('❌ Failed to search tickets:', searchRes.status, await searchRes.text());
        return;
    }

    const searchData = await searchRes.json();
    const availableTickets = searchData.data?.filter(t => t.status === 'Available') || [];
    console.log('✅ Found', searchData.pagination?.total || 0, 'tickets');
    console.log('   Available:', availableTickets.length, 'tickets');

    if (availableTickets.length === 0) {
        console.log('❌ No available tickets found.');
        return;
    }

    const ticket = availableTickets[0];
    console.log('   Selected ticket:', ticket.number, '- Price:', ticket.price, 'THB');
    console.log('   Ticket ID:', ticket.id, '\n');

    // Step 4: Checkout (direct purchase - no cart needed)
    console.log('4. Checking out...');
    const checkoutRes = await fetch(`${API_URL}/order/checkout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ticketIds: [Number(ticket.id)] })
    });

    if (!checkoutRes.ok) {
        const errorText = await checkoutRes.text();
        console.log('❌ Checkout failed:', checkoutRes.status, errorText);
        return;
    }

    const orderData = await checkoutRes.json();
    console.log('✅ Order created!');
    console.log('   Order ID:', orderData.id);
    console.log('   Status:', orderData.status);
    console.log('   Total:', orderData.totalAmount, 'THB\n');

    // Step 5: Confirm payment
    console.log('5. Confirming payment...');
    const payRes = await fetch(`${API_URL}/order/${orderData.id}/pay`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (!payRes.ok) {
        const errText = await payRes.text();
        console.log('❌ Payment failed:', payRes.status, errText);
        return;
    }

    const paidOrder = await payRes.json();
    console.log('✅ Payment confirmed!');
    console.log('   Order Status:', paidOrder.status, '\n');

    // Step 6: Get user orders
    console.log('6. Getting user orders...');
    const ordersRes = await fetch(`${API_URL}/order`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!ordersRes.ok) {
        console.log('❌ Failed to get orders:', ordersRes.status);
        return;
    }

    const orders = await ordersRes.json();
    console.log('✅ User has', orders.length || 0, 'orders\n');

    console.log('=== Purchase Flow Test Complete ✅ ===');
}

testPurchaseFlow().catch(console.error);
