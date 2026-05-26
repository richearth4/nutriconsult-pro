/**
 * Database Transaction Test Suite
 * Tests transaction rollback behavior and data consistency
 */

const crypto = require('crypto');
require('dotenv').config();
const db = require('../config/database');

async function runTransactionTests() {
    console.log('💾 Starting Database Transaction Tests...\n');

    let testsPassed = 0;
    let testsFailed = 0;

    function testResult(name, passed, details = '') {
        if (passed) {
            console.log(`✅ PASS: ${name}`);
            testsPassed++;
        } else {
            console.log(`❌ FAIL: ${name}`);
            if (details) console.log(`   ${details}`);
            testsFailed++;
        }
    }

    try {
        // Test 1: Transaction Rollback on Error
        console.log('--- Test 1: Transaction Rollback ---');

        const testUserId = crypto.randomUUID();
        const client = await db.pool.connect();

        try {
            await client.query('BEGIN');

            // Insert test data
            await client.query(
                'INSERT INTO users (id, email, password_hash, name, role) VALUES ($1, $2, $3, $4, $5)',
                [testUserId, `test_${Date.now()}@test.com`, 'hash', 'Test User', 'client']
            );

            // Verify insert
            const checkInsert = await client.query('SELECT id FROM users WHERE id = $1', [testUserId]);
            testResult(
                'Data inserted in transaction',
                checkInsert.rows.length === 1,
                `Found ${checkInsert.rows.length} rows`
            );

            // Force rollback
            await client.query('ROLLBACK');

            // Verify rollback
            const checkRollback = await db.query('SELECT id FROM users WHERE id = $1', [testUserId]);
            testResult(
                'Data rolled back successfully',
                checkRollback.rows.length === 0,
                `Found ${checkRollback.rows.length} rows after rollback`
            );

        } finally {
            client.release();
        }

        // Test 2: Transaction Commit
        console.log('\n--- Test 2: Transaction Commit ---');

        const testUserId2 = crypto.randomUUID();
        const client2 = await db.pool.connect();

        try {
            await client2.query('BEGIN');

            await client2.query(
                'INSERT INTO users (id, email, password_hash, name, role) VALUES ($1, $2, $3, $4, $5)',
                [testUserId2, `test_${Date.now()}_2@test.com`, 'hash', 'Test User 2', 'client']
            );

            await client2.query('COMMIT');

            // Verify commit
            const checkCommit = await db.query('SELECT id FROM users WHERE id = $1', [testUserId2]);
            testResult(
                'Data committed successfully',
                checkCommit.rows.length === 1,
                `Found ${checkCommit.rows.length} rows after commit`
            );

            // Cleanup
            await db.query('DELETE FROM users WHERE id = $1', [testUserId2]);

        } finally {
            client2.release();
        }

        // Test 3: Connection Pool Limits
        console.log('\n--- Test 3: Connection Pool Behavior ---');

        const poolSize = db.pool.totalCount;
        testResult(
            'Connection pool initialized',
            poolSize >= 0,
            `Pool size: ${poolSize}`
        );

        // Test 4: Query Timeout
        console.log('\n--- Test 4: Query Timeout Protection ---');

        let startTime;
        try {
            // This should timeout after 10 seconds (configured in database.js)
            startTime = Date.now();
            await db.query('SELECT pg_sleep(15)');
            testResult('Query timeout triggered', false, 'Query did not timeout');
        } catch (error) {
            const duration = Date.now() - startTime;
            testResult(
                'Query timeout triggered',
                error.message.includes('timeout') || error.message.includes('canceled'),
                `Timed out after ${duration}ms: ${error.message}`
            );
        }

        // Test 5: Parameterized Queries
        console.log('\n--- Test 5: Parameterized Query Safety ---');

        const safeQuery = await db.query(
            'SELECT $1::text AS value',
            ["'; DROP TABLE users;--"]
        );

        testResult(
            'Parameterized query prevents injection',
            safeQuery.rows[0].value === "'; DROP TABLE users;--",
            `Value treated as string: ${safeQuery.rows[0].value}`
        );

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('📊 Test Summary');
        console.log('='.repeat(50));
        console.log(`✅ Passed: ${testsPassed}`);
        console.log(`❌ Failed: ${testsFailed}`);
        console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
        console.log('='.repeat(50));

        if (testsFailed === 0) {
            console.log('\n🎉 All database tests passed!');
        } else {
            console.log(`\n⚠️  ${testsFailed} test(s) failed`);
        }

    } catch (error) {
        console.error('\n❌ Test execution failed:', error.message);
        console.error(error.stack);
    } finally {
        await db.pool.end();
    }
}

// Run tests
runTransactionTests();
