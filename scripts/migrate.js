require('dotenv').config();
const db = require('../config/database');

async function migrate() {
  console.log('🔄 Running database migrations...');

  try {
    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'client',
        subscription_tier VARCHAR(50) DEFAULT 'free',
        subscription_expiry TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table created');

    // Create client_data table
    await db.query(`
      CREATE TABLE IF NOT EXISTS client_data (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        weight DECIMAL(5,2),
        height DECIMAL(5,2),
        bmi DECIMAL(4,2),
        goal_weight DECIMAL(5,2),
        age INTEGER,
        gender VARCHAR(20),
        activity VARCHAR(50),
        goal VARCHAR(50),
        weight_history JSONB DEFAULT '[]',
        alerts JSONB DEFAULT '[]',
        intake_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      );
    `);
    console.log('✅ Client data table created');

    // Add new columns to client_data if they don't exist (for existing deployments)
    await db.query(`
          ALTER TABLE client_data 
          ADD COLUMN IF NOT EXISTS sleep_hours DECIMAL(4,1),
          ADD COLUMN IF NOT EXISTS sleep_quality VARCHAR(20),
          ADD COLUMN IF NOT EXISTS meals_per_day INTEGER,
          ADD COLUMN IF NOT EXISTS water_intake DECIMAL(4,1),
          ADD COLUMN IF NOT EXISTS medical_conditions JSONB DEFAULT '[]',
          ADD COLUMN IF NOT EXISTS medications TEXT,
          ADD COLUMN IF NOT EXISTS allergies TEXT,
          ADD COLUMN IF NOT EXISTS smoking VARCHAR(20),
          ADD COLUMN IF NOT EXISTS alcohol VARCHAR(20);
        `);
    console.log('✅ Client data schema updated with new fields');

    // Create weight_history table
    await db.query(`
      CREATE TABLE IF NOT EXISTS weight_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        weight DECIMAL(5,2) NOT NULL,
        bmi DECIMAL(4,2),
        date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, date)
      );
    `);
    console.log('✅ Weight history table created');

    // Create meal_plans table
    await db.query(`
      CREATE TABLE IF NOT EXISTS meal_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        day VARCHAR(20) NOT NULL,
        breakfast TEXT,
        lunch TEXT,
        dinner TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, day)
      );
    `);
    console.log('✅ Meal plans table created');

    // Create resources table
    await db.query(`
      CREATE TABLE IF NOT EXISTS resources (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        url TEXT,
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Resources table created');

    // Create resource_assignments table
    await db.query(`
      CREATE TABLE IF NOT EXISTS resource_assignments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, resource_id)
      );
    `);
    console.log('✅ Resource assignments table created');

    // Create consultation notes table
    await db.query(`
      CREATE TABLE IF NOT EXISTS consultation_notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        content TEXT,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Consultation notes table created');

    // Create messages table
    await db.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
        receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Messages table created');

    // Create activity_metrics table
    await db.query(`
      CREATE TABLE IF NOT EXISTS activity_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        date DATE DEFAULT CURRENT_DATE,
        steps INTEGER DEFAULT 0,
        active_minutes INTEGER DEFAULT 0,
        sleep_hours DECIMAL(4,1) DEFAULT 0,
        calories_burned INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, date)
      );
    `);
    console.log('✅ Activity metrics table created');

    // Create appointments table
    await db.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id UUID REFERENCES users(id) ON DELETE CASCADE,
        nutritionist_id UUID REFERENCES users(id) ON DELETE CASCADE,
        appointment_date TIMESTAMP NOT NULL,
        duration INTEGER DEFAULT 60,
        status VARCHAR(50) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Appointments table created');

    console.log('🎉 All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
