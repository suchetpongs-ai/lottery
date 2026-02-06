const { TOTP } = require('otplib');
try {
    const totp = new TOTP();
    console.log('TOTP Instantiated');
    const secret = totp.generateSecret();
    console.log('Secret:', secret);
    const uri = totp.keyuri('user@example.com', 'App', secret);
    console.log('URI:', uri);
} catch (e) {
    console.error('Error:', e.message);
}
