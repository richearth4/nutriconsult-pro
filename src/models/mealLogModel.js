const db = require('../config/database');

const MealLogModel = {
    /**
     * Log a new meal
     * @param {Object} data 
     * @returns {Promise<Object>}
     */
    async create({ userId, dish, calories, protein, carbs, fat }) {
        const result = await db.query(`
            INSERT INTO meal_logs (user_id, dish, calories, protein, carbs, fat)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, user_id, dish, calories, protein, carbs, fat, created_at;
        `, [userId, dish, calories, protein, carbs, fat]);
        return result.rows[0];
    },

    /**
     * Fetch recent meal logs for a specific user
     * @param {string|number} userId 
     * @param {number} limit 
     * @returns {Promise<Array>}
     */
    async findRecentByUserId(userId, limit = 10) {
        const result = await db.query(`
            SELECT * FROM meal_logs 
            WHERE user_id = $1 
            ORDER BY created_at DESC
            LIMIT $2
        `, [userId, limit]);
        return result.rows;
    }
};

module.exports = MealLogModel;
