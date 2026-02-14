require('dotenv').config();
const Stripe = require('stripe');

async function verifyStripe() {
    console.log('🔍 Verifying Stripe Configuration...');

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_your_secret_key') {
        console.warn('⚠️ STRIPE_SECRET_KEY is using a placeholder. Functional checkout will require a real key.');
    } else {
        console.log('✅ STRIPE_SECRET_KEY found.');
    }

    if (!process.env.STRIPE_PUBLIC_KEY || process.env.STRIPE_PUBLIC_KEY === 'pk_test_your_public_key') {
        console.warn('⚠️ STRIPE_PUBLIC_KEY is using a placeholder.');
    } else {
        console.log('✅ STRIPE_PUBLIC_KEY found.');
    }

    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

    try {
        console.log('📡 Testing Stripe connectivity...');
        // Just a simple call to verify the key works (even if it's a placeholder, it might fail with "Invalid Key")
        await stripe.balance.retrieve();
        console.log('✅ Stripe connection successful!');
    } catch (error) {
        if (error.message.includes('Invalid API Key')) {
            console.error('❌ Stripe Verification Failed: Invalid API Key. Please update your .env file with real keys.');
        } else {
            console.error('❌ Stripe Connection Error:', error.message);
        }
    }
}

verifyStripe();
