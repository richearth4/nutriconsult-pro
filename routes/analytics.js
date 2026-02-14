const express = require('express');
const router = express.Router();
const db = require('../config/database');
const auth = require('../middleware/auth');

// Middleware to ensure only admins can access analytics
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Admin only.' });
    }
};

/**
 * GET /api/analytics/summary
 * Returns practice-wide summary statistics
 */
router.get('/summary', auth.authenticateToken, isAdmin, async (req, res) => {
    try {
        const stats = {};

        // 1. Total Clients
        const clientsRes = await db.query("SELECT COUNT(*) FROM users WHERE role = 'client'");
        stats.totalClients = parseInt(clientsRes.rows[0].count);

        // 2. Intake Completion Rate
        const intakeRes = await db.query("SELECT COUNT(*) FROM client_data WHERE intake_completed = true");
        stats.completedIntakes = parseInt(intakeRes.rows[0].count);
        stats.intakeRate = stats.totalClients > 0 ? (stats.completedIntakes / stats.totalClients * 100).toFixed(1) : 0;

        // 3. Active Meal Plans (Assigned in last 30 days)
        const plansRes = await db.query("SELECT COUNT(DISTINCT user_id) FROM meal_plans WHERE created_at > NOW() - INTERVAL '30 days'");
        stats.activePlans = parseInt(plansRes.rows[0].count);

        // 4. Aggregate Weight Loss (Sum of initial weight - current weight for all clients)
        const weightRes = await db.query(`
            SELECT SUM(cd.weight - u.current_weight) as total_loss
            FROM client_data cd
            JOIN (
                SELECT user_id, weight as current_weight 
                FROM weight_history wh1
                WHERE created_at = (SELECT MAX(created_at) FROM weight_history wh2 WHERE wh2.user_id = wh1.user_id)
            ) u ON cd.user_id = u.user_id
        `);
        stats.totalWeightLoss = parseFloat(weightRes.rows[0].total_loss || 0).toFixed(1);

        res.json(stats);
    } catch (error) {
        console.error('Analytics Summary Error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics summary' });
    }
});

/**
 * GET /api/analytics/trends
 * Returns monthly registration trends
 */
router.get('/trends', auth.authenticateToken, isAdmin, async (req, res) => {
    try {
        const trends = await db.query(`
            SELECT 
                TO_CHAR(created_at, 'Mon YYYY') as month,
                COUNT(*) as count,
                MIN(created_at) as sort_key
            FROM users 
            WHERE role = 'client'
            GROUP BY month
            ORDER BY sort_key ASC
            LIMIT 12
        `);

        res.json(trends.rows);
    } catch (error) {
        console.error('Analytics Trends Error:', error);
        res.status(500).json({ error: 'Failed to fetch registration trends' });
    }
});

module.exports = router;
