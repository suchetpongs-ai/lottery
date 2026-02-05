
const RANDOM_ID = Math.floor(Math.random() * 100000);
const TARGET_URL = 'http://localhost:3001/api/auth/register';

const testUser = {
    username: `test_user_${RANDOM_ID}`,
    // Generate a valid 10-digit Thai phone number starting with 08
    phoneNumber: `08${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
    password: 'Password123!',
};

console.log('Testing registration with:', JSON.stringify(testUser, null, 2));

async function runTest() {
    try {
        const response = await fetch(TARGET_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testUser),
        });

        const contentType = response.headers.get('content-type');
        let data;
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        console.log(`Response Status: ${response.status}`);
        console.log('Response Body:', data);

        if (response.ok) {
            console.log('✅ Registration Successful!');
        } else {
            console.log('❌ Registration Failed');
        }

    } catch (error) {
        console.error('❌ Network or Script Error:', error);
    }
}

runTest();
