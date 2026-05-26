const db = require('../config/database');

const UserModel = {
    async findByEmail(email) {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    },

    async findById(id) {
        const result = await db.query(
            'SELECT id, email, name, role, subscription_tier FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0];
    },

    async create({ email, passwordHash, name, role = 'client', subscriptionTier = 'free' }) {
        const result = await db.query(
            `INSERT INTO users (email, password_hash, name, role, subscription_tier)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, email, name, role, subscription_tier`,
            [email, passwordHash, name, role, subscriptionTier]
        );
        return result.rows[0];
    },

    async updateSubscription(userId, tier, expiry) {
        const result = await db.query(
            'UPDATE users SET subscription_tier = $1, subscription_expiry = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
            [tier, expiry, userId]
        );
        return result.rows[0];
    }
};

module.exports = UserModel;
