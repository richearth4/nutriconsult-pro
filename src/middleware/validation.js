const Joi = require('joi');
const { ErrorTypes } = require('./errorHandler');

/**
 * Enhanced Input Validation Middleware
 * Includes XSS sanitization, password strength, and comprehensive schemas
 */

/**
 * Sanitize string to prevent XSS
 */
function sanitizeString(str) {
    if (typeof str !== 'string') return str;

    return str
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;')
        .trim();
}

/**
 * Recursively sanitize object
 */
function sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
        if (typeof obj[key] === 'string') {
            sanitized[key] = sanitizeString(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitized[key] = sanitizeObject(obj[key]);
        } else {
            sanitized[key] = obj[key];
        }
    }

    return sanitized;
}

/**
 * Password strength validation
 */
const passwordSchema = Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password must not exceed 128 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    });

/**
 * Common field schemas
 */
const emailSchema = Joi.string()
    .email({ tlds: { allow: false } })
    .max(255)
    .lowercase()
    .trim()
    .required();

const nameSchema = Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z\s'-]+$/)
    .trim()
    .required()
    .messages({
        'string.pattern.base': 'Name can only contain letters, spaces, hyphens, and apostrophes'
    });

/**
 * Login validation schema
 */
const loginSchema = Joi.object({
    email: emailSchema,
    password: Joi.string().required()
});

/**
 * Registration validation schema
 */
const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .required()
        .messages({
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
            'string.min': 'Password must be at least 8 characters long'
        }),
    name: Joi.string().min(2).required(),
    role: Joi.string().valid('client', 'admin', 'nutritionist').default('client')
});

/**
 * Intake data validation schema
 */
const intakeSchema = Joi.object({
    weight: Joi.number().min(20).max(500).required(),
    height: Joi.number().min(50).max(300).required(),
    age: Joi.number().integer().min(13).max(120).required(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    activity: Joi.string().valid('sedentary', 'light', 'moderate', 'active', 'very_active').required(),
    goal: Joi.string().valid('lose', 'maintain', 'gain', 'weight-loss', 'muscle-gain', 'maintenance', 'athletic').required(),
    goalWeight: Joi.number().min(20).max(500).allow(null),
    sleepHours: Joi.number().min(0).max(24).allow(null),
    sleepQuality: Joi.string().valid('poor', 'fair', 'good', 'excellent').allow(null),
    mealsPerDay: Joi.number().integer().min(1).max(10).allow(null),
    water: Joi.number().min(0).max(20).allow(null),
    waterIntake: Joi.number().min(0).max(20).allow(null),
    conditions: Joi.alternatives().try(
        Joi.array().items(Joi.string().max(200)),
        Joi.string().max(500)
    ).allow(null),
    medications: Joi.string().max(500).allow(null, ''),
    allergies: Joi.string().max(500).allow(null, ''),
    smoking: Joi.string().valid('yes', 'no', 'occasionally').allow(null),
    alcohol: Joi.string().valid('yes', 'no', 'occasionally').allow(null),
    phone: Joi.string().pattern(/^[\d\s\-\+\(\)]+$/).max(20).allow(null, '')
});

/**
 * Client profile update schema
 */
const profileUpdateSchema = Joi.object({
    name: nameSchema,
    email: emailSchema,
    phone: Joi.string().pattern(/^[\d\s\-\+\(\)]+$/).max(20).allow(null, '')
});

/**
 * Weight log schema
 */
const weightLogSchema = Joi.object({
    weight: Joi.number().min(20).max(500).required(),
    date: Joi.date().max('now').allow(null)
});

/**
 * Validation middleware factory
 */
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        // Sanitize input first
        if (req[property]) {
            req[property] = sanitizeObject(req[property]);
        }

        const { error, value } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const details = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            throw ErrorTypes.ValidationError('Validation failed', details);
        }

        // Replace with validated and sanitized value
        req[property] = value;
        next();
    };
};

/**
 * Export validation middleware
 */
const validateLogin = validate(loginSchema);
const validateRegister = validate(registerSchema);
const validateIntake = validate(intakeSchema);
const validateProfileUpdate = validate(profileUpdateSchema);
const validateWeightLog = validate(weightLogSchema);

module.exports = {
    validate,
    validateLogin,
    validateRegister,
    validateIntake,
    validateProfileUpdate,
    validateWeightLog,
    sanitizeString,
    sanitizeObject
};
