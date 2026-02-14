const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const stripeUtil = {
    /**
     * Create a Stripe Checkout Session for a subscription
     * @param {string} customerEmail - Client's email
     * @param {string} priceId - Stripe Price ID for the plan
     * @param {string} successUrl - URL to redirect after success
     * @param {string} cancelUrl - URL to redirect after cancellation
     */
    async createCheckoutSession(customerEmail, priceId, successUrl, cancelUrl) {
        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                customer_email: customerEmail,
                success_url: successUrl,
                cancel_url: cancelUrl,
            });

            return { id: session.id, url: session.url };
        } catch (error) {
            console.error('❌ Stripe checkout session error:', error.message);
            throw error;
        }
    },

    /**
     * Retrieve a session to verify its status
     * @param {string} sessionId 
     */
    async getSession(sessionId) {
        return await stripe.checkout.sessions.retrieve(sessionId);
    }
};

module.exports = stripeUtil;
