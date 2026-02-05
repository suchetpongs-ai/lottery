const axios = require('axios'); // Requires axios in root, if not I'll use fetch or require from apps/api
// Note: 'axios' might not be in root node_modules. Using native fetch if possible or checking modules.
// But previously scripts failed on require. I'll try to use relative path to apps/api/node_modules if needed.
// Actually, let's use the same try/catch trick.

let axiosLib;
try {
    axiosLib = require('axios');
} catch (e) {
    try {
        axiosLib = require('./apps/api/node_modules/axios');
    } catch (e2) {
        console.error("Axios not found. Please run 'npm install axios' in root or check paths.");
        process.exit(1);
    }
}

const API_URL = 'http://76.13.18.170/api';
const PHONE = '0812345678';
const PASSWORD = 'password123';

async function main() {
    console.log(`🔵 Connecting to VPS (${API_URL})...`);

    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axiosLib.post(`${API_URL}/auth/login`, {
            phoneNumber: PHONE,
            password: PASSWORD
        });
        const token = loginRes.data.access_token;
        console.log('✅ Login successful!');

        // 2. Search for a ticket
        console.log('Searching for tickets...');
        const searchRes = await axiosLib.get(`${API_URL}/tickets/search?q=`);
        const tickets = searchRes.data.tickets || searchRes.data;

        if (tickets.length === 0) {
            console.log('❌ No tickets found. Please run seeding on VPS first!');
            return;
        }

        const targetTicket = tickets[0];
        console.log(`✅ Found ticket: ${targetTicket.number} (ID: ${targetTicket.id})`);

        // 3. Add to Cart (Optional API step, usually we create order directly from cart items, but let's check API)
        // Usually POST /orders takes a list of ticketIds.
        // Checking existing code patterns... usually Order is created from cart or directly.
        // Let's assume passed ticket ID to POST /orders or checkout.

        // Let's try creating an order with one ticket.
        console.log('Creating Order...');
        const orderRes = await axiosLib.post(`${API_URL}/orders`, {
            items: [{ ticketId: targetTicket.id, amount: 1 }]
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // If structure differs, adjust.
        // Based on typical implementation: POST /orders { items: [...] }
        const order = orderRes.data;
        console.log(`✅ Order Created! ID: ${order.id}, Amount: ${order.totalAmount}`);

        // 4. Generate QR
        console.log('Generating Payment QR...');
        const qrRes = await axiosLib.post(`${API_URL}/payment/tmweasy/create`, {
            orderId: order.id,
            amount: order.totalAmount
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const qrData = qrRes.data;
        console.log('\n=============================================');
        console.log('🎉 PAYMENT QR CODE GENERATED');
        console.log('=============================================');
        console.log(`Order ID: ${order.id}`);
        console.log(`Amount:   ${order.totalAmount} THB`);
        console.log(`Payload:  ${qrData.qrPayload}`);
        console.log(`\n👉 Visualize/Scan: https://promptpay.io/${qrData.qrPayload ? 'payload/' + qrData.qrPayload : ''}`); // Actually promptpay.io needs specific format or just text
        // Improved link:
        // https://promptpay.io/payload/<payload> might not work.
        // Usually promptpay.io/ID/AMOUNT works. But payload is generic.
        // We can just print the payload for them.

        console.log('\n(Copy the payload to generate QR if needed, or check the link below if it works)');
        // promptpay.io doesn't verify payload directly via URL cleanly.
        // But the payload string itself is what they need.
        console.log('=============================================');

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

main();
