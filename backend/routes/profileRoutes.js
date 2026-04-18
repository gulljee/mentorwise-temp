// Profile routes for updating and retrieving mentor profile information

const express = require('express');
const router = express.Router();
const { updateProfile, getProfile } = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected routes - require authentication
router.put('/update', authMiddleware, updateProfile);
router.get('/me', authMiddleware, getProfile);

module.exports = router;
