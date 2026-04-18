// Profile controller for updating user profile information

const User = require('../models/User');

exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, phoneNumber, about, cgpa, subjects } = req.body;
        const userId = req.user.userId;

        // Validate subjects is an array
        if (subjects && !Array.isArray(subjects)) {
            return res.status(400).json({
                success: false,
                message: 'Subjects must be an array'
            });
        }

        // Validate CGPA range
        if (cgpa !== undefined && cgpa !== null && cgpa !== '' && (cgpa < 0 || cgpa > 4)) {
            return res.status(400).json({
                success: false,
                message: 'CGPA must be between 0 and 4'
            });
        }

        const updateFields = {
            about: about || '',
            cgpa: cgpa !== '' ? cgpa : null,
            subjects: subjects || []
        };

        if (firstName && firstName.trim()) updateFields.firstName = firstName.trim();
        if (lastName && lastName.trim()) updateFields.lastName = lastName.trim();
        if (phoneNumber && phoneNumber.trim()) updateFields.phoneNumber = phoneNumber.trim();

        const user = await User.findByIdAndUpdate(
            userId,
            updateFields,
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
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await User.findById(userId).select(
            'firstName lastName email phoneNumber batch department campus role about cgpa subjects'
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
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

