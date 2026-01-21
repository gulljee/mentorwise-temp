// Profile controller for updating mentor profile information

const User = require('../models/User');

exports.updateProfile = async (req, res) => {
    try {
        const { about, cgpa, subjects } = req.body;
        const userId = req.user.userId; // From auth middleware

        // Validate subjects is an array
        if (subjects && !Array.isArray(subjects)) {
            return res.status(400).json({
                success: false,
                message: 'Subjects must be an array'
            });
        }

        // Validate CGPA range
        if (cgpa !== undefined && (cgpa < 0 || cgpa > 4)) {
            return res.status(400).json({
                success: false,
                message: 'CGPA must be between 0 and 4'
            });
        }

        // Update user profile
        const user = await User.findByIdAndUpdate(
            userId,
            {
                about: about || '',
                cgpa: cgpa || null,
                subjects: subjects || []
            },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            profile: {
                about: user.about,
                cgpa: user.cgpa,
                subjects: user.subjects
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.userId; // From auth middleware

        const user = await User.findById(userId).select('about cgpa subjects');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            profile: {
                about: user.about || '',
                cgpa: user.cgpa || null,
                subjects: user.subjects || []
            }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};
