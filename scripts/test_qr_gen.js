try {
    var promptpay = require('promptpay-qr');
} catch (e) {
    var promptpay = require('./apps/api/node_modules/promptpay-qr');
}
// const qrcode = require('qrcode'); // Not available, using URL instead

// Real ID provided by user
const PROMPTPAY_ID = '0637615531';
const AMOUNT = 100;

const payload = promptpay(PROMPTPAY_ID, { amount: AMOUNT });
console.log('--- PromptPay Payload ---');
console.log(payload);
console.log('-------------------------');
console.log(`For ID: ${PROMPTPAY_ID}`);
console.log(`Amount: ${AMOUNT} THB`);

// Url for visualization
console.log(`\nVisualize/Scan here: https://promptpay.io/${PROMPTPAY_ID}/${AMOUNT}`);
