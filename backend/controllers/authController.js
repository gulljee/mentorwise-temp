// Authentication controller handling user signup, login, Google OAuth, and password reset functionality

const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber, batch, department, campus, password, role } = req.body;

        if (!firstName || !lastName || !email || !phoneNumber || !batch || !department || !campus || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            phoneNumber,
            batch,
            department,
            campus,
            password,
            role
        });

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                batch: user.batch,
                department: user.department,
                campus: user.campus,
                role: user.role,
                about: user.about,
                cgpa: user.cgpa,
                subjects: user.subjects
            }
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

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                batch: user.batch,
                department: user.department,
                campus: user.campus,
                role: user.role,
                about: user.about,
                cgpa: user.cgpa,
                subjects: user.subjects
            }
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

        const { OAuth2Client } = require('google-auth-library');
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, given_name: firstName, family_name: lastName } = payload;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            const jwtToken = jwt.sign(
                { userId: existingUser._id, email: existingUser.email },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            return res.status(200).json({
                success: true,
                userExists: true,
                message: 'Login successful',
                token: jwtToken,
                user: {
                    id: existingUser._id,
                    firstName: existingUser.firstName,
                    lastName: existingUser.lastName,
                    email: existingUser.email,
                    phoneNumber: existingUser.phoneNumber,
                    batch: existingUser.batch,
                    department: existingUser.department,
                    campus: existingUser.campus,
                    role: existingUser.role,
                    about: existingUser.about,
                    cgpa: existingUser.cgpa,
                    subjects: existingUser.subjects
                }
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

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            phoneNumber,
            batch,
            department,
            campus,
            role,
            authProvider: 'google',
            googleId
        });

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                batch: user.batch,
                department: user.department,
                campus: user.campus,
                role: user.role,
                about: user.about,
                cgpa: user.cgpa,
                subjects: user.subjects
            }
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

        const { sendPasswordResetEmail } = require('../utils/emailService');

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

        const crypto = require('crypto');
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
