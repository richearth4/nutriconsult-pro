const express = require('express');
const termsController = require('../controllers/termsController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Public: Get latest terms
router.get('/', termsController.getLatest);

// User: Check if accepted latest terms
router.get('/status', authenticateToken, termsController.checkStatus);

// User: Accept terms
router.post('/accept', authenticateToken, termsController.acceptTerms);

// Admin: Update terms
router.post('/update', authenticateToken, requireRole('admin'), termsController.updateTerms);

module.exports = router;
