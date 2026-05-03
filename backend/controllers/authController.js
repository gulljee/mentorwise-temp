// Authentication controller handling user signup, login, Google OAuth, and password reset functionality

const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const { sendOtpEmail, sendPasswordResetEmail } = require('../utils/emailService');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.signup = async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber, batch, department, campus, password, role } = req.body;

        if (!firstName || !lastName || !email || !phoneNumber || !batch || !department || !campus || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        if (phoneNumber.length !== 10) {
            return res.status(400).json({
                success: false,
                message: 'Phone number must be exactly 10 digits (excluding +92)'
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 15 * 60 * 1000);

        // Save to PendingUser collection temporarily
        const user = await PendingUser.create({
            firstName,
            lastName,
            email,
            phoneNumber,
            batch,
            department,
            campus,
            password,
            role,
            otpCode,
            otpExpires,
            transcript: req.file ? req.file.path.replace(/\\/g, '/') : null
        });

        await sendOtpEmail(user.email, otpCode);

        res.status(201).json({
            success: true,
            requiresOtp: true,
            email: user.email,
            message: 'Account created. Please verify your email with the OTP sent to you.'
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        // FORCED 2FA: Always trigger OTP on successful credential match!
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.otpCode = otpCode;
        user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save({ validateBeforeSave: false });

        await sendOtpEmail(user.email, otpCode);

        return res.status(200).json({
            success: true,
            requiresOtp: true,
            email: user.email,
            message: 'Please verify your profile with the OTP sent to your email.'
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

exports.verifyGoogleToken = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Google token is required'
            });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, given_name: firstName, family_name: lastName } = payload;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            // FORCED 2FA: Always trigger OTP
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            existingUser.otpCode = otpCode;
            existingUser.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
            await existingUser.save({ validateBeforeSave: false });

            await sendOtpEmail(existingUser.email, otpCode);

            return res.status(200).json({
                success: true,
                userExists: true,
                requiresOtp: true,
                email: existingUser.email,
                message: 'Please verify your profile with the OTP sent to your email.'
            });
        } else {
            return res.status(200).json({
                success: true,
                userExists: false,
                message: 'New user - complete profile',
                googleData: {
                    googleId,
                    email,
                    firstName: firstName || '',
                    lastName: lastName || ''
                }
            });
        }

    } catch (error) {
        console.error('Google token verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify Google token'
        });
    }
};

exports.completeGoogleSignup = async (req, res) => {
    try {
        const { googleId, email, firstName, lastName, phoneNumber, batch, department, campus, role } = req.body;

        if (!googleId || !email || !firstName || !lastName || !phoneNumber || !batch || !department || !campus || !role) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        if (phoneNumber.length !== 10) {
            return res.status(400).json({
                success: false,
                message: 'Phone number must be exactly 10 digits (excluding +92)'
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Reuse existing pending doc (if any) to avoid duplicate key errors on retries.
        let pendingUser = await PendingUser.findOne({ email });

        if (pendingUser) {
            pendingUser.firstName = firstName;
            pendingUser.lastName = lastName;
            pendingUser.phoneNumber = phoneNumber;
            pendingUser.batch = batch;
            pendingUser.department = department;
            pendingUser.campus = campus;
            pendingUser.role = role;
            pendingUser.authProvider = 'google';
            pendingUser.googleId = googleId;
            if (req.file) {
                pendingUser.transcript = req.file.path.replace(/\\/g, '/');
            }
        } else {
            // Save to PendingUser collection temporarily until verified
            pendingUser = await PendingUser.create({
                firstName,
                lastName,
                email,
                phoneNumber,
                batch,
                department,
                campus,
                role,
                authProvider: 'google',
                googleId,
                transcript: req.file ? req.file.path.replace(/\\/g, '/') : null
            });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        pendingUser.otpCode = otpCode;
        pendingUser.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
        await pendingUser.save({ validateBeforeSave: false });

        await sendOtpEmail(pendingUser.email, otpCode);

        res.status(201).json({
            success: true,
            requiresOtp: true,
            email: pendingUser.email,
            message: 'Account created. Please verify your email with the OTP sent to you.'
        });

    } catch (error) {
        console.error('Google signup completion error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email address'
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'If that email exists, a password reset link has been sent'
            });
        }

        if (user.authProvider === 'google') {
            return res.status(400).json({
                success: false,
                message: 'This account uses Google Sign-In. Please login with Google.'
            });
        }

        const resetToken = user.generatePasswordResetToken();

        await user.save({ validateBeforeSave: false });

        try {
            await sendPasswordResetEmail(user.email, resetToken);

            res.status(200).json({
                success: true,
                message: 'Password reset link has been sent to your email'
            });
        } catch (emailError) {
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                success: false,
                message: 'Failed to send email. Please try again later.'
            });
        }

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a new password'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        user.password = password;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful. You can now login with your new password.'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otpCode } = req.body;

        if (!email || !otpCode) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP code are required'
            });
        }

        let user = await PendingUser.findOne({ email });
        let isPending = true;

        if (!user) {
            user = await User.findOne({ email });
            isPending = false;
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.otpCode !== otpCode || !user.otpExpires || user.otpExpires < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP code'
            });
        }

        let finalUser = user;

        if (isPending) {
            // Migrate to fully verified User!
            finalUser = await User.create({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                batch: user.batch,
                department: user.department,
                campus: user.campus,
                role: user.role,
                password: user.password,
                authProvider: user.authProvider,
                googleId: user.googleId,
                transcript: user.transcript,
                isApproved: user.role === 'Mentor' ? false : true
            });
            await PendingUser.deleteOne({ _id: user._id });
        } else {
            // Standard login, clear OTP
            user.otpCode = undefined;
            user.otpExpires = undefined;
            await user.save({ validateBeforeSave: false });
        }

        // Check for admin approval (Mentors only)
        if (finalUser.role === 'Mentor' && !finalUser.isApproved) {
            return res.status(403).json({
                success: false,
                isPendingApproval: true,
                message: 'Your account is pending admin approval. Please wait for the admin to approve your profile.'
            });
        }

        const token = jwt.sign(
            { userId: finalUser._id, email: finalUser.email, role: finalUser.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
            token,
            user: {
                id: finalUser._id,
                firstName: finalUser.firstName,
                lastName: finalUser.lastName,
                email: finalUser.email,
                phoneNumber: finalUser.phoneNumber,
                batch: finalUser.batch,
                department: finalUser.department,
                campus: finalUser.campus,
                role: finalUser.role,
                about: finalUser.about,
                cgpa: finalUser.cgpa,
                subjects: finalUser.subjects,
                transcript: finalUser.transcript,
                profileImage: finalUser.profileImage
            }
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

exports.resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        let user = await PendingUser.findOne({ email });
        if (!user) {
            user = await User.findOne({ email });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.otpCode = otpCode;
        user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save({ validateBeforeSave: false });

        await sendOtpEmail(user.email, otpCode);

        res.status(200).json({
            success: true,
            message: 'OTP sent to your email'
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};
