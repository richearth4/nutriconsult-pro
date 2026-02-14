const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get activity summary for a user
router.get('/summary/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;

        // Fetch last 7 days of activity
        const result = await db.query(
            `SELECT date, steps, active_minutes, sleep_hours, calories_burned 
             FROM activity_metrics 
             WHERE user_id = $1 
             ORDER BY date DESC LIMIT 7`,
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching activity summary:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Mock sync fitness data
router.post('/sync', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Generate mock data for today
        const mockData = {
            steps: Math.floor(Math.random() * (12000 - 5000 + 1)) + 5000,
            active_minutes: Math.floor(Math.random() * (90 - 20 + 1)) + 20,
            sleep_hours: (Math.random() * (9 - 6) + 6).toFixed(1),
            calories_burned: Math.floor(Math.random() * (600 - 200 + 1)) + 200,
            date: new Date().toISOString().split('T')[0]
        };

        // Upsert today's data
        await db.query(
            `INSERT INTO activity_metrics (user_id, date, steps, active_minutes, sleep_hours, calories_burned)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (user_id, date) DO UPDATE SET
                steps = EXCLUDED.steps,
                active_minutes = EXCLUDED.active_minutes,
                sleep_hours = EXCLUDED.sleep_hours,
                calories_burned = EXCLUDED.calories_burned`,
            [userId, mockData.date, mockData.steps, mockData.active_minutes, mockData.sleep_hours, mockData.calories_burned]
        );

        res.json({ message: 'Sync successful', data: mockData });
    } catch (error) {
        console.error('Error syncing fitness data:', error);
        res.status(500).json({ error: 'Sync failed' });
    }
});

module.exports = router;
