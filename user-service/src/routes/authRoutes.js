const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const sessionController = require('../controllers/sessionController');

// Authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);
router.post('/anonymous', authController.anonymous);
router.get('/session/validate', sessionController.validate);

// OAuth routes (to be implemented)
// router.get('/auth/google', authController.googleAuth);
// router.get('/auth/google/callback', authController.googleAuthCallback);

// Phone authentication routes (to be implemented)
// router.post('/verify-phone', authController.verifyPhone);
// router.post('/auth/phone', authController.phoneAuth);

module.exports = router;

