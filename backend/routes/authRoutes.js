// Authentication routes for signup, login, Google OAuth, and password reset

const express = require('express');
const router = express.Router();
const { signup, login, verifyGoogleToken, completeGoogleSignup, forgotPassword, resetPassword, verifyOtp, resendOtp } = require('../controllers/authController');

router.post('/signup', signup);

router.post('/login', login);

router.post('/google/verify', verifyGoogleToken);

router.post('/google/complete', completeGoogleSignup);

router.post('/forgot-password', forgotPassword);

router.post('/reset-password/:token', resetPassword);

router.post('/verify-otp', verifyOtp);

router.post('/resend-otp', resendOtp);

module.exports = router;
