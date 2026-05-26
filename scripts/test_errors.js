/**
 * Error Handling Test Suite
 * Tests centralized error handling and logging
 */

const http = require('http');
require('dotenv').config();

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5001';

function request(url, options = {}, body = null) {
    return new Promise((resolve, reject) => {
        const u = new URL(url);
        const reqOptions = {
            hostname: u.hostname,
            port: u.port,
            path: u.pathname + u.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        };

        if (body) {
            const bodyStr = JSON.stringify(body);
            reqOptions.headers['Content-Type'] = 'application/json';
            reqOptions.headers['Content-Length'] = Buffer.byteLength(bodyStr);

            const req = http.request(reqOptions, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        const json = data ? JSON.parse(data) : {};
                        resolve({ status: res.statusCode, data: json, headers: res.headers });
                    } catch (e) {
                        resolve({ status: res.statusCode, data: data, headers: res.headers });
                    }
                });
            });
            req.on('error', reject);
            req.write(bodyStr);
            req.end();
        } else {
            const req = http.request(reqOptions, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        const json = data ? JSON.parse(data) : {};
                        resolve({ status: res.statusCode, data: json, headers: res.headers });
                    } catch (e) {
                        resolve({ status: res.statusCode, data: data, headers: res.headers });
                    }
                });
            });
            req.on('error', reject);
            req.end();
        }
    });
}

async function runErrorHandlingTests() {
    console.log('🚨 Starting Error Handling Tests...\n');

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
        // Test 1: 404 Error Format
        console.log('--- Test 1: 404 Error Format ---');
        const notFoundRes = await request(`${BASE_URL}/api/nonexistent`);

        testResult(
            '404 returns standardized format',
            notFoundRes.status === 404 &&
            notFoundRes.data.success === false &&
            !!notFoundRes.data.error?.code,
            `Status: ${notFoundRes.status}, Code: ${notFoundRes.data.error?.code}`
        );

        // Test 2: Validation Error Format
        console.log('\n--- Test 2: Validation Error Format ---');
        const validationRes = await request(`${BASE_URL}/api/auth/register`, {
            method: 'POST'
        }, {
            email: 'invalid-email',
            password: 'weak',
            name: 'T'
        });

        testResult(
            'Validation error has correct structure',
            validationRes.status === 400 &&
            validationRes.data.error?.code === 'VALIDATION_ERROR',
            `Code: ${validationRes.data.error?.code}`
        );

        testResult(
            'Validation error includes details',
            Array.isArray(validationRes.data.error?.details) &&
            validationRes.data.error.details.length > 0,
            `Details count: ${validationRes.data.error?.details?.length}`
        );

        // Test 3: Authentication Error
        console.log('\n--- Test 3: Authentication Error ---');
        const authRes = await request(`${BASE_URL}/api/clients`, {
            headers: { Authorization: 'Bearer invalid-token' }
        });

        testResult(
            'Invalid token returns 401',
            authRes.status === 401,
            `Status: ${authRes.status}`
        );

        testResult(
            'Auth error has correct code',
            authRes.data.error?.code === 'INVALID_TOKEN' ||
            authRes.data.error?.code === 'AUTHENTICATION_ERROR',
            `Code: ${authRes.data.error?.code}`
        );

        // Test 4: Request ID in Errors
        console.log('\n--- Test 4: Request ID Tracking ---');
        const errorWithId = await request(`${BASE_URL}/api/nonexistent`);

        testResult(
            'Error response includes request ID',
            !!errorWithId.data.requestId || !!errorWithId.headers['x-request-id'],
            `Request ID: ${errorWithId.data.requestId || errorWithId.headers['x-request-id']}`
        );

        // Test 5: No Stack Trace in Production
        console.log('\n--- Test 5: Production Error Safety ---');
        // This test assumes NODE_ENV is not 'development'
        if (process.env.NODE_ENV !== 'development') {
            testResult(
                'Stack trace not exposed in production',
                !validationRes.data.error?.stack,
                validationRes.data.error?.stack ? 'Stack trace exposed!' : 'Safe'
            );
        } else {
            console.log('   ⏭️  Skipped (running in development mode)');
        }

        // Test 6: Error Message Quality
        console.log('\n--- Test 6: Error Message Quality ---');
        testResult(
            'Error messages are user-friendly',
            validationRes.data.error?.message &&
            !validationRes.data.error.message.includes('undefined') &&
            !validationRes.data.error.message.includes('null'),
            `Message: ${validationRes.data.error?.message}`
        );

        // Test 7: Rate Limit Error Format
        console.log('\n--- Test 7: Rate Limit Error Format ---');
        // Make multiple requests to trigger rate limit
        let rateLimitError = null;
        for (let i = 0; i < 7; i++) {
            const res = await request(`${BASE_URL}/api/auth/login`, {
                method: 'POST'
            }, {
                email: 'test@test.com',
                password: 'wrong'
            });

            if (res.status === 429) {
                rateLimitError = res;
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        if (rateLimitError) {
            testResult(
                'Rate limit error has correct format',
                rateLimitError.data.error?.code?.includes('RATE_LIMIT'),
                `Code: ${rateLimitError.data.error?.code}`
            );
        } else {
            console.log('   ⏭️  Rate limit not triggered, skipping test');
        }

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('📊 Test Summary');
        console.log('='.repeat(50));
        console.log(`✅ Passed: ${testsPassed}`);
        console.log(`❌ Failed: ${testsFailed}`);
        console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
        console.log('='.repeat(50));

        if (testsFailed === 0) {
            console.log('\n🎉 All error handling tests passed!');
        } else {
            console.log(`\n⚠️  ${testsFailed} test(s) failed`);
        }

    } catch (error) {
        console.error('\n❌ Test execution failed:', error.message);
        console.error(error.stack);
    }
}

// Run tests
runErrorHandlingTests();
