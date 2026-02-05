
const TARGET_URL = 'http://127.0.0.1:3001/api/auth/login';

// Use the user created in the previous step (or a generic one if you want to try failing)
// Based on previous output: 
// Username: test_user_49298
// Phone: 0835657840
// Password: Password123!

const testUser = {
    phoneNumber: '0835657840', // Try with phone
    password: 'Password123!',
};

const testUserUsername = {
    phoneNumber: 'test_user_49298', // Try with username (API supports it in same field)
    password: 'Password123!',
};

async function login(credentials, label) {
    console.log(`\nTesting login with ${label}:`, JSON.stringify(credentials, null, 2));
    try {
        const response = await fetch(TARGET_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();
        console.log(`Response Status: ${response.status}`);
        if (response.ok) {
            console.log('✅ Login Successful!');
            console.log('Token:', data.accessToken ? 'Recieved' : 'Missing');
        } else {
            console.log('❌ Login Failed:', data);
        }
    } catch (error) {
        console.error('❌ Network Error:', error);
    }
}

async function runTests() {
    await login(testUser, 'Phone Number');
    await login(testUserUsername, 'Username');
}

runTests();
