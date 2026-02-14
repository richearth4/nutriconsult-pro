const Joi = require('joi');

const validateLogin = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};

const validateRegister = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        name: Joi.string().min(2).required(),
        role: Joi.string().valid('client', 'admin').optional()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};

const validateIntake = (req, res, next) => {
    const schema = Joi.object({
        weight: Joi.number().positive().required(),
        height: Joi.number().positive().required(),
        age: Joi.number().integer().min(1).max(120).required(),
        gender: Joi.string().valid('male', 'female', 'other').required(),
        activity: Joi.string().valid('sedentary', 'light', 'moderate', 'active', 'very_active').required(),
        goal: Joi.string().valid('lose', 'maintain', 'gain').optional(),
        goalWeight: Joi.number().positive().optional()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};

module.exports = {
    validateLogin,
    validateRegister,
    validateIntake
};
