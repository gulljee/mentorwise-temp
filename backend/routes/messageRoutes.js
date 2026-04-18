const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const { getMessages, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// Set up Multer for storing uploaded files locally
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// GET  /api/messages/:connectionId  — fetch all messages in this connection
router.get('/:connectionId', protect, getMessages);

// POST /api/messages/:connectionId  — send a new message
router.post('/:connectionId', protect, upload.single('file'), sendMessage);

module.exports = router;
