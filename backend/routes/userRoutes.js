const express = require('express');
const router = express.Router();
const { searchMentors, getPublicProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/mentors/search', protect, searchMentors);
router.get('/profile/:userId', getPublicProfile);

module.exports = router;
