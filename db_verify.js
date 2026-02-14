require('dotenv').config();
const db = require('./config/database');

async function verifyData() {
    console.log('🔍 Verifying Production Data...');
    try {
        const users = await db.query('SELECT email, role, subscription_tier FROM users ORDER BY created_at DESC LIMIT 5');
        console.table(users.rows);

        const clientData = await db.query('SELECT user_id, weight, intake_completed FROM client_data LIMIT 1');
        console.table(clientData.rows);

        process.exit(0);
    } catch (err) {
        console.error('❌ Data verification failed:', err.message);
        process.exit(1);
    }
}

verifyData();
