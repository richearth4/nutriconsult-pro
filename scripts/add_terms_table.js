require('dotenv').config();
const db = require('../src/config/database');

async function migrate() {
  console.log('🔄 Adding Terms and Conditions tables...');

  try {
    // 1. Create terms_and_conditions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS terms_and_conditions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content TEXT NOT NULL,
        version SERIAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ terms_and_conditions table created');

    // 2. Create user_terms_acceptance table
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_terms_acceptance (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        terms_id UUID REFERENCES terms_and_conditions(id) ON DELETE CASCADE,
        accepted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, terms_id)
      );
    `);
    console.log('✅ user_terms_acceptance table created');

    // 3. Insert initial terms if none exist
    const termsCount = await db.query('SELECT COUNT(*) FROM terms_and_conditions');
    if (parseInt(termsCount.rows[0].count) === 0) {
      await db.query(`
        INSERT INTO terms_and_conditions (content)
        VALUES ('Initial Terms and Conditions for Nutrilas. By using this service, you agree to follow our nutrition guidelines and health safety protocols.')
      `);
      console.log('✅ Initial terms inserted');
    }

    console.log('🎉 T&C migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ T&C migration failed:', error);
    process.exit(1);
  }
}

migrate();
