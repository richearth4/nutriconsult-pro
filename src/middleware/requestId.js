/**
 * Request ID Middleware
 * Adds unique ID to each request for tracking and debugging
 */

const crypto = require('crypto');

/**
 * Generate unique request ID
 */
function generateRequestId() {
    return crypto.randomBytes(16).toString('hex');
}

/**
 * Request ID Middleware
 * Adds req.id and X-Request-ID header to all requests
 */
const requestIdMiddleware = (req, res, next) => {
    // Use existing request ID from header if present, otherwise generate new one
    const requestId = req.headers['x-request-id'] || generateRequestId();

    // Attach to request object
    req.id = requestId;

    // Add to response headers
    res.setHeader('X-Request-ID', requestId);

    next();
};

module.exports = requestIdMiddleware;
