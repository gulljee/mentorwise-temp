const express = require('express');
const router = express.Router();
const { chat, getChatHistory } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/chat', protect, chat);
router.get('/history', protect, getChatHistory);

module.exports = router;
