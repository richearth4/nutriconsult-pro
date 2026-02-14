require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
const rateLimit = require('express-rate-limit');

const fs = require('fs');
const path = require('path');
try {
    const routesPath = path.join(__dirname, 'routes');
    console.log('📂 Routes directory contents:', fs.readdirSync(routesPath));
} catch (e) {
    console.error('❌ Error reading routes directory:', e.message);
}

const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const mealPlanRoutes = require('./routes/mealplans');
const resourceRoutes = require('./routes/resources');
const analyticsRoutes = require('./routes/analytics');
const paymentRoutes = require('./routes/payments');
const fitnessRoutes = require('./routes/fitness');
const appointmentRoutes = require('./routes/appointments');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.SOCKET_CORS_ORIGIN || "*",
        methods: ["GET", "POST"]
    }
});
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            "script-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            "font-src": ["'self'", "https://fonts.gstatic.com"],
            "img-src": ["'self'", "data:", "blob:"]
        }
    }
}));
// CORS Configuration
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5001',
    'http://127.0.0.1:5001'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1 && process.env.NODE_ENV === 'production') {
            var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from root
app.use(express.static(__dirname));

// Root Route for Debugging
app.get('/', (req, res) => {
    res.json({ status: 'online', message: 'NutriConsult Backend is Running!' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/mealplans', mealPlanRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', require('./routes/chat'));
app.use('/api/fitness', fitnessRoutes);
app.use('/api/appointments', appointmentRoutes);

// Socket.io initialization
require('./utils/chat')(io);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

server.listen(PORT, async () => {
    console.log(`🚀 NutriConsult API running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);

    // Force immediate DB test
    const db = require('./config/database');
    try {
        await db.query('SELECT NOW()');
        console.log('✅ Database connection verified on startup');
    } catch (err) {
        console.error('❌ Database connection failed on startup:', err.message);
    }
});

module.exports = app;
