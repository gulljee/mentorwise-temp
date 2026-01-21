const User = require('../models/User');

exports.searchMentors = async (req, res) => {
    try {
        const { search, minCgpa, department } = req.query;

        // Base query - only show mentors with complete profiles
        let query = {
            role: 'Mentor',
            about: { $exists: true, $ne: '' },  // Must have about section
            cgpa: { $exists: true, $ne: null }, // Must have CGPA
            subjects: { $exists: true, $not: { $size: 0 } } // Must have at least one subject
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
