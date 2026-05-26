const express = require('express');
const router = express.Router();
const AppointmentModel = require('../models/appointmentModel');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get appointments for the logged-in user (Paginated)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0; // Using offset for simpler calendar view pagination

        // Call the model method to get paginated appointments
        const appointments = await AppointmentModel.findByParticipant({
            userId,
            role,
            limit,
            offset
        });

        // Get total count for pagination UI
        const total = await AppointmentModel.findCountByParticipant({
            userId,
            role
        });

        res.json({
            success: true,
            appointments,
            meta: {
                total,
                limit,
                offset,
                hasMore: offset + appointments.length < total
            }
        });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Book a new appointment (Client side)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const clientId = req.user.userId;
        const { nutritionistId, appointmentDate, duration, notes } = req.body;

        if (req.user.role !== 'client') {
            return res.status(403).json({ error: 'Only clients can book appointments here. Admins use /admin endpoint.' });
        }

        const newAppointment = await AppointmentModel.create({
            clientId,
            nutritionistId,
            appointmentDate,
            duration: duration || 60,
            notes,
            status: 'pending'
        });

        res.status(201).json(newAppointment);
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ error: 'Failed to book appointment' });
    }
});

// Admin-side appointment booking for a specific client
router.post('/admin', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
        const nutritionistId = req.user.userId;
        const { clientId, appointmentDate, duration, notes } = req.body;

        if (!clientId) {
            return res.status(400).json({ error: 'Client ID is required' });
        }

        const newAppointment = await AppointmentModel.create({
            clientId,
            nutritionistId,
            appointmentDate,
            duration: duration || 60,
            notes,
            status: 'confirmed'
        });

        res.status(201).json(newAppointment);
    } catch (error) {
        console.error('Admin booking error:', error);
        res.status(500).json({ error: 'Failed to create appointment' });
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
        const appointment = await AppointmentModel.findById(id);
        if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

        if (role === 'client' && appointment.client_id !== userId) return res.status(403).json({ error: 'Forbidden' });
        if (role === 'admin' && appointment.nutritionist_id !== userId) return res.status(403).json({ error: 'Forbidden' });

        const updatedAppointment = await AppointmentModel.updateStatus(id, status);

        res.json(updatedAppointment);
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({ error: 'Update failed' });
    }
});

module.exports = router;
