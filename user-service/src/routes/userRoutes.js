const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

// User routes (protected)
router.get('/profile/:userId', authenticate, userController.getProfile);
router.put('/profile/:userId', authenticate, userController.updateProfile);

module.exports = router;