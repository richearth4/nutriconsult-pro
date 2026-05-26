const db = require('../config/database');

const AppointmentModel = {
    /**
     * Get paginated list of appointments for a user (client or admin nutritionist)
     * @param {Object} options 
     * @returns {Promise<Array>}
     */
    async findByParticipant({ userId, role, limit = 20, offset = 0 }) {
        let queryBase;
        let whereClause;
        let params = [userId];

        if (role === 'admin') {
            queryBase = `
                SELECT a.*, u.name as client_name, u.email as client_email
                FROM appointments a
                JOIN users u ON a.client_id = u.id
            `;
            whereClause = `WHERE a.nutritionist_id = $1`;
        } else {
            queryBase = `
                SELECT a.*, u.name as nutritionist_name
                FROM appointments a
                JOIN users u ON a.nutritionist_id = u.id
            `;
            whereClause = `WHERE a.client_id = $1`;
        }

        const query = `
            ${queryBase}
            ${whereClause}
            ORDER BY a.appointment_date ASC
            LIMIT $2 OFFSET $3
        `;

        params.push(limit, offset);
        const result = await db.query(query, params);
        return result.rows;
    },

    /**
     * Get count of appointments for calendar pagination
     * @param {Object} options 
     * @returns {Promise<number>}
     */
    async findCountByParticipant({ userId, role }) {
        const whereClause = role === 'admin' 
            ? 'WHERE a.nutritionist_id = $1' 
            : 'WHERE a.client_id = $1';
            
        const query = `SELECT COUNT(*) FROM appointments a ${whereClause}`;
        const result = await db.query(query, [userId]);
        return parseInt(result.rows[0].count);
    },

    /**
     * Get appointment details by ID
     * @param {string|number} id 
     * @returns {Promise<Object>}
     */
    async findById(id) {
        const result = await db.query('SELECT * FROM appointments WHERE id = $1', [id]);
        return result.rows[0];
    },

    /**
     * Book a new consultation
     * @param {Object} appointmentData 
     * @returns {Promise<Object>}
     */
    async create({ clientId, nutritionistId, appointmentDate, duration = 60, notes, status = 'pending' }) {
        const result = await db.query(
            `INSERT INTO appointments (client_id, nutritionist_id, appointment_date, duration, notes, status)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [clientId, nutritionistId, appointmentDate, duration, notes, status]
        );
        return result.rows[0];
    },

    /**
     * Update status (confirm, cancel)
     * @param {string|number} id 
     * @param {string} status 
     * @returns {Promise<Object>}
     */
    async updateStatus(id, status) {
        const result = await db.query(
            'UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        return result.rows[0];
    }
};

module.exports = AppointmentModel;
