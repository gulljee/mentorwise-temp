const User = require('../models/User');

exports.searchMentors = async (req, res) => {
    try {
        const { search, minCgpa, department } = req.query;

        // Base query - only show mentors with complete profiles
        let query = {
            role: 'Mentor',
            about: { $exists: true, $ne: '' },  // Must have about section
            cgpa: { $exists: true, $ne: null }, // Must have CGPA
            subjects: { $exists: true, $not: { $size: 0 } }, // Must have at least one subject
            transcript: { $exists: true, $ne: null } // Must have uploaded transcript to get discovered
        };

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { subjects: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        if (minCgpa) {
            query.cgpa = { $gte: parseFloat(minCgpa) };
        }

        if (department) {
            query.department = department;
        }

        const mentors = await User.find(query)
            .select('-password -resetPasswordToken -resetPasswordExpires -authProvider -googleId')
            .sort({ cgpa: -1, createdAt: -1 })
            .limit(50);

        res.status(200).json({
            success: true,
            count: mentors.length,
            mentors
        });

    } catch (error) {
        console.error('Error searching mentors:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching mentors',
            error: error.message
        });
    }
};
exports.getPublicProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId)
            .select('firstName lastName email department batch cgpa subjects about role profileImage');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        console.error('Error fetching public profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching public profile',
            error: error.message
        });
    }
};
