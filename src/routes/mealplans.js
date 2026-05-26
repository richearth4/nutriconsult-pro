const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const emailService = require('../utils/email');

const router = express.Router();

// Get meal plan for user
router.get('/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await db.query(
            'SELECT * FROM meal_plans WHERE user_id = $1',
            [userId]
        );

        // Convert to object format { monday: {...}, tuesday: {...} }
        const mealPlan = {};
        result.rows.forEach(row => {
            mealPlan[row.day] = {
                b: row.breakfast,
                l: row.lunch,
                d: row.dinner
            };
        });

        res.json({ success: true, mealPlan });
    } catch (error) {
        console.error('Get meal plan error:', error);
        res.status(500).json({ error: 'Failed to fetch meal plan' });
    }
});

// Save meal plan
router.post('/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { day, breakfast, lunch, dinner } = req.body;

        // Check if plan exists for this day
        const existing = await db.query(
            'SELECT id FROM meal_plans WHERE user_id = $1 AND day = $2',
            [userId, day]
        );

        if (existing.rows.length > 0) {
            // Update
            await db.query(`
        UPDATE meal_plans SET
          breakfast = $1, lunch = $2, dinner = $3, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $4 AND day = $5
      `, [breakfast, lunch, dinner, userId, day]);
        } else {
            // Insert
            await db.query(`
        INSERT INTO meal_plans (user_id, day, breakfast, lunch, dinner)
        VALUES ($1, $2, $3, $4, $5)
      `, [userId, day, breakfast, lunch, dinner]);
        }

        res.json({ success: true, message: 'Meal plan saved' });
    } catch (error) {
        console.error('Save meal plan error:', error);
        res.status(500).json({ error: 'Failed to save meal plan' });
    }
});

// Get all templates
router.get('/templates', authenticateToken, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM meal_plan_templates ORDER BY created_at DESC');
        res.json({ success: true, templates: result.rows });
    } catch (error) {
        console.error('Get templates error:', error);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
});

// Apply template to user
router.post('/:userId/apply-template', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { templateId } = req.body;

        // 1. Get template
        const templateResult = await db.query('SELECT data FROM meal_plan_templates WHERE id = $1', [templateId]);
        if (templateResult.rows.length === 0) {
            return res.status(404).json({ error: 'Template not found' });
        }
        const templateData = templateResult.rows[0].data;

        // 2. Clear existing plan? Or just overwrite days?
        // Usually safer to clear or just UPSERT all days in template
        const days = Object.keys(templateData);

        for (const day of days) {
            const plan = templateData[day];
            await db.query(`
                INSERT INTO meal_plans (user_id, day, breakfast, lunch, dinner)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (user_id, day) 
                DO UPDATE SET breakfast = $3, lunch = $4, dinner = $5, updated_at = CURRENT_TIMESTAMP
            `, [userId, day, plan.b, plan.l, plan.d]);
        }

        // Send notification to client
        // Fetch user info first if needed, but we can assume req.user for admin or pass info
        // For simplicity, we log it.
        emailService.sendPlanAssignedNotification({ email: 'client@nutri.com', name: 'Client' }, 'New Template').catch(console.error);

        res.json({ success: true, message: 'Template applied successfully' });
    } catch (error) {
        console.error('Apply template error:', error);
        res.status(500).json({ error: 'Failed to apply template' });
    }
});

module.exports = router;
