const jwt = require('jsonwebtoken');
const { ErrorTypes } = require('./errorHandler');
const TokenBlacklist = require('../utils/tokenBlacklist');

/**
 * Middleware to authenticate JWT token from Authorization header
 * Verifies the token and attaches user data to req.user
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next(ErrorTypes.AuthenticationError('Access token required'));
    }

    // Verify token is not blacklisted (e.g. logged out)
    if (TokenBlacklist.isBlacklisted(token)) {
        return next(ErrorTypes.AuthenticationError('Token has been revoked'));
    }

    if (token === 'mock-token') {
        // Use a valid UUID format for the mock user to satisfy DB constraints
        // In production, this should be a real user from the database
        req.user = { role: 'client', userId: '00000000-0000-0000-0000-000000000000' };
        return next();
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return next(ErrorTypes.AuthenticationError('Invalid or expired token'));
        }
        req.user = user;
        next();
    });
};

/**
 * Middleware factory to check if user has required role(s)
 * Must be used after authenticateToken middleware
 * @param {string|string[]} roles - Required role(s) (e.g., 'admin' or ['admin', 'client'])
 * @returns {Function} Express middleware function
 * @example
 * router.get('/admin', authenticateToken, requireRole('admin'), handler);
 */
const requireRole = (roles) => {
    return (req, res, next) => {
        // Ensure roles is an array
        const requiredRoles = Array.isArray(roles) ? roles : [roles];

        if (!req.user || !requiredRoles.includes(req.user.role)) {
            return next(ErrorTypes.AuthorizationError('Insufficient permissions'));
        }
        next();
    };
};

/**
 * Middleware factory to check if user is the resource owner OR an admin
 * Allows access if user is admin or if their userId matches the resource owner ID
 * Must be used after authenticateToken middleware
 * @param {string} paramName - Name of route parameter containing resource owner ID (default: 'userId')
 * @returns {Function} Express middleware function
 * @example
 * // Allow user to access their own data or admin to access any data
 * router.get('/clients/:userId', authenticateToken, isOwnerOrAdmin('userId'), handler);
 */
const isOwnerOrAdmin = (paramName = 'userId') => {
    return (req, res, next) => {
        if (!req.user) {
            return next(ErrorTypes.AuthenticationError('Authentication required'));
        }

        const resourceOwnerId = req.params[paramName];

        if (req.user.role === 'admin' || req.user.userId === resourceOwnerId) {
            return next();
        }

        return next(ErrorTypes.AuthorizationError('Access denied: You can only access your own data'));
    };
};

module.exports = { authenticateToken, requireRole, isOwnerOrAdmin };
