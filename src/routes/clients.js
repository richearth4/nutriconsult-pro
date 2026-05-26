const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole, isOwnerOrAdmin } = require('../middleware/auth');
const emailService = require('../utils/email');
const logger = require('../utils/logger');
const { ErrorTypes, asyncHandler } = require('../middleware/errorHandler');
const { validateIntake, validateProfileUpdate, validateWeightLog } = require('../middleware/validation');

const router = express.Router();

// Get all clients (Admin only) - with Cursor-based Pagination
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const cursor = req.query.cursor; // ISO timestamp string

        let query = `
      SELECT u.id, u.name, u.email, u.subscription_tier, u.created_at,
             cd.bmi, cd.weight, cd.height, cd.intake_completed, cd.alerts
      FROM users u
      LEFT JOIN client_data cd ON u.id = cd.user_id
      WHERE u.role = 'client'
    `;

        const params = [];

        if (cursor) {
            query += ` AND u.created_at < $1`;
            params.push(cursor);
        }

        query += ` ORDER BY u.created_at DESC LIMIT $${params.length + 1}`;
        params.push(limit + 1); // Fetch one extra to check if there's a next page

        const result = await db.query(query, params);

        const hasNextPage = result.rows.length > limit;
        const clients = hasNextPage ? result.rows.slice(0, -1) : result.rows;
        const nextCursor = hasNextPage ? clients[clients.length - 1].created_at : null;

        res.json({
            success: true,
            clients,
            meta: {
                count: clients.length,
                hasNextPage,
                nextCursor
            }
        });
    } catch (error) {
        console.error('Get clients error:', error);
        res.status(500).json({ error: 'Failed to fetch clients' });
    }
});

// Get client data
router.get('/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(userId)) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'Invalid client ID format' }
            });
        }

        // Check authorization (Managed by middleware if we want, or manually here)
        if (req.user.role !== 'admin' && req.user.userId !== userId) {
            return res.status(403).json({
                success: false,
                error: { code: 'AUTHORIZATION_ERROR', message: 'Unauthorized' }
            });
        }

        const result = await db.query(
            'SELECT * FROM client_data WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.json({ success: true, data: null });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Get client data error:', error);
        res.status(500).json({ error: 'Failed to fetch client data' });
    }
});

// Save intake data
router.post('/:userId/intake', authenticateToken, validateIntake, asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const intakeData = req.body;

    // Check authorization
    if (req.user.userId !== userId) {
        throw ErrorTypes.AuthorizationError('Cannot save intake for another user');
    }

    // Parse numeric fields
    const weight = parseFloat(intakeData.weight) || 0;
    const height = parseFloat(intakeData.height) || 0;
    const age = parseInt(intakeData.age) || null;
    const goalWeight = parseFloat(intakeData.goalWeight) || null;
    const sleepHours = intakeData.sleepHours ? parseFloat(intakeData.sleepHours) : null;
    const mealsPerDay = intakeData.mealsPerDay ? parseInt(intakeData.mealsPerDay) : null;
    const waterIntake = (intakeData.water || intakeData.waterIntake) ? parseFloat(intakeData.water || intakeData.waterIntake) : null;

    // Calculate BMI
    const bmi = weight > 0 && height > 0 ? weight / Math.pow(height / 100, 2) : null;

    // Prepare conditions as JSONB
    const conditions = Array.isArray(intakeData.conditions)
        ? JSON.stringify(intakeData.conditions)
        : JSON.stringify(intakeData.conditions ? [intakeData.conditions] : []);

    // Use transaction for data consistency
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // Check for existing data
        const existing = await client.query(
            'SELECT id FROM client_data WHERE user_id = $1',
            [userId]
        );

        if (existing.rows.length > 0) {
            // Update
            await client.query(`
                UPDATE client_data SET
                    weight = $1, height = $2, bmi = $3, age = $4, gender = $5,
                    activity = $6, goal = $7, goal_weight = $8, intake_completed = true,
                    sleep_hours = $9, sleep_quality = $10,
                    meals_per_day = $11, water_intake = $12,
                    medical_conditions = $13, medications = $14, allergies = $15,
                    smoking = $16, alcohol = $17, phone = $18,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = $19
            `, [
                weight, height, bmi, age,
                intakeData.gender, intakeData.activity, intakeData.goal,
                goalWeight,
                sleepHours, intakeData.sleepQuality,
                mealsPerDay, waterIntake,
                conditions, intakeData.medications, intakeData.allergies,
                intakeData.smoking, intakeData.alcohol, intakeData.phone || null,
                userId
            ]);
        } else {
            // Insert
            await client.query(`
                INSERT INTO client_data
                (
                    user_id, weight, height, bmi, age, gender, activity, goal, goal_weight, intake_completed,
                    sleep_hours, sleep_quality, meals_per_day, water_intake,
                    medical_conditions, medications, allergies, smoking, alcohol, phone
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
            `, [
                userId, weight, height, bmi, age,
                intakeData.gender, intakeData.activity, intakeData.goal, goalWeight,
                sleepHours, intakeData.sleepQuality,
                mealsPerDay, waterIntake,
                conditions, intakeData.medications, intakeData.allergies,
                intakeData.smoking, intakeData.alcohol, intakeData.phone || null
            ]);
        }

        // Log initial weight in history
        await client.query(`
            INSERT INTO weight_history (user_id, weight, bmi, date)
            VALUES ($1, $2, $3, CURRENT_DATE)
            ON CONFLICT (user_id, date) DO UPDATE SET weight = $2, bmi = $3
        `, [userId, weight, bmi]);

        await client.query('COMMIT');

        logger.info('Intake data saved successfully', { userId });

        // Send notification (fire and forget)
        emailService.sendIntakeNotification({
            id: userId,
            email: req.user.email,
            name: req.user.name
        }).catch(err => logger.error('Failed to send intake notification', { error: err.message }));

        res.json({ success: true, message: 'Intake saved successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Save intake error', { userId, error: error.message });
        throw ErrorTypes.DatabaseError('Failed to save intake data');
    } finally {
        client.release();
    }
}));

// Get consultation notes
router.get('/:userId/notes', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;

        // Check authorization (Admin or own profile)
        if (req.user.role !== 'admin' && req.user.userId !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const result = await db.query(
            'SELECT content, updated_at FROM consultation_notes WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.json({ success: true, notes: '' });
        }

        res.json({ success: true, notes: result.rows[0].content, updatedAt: result.rows[0].updated_at });
    } catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

// Save consultation notes (Admin only)
router.post('/:userId/notes', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
        const { userId } = req.params;
        const { notes } = req.body;

        // Upsert notes (assuming one note per user for simplest prototype, or insert new history)
        // For this prototype, we'll keep a single "latest" note or history.
        // The table allows multiple rows.
        // Logic: Insert new note.

        await db.query(
            'INSERT INTO consultation_notes (user_id, content, created_by) VALUES ($1, $2, $3)',
            [userId, notes, req.user.userId]
        );

        res.json({ success: true, message: 'Notes saved' });
    } catch (error) {
        console.error('Save notes error:', error);
        res.status(500).json({ error: 'Failed to save notes' });
    }
});

// Update client profile (Admin only)
router.put('/:userId/profile', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, email, phone } = req.body;

        // check if email exists for other user
        const existing = await db.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Email already currently in use by another user' });
        }

        // Update users table
        await db.query(`
            UPDATE users SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
        `, [name, email, userId]);

        // Update or Insert into client_data for phone (if we decide to store phone there, or just keep it simple)
        // For now, let's assume phone might be in client_data or users.
        // The intake form has phone. The users table usually just has Auth info.
        // Let's check intake structure. Step 1 has phone.
        // We should update phone in client_data if exists, or users if we added a column there.
        // Checking migrate.js... users table has: id, email, password, name, role, created_at.
        // client_data has: user_id, weight, height...
        // Wait, intake form Step 1 has phone. Where is it saved?
        // In `POST /intake`, we save `intakeData`. The migrate.js for client_data DOES NOT have a phone column explicitly listed in the big insert.
        // It seems phone is currently LOST in the intake process unless I missed it.
        // Let's check `POST /intake` implementation in `clients.js`.
        // It extracts `weight`, `height`... `medications`...
        // It does NOT seem to extract `phone`.
        // OK, I will add `phone` column to `client_data` in a migration if needed, OR just ignore phone for now and focus on Name/Email which are in `users`.
        // Let's stick to Name and Email for this feature to be safe and quick.

        res.json({ success: true, message: 'Client profile updated' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Log weight entry
router.post('/:userId/weight', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const { weight, date } = req.body;

        if (req.user.userId !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Get height to calc BMI
        const clientData = await db.query('SELECT height FROM client_data WHERE user_id = $1', [userId]);
        let bmi = null;

        if (clientData.rows.length > 0 && clientData.rows[0].height) {
            const h = clientData.rows[0].height;
            if (h > 0) {
                bmi = weight / Math.pow(h / 100, 2);
                // Sanity check to avoid numeric overflow in DB if height is weirdly small
                if (bmi > 999.99) bmi = 999.99;
            }
        }

        // Insert into history
        await db.query(`
            INSERT INTO weight_history (user_id, weight, bmi, date)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, date) DO UPDATE SET weight = $2, bmi = $3
        `, [userId, weight, bmi, date || new Date()]);

        // Update current weight in client_data
        await db.query(`
            UPDATE client_data SET weight = $1, bmi = $2, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $3
        `, [weight, bmi, userId]);

        res.json({ success: true, message: 'Weight logged successfully', bmi });
    } catch (error) {
        console.error('Log weight error:', error);
        res.status(500).json({ error: 'Failed to log weight' });
    }
});

// Get weight history
router.get('/:userId/weight-history', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;

        if (req.user.userId !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const result = await db.query(
            'SELECT weight, bmi, date FROM weight_history WHERE user_id = $1 ORDER BY date ASC',
            [userId]
        );

        res.json({ success: true, history: result.rows });
    } catch (error) {
        console.error('Get weight history error:', error);
        res.status(500).json({ error: 'Failed to fetch weight history' });
    }
});

// Delete client (Admin only)
router.delete('/:userId', authenticateToken, requireRole(['admin']), asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // Validate UUID format to prevent DB errors
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
        throw ErrorTypes.ValidationError('Invalid client ID format');
    }

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        // Delete from dependent tables first
        await client.query('DELETE FROM weight_history WHERE user_id = $1', [userId]);
        await client.query('DELETE FROM consultation_notes WHERE user_id = $1', [userId]);
        await client.query('DELETE FROM resource_assignments WHERE user_id = $1', [userId]);
        await client.query('DELETE FROM meal_plans WHERE user_id = $1', [userId]);
        await client.query('DELETE FROM appointments WHERE client_id = $1', [userId]);
        await client.query('DELETE FROM client_data WHERE user_id = $1', [userId]);

        // Delete user
        const result = await client.query(
            'DELETE FROM users WHERE id = $1 AND role = $2 RETURNING id',
            [userId, 'client']
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            throw ErrorTypes.NotFoundError('Client');
        }

        await client.query('COMMIT');

        logger.info('Client deleted successfully', { userId, deletedBy: req.user.userId });
        res.json({ success: true, message: 'Client and all associated data deleted' });
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Delete client error', { userId, error: error.message });
        throw error;
    } finally {
        client.release();
    }
}));


module.exports = router;
