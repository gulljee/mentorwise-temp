const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { updateProfile, getProfile, uploadTranscript, uploadProfileImage } = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

// Multer Config for Transcripts
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/transcripts/');
    },
    filename: (req, file, cb) => {
        cb(null, `transcript-${req.user.userId}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'));
        }
    }
});

// Multer Config for Profile Images
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profiles/');
    },
    filename: (req, file, cb) => {
        cb(null, `profile-${req.user.userId}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const uploadImage = multer({
    storage: imageStorage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only images (jpeg, jpg, png) are allowed!'));
        }
    }
});

// Protected routes - require authentication
router.put('/update', authMiddleware, updateProfile);
router.get('/me', authMiddleware, getProfile);
router.put('/upload-transcript', authMiddleware, upload.single('transcript'), uploadTranscript);
router.put('/upload-image', authMiddleware, uploadImage.single('image'), uploadProfileImage);

module.exports = router;
