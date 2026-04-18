const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getTasks, createTask, submitTask, gradeTask } = require('../controllers/taskController');
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

// Routes
router.get('/:connectionId', protect, getTasks);
router.post('/:connectionId', protect, upload.single('file'), createTask);
router.put('/:id/submit', protect, upload.single('file'), submitTask);
router.put('/:id/grade', protect, gradeTask);

module.exports = router;
