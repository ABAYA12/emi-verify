const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController-simple');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/signup', authController.signup);
router.post('/verify-email', authController.verifyEmail);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Development route - manual verification bypass
router.post('/dev-verify', authController.devVerifyUser);
router.get('/dev-get-code/:email', authController.getVerificationCode);

// Protected routes
router.get('/me', authenticateToken, authController.getProfile);
router.put('/me', authenticateToken, authController.updateProfile);

module.exports = router;
