const { Pool } = require('pg');

let pool;
let query;

if (process.env.USE_MOCK_DB === 'true') {
    const mockDb = require('./mock_db');
    query = (text, params) => mockDb.query(text, params);
    pool = { on: () => { } }; // Dummy pool object
    console.log('⚠️ Using Mock Database for testing');
} else {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_SSL === 'true' ? {
            rejectUnauthorized: false
        } : false
    });

    pool.on('connect', () => {
        console.log('✅ Database connected');
    });

    pool.on('error', (err) => {
        console.error('❌ Unexpected database error:', err);
        process.exit(-1);
    });

    query = (text, params) => pool.query(text, params);
}

module.exports = {
    query,
    pool
};
