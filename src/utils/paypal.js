const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

/**
 * PayPal Environment Configuration
 */
function environment() {
    const clientId = process.env.PAYPAL_CLIENT_ID || 'PAYPAL_CLIENT_ID_PLACEHOLDER';
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET || 'PAYPAL_CLIENT_SECRET_PLACEHOLDER';

    return process.env.NODE_ENV === 'production'
        ? new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret)
        : new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}

/**
 * PayPal Client Initialization
 */
function client() {
    return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

const paypalUtil = {
    /**
     * Verify a subscription was successfully created
     * @param {string} subscriptionId - The ID returned by the PayPal button
     */
    async verifySubscription(subscriptionId) {
        // Note: For subscriptions, PayPal SDK might require direct REST calls if not in the SDK.
        // For demo, we'll implement a simple verification placeholder.
        console.log(`📡 Verifying PayPal Subscription: ${subscriptionId}`);

        try {
            // Real implementation would use:
            // const request = new paypal.subscriptions.SubscriptionsGetRequest(subscriptionId);
            // const response = await client().execute(request);
            // return response.result;

            return { id: subscriptionId, status: 'ACTIVE' };
        } catch (error) {
            console.error('❌ PayPal verification error:', error.message);
            throw error;
        }
    }
};

module.exports = paypalUtil;
