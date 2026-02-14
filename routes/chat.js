const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   GET /api/chat/history/:otherUserId
 * @desc    Get chat history between current user and another user
 * @access  Private
 */
router.get('/history/:otherUserId', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { otherUserId } = req.params;

    try {
        const result = await db.query(`
            SELECT m.*, u.name as sender_name 
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE (m.sender_id = $1 AND m.receiver_id = $2)
               OR (m.sender_id = $2 AND m.receiver_id = $1)
            ORDER BY m.created_at ASC
        `, [userId, otherUserId]);

        res.json({ messages: result.rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route   POST /api/chat/read
 * @desc    Mark messages as read
 * @access  Private
 */
router.post('/read', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { senderId } = req.body;

    try {
        await db.query(
            'UPDATE messages SET is_read = TRUE WHERE receiver_id = $1 AND sender_id = $2',
            [userId, senderId]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
