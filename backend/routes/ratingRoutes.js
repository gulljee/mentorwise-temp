const express = require('express');
const router = express.Router();
const { submitRating, getMyRating, getUserRating } = require('../controllers/ratingController');
const { protect } = require('../middleware/authMiddleware');

// IMPORTANT: specific named routes MUST come before /:param routes
// Get average rating for a user (must be before /:connectionId catch-all)
router.get('/user/:userId', protect, getUserRating);

// Submit / update a rating for a connection
router.post('/:connectionId', protect, submitRating);

// Get your own rating for a specific connection
router.get('/connection/:connectionId', protect, getMyRating);

module.exports = router;
