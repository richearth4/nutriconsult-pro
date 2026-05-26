/**
 * Centralized Error Handling Middleware
 * Provides consistent error responses and logging
 */

const logger = require('../utils/logger');

/**
 * Custom Application Error Class
 */
class AppError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.isOperational = true; // Distinguish from programming errors
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Common error factory functions
 */
const ErrorTypes = {
    ValidationError: (message, details = null) =>
        new AppError(message, 400, 'VALIDATION_ERROR', details),

    AuthenticationError: (message = 'Authentication required') =>
        new AppError(message, 401, 'AUTHENTICATION_ERROR'),

    AuthorizationError: (message = 'Insufficient permissions') =>
        new AppError(message, 403, 'AUTHORIZATION_ERROR'),

    NotFoundError: (resource = 'Resource') =>
        new AppError(`${resource} not found`, 404, 'NOT_FOUND'),

    ConflictError: (message) =>
        new AppError(message, 409, 'CONFLICT'),

    RateLimitError: (message = 'Too many requests') =>
        new AppError(message, 429, 'RATE_LIMIT_EXCEEDED'),

    DatabaseError: (message = 'Database operation failed') =>
        new AppError(message, 500, 'DATABASE_ERROR'),

    ExternalServiceError: (service, message = 'External service unavailable') =>
        new AppError(`${service}: ${message}`, 503, 'EXTERNAL_SERVICE_ERROR')
};

/**
 * Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
    // Default to 500 if not set
    let statusCode = err.statusCode || 500;
    let errorCode = err.code || 'INTERNAL_ERROR';
    let message = err.message || 'An unexpected error occurred';
    let details = err.details || null;

    // Handle specific error types
    if (err.name === 'ValidationError') {
        // Joi validation errors
        statusCode = 400;
        errorCode = 'VALIDATION_ERROR';
        message = 'Validation failed';
        details = err.details?.map(d => ({
            field: d.path.join('.'),
            message: d.message
        }));
    } else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        errorCode = 'INVALID_TOKEN';
        message = 'Invalid authentication token';
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        errorCode = 'TOKEN_EXPIRED';
        message = 'Authentication token has expired';
    } else if (err.code === '23505') {
        // PostgreSQL unique violation
        statusCode = 409;
        errorCode = 'DUPLICATE_ENTRY';
        message = 'A record with this value already exists';
    } else if (err.code === '23503') {
        // PostgreSQL foreign key violation
        statusCode = 400;
        errorCode = 'INVALID_REFERENCE';
        message = 'Referenced record does not exist';
    } else if (err.code === '22P02') {
        // PostgreSQL invalid text representation (e.g. invalid UUID)
        statusCode = 400;
        errorCode = 'INVALID_INPUT_FORMAT';
        message = 'Invalid input format for database field';
    }

    // Log error with context
    const logMeta = {
        requestId: req.id,
        method: req.method,
        path: req.path,
        statusCode,
        errorCode,
        userId: req.user?.userId,
        ip: req.ip
    };

    if (statusCode >= 500) {
        logger.error(message, { ...logMeta, stack: err.stack });
    } else {
        logger.warn(message, logMeta);
    }

    // Build response
    const response = {
        success: false,
        error: {
            code: errorCode,
            message: message
        }
    };

    // Add details in development or for validation errors
    if (process.env.NODE_ENV === 'development' || statusCode === 400) {
        if (details) response.error.details = details;
        if (process.env.NODE_ENV === 'development') {
            response.error.stack = err.stack;
        }
    }

    // Add request ID for tracking
    if (req.id) {
        response.requestId = req.id;
    }

    res.status(statusCode).json(response);
};

/**
 * 404 Handler
 */
const notFoundHandler = (req, res) => {
    logger.warn('Route not found', {
        method: req.method,
        path: req.path,
        ip: req.ip
    });

    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: 'The requested resource was not found'
        }
    });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    AppError,
    ErrorTypes,
    errorHandler,
    notFoundHandler,
    asyncHandler
};
