const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get appointments for the logged-in user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;

        let query;
        let params = [userId];

        if (role === 'admin') {
            query = `
                SELECT a.*, u.name as client_name, u.email as client_email
                FROM appointments a
                JOIN users u ON a.client_id = u.id
                WHERE a.nutritionist_id = $1
                ORDER BY a.appointment_date ASC
            `;
        } else {
            query = `
                SELECT a.*, u.name as nutritionist_name
                FROM appointments a
                JOIN users u ON a.nutritionist_id = u.id
                WHERE a.client_id = $1
                ORDER BY a.appointment_date ASC
            `;
        }

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Book a new appointment
router.post('/', authenticateToken, async (req, res) => {
    try {
        const clientId = req.user.userId;
        const { nutritionistId, appointmentDate, duration, notes } = req.body;

        if (req.user.role !== 'client') {
            return res.status(403).json({ error: 'Only clients can book appointments' });
        }

        const result = await db.query(
            `INSERT INTO appointments (client_id, nutritionist_id, appointment_date, duration, notes)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [clientId, nutritionistId, appointmentDate, duration || 60, notes]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ error: 'Failed to book appointment' });
    }
});

// Update appointment status (confirm/cancel)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.userId;
        const role = req.user.role;

        // Check if user is participant
        const check = await db.query('SELECT * FROM appointments WHERE id = $1', [id]);
        if (check.rows.length === 0) return res.status(404).json({ error: 'Appointment not found' });

        const appointment = check.rows[0];
        if (role === 'client' && appointment.client_id !== userId) return res.status(403).json({ error: 'Forbidden' });
        if (role === 'admin' && appointment.nutritionist_id !== userId) return res.status(403).json({ error: 'Forbidden' });

        const result = await db.query(
            'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({ error: 'Update failed' });
    }
});

module.exports = router;
