const io = require('socket.io-client');
require('dotenv').config();

// Standard JWT for testing (needs to be valid for the local server)
const testToken = 'YOUR_TEST_TOKEN_HERE';

async function testChat() {
    console.log('📡 Testing Real-time Chat System...');

    const socket = io('http://localhost:5001', {
        auth: { token: testToken }
    });

    socket.on('connect', () => {
        console.log('✅ Connected to Socket.io server');

        // Mock sending a message
        console.log('✉️ Sending test message...');
        socket.emit('send_message', {
            receiverId: 'some-receiver-id',
            content: 'Hello, this is a test message!'
        });
    });

    socket.on('message_sent', (msg) => {
        console.log('✅ Message successfully sent and acknowledged by server:', msg.content);
        socket.disconnect();
        process.exit(0);
    });

    socket.on('connect_error', (err) => {
        console.error('❌ Connection Error:', err.message);
        process.exit(1);
    });

    // Timeout if no response
    setTimeout(() => {
        console.error('❌ Test timed out.');
        process.exit(1);
    }, 10000);
}

// Note: This script requires the server to be running.
console.log('💡 Note: Ensure the NutriConsult Pro server is running on port 5001 before running this test.');
testChat();
