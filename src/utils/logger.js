/**
 * Structured Logger Utility
 * Provides consistent logging with levels, request tracking, and sensitive data redaction
 */

const LOG_LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
};

const SENSITIVE_FIELDS = ['password', 'token', 'authorization', 'secret', 'apiKey', 'creditCard'];

class Logger {
    constructor() {
        this.level = process.env.LOG_LEVEL || 'info';
        this.levelValue = LOG_LEVELS[this.level] || LOG_LEVELS.info;
    }

    /**
     * Redact sensitive data from objects
     */
    redactSensitive(obj) {
        if (!obj || typeof obj !== 'object') return obj;

        const redacted = Array.isArray(obj) ? [...obj] : { ...obj };

        for (const key in redacted) {
            const lowerKey = key.toLowerCase();
            if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
                redacted[key] = '[REDACTED]';
            } else if (typeof redacted[key] === 'object' && redacted[key] !== null) {
                redacted[key] = this.redactSensitive(redacted[key]);
            }
        }

        return redacted;
    }

    /**
     * Format log message with metadata
     */
    formatMessage(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const redactedMeta = this.redactSensitive(meta);

        return {
            timestamp,
            level: level.toUpperCase(),
            message,
            ...redactedMeta,
            env: process.env.NODE_ENV || 'development'
        };
    }

    /**
     * Log at specified level
     */
    log(level, message, meta = {}) {
        if (LOG_LEVELS[level] > this.levelValue) return;

        const formatted = this.formatMessage(level, message, meta);

        // Use appropriate console method
        const consoleMethod = level === 'error' ? 'error' :
            level === 'warn' ? 'warn' : 'log';

        if (process.env.NODE_ENV === 'production') {
            // JSON format for production (easier to parse)
            console[consoleMethod](JSON.stringify(formatted));
        } else {
            // Pretty format for development
            const emoji = level === 'error' ? '❌' :
                level === 'warn' ? '⚠️' :
                    level === 'info' ? 'ℹ️' : '🐛';
            console[consoleMethod](`${emoji} [${formatted.timestamp}] ${formatted.level}: ${message}`,
                Object.keys(meta).length > 0 ? this.redactSensitive(meta) : '');
        }
    }

    error(message, meta = {}) {
        this.log('error', message, meta);
    }

    warn(message, meta = {}) {
        this.log('warn', message, meta);
    }

    info(message, meta = {}) {
        this.log('info', message, meta);
    }

    debug(message, meta = {}) {
        this.log('debug', message, meta);
    }

    /**
     * Create child logger with additional context
     */
    child(context = {}) {
        const childLogger = new Logger();
        const originalLog = childLogger.log.bind(childLogger);

        childLogger.log = (level, message, meta = {}) => {
            originalLog(level, message, { ...context, ...meta });
        };

        return childLogger;
    }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger;
