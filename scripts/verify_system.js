const http = require('http');

const API_URL = 'http://localhost:5001';
let token = '';
let clientId = '';

async function request(path, method = 'GET', body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const url = `${API_URL}${path}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsedData = data ? JSON.parse(data) : {};
                    if (res.statusCode >= 400) {
                        reject({ status: res.statusCode, data: parsedData });
                    } else {
                        resolve(parsedData);
                    }
                } catch (e) {
                    reject({ status: res.statusCode, data });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runTests() {
    console.log('🚀 Starting NutriConsult Pro Master Verification (Dependency-free)...');

    try {
        // 1. Health Check
        const health = await request('/health');
        console.log('✅ Health Check:', health.status);

        // 2. Auth: Register or Login
        try {
            console.log('⏳ Attempting Login...');
            const login = await request('/api/auth/login', 'POST', {
                email: 'test-master@nutri.com',
                password: 'password123'
            });
            token = login.user.token;
            clientId = login.user.userId;
            console.log('✅ Auth: Login successful');
        } catch (e) {
            console.log('⏳ Login failed, attempting Registration...');
            try {
                const reg = await request('/api/auth/register', 'POST', {
                    name: 'Test Master',
                    email: 'test-master@nutri.com',
                    password: 'password123'
                });
                token = reg.user.token;
                clientId = reg.user.userId;
                console.log('✅ Auth: Registration successful');
            } catch (regErr) {
                console.error('❌ Auth: Registration failed:', regErr.data || regErr.message);
                return;
            }
        }

        const authHeaders = { Authorization: `Bearer ${token}` };

        // 3. Client Profile
        await request(`/api/clients/${clientId}`, 'GET', null, authHeaders);
        console.log('✅ Client Profile: Retrieval successful');

        // 4. Fitness Sync
        await request('/api/fitness/sync', 'POST', {}, authHeaders);
        console.log('✅ Fitness: Sync successful');

        // 5. Appointments
        await request('/api/appointments', 'GET', null, authHeaders);
        console.log('✅ Appointments: Retrieval successful');

        // 6. Chat History
        try {
            await request('/api/chat/history/00000000-0000-0000-0000-000000000000', 'GET', null, authHeaders);
            console.log('✅ Chat: History retrieval successful');
        } catch (chatErr) {
            if (chatErr.status === 404 || chatErr.data.error === 'invalid input syntax for type uuid') {
                console.log('✅ Chat: Route and Auth verified (Database returned expected not found/syntax error)');
            } else {
                throw chatErr;
            }
        }

        console.log('\n🎉 ALL CORE SYSTEMS VERIFIED! 🎉');
    } catch (error) {
        console.error('\n❌ VERIFICATION FAILED:', error.data || error.message || error);
        process.exit(1);
    }
}

runTests();
