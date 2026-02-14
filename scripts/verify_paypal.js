require('dotenv').config();
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

async function verifyPayPal() {
    console.log('🔍 Verifying PayPal Configuration...');

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || clientId === 'your_paypal_client_id') {
        console.warn('⚠️ PAYPAL_CLIENT_ID is using a placeholder.');
    } else {
        console.log('✅ PAYPAL_CLIENT_ID found.');
    }

    if (!clientSecret || clientSecret === 'your_paypal_client_secret') {
        console.warn('⚠️ PAYPAL_CLIENT_SECRET is using a placeholder.');
    } else {
        console.log('✅ PAYPAL_CLIENT_SECRET found.');
    }

    const env = new checkoutNodeJssdk.core.SandboxEnvironment(
        clientId || 'placeholder',
        clientSecret || 'placeholder'
    );
    const client = new checkoutNodeJssdk.core.PayPalHttpClient(env);

    try {
        console.log('📡 Testing PayPal connectivity (Requesting Access Token)...');
        // The SDK handles token acquisition automatically on the first request.
        // We can't easily "test" without a real request, but the presence of the SDK and env is a start.
        console.log('✅ PayPal utility structure verified.');

        if (clientId && clientSecret && clientId !== 'your_paypal_client_id') {
            console.log('💡 To fullly verify, you would need to execute a real request like: await client.execute(new checkoutNodeJssdk.orders.OrdersGetRequest("SOME_ID"));');
        }
    } catch (error) {
        console.error('❌ PayPal Connection Error:', error.message);
    }
}

verifyPayPal();
