/**
 * Security Test Suite for Phase 1 Improvements
 * Tests SQL injection prevention, input validation, rate limiting, and CORS
 */

const http = require('http');
require('dotenv').config();

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5001';
const ADMIN_EMAIL = 'admin@nutri.com';
const ADMIN_PASSWORD = 'admin123';

// Helper function for HTTP requests
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

// Test suite
async function runSecurityTests() {
    console.log('🔒 Starting Security Test Suite...\n');

    let adminToken;
    let testsPassed = 0;
    let testsFailed = 0;

    // Helper to track test results
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
        // Setup: Login as admin
        console.log('--- Setup: Admin Login ---');
        const adminLogin = await request(`${BASE_URL}/api/auth/login`, {
            method: 'POST'
        }, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });

        if (adminLogin.status === 200 && adminLogin.data.user) {
            adminToken = adminLogin.data.user.token;
            console.log('✅ Admin logged in successfully\n');
        } else {
            console.log('❌ Admin login failed - cannot continue tests');
            return;
        }

        // Test 1: SQL Injection Prevention
        console.log('--- Test 1: SQL Injection Prevention ---');
        const maliciousInputs = [
            "1'; DROP TABLE users;--",
            "1' OR '1'='1",
            "1; DELETE FROM users WHERE 1=1;--",
            "1' UNION SELECT * FROM users--"
        ];

        for (const input of maliciousInputs) {
            const res = await request(`${BASE_URL}/api/clients/${encodeURIComponent(input)}`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            // Should return 404 or 403, not execute SQL
            testResult(
                `SQL Injection blocked: ${input.substring(0, 20)}...`,
                res.status === 404 || res.status === 403 || res.status === 400,
                `Got status ${res.status}`
            );
        }

        // Test 2: Password Strength Validation
        console.log('\n--- Test 2: Password Strength Validation ---');

        const weakPasswords = [
            { password: 'weak', reason: 'too short' },
            { password: 'weakpassword', reason: 'no uppercase or number' },
            { password: 'WEAKPASSWORD', reason: 'no lowercase or number' },
            { password: 'WeakPassword', reason: 'no number' },
            { password: '12345678', reason: 'no letters' }
        ];

        for (const { password, reason } of weakPasswords) {
            const res = await request(`${BASE_URL}/api/auth/register`, {
                method: 'POST'
            }, {
                email: `test_${Date.now()}@test.com`,
                password: password,
                name: 'Test User'
            });
            testResult(
                `Weak password rejected (${reason})`,
                res.status === 400 && res.data.error?.code === 'VALIDATION_ERROR',
                `Got status ${res.status}, code: ${res.data.error?.code}`
            );
        }

        // Test 3: Strong password should work
        const strongPasswordRes = await request(`${BASE_URL}/api/auth/register`, {
            method: 'POST'
        }, {
            email: `test_strong_${Date.now()}@test.com`,
            password: 'StrongPass123!',
            name: 'Test User'
        });
        testResult(
            'Strong password accepted',
            strongPasswordRes.status === 201,
            `Got status ${strongPasswordRes.status}`
        );

        // Test 4: XSS Sanitization
        console.log('\n--- Test 3: XSS Sanitization ---');
        const xssPayloads = [
            '<script>alert("xss")</script>',
            '<img src=x onerror=alert(1)>',
            'javascript:alert(1)',
            '<iframe src="javascript:alert(1)">'
        ];

        for (const payload of xssPayloads) {
            const res = await request(`${BASE_URL}/api/auth/register`, {
                method: 'POST'
            }, {
                email: `test_${Date.now()}@test.com`,
                password: 'TestPass123!',
                name: payload
            });
            // Should sanitize or reject
            if (res.status === 201) {
                // Check if sanitized
                testResult(
                    `XSS payload sanitized in name`,
                    !res.data.user?.name?.includes('<') && !res.data.user?.name?.includes('>'),
                    `Name: ${res.data.user?.name}`
                );
            } else {
                testResult(
                    `XSS payload rejected`,
                    res.status === 400,
                    `Got status ${res.status}`
                );
            }
        }

        // Test 5: Request ID Tracking
        console.log('\n--- Test 4: Request ID Tracking ---');
        const healthRes = await request(`${BASE_URL}/health`);
        testResult(
            'Request ID in response headers',
            !!healthRes.headers['x-request-id'],
            `Request ID: ${healthRes.headers['x-request-id']}`
        );

        // Test 6: Standardized Error Format
        console.log('\n--- Test 5: Standardized Error Format ---');
        const errorRes = await request(`${BASE_URL}/api/auth/login`, {
            method: 'POST'
        }, {
            email: 'invalid-email',
            password: 'test'
        });
        testResult(
            'Error has success field',
            errorRes.data.success === false,
            `success: ${errorRes.data.success}`
        );
        testResult(
            'Error has error.code field',
            !!errorRes.data.error?.code,
            `code: ${errorRes.data.error?.code}`
        );
        testResult(
            'Error has error.message field',
            !!errorRes.data.error?.message,
            `message: ${errorRes.data.error?.message}`
        );

        // Test 7: Input Validation Ranges
        console.log('\n--- Test 6: Input Validation Ranges ---');
        const invalidIntake = {
            weight: 1000, // Too high
            height: 10,   // Too low
            age: 150,     // Too high
            gender: 'invalid',
            activity: 'invalid',
            goal: 'invalid'
        };

        const intakeRes = await request(`${BASE_URL}/api/clients/test-user/intake`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${adminToken}` }
        }, invalidIntake);

        testResult(
            'Invalid intake data rejected',
            intakeRes.status === 400 || intakeRes.status === 403,
            `Got status ${intakeRes.status}`
        );

        // Test 8: Rate Limiting (Auth endpoint)
        console.log('\n--- Test 7: Rate Limiting ---');
        console.log('Checking rate limit configuration...');

        const rateLimitRes = await request(`${BASE_URL}/api/auth/login`, {
            method: 'POST'
        }, {
            email: 'nonexistent@test.com',
            password: 'wrong'
        });

        const limitHeader = rateLimitRes.headers['ratelimit-limit'];
        testResult(
            'Rate limit headers present and limit is 100',
            limitHeader === '100',
            `Limit header: ${limitHeader}`
        );


        // Test 9: CORS Headers
        console.log('\n--- Test 8: CORS Headers ---');
        const corsRes = await request(`${BASE_URL}/health`, {
            headers: { 'Origin': 'http://localhost:5001' }
        });
        testResult(
            'CORS headers present',
            !!corsRes.headers['access-control-allow-origin'],
            `Origin: ${corsRes.headers['access-control-allow-origin']}`
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
            console.log('\n🎉 All security tests passed!');
        } else {
            console.log(`\n⚠️  ${testsFailed} test(s) failed - review implementation`);
        }

    } catch (error) {
        console.error('\n❌ Test execution failed:', error.message);
        console.error(error.stack);
    }
}

// Run tests
runSecurityTests();
