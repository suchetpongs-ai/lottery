
const TARGET_URL = 'http://127.0.0.1:3001/api/auth/register';

const conflictingUser = {
    username: 'suchetpong',
    phoneNumber: '0807458960',
    password: 'Password123!',
};

async function testConflict() {
    console.log('Testing registration for supposedly existing user:', conflictingUser.username);
    try {
        const response = await fetch(TARGET_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(conflictingUser),
        });

        console.log(`Response Status: ${response.status}`);
        const data = await response.json();
        console.log('Response Body:', data);

        if (response.status === 409) {
            console.log('⚠️ CONFLICT CONFIRMED: API thinks user exists.');
        } else if (response.status === 201) {
            console.log('✅ CREATED: User did not exist, now created.');
        } else {
            console.log('❓ Unexpected status:', response.status);
        }

    } catch (error) {
        console.error('❌ Network Error:', error);
    }
}

testConflict();
