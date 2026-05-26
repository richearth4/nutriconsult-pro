const { Pool } = require('pg');
const logger = require('../utils/logger');

let pool;
let query;

if (process.env.USE_MOCK_DB === 'true') {
    const mockDb = require('./mock_db');
    query = (text, params) => mockDb.query(text, params);
    pool = { on: () => { } }; // Dummy pool object
    logger.warn('Using Mock Database for testing');
} else {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_SSL === 'true' ? {
            rejectUnauthorized: false
        } : false,
        // Connection pool configuration
        max: 20, // Maximum number of clients in the pool
        min: 2, // Minimum number of clients
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: 5000, // Return error after 5 seconds if connection cannot be established
        // Query timeout
        statement_timeout: 10000, // Cancel queries after 10 seconds
        query_timeout: 10000
    });

    pool.on('connect', (client) => {
        logger.debug('New database client connected');
    });

    pool.on('error', (err, client) => {
        logger.error('Unexpected database error', { error: err.message, stack: err.stack });
        // Don't exit process - let error handling middleware deal with it
    });

    pool.on('remove', () => {
        logger.debug('Database client removed from pool');
    });

    query = (text, params) => {
        const start = Date.now();
        return pool.query(text, params).then(res => {
            const duration = Date.now() - start;
            if (duration > 1000) {
                logger.warn('Slow query detected', { duration: `${duration}ms`, query: text.substring(0, 100) });
            }
            return res;
        });
    };
}

module.exports = {
    query,
    pool
};
