require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');
const requestIdMiddleware = require('./middleware/requestId');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

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

const compression = require('compression');
const xss = require('xss-clean');
const hpp = require('hpp');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            "default-src": ["'self'"],
            "script-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://unpkg.com"],
            "script-src-attr": ["'self'", "'unsafe-inline'"],
            "style-src": ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
            "font-src": ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
            "img-src": ["'self'", "data:", "https:"],
            "connect-src": ["'self'", "ws://localhost:5001", "http://localhost:5001"]
        }
    }
}));

// Gzip Compression
app.use(compression());

// Global Rate Limiting
app.use('/api', apiLimiter);

// Body Parser
app.use(express.json({ limit: '50mb' })); // Increased for AI Vision photos
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Data Sanitization against XSS
app.use(xss());

// Prevent Parameter Pollution
app.use(hpp());

// Static files with cache headers
app.use('/assets', express.static(path.join(__dirname, '..', 'assets'), {
    maxAge: '1d', // Cache for 1 day
    etag: true
}));
app.use(express.static(path.join(__dirname, '..'), {
    maxAge: '1h' // Cache other static files for 1 hour
}));

// CORS Configuration
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://loquacious-seahorse-cd71fc.netlify.app',
    'http://localhost:5001',
    'http://127.0.0.1:5001',
    'http://localhost:8000'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // In development, allow requests with no origin (like mobile apps or curl requests)
        // In production, only allow whitelisted origins
        if (!origin || origin === 'null') {
            if (process.env.NODE_ENV === 'production') {
                logger.warn('Blocked request with null origin in production', { origin });
                return callback(new Error('CORS policy does not allow null origin in production'), false);
            }
            return callback(null, true);
        }

        if (allowedOrigins.indexOf(origin) === -1 && process.env.NODE_ENV === 'production') {
            logger.warn('Blocked request from unauthorized origin', { origin });
            return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
}));

// Rate limiting - Tiered approach
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests, please try again later' } },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn('Rate limit exceeded', { ip: req.ip, path: req.path });
        res.status(429).json({
            success: false,
            error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests, please try again later' }
        });
    }
});

// Stricter rate limiting for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // Only 5 login attempts per 15 minutes
    skipSuccessfulRequests: true,
    message: { success: false, error: { code: 'AUTH_RATE_LIMIT_EXCEEDED', message: 'Too many authentication attempts' } },
    handler: (req, res) => {
        logger.warn('Auth rate limit exceeded', { ip: req.ip, email: req.body?.email });
        res.status(429).json({
            success: false,
            error: { code: 'AUTH_RATE_LIMIT_EXCEEDED', message: 'Too many authentication attempts, please try again later' }
        });
    }
});

app.use('/api/', generalLimiter);

// Request ID tracking (must be before routes)
app.use(requestIdMiddleware);

// Request logging
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info('Request completed', {
            requestId: req.id,
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip
        });
    });
    next();
});

// Static files from root
app.use(express.static(path.join(__dirname, '..')));

// Root Route for frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
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
app.use('/api/terms', require('./routes/terms'));
app.use('/api/ai', require('./routes/ai'));

// Socket.io initialization
require('./utils/chat')(io);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// 404 handler (must be before error handler)
app.use(notFoundHandler);

// Centralized error handling (must be last)
app.use(errorHandler);

const db = require('./config/database');

const serverInstance = server.listen(PORT, async () => {
    logger.info(`Nutrilas API starting`, { port: PORT, env: process.env.NODE_ENV || 'development' });

    // Force immediate DB test
    try {
        await db.query('SELECT NOW()');
        logger.info('Database connection verified on startup');
    } catch (err) {
        logger.error('Database connection failed on startup', { error: err.message });
    }

    logger.info(`🚀 Nutrilas API running on port ${PORT}`);
});

// Graceful Shutdown
const gracefulShutdown = async (signal) => {
    logger.info(`${signal} signal received: closing HTTP server`);
    serverInstance.close(async () => {
        logger.info('HTTP server closed');
        try {
            await db.pool.end();
            logger.info('Database pool closed');
            process.exit(0);
        } catch (err) {
            logger.error('Error during database disconnection', { error: err.message });
            process.exit(1);
        }
    });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Prevent unhandled promise rejections from crashing the server
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection — server kept alive', {
        reason: reason?.message || reason,
        stack: reason?.stack
    });
});

// Prevent uncaught exceptions from crashing the server
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception — server kept alive', {
        error: err.message,
        stack: err.stack
    });
});

module.exports = app;
