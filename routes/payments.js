const express = require('express');
const router = express.Router();
const stripeUtil = require('../utils/stripe');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   GET /api/payments/config
 * @desc    Get Stripe Public Key
 * @access  Private
 */
router.get('/config', authenticateToken, (req, res) => {
    res.json({
        publicKey: process.env.STRIPE_PUBLIC_KEY
    });
});

/**
 * @route   POST /api/payments/create-checkout-session
 * @desc    Create Stripe Checkout Session
 * @access  Private
 */
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
    const { plan } = req.body;
    const userEmail = req.user.email;

    // Define price IDs for plans (These would normally be in Stripe Dashboard)
    // For demo, we'll use placeholder IDs or actual ones if provided in .env
    const planPriceMap = {
        'premium': process.env.STRIPE_PRICE_PREMIUM || 'price_premium_placeholder',
        'pro': process.env.STRIPE_PRICE_PRO || 'price_pro_placeholder'
    };

    const priceId = planPriceMap[plan];

    if (!priceId) {
        return res.status(400).json({ error: 'Invalid subscription plan' });
    }

    try {
        const redirectUrl = `${req.protocol}://${req.get('host')}`;
        const session = await stripeUtil.createCheckoutSession(
            userEmail,
            priceId,
            `${redirectUrl}/dashboard-client.html?session_id={CHECKOUT_SESSION_ID}`,
            `${redirectUrl}/subscription.html`
        );

        res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   POST /api/payments/verify-paypal-subscription
 * @desc    Verify PayPal Subscription
 * @access  Private
 */
router.post('/verify-paypal-subscription', authenticateToken, async (req, res) => {
    const { subscriptionId, plan } = req.body;
    const userId = req.user.userId;

    if (!subscriptionId) {
        return res.status(400).json({ error: 'Subscription ID is required' });
    }

    try {
        const paypalUtil = require('../utils/paypal');
        const verification = await paypalUtil.verifySubscription(subscriptionId);

        if (verification.status === 'ACTIVE') {
            // Update user subscription tier in DB
            const db = require('../config/database');
            await db.query(
                'UPDATE users SET subscription_tier = $1 WHERE id = $2',
                [plan, userId]
            );

            res.json({ success: true, message: 'Subscription verified and account updated' });
        } else {
            res.status(400).json({ error: 'Subscription is not active' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
