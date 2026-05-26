const jwt = require('jsonwebtoken');
const db = require('../config/database');

module.exports = (io) => {
    // Socket.io Middleware for Authentication
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Authentication error'));

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return next(new Error('Authentication error'));
            socket.user = decoded;
            next();
        });
    });

    io.on('connection', (socket) => {
        const userId = socket.user.userId;
        console.log(`🔌 User connected to chat: ${userId}`);

        // Join a private room for this user
        socket.join(userId);

        // Handle sending a message
        socket.on('send_message', async (data) => {
            const { receiverId, content } = data;
            if (!receiverId || !content) return;

            try {
                // Save to database
                const result = await db.query(
                    'INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *',
                    [userId, receiverId, content]
                );

                const savedMsg = result.rows[0];

                // Emit to receiver's private room
                io.to(receiverId).emit('receive_message', {
                    ...savedMsg,
                    sender_name: socket.user.name
                });

                // Acknowledge back to sender (useful for UI updates)
                socket.emit('message_sent', savedMsg);

            } catch (error) {
                console.error('❌ Chat save error:', error.message);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        socket.on('disconnect', () => {
            console.log(`🔌 User disconnected: ${userId}`);
        });
    });
};
