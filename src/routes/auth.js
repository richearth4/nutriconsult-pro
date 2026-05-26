const express = require('express');
const authController = require('../controllers/authController');
const { validateLogin, validateRegister } = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', authLimiter, validateRegister, authController.register);

// Login
router.post('/login', authLimiter, validateLogin, authController.login);

// Verify token
router.get('/verify', authController.verify);

// Logout
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;
