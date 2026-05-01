// Authentication routes for signup, login, Google OAuth, and password reset

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { signup, login, verifyGoogleToken, completeGoogleSignup, forgotPassword, resetPassword, verifyOtp, resendOtp } = require('../controllers/authController');

// Multer Config for Transcripts during Signup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/transcripts/');
    },
    filename: (req, file, cb) => {
        cb(null, `signup-transcript-${Date.now()}${path.extname(file.originalname)}`);
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

router.post('/signup', upload.single('transcript'), signup);

router.post('/login', login);

router.post('/google/verify', verifyGoogleToken);

router.post('/google/complete', upload.single('transcript'), completeGoogleSignup);

router.post('/forgot-password', forgotPassword);

router.post('/reset-password/:token', resetPassword);

router.post('/verify-otp', verifyOtp);

router.post('/resend-otp', resendOtp);

module.exports = router;
