/**
 * Step-by-step Ticket Locking Verification
 * Runs against hauythai.com/api
 */
const BASE = 'https://hauythai.com/api';

async function req(method, path, body, token) {
    const h = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    const r = await fetch(`${BASE}${path}`, {
        method, headers: h,
        body: body ? JSON.stringify(body) : undefined,
    });
    const t = await r.text();
    let d; try { d = JSON.parse(t); } catch { d = t; }
    return { s: r.status, d };
}

(async () => {
    // 1. Login as admin
    let r = await req('POST', '/auth/login', { phoneNumber: 'admin', password: 'password123' });
    if (r.s !== 200 && r.s !== 201) { console.log('Login failed:', r.s, JSON.stringify(r.d)); return; }
    const tokenA = r.d.accessToken;
    console.log('✅ Admin logged in');

    // 2. Get available rounds
    r = await req('GET', '/admin/rounds', null, tokenA);
    if (r.s !== 200) { console.log('Rounds failed:', r.s); return; }
    const rounds = r.d;
    console.log('Rounds:', rounds.map(x => `id=${x.id} total=${x.totalTickets} sold=${x.soldTickets}`).join(', '));

    // 3. Find an available ticket (try each round)
    let ticketId = null;
    let ticketNumber = '';
    for (const round of rounds) {
        r = await req('GET', `/admin/tickets?roundId=${round.id}&page=1`, null, tokenA);
        if (r.s !== 200) continue;
        const list = r.d.data || r.d.tickets || (Array.isArray(r.d) ? r.d : []);
        const avail = list.find(t => t.status === 'Available');
        if (avail) {
            ticketId = Number(avail.id);
            ticketNumber = avail.number;
            console.log(`✅ Found Available ticket: id=${ticketId} number=${ticketNumber} (round ${round.id})`);
            break;
        }
        console.log(`  Round ${round.id}: ${list.length} tickets, available=${list.filter(t => t.status === 'Available').length}`);
    }

    if (!ticketId) {
        console.log('❌ No Available tickets found on any round. Need to seed data on production.');
        return;
    }

    // === LOCKING TESTS ===

    // Test 1: Lock ticket
    console.log('\n--- TEST 1: Admin A locks ticket ---');
    r = await req('POST', `/admin/tickets/${ticketId}/lock`, {}, tokenA);
    console.log(`  Lock: status=${r.s} ${r.s === 200 || r.s === 201 ? '✅' : '❌'}`);
    if (r.d?.lockedBy) console.log(`  lockedBy=${r.d.lockedBy}`);

    // Test 2: Login as user, try checkout
    console.log('\n--- TEST 2: User tries checkout of locked ticket ---');
    r = await req('POST', '/auth/login', { phoneNumber: 'testuser1', password: 'password123' });
    if (r.s === 200 || r.s === 201) {
        const userToken = r.d.accessToken;
        r = await req('POST', '/orders/checkout', { ticketIds: [ticketId] }, userToken);
        console.log(`  Checkout: status=${r.s} ${r.s === 400 ? '✅ (correctly rejected)' : '❌'}`);
        console.log(`  Message: ${r.d?.message || JSON.stringify(r.d).substring(0, 100)}`);
    } else {
        console.log('  ⚠️ Cannot login as user, skipping');
    }

    // Test 3: Login as admin B, try to lock same ticket
    console.log('\n--- TEST 3: Admin B tries lock same ticket ---');
    r = await req('POST', '/auth/login', { phoneNumber: '0899999902', password: 'password123' });
    if (r.s === 200 || r.s === 201) {
        const tokenB = r.d.accessToken;
        r = await req('POST', `/admin/tickets/${ticketId}/lock`, {}, tokenB);
        console.log(`  Lock attempt: status=${r.s} ${r.s === 400 || r.s === 403 ? '✅ (correctly rejected)' : '❌'}`);
        console.log(`  Message: ${r.d?.message || JSON.stringify(r.d).substring(0, 100)}`);
    } else {
        console.log('  ⚠️ Cannot login as Admin B, skipping');
    }

    // Test 4: Admin A updates ticket (auto-unlock)
    console.log('\n--- TEST 4: Admin A updates price (auto-unlock) ---');
    r = await req('PUT', `/admin/tickets/${ticketId}`, { price: 100 }, tokenA);
    console.log(`  Update: status=${r.s} ${r.s === 200 ? '✅' : '❌'}`);

    // Test 5: Now Admin B can lock
    console.log('\n--- TEST 5: After unlock, Admin B can lock ---');
    r = await req('POST', '/auth/login', { phoneNumber: '0899999902', password: 'password123' });
    if (r.s === 200 || r.s === 201) {
        const tokenB = r.d.accessToken;
        r = await req('POST', `/admin/tickets/${ticketId}/lock`, {}, tokenB);
        console.log(`  Lock: status=${r.s} ${r.s === 200 || r.s === 201 ? '✅' : '❌'}`);
        // Cleanup
        await req('POST', `/admin/tickets/${ticketId}/unlock`, {}, tokenB);
        console.log('  Cleaned up (unlocked)');
    }

    console.log('\n✨ Done!');
})();
