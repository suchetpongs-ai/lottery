
async function verifyRegistration() {
    const API_URL = 'http://localhost:3001/api';
    const randomSuffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    const phoneNumber = `09${randomSuffix}`;
    const password = 'password123';
    const username = `TestUser_${randomSuffix}`;

    console.log(`Testing with Phone: ${phoneNumber}, User: ${username}`);

    try {
        // 1. Register
        console.log('--- Step 1: Register ---');
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, phoneNumber, password })
        });

        const regData = await regRes.json();
        console.log('Status:', regRes.status);
        console.log('Response:', regData);

        if (!regRes.ok) throw new Error('Registration failed');

        // 2. Login
        console.log('\n--- Step 2: Login ---');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber, password })
        });

        const loginData = await loginRes.json();
        console.log('Status:', loginRes.status);
        // console.log('Response:', loginData);

        if (!loginRes.ok || !loginData.accessToken) throw new Error('Login failed');
        const token = loginData.accessToken;
        console.log('Login Successful. Token obtained.');

        // 3. Get Profile
        console.log('\n--- Step 3: Get Profile ---');
        const profileRes = await fetch(`${API_URL}/auth/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const profileData = await profileRes.json();
        console.log('Status:', profileRes.status);
        console.log('User Profile:', profileData);

        if (!profileRes.ok) throw new Error('Get Profile failed');

        console.log('\n✅ VERIFICATION SUCCESSFUL: Registration -> Login -> Profile works.');

    } catch (error) {
        console.error('\n❌ VERIFICATION FAILED:', error.message);
        process.exit(1);
    }
}

verifyRegistration();
