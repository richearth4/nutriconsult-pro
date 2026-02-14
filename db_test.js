require('dotenv').config();
const { Client } = require('pg');

async function testConnection(name, config) {
    console.log(`--- Testing: ${name} ---`);
    const client = new Client(config);
    try {
        await client.connect();
        console.log(`✅ Success for ${name}`);
        await client.end();
        return true;
    } catch (err) {
        console.error(`❌ Failed for ${name}:`, err.message || err);
        try { await client.end(); } catch (e) { }
        return false;
    }
}

async function runTests() {
    const url = process.env.DATABASE_URL;
    console.log(`Target URL: ${url.split('@')[1]}`);

    // Test 1: Standard SSL (Reject Unauthorized)
    await testConnection('Standard SSL', {
        connectionString: url,
        ssl: { rejectUnauthorized: false }
    });

    // Test 2: Standard SSL (Strict)
    await testConnection('Strict SSL', {
        connectionString: url,
        ssl: true
    });

    // Test 3: No SSL
    await testConnection('No SSL', {
        connectionString: url,
        ssl: false
    });

    // Test 4: Higher Timeout
    await testConnection('High Timeout SSL', {
        connectionString: url,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 20000
    });
}

runTests();
