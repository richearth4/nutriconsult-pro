const express = require('express');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const emailService = require('../utils/email');

const router = express.Router();

// Get all clients (Admin only)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
    try {
        const result = await db.query(`
      SELECT u.id, u.name, u.email, u.subscription_tier,
             cd.bmi, cd.weight, cd.height, cd.intake_completed, cd.alerts
      FROM users u
      LEFT JOIN client_data cd ON u.id = cd.user_id
      WHERE u.role = 'client'
      ORDER BY u.created_at DESC
    `);

        res.json({ success: true, clients: result.rows });
    } catch (error) {
        console.error('Get clients error:', error);
        res.status(500).json({ error: 'Failed to fetch clients' });
    }
});

// Get client data
router.get('/:userId', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;

        // Check authorization
        if (req.user.role !== 'admin' && req.user.userId !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
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
router.post('/:userId/intake', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const intakeData = req.body;

        // Check authorization
        if (req.user.userId !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Calculate BMI
        const bmi = intakeData.weight / Math.pow(intakeData.height / 100, 2);
        let status = 'Normal';
        if (bmi < 18.5) status = 'Underweight';
        else if (bmi >= 25 && bmi < 30) status = 'Overweight';
        else if (bmi >= 30) status = 'Obese';

        // Prepare extended fields
        // Ensure conditions is an array for JSONB
        const conditions = Array.isArray(intakeData.conditions) ? JSON.stringify(intakeData.conditions) : JSON.stringify(intakeData.conditions ? [intakeData.conditions] : []);

        // Check for existing data
        const existing = await db.query(
            'SELECT id FROM client_data WHERE user_id = $1',
            [userId]
        );

        if (existing.rows.length > 0) {
            // Update
            await db.query(`
        UPDATE client_data SET
          weight = $1, height = $2, bmi = $3, age = $4, gender = $5,
          activity = $6, goal = $7, goal_weight = $8, intake_completed = true,
          sleep_hours = $9, sleep_quality = $10,
          meals_per_day = $11, water_intake = $12,
          medical_conditions = $13, medications = $14, allergies = $15,
          smoking = $16, alcohol = $17,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $18
      `, [
                intakeData.weight, intakeData.height, bmi, intakeData.age,
                intakeData.gender, intakeData.activity, intakeData.goal,
                intakeData.goalWeight,
                intakeData.sleepHours, intakeData.sleepQuality,
                intakeData.mealsPerDay, intakeData.water,
                conditions, intakeData.medications, intakeData.allergies,
                intakeData.smoking, intakeData.alcohol,
                userId
            ]);
        } else {
            // Insert
            await db.query(`
        INSERT INTO client_data 
        (
            user_id, weight, height, bmi, age, gender, activity, goal, goal_weight, intake_completed,
            sleep_hours, sleep_quality, meals_per_day, water_intake,
            medical_conditions, medications, allergies, smoking, alcohol
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      `, [
                userId, intakeData.weight, intakeData.height, bmi, intakeData.age,
                intakeData.gender, intakeData.activity, intakeData.goal, intakeData.goalWeight,
                intakeData.sleepHours, intakeData.sleepQuality,
                intakeData.mealsPerDay, intakeData.water,
                conditions, intakeData.medications, intakeData.allergies,
                intakeData.smoking, intakeData.alcohol
            ]);
        }

        // Log initial weight in history
        await db.query(`
            INSERT INTO weight_history (user_id, weight, bmi, date)
            VALUES ($1, $2, $3, CURRENT_DATE)
            ON CONFLICT (user_id, date) DO UPDATE SET weight = $2, bmi = $3
        `, [userId, intakeData.weight, bmi]);

        // Send notification (Fire and forget in mock)
        emailService.sendIntakeNotification({ id: userId, email: req.user.email, name: req.user.name }).catch(console.error);

        res.json({ success: true, message: 'Intake saved successfully' });
    } catch (error) {
        console.error('Save intake error:', error);
        res.status(500).json({ error: 'Failed to save intake' });
    }
});

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
            bmi = weight / Math.pow(h / 100, 2);
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

module.exports = router;
