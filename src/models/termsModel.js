const db = require('../config/database');

const TermsModel = {
    async getLatest() {
        const result = await db.query(
            'SELECT * FROM terms_and_conditions ORDER BY created_at DESC LIMIT 1'
        );
        return result.rows[0];
    },

    async create(content) {
        const result = await db.query(
            'INSERT INTO terms_and_conditions (content) VALUES ($1) RETURNING *',
            [content]
        );
        return result.rows[0];
    },

    async checkAcceptance(userId, termsId) {
        const result = await db.query(
            'SELECT * FROM user_terms_acceptance WHERE user_id = $1 AND terms_id = $2',
            [userId, termsId]
        );
        return result.rows.length > 0;
    },

    async accept(userId, termsId) {
        const result = await db.query(
            'INSERT INTO user_terms_acceptance (user_id, terms_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *',
            [userId, termsId]
        );
        return result.rows[0];
    }
};

module.exports = TermsModel;
