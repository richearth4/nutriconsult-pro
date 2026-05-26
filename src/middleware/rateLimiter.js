const rateLimit = require('express-rate-limit');

// Rate limit handler
const handler = (req, res, next, options) => {
    res.status(options.statusCode).json({
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: options.message
        }
    });
};

// General API Limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again after 15 minutes',
    handler: handler
});

// Stricter Auth Limiter (Login/Register)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 login/register requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
    handler: handler
});

module.exports = {
    apiLimiter,
    authLimiter
};
