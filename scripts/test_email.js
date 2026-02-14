require('dotenv').config();
const emailService = require('../utils/email');

async function test() {
    console.log('🚀 Testing Email Service Integration...');

    const result = await emailService.sendEmail(
        'test@example.com',
        'Test Suite Execution',
        'This is a test of the NutriConsult Pro email delivery system.'
    );

    console.log('Result:', result);
    process.exit(0);
}

test();
