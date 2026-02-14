require('dotenv').config();
const db = require('../config/database');
const bcrypt = require('bcryptjs');

async function seed() {
    console.log('🌱 Seeding initial data...');

    try {
        // 1. Create Admin User
        const adminPassword = await bcrypt.hash('admin123', 10);
        await db.query(`
      INSERT INTO users (email, password_hash, name, role, subscription_tier)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, ['admin@nutri.com', adminPassword, 'Admin User', 'admin', 'premium']);
        console.log('✅ Admin user created');

        // 2. Create Client User
        const clientPassword = await bcrypt.hash('client123', 10);
        const clientRes = await db.query(`
      INSERT INTO users (email, password_hash, name, role, subscription_tier)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
      RETURNING id
    `, ['client@nutri.com', clientPassword, 'Test Client', 'client', 'free']);

        const clientId = clientRes.rows[0].id;
        console.log('✅ Client user created');

        // 3. Create initial client data
        await db.query(`
      INSERT INTO client_data (user_id, weight, height, goal, intake_completed)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id) DO NOTHING
    `, [clientId, 85.5, 180, 'Weight Loss', true]);
        console.log('✅ Client data initialized');

        // 4. Create initial resources
        await db.query(`
      INSERT INTO resources (title, type, url, category)
      VALUES 
      ($1, $2, $3, $4),
      ($5, $6, $7, $8)
      ON CONFLICT DO NOTHING
    `, [
            'Healthy Eating Guide', 'article', '#', 'Nutrition',
            'Macro Calculator', 'tool', '#', 'Tools'
        ]);
        console.log('✅ Resources seeded');

        console.log('🎉 Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
