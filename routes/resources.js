const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all resources
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM resources ORDER BY created_at DESC');
        res.json({ success: true, resources: result.rows });
    } catch (error) {
        console.error('Get resources error:', error);
        res.status(500).json({ error: 'Failed to fetch resources' });
    }
});

// Get assigned resources for user
router.get('/assigned/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await db.query(`
      SELECT r.* FROM resources r
      JOIN resource_assignments ra ON r.id = ra.resource_id
      WHERE ra.user_id = $1
      ORDER BY ra.assigned_at DESC
    `, [userId]);

        res.json({ success: true, resources: result.rows });
    } catch (error) {
        console.error('Get assigned resources error:', error);
        res.status(500).json({ error: 'Failed to fetch assigned resources' });
    }
});

// Assign resource to user (Admin only)
router.post('/assign', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
        const { userId, resourceId } = req.body;

        // Check if already assigned
        const existing = await db.query(
            'SELECT id FROM resource_assignments WHERE user_id = $1 AND resource_id = $2',
            [userId, resourceId]
        );

        if (existing.rows.length > 0) {
            // Toggle off (remove assignment)
            await db.query(
                'DELETE FROM resource_assignments WHERE user_id = $1 AND resource_id = $2',
                [userId, resourceId]
            );
            return res.json({ success: true, action: 'unassigned' });
        }

        // Assign
        await db.query(
            'INSERT INTO resource_assignments (user_id, resource_id) VALUES ($1, $2)',
            [userId, resourceId]
        );

        res.json({ success: true, action: 'assigned' });
    } catch (error) {
        console.error('Assign resource error:', error);
        res.status(500).json({ error: 'Failed to assign resource' });
    }
});

// Add new resource (Admin only)
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
        const { title, type, url, category } = req.body;

        const result = await db.query(
            'INSERT INTO resources (title, type, url, category) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, type, url || '#', category || 'General']
        );

        res.status(201).json({ success: true, resource: result.rows[0] });
    } catch (error) {
        console.error('Add resource error:', error);
        res.status(500).json({ error: 'Failed to add resource' });
    }
});

// Delete resource (Admin only)
router.delete('/:resourceId', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
        const { resourceId } = req.params;

        await db.query('DELETE FROM resources WHERE id = $1', [resourceId]);
        res.json({ success: true, message: 'Resource deleted' });
    } catch (error) {
        console.error('Delete resource error:', error);
        res.status(500).json({ error: 'Failed to delete resource' });
    }
});

module.exports = router;
