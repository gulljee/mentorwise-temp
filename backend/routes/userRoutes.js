const express = require('express');
const router = express.Router();
const { searchMentors } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.get('/mentors/search', protect, searchMentors);

module.exports = router;
