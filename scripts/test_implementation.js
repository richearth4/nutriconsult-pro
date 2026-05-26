const http = require('http');
require('dotenv').config();

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5001';
const ADMIN_EMAIL = 'admin@nutri.com';
const ADMIN_PASSWORD = 'admin123';
const CLIENT_EMAIL = 'client@nutri.com';
const CLIENT_PASSWORD = 'client123';

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
                        resolve({ status: res.statusCode, data: json });
                    } catch (e) {
                        resolve({ status: res.statusCode, data: data });
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
                        resolve({ status: res.statusCode, data: json });
                    } catch (e) {
                        resolve({ status: res.statusCode, data: data });
                    }
                });
            });
            req.on('error', reject);
            req.end();
        }
    });
}

async function runTests() {
    console.log('🚀 Starting Implementation Tests (Native HTTP)...');

    let adminToken, clientToken, clientId;

    try {
        // 1. Login as Admin
        console.log('\n--- 1. Login as Admin ---');
        const adminLogin = await request(`${BASE_URL}/api/auth/login`, {
            method: 'POST'
        }, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });

        if (adminLogin.status === 200 && adminLogin.data.user) {
            adminToken = adminLogin.data.user.token;
            console.log('✅ Admin logged in');
        } else {
            console.log('❌ Admin login failed:', adminLogin.data);
            return;
        }

        // 2. Login as Client
        console.log('\n--- 2. Login as Client ---');
        const clientLogin = await request(`${BASE_URL}/api/auth/login`, {
            method: 'POST'
        }, {
            email: CLIENT_EMAIL,
            password: CLIENT_PASSWORD
        });

        if (clientLogin.status === 200 && clientLogin.data.user) {
            clientToken = clientLogin.data.user.token;
            clientId = clientLogin.data.user.userId;
            console.log('✅ Client logged in');
        } else {
            console.log('❌ Client login failed:', clientLogin.data);
            return;
        }

        // 3. Test ACL: Client accessing another client's data (Should fail)
        console.log('\n--- 3. Test ACL (Unauthorized) ---');
        const unauthorizedRes = await request(`${BASE_URL}/api/clients/11111111-1111-4111-8111-111111111111`, {
            headers: { Authorization: `Bearer ${clientToken}` }
        });
        if (unauthorizedRes.status === 403) {
            console.log('✅ Success: Access denied as expected (403)');
        } else {
            console.log(`❌ Unexpected status: ${unauthorizedRes.status}`, unauthorizedRes.data);
        }

        // 4. Test ACL: Admin accessing client data (Should succeed)
        console.log('\n--- 4. Test ACL (Authorized Admin) ---');
        const adminAccess = await request(`${BASE_URL}/api/clients/${clientId}`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        if (adminAccess.status === 200 && adminAccess.data.success) {
            console.log('✅ Success: Admin accessed client data');
        } else {
            console.log(`❌ Error: Admin failed to access client data (Status: ${adminAccess.status})`, adminAccess.data);
        }

        // 5. Test Admin Appointment Booking
        console.log('\n--- 5. Test Admin Appointment Booking ---');
        const appointmentData = {
            clientId: clientId,
            appointmentDate: new Date(Date.now() + 86400000).toISOString(),
            duration: 45,
            notes: 'Test appointment from automation'
        };
        const bookingRes = await request(`${BASE_URL}/api/appointments/admin`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${adminToken}` }
        }, appointmentData);

        if (bookingRes.status === 201) {
            console.log('✅ Success: Admin booked appointment');
        } else {
            console.log(`❌ Error: Admin failed to book appointment (Status: ${bookingRes.status})`, bookingRes.data);
        }

        // 6. Test Client Deletion (Admin only)
        console.log('\n--- 6. Test Client Deletion ---');
        const tempEmail = `temp_${Date.now()}@test.com`;
        const registerRes = await request(`${BASE_URL}/api/auth/register`, {
            method: 'POST'
        }, {
            email: tempEmail,
            email: tempEmail,
            password: 'Password123!',
            name: 'Temp User'
        });

        if (registerRes.status !== 201) {
            console.log('❌ Failed to create temp user:', registerRes.data);
            return;
        }

        const tempUserId = registerRes.data.user.userId;
        console.log(`Created temp user: ${tempUserId}`);

        // Try deleting as client (Should fail)
        console.log('Attempting delete as client...');
        const deleteAsClient = await request(`${BASE_URL}/api/clients/${tempUserId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${clientToken}` }
        });
        if (deleteAsClient.status === 403) {
            console.log('✅ Success: Access denied as expected (403)');
        } else {
            console.log(`❌ Unexpected status: ${deleteAsClient.status}`, deleteAsClient.data);
        }

        // Delete as admin (Should succeed)
        console.log('Attempting delete as admin...');
        const deleteRes = await request(`${BASE_URL}/api/clients/${tempUserId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        if (deleteRes.status === 200 && deleteRes.data.success) {
            console.log('✅ Success: Admin deleted client');
        } else {
            console.log(`❌ Error: Admin failed to delete client (Status: ${deleteRes.status})`, deleteRes.data);
        }

        console.log('\n🎉 All backend tests completed!');

    } catch (error) {
        console.error('\n❌ Test execution failed:', error.message);
    }
}

runTests();
